import { HttpResponse } from "uWebSockets.js";

export function readJson(res: HttpResponse, cb: any, err: any) {
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
