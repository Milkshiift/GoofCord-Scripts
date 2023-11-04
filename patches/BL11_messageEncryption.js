/**
 * @name MessageEncryption
 * @description Encrypts messages
 * @version 1.0.0
 */

const patches = [
    {
        find: ".fetchMessages.recordEnd",
        replacement: [
            {
                match: /("LOAD_MESSAGES_SUCCESS",channelId:.,messages:)([^\s,]+)/,
                replace: "$1window.MessageEncryption.decryptMessages($2)"
            }
        ],
        plugin: "MessageEncryption"
    },
    {
        find: ".AUTOMATED_MESSAGE_RECEIVED,{",
        replacement: [
            {
                match: /("MESSAGE_CREATE",channelId:.,message:)([^\s,]+)/,
                replace: "$1{...$2,content:window.goofcord.decryptMessage($2.content)}"
            }
        ],
        plugin: "MessageEncryption"
    },
    {
        find: 'type:"MESSAGE_CREATE",guildId',
        replacement: [
            {
                match: /("MESSAGE_CREATE",guildId:(.*?)message:)(.)/,
                replace: "$1{...$3,content:window.goofcord.decryptMessage($3.content)}"
            },
            {
                match: /("MESSAGE_UPDATE",guildId:(.*?)message:)(.)/,
                replace: "$1window.MessageEncryption.modifyMessageObject($3)"
            }
        ],
        plugin: "MessageEncryption"
    }
];

Vencord.Api.MessageEvents.addPreSendListener(async (_, msg) => {
    if (!encryptionEnabled) return;
    msg.content = await window.goofcord.encryptMessage(msg.content);
});
Vencord.Api.MessageEvents.addPreEditListener(async (_cid, _mid, msg) => {
    if (!encryptionEnabled) return;
    msg.content = await window.goofcord.encryptMessage(msg.content);
});

let encryptionEnabled = false;

document.onkeyup = function(e) {
    if (e.key === 'F10') {
        encryptionEnabled = !encryptionEnabled;
        changeDiscordIcon();
    };
};

let lockIcon, discordSvg;
const waitForDMButton = setInterval(async () => {
    // Waiting until svg holder appears
    const dmButton = document.querySelector('div[data-list-item-id="guildsnav___home"]');
    if (dmButton) {
        clearInterval(waitForDMButton);

        lockIcon = document.createElement('p');
        dmButton.appendChild(lockIcon);
        lockIcon.style.fontSize = "1.5em";
        lockIcon.style.opacity = "0";
        lockIcon.style.position = "fixed";
        lockIcon.style.transition = "opacity 0.25s ease-in-out";
        lockIcon.textContent = "🔒";
        discordSvg = dmButton.querySelector('svg');
        discordSvg.style.opacity = "1";
        discordSvg.style.position = "fixed";
        discordSvg.style.transition = "opacity 0.25s ease-in-out";
    }
}, 1000);

function changeDiscordIcon() {
    if (encryptionEnabled === true) {
        window.goofcord.titlebar.flashTitlebar("#f9c23c");
        discordSvg.style.opacity = "0";
        lockIcon.style.opacity = "1";
    }
    else {
        window.goofcord.titlebar.flashTitlebar("#D0D0D0");
        lockIcon.style.opacity = "0";
        discordSvg.style.opacity = "1";
    }
}

function decryptMessages(messages) {
    for (let i = 0; i < messages.length; i++) {
        messages[i].content = window.goofcord.decryptMessage(messages[i].content);
    }
    return messages;
}

window.MessageEncryption = {};
window.MessageEncryption.decryptMessages = decryptMessages;