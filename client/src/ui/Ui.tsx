import React from 'react';

import { Rooms, RoomsProps } from './Rooms';
import Panel from './Panel';
import { PanelState } from '../canvas';

type UiProps = {
    isRoomsVisible: boolean,
    roomProps: RoomsProps,
    panelState: PanelState,
};

class Ui extends React.Component<UiProps> {
    constructor(props: UiProps) {
        super(props);   
    }

    render() {
        return (
            <div>
                {this.props.isRoomsVisible &&
                    <Rooms {...this.props.roomProps}/>
                }
                {!this.props.isRoomsVisible &&
                    <Panel {...this.props.panelState}/>
                }
            </div>
        );
    }
}

export default Ui;
