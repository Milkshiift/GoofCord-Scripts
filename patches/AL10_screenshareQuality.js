/**
 * @name ScreenshareQualityPatch
 * @description Allows you to modify screenshare quality
 * @version 1.1.0
 */

// Spitroast
var y=["a","b","i"],n=new Map;function j(s,t,o,r,i){let e=n.get(t)?.[s];if(!e)return i?Reflect.construct(t[s],o,r):t[s].apply(r,o);for(let c of e.b.values()){let l=c.call(r,o);Array.isArray(l)&&(o=l)}let p=[...e.i.values()].reduce((c,l)=>(...f)=>l.call(r,f,c),(...c)=>i?Reflect.construct(e.o,c,r):e.o.apply(r,c))(...o);for(let c of e.a.values())p=c.call(r,o,p)??p;return p}function u(s,t,o,r){let i=n.get(s),e=i?.[t];return e?.[r].has(o)?(e[r].delete(o),y.every(p=>e[p].size===0)&&(Reflect.defineProperty(s,t,{value:e.o,writable:!0,configurable:!0})||(s[t]=e.o),delete i[t]),Object.keys(i).length==0&&n.delete(s),!0):!1}function g(){for(let[s,t]of n.entries())for(let o in t)for(let r of y)for(let i of t[o]?.[r].keys()??[])u(s,o,i,r)}var d=s=>(t,o,r,i=!1)=>{if(typeof o[t]!="function")throw new Error(`${t} is not a function in ${o.constructor.name}`);n.has(o)||n.set(o,{});let e=n.get(o);if(!e[t]){let l=o[t];e[t]={o:l,b:new Map,i:new Map,a:new Map};let f=(h,a,b)=>{let k=j(t,o,a,h,b);return i&&c(),k},w=new Proxy(l,{apply:(h,a,b)=>f(a,b,!1),construct:(h,a)=>f(l,a,!0),get:(h,a,b)=>a=="toString"?l.toString.bind(l):Reflect.get(h,a,b)});Reflect.defineProperty(o,t,{value:w,configurable:!0,writable:!0})||(o[t]=w)}let p=Symbol(),c=()=>u(o,t,p,s);return e[t][s].set(p,r),c};var before=d("b"),instead=d("i"),after=d("a");

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