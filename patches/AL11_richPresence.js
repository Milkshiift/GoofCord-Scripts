/**
 * @name RichPresence
 * @description Adds arRPC support
 * @version 1.0.0
 */

const RpcUtils = Vencord.Webpack.findByPropsLazy("fetchApplicationsRPC", "getRemoteIconURL");

async function lookupAsset(applicationId, key) {
    return (await Vencord.Webpack.Common.ApplicationAssetUtils.fetchAssetIds(applicationId, [key]))[0];
}

const apps = {};
async function lookupApp(applicationId) {
    const socket = {};
    await RpcUtils.fetchApplicationsRPC(socket, applicationId);
    return socket.application;
}

goofcord.rpcListen(async (data) => {
    msg = data;

    if (msg.activity?.assets?.large_image)
        msg.activity.assets.large_image = await lookupAsset(
            msg.activity.application_id,
            msg.activity.assets.large_image
        );
    if (msg.activity?.assets?.small_image)
        msg.activity.assets.small_image = await lookupAsset(
            msg.activity.application_id,
            msg.activity.assets.small_image
        );
    if (msg.activity) {
        const appId = msg.activity.application_id;
        if (!apps[appId]) apps[appId] = await lookupApp(appId);
        const app = apps[appId];
        if (!msg.activity.name) msg.activity.name = app.name;
    }

    Vencord.Webpack.Common.FluxDispatcher.dispatch({type: "LOCAL_ACTIVITY_UPDATE", ...msg});
});