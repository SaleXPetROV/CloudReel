import stream from "./types.js";

import { closeResponse } from "./shared.js";
import { internalStream } from "./internal.js";

export default async function(res, streamInfo) {
    try {
        switch (streamInfo.type) {
            case "proxy":
                return await stream.proxy(streamInfo, res);

            case "internal":
                return await internalStream(streamInfo.data, res);

            case "merge":
                return await stream.merge(streamInfo, res);

            case "remux":
            case "mute":
                return await stream.remux(streamInfo, res);

            case "audio":
                return await stream.convertAudio(streamInfo, res);

            case "gif":
<<<<<<< HEAD
                return await stream.convertGif(streamInfo, res);
=======
                return stream.convertGif(streamInfo, res);

            case "direct":
                return stream.direct(streamInfo, res);
>>>>>>> 96c9367ea7b5d6c4bc6e6fbd65b45b64fe7b05d1
        }

        closeResponse(res);
    } catch {
        closeResponse(res);
    }
}
