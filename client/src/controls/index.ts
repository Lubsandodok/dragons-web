export class Controls {
    websocket: WebSocket;

    constructor() {
        window.addEventListener('keydown', (event: KeyboardEvent) => this.onKeyDown(event));
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space') {
            console.log('Space was pressed');
        }
    }

    joinRoom(roomId: string) {
        this.websocket = new WebSocket('ws://localhost:9001/room/join');
        this.websocket.onmessage = (event: MessageEvent) => this.onMessage(event);

        this.websocket.onopen = (event: Event) => {
            console.log('Connected to server');
            this.websocket.send(roomId);
        }
    }

    onMessage(event: MessageEvent) {
        console.log('Got message from server:', event.data);
    }
}
