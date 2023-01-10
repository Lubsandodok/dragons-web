import { PlayerEvent, GameMethod } from '../canvas';

export interface Movable {
    moveUp(): void;
    moveLeft(): void;
    moveRight(): void;
}

export interface WorldUpdatable {
    createCharacter(playerId: string, isPlayer: boolean): void;
    createFireball(playerId: string): void;
    moveCharacter(playerId: string, event: string): void;
    setIsGamePlaying(isGamePlaying: boolean): void;
}

function getPlayerEvent(event: KeyboardEvent) {
    if (event.code === 'KeyW') {
        return PlayerEvent.DRAGON_MOVE;
    } else if (event.code === 'KeyA') {
        return PlayerEvent.DRAGON_LEFT;
    } else if (event.code === 'KeyD') {
        return PlayerEvent.DRAGON_RIGHT;
    } else if (event.code === 'Space') {
        return PlayerEvent.CREATE_FIREBALL;
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
        window.addEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown(event));
    }

    onKeyDown(event: KeyboardEvent) {
        if (!this.listenToKeyboard) {
            return;
        }
        if (event.code === 'Space') {
            console.log('Space was pressed');
        }
        console.log('Pressed', event.code);
        const messageToSend = {
            method: GameMethod.SEND_PLAYER_EVENT,
            parameters: {event: getPlayerEvent(event)},
        };
        this.ws.send(JSON.stringify(messageToSend));
    }

    subscibeWorld(world: WorldUpdatable) {
        this.world = world;
    }

    joinRoom(roomId: string) {
        this.listenToKeyboard = true;

        this.ws = new WebSocket('ws://localhost:9001/room/join');
        this.ws.onmessage = (event: MessageEvent) => this.onMessage(event);

        this.ws.onopen = (event: Event) => {
            console.log('Connected to server');
            const messageToSend = {method: GameMethod.JOIN_ROOM, parameters: {room_id: roomId}};
            this.ws.send(JSON.stringify(messageToSend));
        }
    }

    onMessage(event: MessageEvent) {
        console.log('Got message from server:', event.data);
        const data = JSON.parse(event.data);

        // TODO validation
        if (data.method === GameMethod.JOIN_ROOM) {
            console.log('Joined room with id', data.result.your_player);
            this.world.createCharacter(data.result.your_player, true);
        } else if (data.method === GameMethod.PLAYER_WAS_JOINED) {
            const players = data.parameters.players;
            for (const playerId of players) {
                this.world.createCharacter(playerId, false);
            }
            if (data.parameters.is_game_playing) {
                // todo
                this.world.setIsGamePlaying(true);
            }
        } else if (data.method === GameMethod.PLAYER_EVENT_WAS_SENT) {
            const players: {[id: string]: PlayerEvent}[] = data.parameters.players;
            for (const player of players) {
                const playerId = Object.keys(player)[0];
                const event = player[playerId];
                if (event === PlayerEvent.CREATE_FIREBALL) {
                    this.world.createFireball(playerId);
                } else {
                    this.world.moveCharacter(playerId, event);
                }
                console.log('Got event', data);
            }
        }
    }
}
