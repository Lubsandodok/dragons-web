import React from "react";
// import KD from 'keydrown';
import {
  Canvas,
  loadResources,
  loadPhysicsEngine,
  LIVES_AT_START,
  PanelState,
} from "../canvas";
import { Controls } from "../controls";
import { LauchWindowMode } from "./constants";
import type { Props as LauchWindowProps } from "./LauchWindow";
import Ui from "./Ui";

class App extends React.Component {
  canvas: Canvas;
  controls: Controls;
  canvasRef: React.RefObject<HTMLCanvasElement>;

  state: {
    isRoomsVisible: boolean;
    roomProps: LauchWindowProps;
    panelState: PanelState;
  };

  constructor(props: any) {
    super(props);
    this.canvasRef = React.createRef<HTMLCanvasElement>();

    this.state = {
      isRoomsVisible: true,
      roomProps: {
        createRoom: this.createRoom,
        joinRoom: this.joinRoom,
        roomId: null,
        mode: LauchWindowMode.CREATING_ROOM,
      },
      panelState: { playerLives: LIVES_AT_START, winnerName: null },
    };
  }

  async componentDidMount(): Promise<void> {
    await loadPhysicsEngine();
    await loadResources();
    this.controls = new Controls();
    this.canvas = new Canvas(this.canvasRef.current, this.controls);
    this.controls.subscibeWorld(this.canvas.world);

    // TODO: KD typescript types
    // setInterval(() => {
    //   KD.tick();
    //   // console.log('GHERE2');
    // }, 150);

    this.canvas.app.ticker.speed = 1;
    this.canvas.app.ticker.add(() => {
      this.canvas.world.update();
      const currentPanelState = this.canvas.world.getPanelState();
      // TODO
      if (currentPanelState && currentPanelState !== this.state.panelState) {
        this.setState({ panelState: currentPanelState });
      }
    });

    console.log("location", window.location.pathname.split("/"));
    const splited = window.location.pathname.split("/");
    if (splited.length === 3) {
      const roomId = splited[2];
      console.log("roomId we got", roomId);
      this.setState({
        roomProps: {
          ...this.state.roomProps,
          roomId: roomId,
          mode: LauchWindowMode.JOINING_ROOM,
        },
      });
      // this.controls.joinRoom(roomId);
      // this.setState({isRoomsVisible: false});
    }

    //  debug
    // this.setState({isRoomsVisible: false});

    return Promise.resolve();
  }

  createRoom = (nickname: string, playerCount: number) => {
    fetch("http://127.0.0.1:1234/api/room/create", {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname, expected_player_count: playerCount }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        this.setState({
          roomProps: {
            ...this.state.roomProps,
            roomId: data.room_id,
            mode: LauchWindowMode.JOINING_ROOM,
          },
        });
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  joinRoom = (roomId: string, nickname: string) => {
    this.setState({ isRoomsVisible: false });
    this.controls.joinRoom(roomId, nickname);
  };

  render() {
    return (
      <div>
        <canvas ref={this.canvasRef} />
        <Ui
          isRoomsVisible={this.state.isRoomsVisible}
          roomProps={this.state.roomProps}
          panelState={this.state.panelState}
        />
      </div>
    );
  }
}

export default App;
