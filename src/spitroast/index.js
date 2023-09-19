import getPatchFunc from "./getPatchFunc.js";
import { unpatchAll } from "./unpatch.js";

window.spitroast = {};

window.spitroast.before = getPatchFunc("b");
window.spitroast.instead = getPatchFunc("i");
window.spitroast.after = getPatchFunc("a");
window.spitroast.unpatchAll = unpatchAll;
