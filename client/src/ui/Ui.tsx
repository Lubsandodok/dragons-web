import React from 'react';
import CSS from 'csstype';

import Rooms from './Rooms';

type UiProps = {
    handle: () => void;
};

class Ui extends React.Component<UiProps> {
    state: {link: string | null};

    constructor(props: UiProps) {
        super(props);   

        this.state = {link: null};
    }

    createRoom = (nickname: string) => {
        console.log(nickname);
        fetch('http://127.0.0.1:1234/api/room/create', {
            method: 'POST',
//            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({nickname}),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('Success:', data);
            const fullLink = `http://localhost:1234/room/${data.room_id}`;
            this.setState({link: fullLink});
        })
        .catch((error) => {
            console.log('Error:', error);
        });
    };

    render() {
        return (
            <Rooms
                createRoom={this.createRoom}
                link={this.state.link}
            />
        );
    }
}

export default Ui;
