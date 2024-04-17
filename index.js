"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawtext = exports.LogInfo = exports.logPrefix = void 0;
const event_1 = require("bdsx/event");
const config = require("./config.json");
const serverproperties_1 = require("bdsx/serverproperties");
const launcher_1 = require("bdsx/launcher");
exports.logPrefix = ``.reset + `[${config.pluginName.yellow}] `;
var LogInfo;
(function (LogInfo) {
    LogInfo[LogInfo["default"] = 0] = "default";
    LogInfo[LogInfo["info"] = 1] = "info";
    LogInfo[LogInfo["warn"] = 2] = "warn";
    LogInfo[LogInfo["error"] = 3] = "error";
})(LogInfo || (exports.LogInfo = LogInfo = {}));
function rawtext(msg, type = LogInfo.default) {
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
exports.rawtext = rawtext;
let rainbowOffset = 0;
const rainbow = ["§c", "§6", "§e", "§a", "§9", "§b", "§d", "§g", "§5", "§2"];
let motdInterval;
console.log(exports.logPrefix + "Allocated");
// before BDS launching
event_1.events.serverOpen.on(() => {
    console.log(exports.logPrefix + "Launched");
    if (serverproperties_1.serverProperties["level-name"] === "UG")
        require("./ug");
    if (serverproperties_1.serverProperties["level-name"] === "lobby")
        require("./lobby");
    if (serverproperties_1.serverProperties["level-name"] === "WSMP")
        require("./wsmp");
    motdInterval = setInterval(() => {
        let i = rainbowOffset;
        rainbowOffset = (rainbowOffset + 1) & rainbow.length;
        const coloredName = config.name.replace(/./g, v => rainbow[i++ % rainbow.length] + v);
        try {
            launcher_1.bedrockServer.serverInstance.setMotd(coloredName);
        }
        catch (err) {
            console.log(err);
        }
    }, 5000);
});
event_1.events.serverClose.on(() => {
    clearInterval(motdInterval);
    console.log(exports.logPrefix + "Closed");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsd0NBQXlDO0FBQ3pDLDREQUF5RDtBQUN6RCw0Q0FBOEM7QUFFakMsUUFBQSxTQUFTLEdBQUcsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUE7QUFDcEUsSUFBWSxPQUtYO0FBTEQsV0FBWSxPQUFPO0lBQ2YsMkNBQU8sQ0FBQTtJQUNQLHFDQUFJLENBQUE7SUFDSixxQ0FBSSxDQUFBO0lBQ0osdUNBQUssQ0FBQTtBQUNULENBQUMsRUFMVyxPQUFPLHVCQUFQLE9BQU8sUUFLbEI7QUFDRCxTQUFnQixPQUFPLENBQUMsR0FBVyxFQUFFLE9BQWdCLE9BQU8sQ0FBQyxPQUFPO0lBQ2hFLFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxPQUFPLENBQUMsSUFBSTtZQUNiLE9BQU8sZ0NBQWdDLEdBQUcsTUFBTSxDQUFDO1FBQ3JELEtBQUssT0FBTyxDQUFDLEtBQUs7WUFDZCxPQUFPLHVDQUF1QyxHQUFHLE1BQU0sQ0FBQztRQUM1RCxLQUFLLE9BQU8sQ0FBQyxJQUFJO1lBQ2IsT0FBTyxzQ0FBc0MsR0FBRyxNQUFNLENBQUM7UUFDM0QsS0FBSyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ3JCO1lBQ0ksT0FBTyx3QkFBd0IsR0FBRyxNQUFNLENBQUM7S0FDaEQ7QUFDTCxDQUFDO0FBWkQsMEJBWUM7QUFFRCxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDdEIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3RSxJQUFJLFlBQTRCLENBQUM7QUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBUyxHQUFHLFdBQVcsQ0FBQyxDQUFDO0FBQ3JDLHVCQUF1QjtBQUV2QixjQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDO0lBRXBDLElBQUksbUNBQWdCLENBQUMsWUFBWSxDQUFDLEtBQUssSUFBSTtRQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM3RCxJQUFJLG1DQUFnQixDQUFDLFlBQVksQ0FBQyxLQUFLLE9BQU87UUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkUsSUFBSSxtQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxNQUFNO1FBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWpFLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1FBQzVCLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQztRQUN0QixhQUFhLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUVyRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLElBQUk7WUFDQSx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDckQ7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEI7SUFDTCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDYixDQUFDLENBQUMsQ0FBQztBQUVILGNBQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRTtJQUN2QixhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0FBQ3RDLENBQUMsQ0FBQyxDQUFDIn0=