import React from "react";
import { Canvas, loadResources, loadPhysicsEngine } from "../canvas";
import { Controls } from "../controls";
import Ui from './Ui';

class App extends React.Component {
    canvas: Canvas;
    controls: Controls;
    canvasRef: React.RefObject<HTMLCanvasElement>;

    state: {isRoomsVisible: boolean, link: string};

    constructor(props: any) {
        super(props);
        this.canvasRef = React.createRef<HTMLCanvasElement>();

        this.state = {isRoomsVisible: true, link: null};
    }

    async componentDidMount(): Promise<void> {
        await loadPhysicsEngine();
        await loadResources();
        this.controls = new Controls();
        this.canvas = new Canvas(this.canvasRef.current, this.controls);
        this.controls.subscibeWorld(this.canvas.world);

        this.canvas.app.ticker.speed = 1;
        this.canvas.app.ticker.add(() => {
            this.canvas.world.update();
        });

        console.log('location', window.location.pathname.split('/'));
        const splited = window.location.pathname.split('/');
        if (splited.length === 3) {
            const roomId = splited[2];
            console.log('roomId we got', roomId);
            this.controls.joinRoom(roomId);
            this.setState({isRoomsVisible: false});
        }

    //  debug
        // this.setState({isRoomsVisible: false});

        return Promise.resolve();
    }

    createRoom = (nickname: string, playerCount: number) => {
        fetch('http://127.0.0.1:1234/api/room/create', {
            method: 'POST',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nickname, expected_player_count: playerCount}),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success:', data);
            const fullLink = `http://localhost:1234/room/${data.room_id}`;
            this.setState({link: fullLink});

            setTimeout(() => {
                this.setState({isRoomsVisible: false});
                this.controls.joinRoom(data.room_id);
            }, 5000);
        })
        .catch((error) => {
            console.log('Error:', error);
        });
    };

    render() {
        return (
            <div>
                <canvas
                    ref={this.canvasRef}
                />
                <Ui
                    isRoomsVisible={this.state.isRoomsVisible}
                    createRoom={this.createRoom}
                    link={this.state.link}
                />
            </div>
        )
    }
}

export default App;
