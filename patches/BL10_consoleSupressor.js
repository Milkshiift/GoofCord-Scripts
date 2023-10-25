/**
 * @name ConsoleSupressor
 * @description Suppresses Discord logger
 * @version 2.1.0
 */

const patches = [
    {
        find: "console[_]",
        replacement: [
            {
                match: /&&console(.*?)\).*?\)/,
                replace: ""
            }
        ],
        plugin: 'ConsoleSupressor'
    }
];