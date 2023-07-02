import React from 'react';
import CSS from 'csstype';

// @ts-expect-error<parcel import>
import heartImage from 'url:../assets/heart.png';

const DivCss: CSS.Properties = {
    position: 'absolute',
    margin: 'auto',
    right: 0,
    top: 0,

    width: 'max-content',
    height: 'max-content',
    backgroundColor: 'transparent',
};

type PanelProps = {
    playerLives: number,
    winnerName: string | null,
};

export default class Panel extends React.Component<PanelProps> {
    constructor(props: PanelProps) {
        super(props);
    }

    render() {
        const lives = Array.from(
            {length: this.props.playerLives}, (_, i) => <img src={heartImage} />
        );
        return (
            <div>
                <div style={DivCss}>
                    {lives}
                </div>

                {this.props.winnerName &&
                    <label>
                        {this.props.winnerName} won!
                    </label>
                }
            </div>
        );
    }
}
