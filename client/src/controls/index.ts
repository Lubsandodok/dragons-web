import { PlayerEvent, GameMethod, PlayerStartingPosition } from "../canvas";
// import KD from 'keydrown';

export interface Movable {
  moveUp(): void;
  moveLeft(): void;
  moveRight(): void;
}

export interface WorldUpdatable {
  createCharacter(
    playerId: string,
    startingPosition: PlayerStartingPosition,
    nickname: string
  ): void;
  applyEvent(playerId: string, event: PlayerEvent): void;
  setIsGamePlaying(isGamePlaying: boolean): void;
  setMyPlayerId(myPlayerId: string): void;
}

function getPlayerEvent(event: KeyboardEvent) {
  console.log("Code", event.code);
  if (event.code === "KeyW") {
    return PlayerEvent.DRAGON_MOVE;
  } else if (event.code === "KeyA") {
    return PlayerEvent.DRAGON_LEFT;
  } else if (event.code === "KeyD") {
    return PlayerEvent.DRAGON_RIGHT;
  } else if (event.code === "Space") {
    return PlayerEvent.CREATE_FIREBALL;
  } else if (event.code === "ShiftLeft") {
    return PlayerEvent.DRAGON_TURN_BACK;
  } else {
    return PlayerEvent.NONE;
  }
}

export class Controls {
  ws: WebSocket;
  world: WorldUpdatable;
  player: Movable;
  enemy: Movable;
  listenToKeyboard: boolean = false;

  constructor() {
    window.addEventListener("keydown", (event: KeyboardEvent) =>
      this.onKeyDown(event)
    );

    // KD.W.down((event: KeyboardEvent) => {
    //   console.log('W pressed');
    //   this.onKeyDown(event);
    // });

    // KD.A.down((event: KeyboardEvent) => {
    //   console.log('A pressed');
    //   this.onKeyDown(event);
    // });

    // KD.D.down((event: KeyboardEvent) => {
    //   console.log('D pressed');
    //   this.onKeyDown(event);
    // });

    // KD.SPACE.down((event: KeyboardEvent) => {
    //   console.log('SPACE pressed');
    //   this.onKeyDown(event);
    // });

    // KD.SHIFT.down((event: KeyboardEvent) => {
    //   console.log('SHIFT pressed');
    //   this.onKeyDown(event);
    // });
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.listenToKeyboard) {
      return;
    }
    // console.log('Pressed', event.code);
    const messageToSend = {
      method: GameMethod.SEND_PLAYER_EVENT,
      parameters: { event: getPlayerEvent(event) },
    };
    this.ws.send(JSON.stringify(messageToSend));
  }

  subscibeWorld(world: WorldUpdatable) {
    this.world = world;
  }

  joinRoom(roomId: string, nickname: string) {
    this.listenToKeyboard = true;

    this.ws = new WebSocket("ws://localhost:9001/room/join");
    this.ws.onmessage = (event: MessageEvent) => this.onMessage(event);

    this.ws.onopen = (event: Event) => {
      // console.log('Connected to server');
      const messageToSend = {
        method: GameMethod.JOIN_ROOM,
        parameters: { room_id: roomId, nickname: nickname },
      };
      this.ws.send(JSON.stringify(messageToSend));
    };
  }

  finishGame(winnerId: string) {
    // TODO: unsubscribe from world and stop listening to keyboard
    this.listenToKeyboard = false;
    const messageToSend = {
      method: GameMethod.FINISH_ROOM,
      parameters: { winner_id: winnerId },
    };
    this.ws.send(JSON.stringify(messageToSend));
  }

  onMessage(event: MessageEvent) {
    console.log("Got message from server:", event.data);
    const data = JSON.parse(event.data);

    // TODO validation
    if (data.method === GameMethod.JOIN_ROOM) {
      // console.log('Joined room with id', data.result.your_player);
      this.world.setMyPlayerId(data.result.your_player);
      // this.world.createCharacter(data.result.your_player, true);
    } else if (data.method === GameMethod.PLAYER_WAS_JOINED) {
      const players = data.parameters.players;
      if (data.parameters.is_game_playing) {
        for (const player of players) {
          this.world.createCharacter(
            player.id,
            player.starting_position,
            player.nickname
          );
        }
        this.world.setIsGamePlaying(true);
      }
    } else if (data.method === GameMethod.PLAYER_EVENT_WAS_SENT) {
      const players: { [id: string]: PlayerEvent }[] = data.parameters.players;
      for (const player of players) {
        const playerId = Object.keys(player)[0];
        const event = player[playerId];
        this.world.applyEvent(playerId, event);
      }
    }
  }
}
