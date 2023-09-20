var goofmod=(function(exports){'use strict';/**
 * @name GoofMod
 * @description Helper mod for GoofCord
 * @version 1.0.0
 */

/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const subscriptions = new Map();
const listeners = new Set();
let cache, wreq$1;
let webpackChunk;
const WEBPACK_CHUNK = "webpackChunkdiscord_app";

function _initWebpack(instance) {
    if (cache !== void 0) throw "no.";

    wreq$1 = instance.push([[Symbol("GoofMod_Helper")], {}, r => r]);
    cache = wreq$1.c;
    instance.pop();
}

function patchPush() {
    function handlePush(chunk) {
        try {
            const modules = chunk[1];
            for (const id in modules) {
                let mod = modules[id];
                // Discords Webpack chunks for some ungodly reason contain random
                // newlines. Cyn recommended this workaround and it seems to work fine,
                // however this could potentially break code, so if anything goes weird,
                // this is probably why.
                // Additionally, `[actual newline]` is one less char than "\n", so if Discord
                // ever targets newer browsers, the minifier could potentially use this trick and
                // cause issues.
                let code = mod.toString().replaceAll("\n", "");
                // a very small minority of modules use function() instead of arrow functions,
                // but, unnamed toplevel functions aren't valid. However 0, function() makes it a statement
                if (code.startsWith("function(")) {
                    code = "0," + code;
                }
                const originalMod = mod;

                const factory = modules[id] = function (module, exports, require) {
                    try {
                        mod(module, exports, require);
                    } catch (err) {
                        // Just rethrow discord errors
                        if (mod === originalMod) throw err;

                        console.error("Error in patched chunk", err);
                        return void originalMod(module, exports, require);
                    }

                    // There are (at the time of writing) 11 modules exporting the window
                    // Make these non enumerable to improve webpack search performance
                    if (module.exports === window) {
                        Object.defineProperty(require.c, id, {
                            value: require.c[id],
                            enumerable: false,
                            configurable: true,
                            writable: true
                        });
                        return;
                    }

                    const numberId = Number(id);

                    for (const callback of listeners) {
                        try {
                            callback(exports, numberId);
                        } catch (err) {
                            console.error("Error in webpack listener", err);
                        }
                    }

                    for (const [filter, callback] of subscriptions) {
                        try {
                            if (filter(exports)) {
                                subscriptions.delete(filter);
                                callback(exports, numberId);
                            } else if (typeof exports === "object") {
                                if (exports.default && filter(exports.default)) {
                                    subscriptions.delete(filter);
                                    callback(exports.default, numberId);
                                }

                                for (const nested in exports) if (nested.length <= 3) {
                                    if (exports[nested] && filter(exports[nested])) {
                                        subscriptions.delete(filter);
                                        callback(exports[nested], numberId);
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("Error while firing callback for webpack chunk", err);
                        }
                    }
                };

                // for some reason throws some error on which calling .toString() leads to infinite recursion
                // when you force load all chunks???
                try {
                    factory.toString = () => mod.toString();
                    factory.original = originalMod;
                } catch {
                }


            }
        } catch (err) {
            console.error("Error in handlePush", err);
        }

        return handlePush.original.call(window[WEBPACK_CHUNK], chunk);
    }

    handlePush.original = window[WEBPACK_CHUNK].push;
    Object.defineProperty(window[WEBPACK_CHUNK], "push", {
        get: () => handlePush,
        set: v => (handlePush.original = v),
        configurable: true
    });
}

if (window[WEBPACK_CHUNK]) {
    console.info(`Patching ${WEBPACK_CHUNK}.push (was already existant, likely from cache!)`);
    _initWebpack(window[WEBPACK_CHUNK]);
    patchPush();
} else {
    Object.defineProperty(window, WEBPACK_CHUNK, {
        get: () => webpackChunk,
        set: v => {
            if (v?.push !== Array.prototype.push) {
                console.info(`Patching ${WEBPACK_CHUNK}.push`);
                _initWebpack(v);
                patchPush();
                delete window[WEBPACK_CHUNK];
                window[WEBPACK_CHUNK] = v;
            }
            webpackChunk = v;
        },
        configurable: true
    });
}// we use this array multiple times
const patchTypes = ["a", "b", "i"];
const patchedObjects = new Map();// calls relevant patches and returns the final result
function hook (funcName, funcParent, funcArgs, 
// the value of `this` to apply
ctxt, 
// if true, the function is actually constructor
isConstruct) {
    const patch = patchedObjects.get(funcParent)?.[funcName];
    // This is in the event that this function is being called after all patches are removed.
    if (!patch)
        return isConstruct
            ? Reflect.construct(funcParent[funcName], funcArgs, ctxt)
            : funcParent[funcName].apply(ctxt, funcArgs);
    // Before patches
    for (const hook of patch.b.values()) {
        const maybefuncArgs = hook.call(ctxt, funcArgs);
        if (Array.isArray(maybefuncArgs))
            funcArgs = maybefuncArgs;
    }
    // Instead patches
    let workingRetVal = [...patch.i.values()].reduce((prev, current) => (...args) => current.call(ctxt, args, prev), 
    // This calls the original function
    (...args) => isConstruct
        ? Reflect.construct(patch.o, args, ctxt)
        : patch.o.apply(ctxt, args))(...funcArgs);
    // After patches
    for (const hook of patch.a.values())
        workingRetVal = hook.call(ctxt, funcArgs, workingRetVal) ?? workingRetVal;
    return workingRetVal;
}function unpatch(funcParent, funcName, hookId, type) {
    const patchedObject = patchedObjects.get(funcParent);
    const patch = patchedObject?.[funcName];
    if (!patch?.[type].has(hookId))
        return false;
    patch[type].delete(hookId);
    // If there are no more hooks for every type, remove the patch
    if (patchTypes.every((t) => patch[t].size === 0)) {
        // reflect defineproperty is like object defineproperty
        // but instead of erroring it returns if it worked or not.
        // this is more easily minifiable, hence its use. -- sink
        const success = Reflect.defineProperty(funcParent, funcName, {
            value: patch.o,
            writable: true,
            configurable: true,
        });
        if (!success)
            funcParent[funcName] = patch.o;
        delete patchedObject[funcName];
    }
    if (Object.keys(patchedObject).length == 0)
        patchedObjects.delete(funcParent);
    return true;
}
function unpatchAll() {
    for (const [parentObject, patchedObject] of patchedObjects.entries())
        for (const funcName in patchedObject)
            for (const hookType of patchTypes)
                for (const hookId of patchedObject[funcName]?.[hookType].keys() ?? [])
                    unpatch(parentObject, funcName, hookId, hookType);
}// curried - getPatchFunc("before")(...)
// allows us to apply an argument while leaving the rest open much cleaner.
// functional programming strikes again! -- sink
// creates a hook if needed, else just adds one to the patches array
var getPatchFunc = (patchType) => (funcName, funcParent, callback, oneTime = false) => {
    if (typeof funcParent[funcName] !== "function")
        throw new Error(`${funcName} is not a function in ${funcParent.constructor.name}`);
    if (!patchedObjects.has(funcParent))
        patchedObjects.set(funcParent, {});
    const parentInjections = patchedObjects.get(funcParent);
    if (!parentInjections[funcName]) {
        const origFunc = funcParent[funcName];
        // note to future me optimising for size: extracting new Map() to a func increases size --sink
        parentInjections[funcName] = {
            o: origFunc,
            b: new Map(),
            i: new Map(),
            a: new Map(),
        };
        const runHook = (ctxt, args, construct) => {
            const ret = hook(funcName, funcParent, args, ctxt, construct);
            if (oneTime)
                unpatchThisPatch();
            return ret;
        };
        const replaceProxy = new Proxy(origFunc, {
            apply: (_, ctxt, args) => runHook(ctxt, args, false),
            construct: (_, args) => runHook(origFunc, args, true),
            get: (target, prop, receiver) => prop == "toString"
                ? origFunc.toString.bind(origFunc)
                : Reflect.get(target, prop, receiver),
        });
        // this works around breaking some async find implementation which listens for assigns via proxy
        // see comment in unpatch.ts
        const success = Reflect.defineProperty(funcParent, funcName, {
            value: replaceProxy,
            configurable: true,
            writable: true,
        });
        if (!success)
            funcParent[funcName] = replaceProxy;
    }
    const hookId = Symbol();
    const unpatchThisPatch = () => unpatch(funcParent, funcName, hookId, patchType);
    parentInjections[funcName][patchType].set(hookId, callback);
    return unpatchThisPatch;
};window.spitroast = {};

window.spitroast.before = getPatchFunc("b");
window.spitroast.instead = getPatchFunc("i");
window.spitroast.after = getPatchFunc("a");
window.spitroast.unpatchAll = unpatchAll;/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


exports.SelectedGuildStore=void 0;
exports.FluxDispatcher=void 0;
exports.SettingsRouter=void 0;

window.goofmod = {};

function log(data) {
    console.log("%c[GoofMod]", "color: #5865f2;", data);
}
window.goofmod.log = log;

log("Loading...");

const filters = {
    byProps: (...props) =>
        props.length === 1
            ? m => m[props[0]] !== void 0
            : m => props.every(p => m[p] !== void 0),

    byCode: (...code) => m => {
        if (typeof m !== "function") return false;
        const s = Function.prototype.toString.call(m);
        for (const c of code) {
            if (!s.includes(c)) return false;
        }
        return true;
    },
    byStoreName: (name) => m =>
        m.constructor?.displayName === name
};

/**
 * Find the first module that matches the filter
 */
function find(filter, getDefault = true, isWaitFor = false) {
    if (typeof filter !== "function")
        throw new Error("Invalid filter. Expected a function got " + typeof filter);

    for (const key in cache) {
        const mod = cache[key];
        if (!mod?.exports) continue;

        if (filter(mod.exports)) {
            return isWaitFor ? [mod.exports, Number(key)] : mod.exports;
        }

        if (typeof mod.exports !== "object") continue;

        if (mod.exports.default && filter(mod.exports.default)) {
            const found = getDefault ? mod.exports.default : mod.exports;
            return isWaitFor ? [found, Number(key)] : found;
        }

        // the length check makes search about 20% faster
        for (const nestedMod in mod.exports) if (nestedMod.length <= 3) {
            const nested = mod.exports[nestedMod];
            if (nested && filter(nested)) {
                return isWaitFor ? [nested, Number(key)] : nested;
            }
        }
    }

    if (!isWaitFor) {
        const err = new Error("Didn't find module matching this filter");
        console.warn(err);
    }

    return isWaitFor ? [null, null] : null;
}
window.goofmod.find = find;

/**
 * Find the first module that has the specified properties
 */
function findByProps(...props) {
    return find(filters.byProps(...props));
}
window.goofmod.findByProps = findByProps;

const GET_KEY = Symbol.for("GoofMod_Helper.lazy.get");
const CACHED_KEY = Symbol.for("GoofMod_Helper.lazy.cached");
const handler = {};

/**
 * Wraps the result of {@see makeLazy} in a Proxy you can consume as if it wasn't lazy.
 * On first property access, the lazy is evaluated
 * @param factory lazy factory
 * @returns Proxy
 *
 * Note that the example below exists already as an api, see {@link findByPropsLazy}
 * @example const mod = proxyLazy(() => findByProps("blah")); console.log(mod.blah);
 */
function proxyLazy(factory) {
    const proxyDummy = Object.assign(function () {
    }, {
        [CACHED_KEY]: void 0,
        [GET_KEY]: () => proxyDummy[CACHED_KEY] ??= factory(),
    });

    return new Proxy(proxyDummy, handler);
}

/**
 * find but lazy
 */
function findLazy(filter, getDefault = true) {
    return proxyLazy(() => find(filter, getDefault));
}
window.goofmod.findLazy = findLazy;

/**
 * Finds a mangled module by the provided code "code" (must be unique and can be anywhere in the module)
 * then maps it into an easily usable module via the specified mappers
 * @param code Code snippet
 * @param mappers Mappers to create the non mangled exports
 * @returns Unmangled exports as specified in mappers
 *
 * @example mapMangledModule("headerIdIsManaged:", {
 *             openModal: filters.byCode("headerIdIsManaged:"),
 *             closeModal: filters.byCode("key==")
 *          })
 */
function mapMangledModule(code, mappers) {
    const exports = {};

    const id = findModuleId(code);
    if (id === null)
        return exports;

    const mod = wreq(id);
    outer:
        for (const key in mod) {
            const member = mod[key];
            for (const newName in mappers) {
                // if the current mapper matches this module
                if (mappers[newName](member)) {
                    exports[newName] = member;
                    continue outer;
                }
            }
        }
    return exports;
}

/**
 * Same as {@link mapMangledModule} but lazy
 */
function mapMangledModuleLazy(code, mappers) {
    return proxyLazy(() => mapMangledModule(code, mappers));
}

/**
 * Wait for a module that matches the provided filter to be registered,
 * then call the callback with the module as the first argument
 */
function waitFor(filter, callback) {
    if (typeof filter === "string")
        filter = filters.byProps(filter);
    else if (Array.isArray(filter))
        filter = filters.byProps(...filter);
    else if (typeof filter !== "function")
        throw new Error("filter must be a string, string[] or function, got " + typeof filter);

    const [existing, id] = find(filter, true, true);
    if (existing) return void callback(existing, id);

    subscriptions.set(filter, callback);
}

function waitForStore(name, cb) {
    waitFor(filters.byStoreName(name), cb);
}

const NavigationRouter = mapMangledModuleLazy("transitionToGuild - ", {
    transitionTo: filters.byCode("transitionTo -"),
    transitionToGuild: filters.byCode("transitionToGuild -"),
    goBack: filters.byCode("goBack()"),
    goForward: filters.byCode("goForward()"),
});

waitFor(["dispatch", "subscribe"], m => {
    exports.FluxDispatcher = m;
    const cb = () => {
        m.unsubscribe("CONNECTION_OPEN", cb);
        _resolveReady();
    };
    m.subscribe("CONNECTION_OPEN", cb);
});

waitForStore("SelectedGuildStore", m => exports.SelectedGuildStore = m);
waitFor(["open", "saveAccountChanges"], m => exports.SettingsRouter = m);
waitFor(["open", "saveAccountChanges"], m => exports.SettingsRouter = m);exports.NavigationRouter=NavigationRouter;exports.filters=filters;exports.find=find;exports.findByProps=findByProps;exports.findLazy=findLazy;exports.log=log;exports.mapMangledModule=mapMangledModule;exports.mapMangledModuleLazy=mapMangledModuleLazy;exports.proxyLazy=proxyLazy;exports.waitFor=waitFor;exports.waitForStore=waitForStore;return exports;})({});