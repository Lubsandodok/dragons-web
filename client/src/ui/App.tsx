import React from "react";
import { Canvas, loadResources, loadPhysicsEngine } from "../canvas";
import { Controls } from "../controls";
import Ui from './Ui';

class App extends React.Component {
    canvas: Canvas;
    controls: Controls;
    canvasRef: React.RefObject<HTMLCanvasElement>;

    state: {isGameVisible: boolean};

    constructor(props: any) {
        super(props);
        this.canvasRef = React.createRef<HTMLCanvasElement>();

        this.state = {isGameVisible: true};
    }

    async componentDidMount(): Promise<void> {
        await loadPhysicsEngine();
        await loadResources();
        this.canvas = new Canvas(this.canvasRef.current);
        this.controls = new Controls();

        this.canvas.app.ticker.add(() => {
            this.canvas.world.update();
        });

        console.log('location', window.location.pathname.split('/'));
        const splited = window.location.pathname.split('/');
        if (splited.length === 3) {
            const roomId = splited[2];
            console.log('roomId we got', roomId);
            this.controls.joinRoom(roomId);
        }

        return Promise.resolve();
    }

    joinRoom = (roomId: string) => {

    };

    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} />
                <Ui
                    handle={this.handle}
                />
            </div>
        )
    }
}

export default App;
