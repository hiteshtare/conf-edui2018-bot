"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
function getRandom(min, max) {
    return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}
function getTime(data) {
    let messages = [];
    for (let i = 0; i < data.length; i++) {
        let message = "";
        if (i !== 0) {
            message += `${types_1.LINGO[getRandom(0, types_1.LINGO.length - 1)]}, `;
        }
        message += `${data[i].speakers} is speaking about ${data[i].title} at ${data[i].startTime} on ${data[i].date}.`;
        messages.push({ type: "message", text: message });
    }
    return messages;
}
exports.getTime = getTime;
//# sourceMappingURL=dialogs.js.map