export interface Movable {
    moveUp(): void;
    moveLeft(): void;
    moveRight(): void;
}

export interface WorldUpdatable {
    createCharacter(playerId: string, isPlayer: boolean): void;
    moveCharacter(playerId: string, event: string): void;
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
        this.ws.send(JSON.stringify({type: 'event', event: event.code}));
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
            this.ws.send(JSON.stringify({type: 'join', room_id: roomId}));
        }
    }

    onMessage(event: MessageEvent) {
        console.log('Got message from server:', event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'join') {
            console.log('Joined room with id', data.your_player_id);
            for (const playerId of data.players) {
                const isPlayer = playerId === data.your_player_id;
                this.world.createCharacter(playerId, isPlayer);
            }
        } else if (data.type === 'event') {
            console.log('Got event', data.players);
            for (const playerId in data.players) {
                this.world.moveCharacter(playerId, data.players[playerId]);
                console.log('Moved', playerId, 'to', data.players[playerId]);
            }

        }
    }
}
