/**
 * @name InvidiousEmbeds
 * @description Replaces youtube embeds with invidious embeds
 * @version 1.0.2
 */

const patches = [
    {
        find: ',"%"),maxWidth',
        replacement: [
            {
                match: /(:.,src:.\.url)/,
                replace: "$1.replace('https://www.youtube.com', 'https://iv.datura.network')+'?player_style=youtube'"
            }
        ],
        plugin: "InvidiousEmbeds"
    }
];
