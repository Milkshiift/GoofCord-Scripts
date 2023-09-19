import {log} from "./lib";
import {patchScreenshareQuality} from "./patches/screenshareQuality";

log("Loading...")

window.GMHelper = {
    patchScreenshareQuality: patchScreenshareQuality
}

try {
    log("Loading screenshare quality patch...")
    patchScreenshareQuality(60, 720)
} catch (e) {
    console.error(e)
}