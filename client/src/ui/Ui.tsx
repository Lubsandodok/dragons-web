import React from "react";

import Panel from "./Panel";
import { PanelState } from "../canvas";

import {type Props as LauchWindowProps, LauchWindow } from "./LauchWindow";

type UiProps = {
  isRoomsVisible: boolean;
  roomProps: LauchWindowProps;
  panelState: PanelState;
};

class Ui extends React.Component<UiProps> {
  constructor(props: UiProps) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.isRoomsVisible ? <LauchWindow {...this.props.roomProps} /> : <Panel {...this.props.panelState} />}
      </div>
    );
  }
}

export default Ui;
