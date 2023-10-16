/**
 * @name ConsoleSupressor
 * @description Suppresses Discord logger
 * @version 2.0.0
 */

const patches = [
    {
        find: "=console)[",
        replacement: [
            {
                match: /\(.=console.{53}/,
                replace: ""
            }
        ],
        plugin: 'ConsoleSupressor'
    }
];