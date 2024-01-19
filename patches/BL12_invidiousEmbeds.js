/**
 * @name InvidiousEmbeds
 * @description Replaces youtube embeds with invidious embeds
 * @version 1.0.1
 * @minGCVer 1.0.1
 */

const patches = [
    {
        find: ',"%"),maxWidth',
        replacement: [
            {
                match: /(:.,src:.\.url)/,
                replace: "$1.replace('https://www.youtube.com', 'https://invidious.fdn.fr')+'?player_style=youtube'"
            }
        ],
        plugin: "InvidiousEmbeds"
    }
];
