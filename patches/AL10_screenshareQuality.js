/**
 * @name ScreenshareQualityPatch
 * @description Allows you to modify screenshare quality
 * @version 1.1.1
 */

function after(functionName, object, callback, once = false) {
    const originalFunction = object[functionName];
  
    object[functionName] = function (...args) {
      const result = originalFunction.apply(this, args);
      const newResult = callback.call(this, result, ...args);
  
      if (once) {
        object[functionName] = originalFunction;
      }
  
      return newResult === undefined ? result : newResult;
    };
}

function patchScreenshareQuality(responseParams) {
    console.log("[ScreenshareQualityPatch] Loading screenshare quality patch...");
    const StreamQuality = Vencord.Webpack.findByProps("VIDEO_QUALITY_MODES_TO_OVERWRITES").VideoQualityManager;
    const ASPECT_RATIO = screen.width / screen.height;
    const width = Math.round(responseParams.height * ASPECT_RATIO);

    after("getVideoQuality", StreamQuality.prototype, (response) => {
        response = {
            bitrateMin: responseParams.bitrateMin || 500000,
            bitrateMax: responseParams.bitrateMax || 70000000,
            bitrateTarget: responseParams.bitrateTarget || 40000000,
            localWant: responseParams.localWant || 100,
            capture: {
                framerate: responseParams.framerate || 30,
                width,
                height: responseParams.height || 720,
                pixelCount: width * (responseParams.height || 720)
            },
            encode: {
                framerate: responseParams.framerate || 30,
                width,
                height: responseParams.height || 720,
                pixelCount: width * (responseParams.height || 720)
            }
        };
        return response;
    }, false);

    after("getQuality", StreamQuality.prototype, (response) => {
        response = {
            bitrateMin: responseParams.bitrateMin || 500000,
            bitrateMax: responseParams.bitrateMax || 70000000,
            bitrateTarget: responseParams.bitrateTarget || 40000000,
            localWant: responseParams.localWant || 100,
            capture: {
                framerate: responseParams.framerate || 30,
                width,
                height: responseParams.height || 720,
                pixelCount: width * (responseParams.height || 720)
            },
            encode: {
                framerate: responseParams.framerate || 30,
                width,
                height: responseParams.height || 720,
                pixelCount: width * (responseParams.height || 720)
            }
        };
        return response;
    }, false);
}

// Setting default settings
patchScreenshareQuality({
    framerate: 30,
    height: 1080
});

window.ScreenshareQuality = {};
window.ScreenshareQuality.patchScreenshareQuality = patchScreenshareQuality;