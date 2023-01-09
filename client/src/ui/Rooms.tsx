import React from 'react';
import CSS from 'csstype';

const DivCss: CSS.Properties = {
    position: 'absolute',
    margin: 'auto',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    width: 'max-content',
    height: 'max-content',
    backgroundColor: 'lightblue',
};

type RoomsProps = {
    createRoom: (nickname: string, playerCount: number) => void,
    link: string | null,
};

export default class Rooms extends React.Component<RoomsProps> {
    state: {nickname: string, playerCount: number};

    constructor(props: RoomsProps) {
        super(props);

        this.state = {nickname: '', playerCount: 2};
    }

    handleNickname = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({nickname: event.target.value});
    };

    handlePlayerCount = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({playerCount: event.target.value});
    };

    handleCreateRoomButton = () => {
        console.log(this.state.nickname, this.state.playerCount);
        this.props.createRoom(this.state.nickname, this.state.playerCount);
    };

    render() {
        return (
            <div style={DivCss}>
                <label>
                    Enter Nickname
                    <input
                        type='text'
                        placeholder='Nickname'
                        value={this.state.nickname}
                        onChange={this.handleNickname}
                    />
                </label>
                <label>
                    Enter Player's count
                    <input
                        type='number'
                        placeholder="Player's count"
                        value={this.state.playerCount}
                        onChange={this.handlePlayerCount}
                    />
                </label>
                <button onClick={this.handleCreateRoomButton}>
                    Create room
                </button>
                {this.props.link && <label>{this.props.link}</label>}
            </div>
        );
    }
}
