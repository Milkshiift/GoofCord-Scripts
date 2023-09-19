import {find} from "../lib";
import * as spitroast from 'spitroast';

export function patchScreenshareQuality(framerate, height) {
    const StreamQuality = find(m => m.prototype?.getVideoQuality);
    const ASPECT_RATIO = screen.width / screen.height;
    const width = Math.round(height * ASPECT_RATIO);
    console.log(StreamQuality)

    spitroast.after("getVideoQuality", StreamQuality.prototype, (response) => {
        response = {
            bitrateMin: 10000,
            bitrateMax: 10000,
            localWant: 100,
            capture: {
                framerate,
                width,
                height,
                pixelCount: height * width
            },
            encode: {
                framerate,
                width,
                height,
                pixelCount: height * width
            }
        }
        return response;
    }, false)
    spitroast.after("getQuality", StreamQuality.prototype, (response) => {
        response = {
            bitrateMin: 500000,
            bitrateMax: 8000000,
            localWant: 100,
            capture: {
                framerate,
                width,
                height,
                pixelCount: height * width
            },
            encode: {
                framerate,
                width,
                height,
                pixelCount: height * width
            }
        }
        return response;
    }, false)
}