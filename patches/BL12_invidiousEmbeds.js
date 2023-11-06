/**
 * @name InvidiousEmbeds
 * @description Replaces youtube embeds with invidious embeds
 * @version 1.0.0
 */

const patches = [
    {
        find: ',"%"),maxWidth',
        replacement: [
            {
                match: /(:.,src:.\.url)/,
                replace: "$1.replace('https://www.youtube.com', 'https://iv.nboeck.de')"
            }
        ],
        plugin: "InvidiousEmbeds"
    }
];