/**
 * @name ConsoleSupressor
 * @description Suppresses messages in the console that are not necessary
 * @version 1.0.0
 */

// All the messages here are useless and just spam the console
// Some filters are not included to keep the list small
const messagesToFilter = [
    "[Gate", // [GatewaySocket]
    "[RTC",  // [RTCConnection]
    "[Anal", // [Analytics]
    "[Unif"  // [UnifiedConnection]
];

function filterConsoleMessages() {
    const originalConsoleMethods = {};

    // Iterate through all console methods and filter messages
    Object.keys(console).forEach(method => {
        originalConsoleMethods[method] = console[method];

        console[method] = function () {
            const message = arguments[0];
            if (message && messagesToFilter.some(msg => message.includes(msg))) {
                return;
            }
            originalConsoleMethods[method].apply(console, arguments);
        };
    });
}

filterConsoleMessages();