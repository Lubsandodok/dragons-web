import React from 'react';

import Rooms from './Rooms';
import Panel from './Panel';
import { PanelState } from '../canvas';

type UiProps = {
    isRoomsVisible: boolean,
    link: string,
    panelState: PanelState,
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
                {!this.props.isRoomsVisible &&
                    <Panel playerLives={this.props.panelState.playerLives} />
                }
            </div>
        );
    }
}

export default Ui;
