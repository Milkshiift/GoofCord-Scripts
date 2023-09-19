function patchScreenshareQuality(framerate, height) {
    window.goofmod.log("Loading screenshare quality patch...")
    const StreamQuality = window.goofmod.find(m => m.prototype?.getVideoQuality);
    const ASPECT_RATIO = screen.width / screen.height;
    const width = Math.round(height * ASPECT_RATIO);

    window.spitroast.after("getVideoQuality", StreamQuality.prototype, (response) => {
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
    window.spitroast.after("getQuality", StreamQuality.prototype, (response) => {
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
patchScreenshareQuality(30,720);

window.patchScreenshareQuality = patchScreenshareQuality;