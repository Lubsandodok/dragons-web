import { v4 } from 'uuid';

import { App, HttpRequest, HttpResponse, WebSocket } from 'uWebSockets.js';

type Room = {
    id: string,
};

let store: {rooms: {[id: string]: Room}} = {
    rooms: {},
};

const app = App({
}).ws('/room/join', {
    open: (ws: WebSocket) => {
        console.log('WebSocket connection opened');
    },
    message: (ws, message, isBinary) => {
        console.log(`Got message: ${message}`);
        let ok = ws.send(message, isBinary, false);
        console.log(ok);
    }
}).post('/room/create', (res: HttpResponse, req: HttpRequest) => {
    console.log('Request:', req);
    const url = req.getUrl();

    readJson(res, (obj: any) => {
        console.log('Posted to ' + url + ': ');
        const roomId = v4();
        store.rooms[roomId] = {id: roomId};
        res.end(JSON.stringify({'room_id': roomId}));
        console.log('Created room with id: ' + roomId);
    }, () => {
        console.log('Invalid JSON');
    });

    res.onAborted(() => {
        console.log('Request aborted');
    });
}).post('/http/room/join', (res: HttpResponse, req: HttpRequest) => {
    console.log('RequestToJoin:', req);

    readJson(res, (obj: any) => {
        console.log('Posted to ', obj);
        if (!obj.hasOwnProperty('room_id')) {
            console.log('Request body doesnt have room_id');
            res.end(JSON.stringify({'error': 'Doesnt have a room_id'}));
        }

        const room_id = obj.room_id;
        if (store.rooms.hasOwnProperty(room_id)) {
            const room = store.rooms.room_id;
            console.log('Joined');
            res.end(JSON.stringify({'result': 'You have successfully joined'}));
        } else {
            console.log('Doesnt have a room like that');
            res.end(JSON.stringify({'error': 'Doesnt have a room like that'}));
        }
    }, () => {
        console.log('Invalid JSON');
    });
}).listen(9001, (listenSocket) => {
    if (listenSocket) {
        console.log('Listening to port 9001');
    }
});

function readJson(res: HttpResponse, cb: any, err: any) {
    let buffer: any;
    /* Register data cb */
    res.onData((ab: ArrayBuffer, isLast: boolean) => {
        let chunk: any = Buffer.from(ab);
        if (isLast) {
            let json;
            if (buffer) {
                try {
                    json = JSON.parse(Buffer.concat([buffer, chunk]).toString());
                } catch (e) {
                /* res.close calls onAborted */
                res.close();
                return;
            }
                cb(json);
            } else {
                try {
                    json = JSON.parse(chunk);
                } catch (e) {
                    /* res.close calls onAborted */
                    res.close();
                    return;
                }
                cb(json);
            }
        } else {
            if (buffer) {
                buffer = Buffer.concat([buffer, chunk]);
            } else {
                buffer = Buffer.concat([chunk]);
            }
        }
    });

    /* Register error cb */
    res.onAborted(err);
}
