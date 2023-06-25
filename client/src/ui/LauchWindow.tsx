import React from "react";

export type Props = {
  createRoom: (nickname: string, playerCount: number) => void;
  joinRoom: (roomId: string, nickname: string) => void;
  roomId: string | null;
  isCreateRoomVisible: boolean;
  isJoinRoomVisible: boolean;
  isPlayerCountVisible: boolean;
  isNicknameVisible: boolean;
};

export class LauchWindow extends React.Component<Props> {
  state: { nickname: string; playerCount: number };

  constructor(props: Props) {
    super(props);

    this.state = { nickname: "", playerCount: 2 };
  }

  handleNickname = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ nickname: event.target.value });
  };

  handlePlayerCount = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ playerCount: event.target.value });
  };

  handleCreateRoomButton = () => {
    console.log(this.state.nickname, this.state.playerCount);
    this.props.createRoom(this.state.nickname, this.state.playerCount);
  };

  handleJoinRoomButton = () => {
    console.log(this.state.nickname);
    this.props.joinRoom(this.props.roomId, this.state.nickname);
  };

  render() {
    return (
      <dialog open>
        <article>
          {this.props.isNicknameVisible && (
            <label>
              Enter Nickname
              <input
                type="text"
                placeholder="Nickname"
                value={this.state.nickname}
                onChange={this.handleNickname}
              />
            </label>
          )}
          {this.props.isPlayerCountVisible && (
            <label>
              Enter Player's count
              <input
                type="number"
                placeholder="Player's count"
                value={this.state.playerCount}
                onChange={this.handlePlayerCount}
              />
            </label>
          )}
          {this.props.isCreateRoomVisible && (
            <button onClick={this.handleCreateRoomButton}>Create room</button>
          )}
          {this.props.isJoinRoomVisible && (
            <button onClick={this.handleJoinRoomButton}>Join room</button>
          )}
          {this.props.roomId && (
            <label>{`http://localhost:1234/room/${this.props.roomId}`}</label>
          )}
        </article>
      </dialog>
    );
  }
}
