import { events } from "bdsx/event";
import config = require("./config.json");
import { serverProperties } from "bdsx/serverproperties";

export const logPrefix = ``.reset + `[${config.pluginName.yellow}] `
export enum LogInfo {
    default,
    info,
    warn,
    error
}
export function rawtext(msg: string, type: LogInfo = LogInfo.default) {
    switch (type) {
        case LogInfo.info:
            return `{"rawtext":[{"text":"§a§l> §r${msg}"}]}`;
        case LogInfo.error:
            return `{"rawtext":[{"text":"§4§lERROR> §r§c${msg}"}]}`;
        case LogInfo.warn:
            return `{"rawtext":[{"text":"§6§lWARN> §r§e${msg}"}]}`;
        case LogInfo.default:
        default:
            return `{"rawtext":[{"text":"${msg}"}]}`;
    }
}

console.log(logPrefix + "Allocated");
// before BDS launching

events.serverOpen.on(() => {
    console.log(logPrefix + "Launched");

    if (serverProperties["level-name"] == "UG") require("./ug");
    if (serverProperties["level-name"] == "Party Lobby") require("./lobby");
});

events.serverClose.on(() => {
    console.log(logPrefix + "Closed");
});