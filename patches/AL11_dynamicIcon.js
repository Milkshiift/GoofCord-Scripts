/**
 * @name DynamicIcon
 * @description Gets data for the dynamic icon feature
 * @version 1.0.0
 */

function setBadge() {
    try {
        const mentionCount = GuildReadStateStore.getTotalMentionCount();
        const pendingRequests = window.Vencord.Webpack.Common.RelationshipStore.getPendingCount();

        let totalCount = mentionCount + pendingRequests;

        window.goofcord.setBadgeCount(totalCount);
    } catch (e) {
        console.error(e);
    }
}

function subscribeToStore(name) {
    const found = window.Vencord.Webpack.find(window.Vencord.Webpack.filters.byStoreName(name));
    found.addChangeListener(setBadge);
    return found;
}

let GuildReadStateStore;
function init() {
    GuildReadStateStore = subscribeToStore("GuildReadStateStore");
    subscribeToStore("RelationshipStore");
}

if (await window.goofcord.getConfig("dynamicIcon") === true) {
    init()
}