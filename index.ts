import { events } from "bdsx/event";
import config = require("./config.json");
import { serverProperties } from "bdsx/serverproperties";
import { bedrockServer } from "bdsx/launcher";

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

let rainbowOffset = 0;
const rainbow = ["§c", "§6", "§e", "§a", "§9", "§b", "§d", "§g", "§5", "§2"];
let motdInterval: NodeJS.Timeout;
console.log(logPrefix + "Allocated");
// before BDS launching

events.serverOpen.on(() => {
    console.log(logPrefix + "Launched");

    if (serverProperties["level-name"] == "UG") require("./ug");
    if (serverProperties["level-name"] == "lobby") require("./lobby");

    motdInterval = setInterval(() => {
        let i = rainbowOffset;
        rainbowOffset = (rainbowOffset + 1) & rainbow.length;

        const coloredName = config.name.replace(/./g, v => rainbow[i++ % rainbow.length] + v);
        try {
            bedrockServer.serverInstance.setMotd(coloredName);
        } catch (err) {
            console.log(err);
        }
    }, 5000);
});

events.serverClose.on(() => {
    clearInterval(motdInterval);
    console.log(logPrefix + "Closed");
});