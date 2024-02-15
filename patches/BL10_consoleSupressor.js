/**
 * @name ConsoleSupressor
 * @description Suppresses Discord logger
 * @version 2.1.1
 */

const patches = [
    {
        find: ".setLogFn",
        replacement: [
            {
                match: /&&console(.*?)\).*?\)/,
                replace: ""
            }
        ],
        plugin: 'ConsoleSupressor'
    },
    {
        find: "getDetectableGames(){",
        replacement: [
            {
                match: /(getDetectableGames\(\)\{)([\s\S]*?)(},reportUnverifiedGame)/,
                replace: "$1$3"
            }
        ],
        plugin: 'ConsoleSupressor'
    }
];

// Temporary fix for context menu twitching
var styles = `
    [class^="scroller"] {
        transform: none !important;
        -webkit-backface-visibility: unset !important;
        -webkit-perspective: none !important;
    }
`

var styleSheet = document.createElement("style")
styleSheet.innerText = styles
document.head.appendChild(styleSheet)
