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
    createRoom: (nickname: string) => void,
    link: string | null,
};

export default class Rooms extends React.Component<RoomsProps> {
    state: {nickname: string};

    constructor(props: RoomsProps) {
        super(props);

        this.state = {nickname: ''};
    }

    handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({nickname: event.target.value});
    };

    handleCreateRoomButton = () => {
        console.log(this.state.nickname);
        this.props.createRoom(this.state.nickname);
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
                        onChange={this.handleInput}
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
