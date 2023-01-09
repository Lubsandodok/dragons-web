import React from 'react';

import Rooms from './Rooms';

type UiProps = {
    isRoomsVisible: boolean,
    link: string,
    createRoom: (nickname: string, playerCount: number) => void,
};

class Ui extends React.Component<UiProps> {
    constructor(props: UiProps) {
        super(props);   
    }

    render() {
        return (
            <div>
                {this.props.isRoomsVisible &&
                    <Rooms
                        createRoom={this.props.createRoom}
                        link={this.props.link}
                    />
                }
            </div>
        );
    }
}

export default Ui;
