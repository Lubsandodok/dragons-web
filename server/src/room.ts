import type { WebSocket } from 'uWebSockets.js';

enum PlayerEvent {
    NONE = 'NONE',
    DRAGON_MOVE = 'DRAGON_MOVE',
    DRAGON_LEFT = 'DRAGON_LEFT',
    DRAGON_RIGHT = 'DRAGON_RIGHT',
    CREATE_FIREBALL = 'CREATE_FIREBALL',
}

export enum GameMethod {
    PLAYER_EVENT_WAS_SENT = 'PLAYER_EVENT_WAS_SENT',
    JOIN_ROOM = 'JOIN_ROOM',
    PLAYER_WAS_JOINED = 'PLAYER_WAS_JOINED',
    SEND_PLAYER_EVENT = 'SEND_PLAYER_EVENT',
    FINISH_ROOM = 'FINISH_ROOM',
}

export type PlayerEventWasSentResponse = {
    players: {[id: string]: PlayerEvent}[],
};

export type JoinRoomResponse = {
    your_player: string,
};

export type PlayerWasJoinedResponse = {
    players: string[],
    is_game_playing: boolean,
};

export type GameResponse = PlayerEventWasSentResponse | JoinRoomResponse | PlayerWasJoinedResponse;

type Player = {
    id: string,
    ws: WebSocket,
    event: PlayerEvent,
};


export class Room {
    id: string;
    expectedPlayersCount: number;
    isGamePlaying: boolean = false;
    players: {[id: string]: Player} = {};

    constructor(roomId: string, expectedPlayersCount: number) {
        this.id = roomId;
        this.expectedPlayersCount = expectedPlayersCount;
    }

    addPlayer(playerId: string, ws: WebSocket) {
        const player: Player = {
            id: playerId,
            ws: ws,
            event: PlayerEvent.NONE,
        };
        this.players[playerId] = player;
        console.log('Player was added', playerId);
    }

    removePlayer(playerId: string) {
        if (this.players.hasOwnProperty(playerId)) {
            delete this.players[playerId];
            console.log('Player was removed', playerId);
        } else {
            console.log('Error. Trying to delete an unknown player');
        }
    }

    getAllCurrentEvents() : {[id: string]: PlayerEvent}[] {
        return Object.entries(this.players).map(
            ([playerId, player]) : {[id: string]: PlayerEvent} => {
                return {[playerId]: player.event}
            });
    }

    getCurrentJoinedPlayers() : string[] {
        return Object.keys(this.players);
    }

    getGamePlaying() : boolean {
        console.log(Object.keys(this.players).length, this.expectedPlayersCount);
        return Object.keys(this.players).length === this.expectedPlayersCount;
    }

    setGamePlaying(isGamePlaying: boolean) {
        this.isGamePlaying = isGamePlaying;
    }

    setPlayerEvent(playerId: string, event: PlayerEvent) {
        this.players[playerId].event = event;
    }

    clearAllCurrentEvents() {
        for (let playerId in this.players) {
            const player = this.players[playerId];
            player.event = PlayerEvent.NONE;
        }
    }

    sendToOne(method: GameMethod, response: GameResponse, playerId: string, isResponse: boolean = false) {
        const ws = this.players[playerId].ws;
        const dataField = isResponse ? 'result' : 'parameters';
        const messageToSend = {method: method, [dataField]: response};
        ws.send(JSON.stringify(messageToSend));
        console.log('Message was sent to', playerId);
    }

    sendToAll(method: GameMethod, response: GameResponse) {
        for (const playerId in this.players) {
            const player = this.players[playerId];
            const messageToSend = {method: method, parameters: response};
            player.ws.send(JSON.stringify(messageToSend));
            console.log('Message was sent to', playerId);
        }
    }
}
