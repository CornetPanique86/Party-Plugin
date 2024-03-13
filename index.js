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
    if (serverproperties_1.serverProperties["level-name"] == "UG")
        require("./ug");
    if (serverproperties_1.serverProperties["level-name"] == "Party Lobby")
        require("./lobby");
    motdInterval = setInterval(() => {
        let i = rainbowOffset;
        rainbowOffset = (rainbowOffset + 1) & rainbow.length;
        const coloredName = config.name.replace(/./g, v => rainbow[i++ % rainbow.length] + v);
        launcher_1.bedrockServer.serverInstance.setMotd(coloredName);
    }, 5000);
});
event_1.events.serverClose.on(() => {
    clearInterval(motdInterval);
    console.log(exports.logPrefix + "Closed");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsd0NBQXlDO0FBQ3pDLDREQUF5RDtBQUN6RCw0Q0FBOEM7QUFFakMsUUFBQSxTQUFTLEdBQUcsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUE7QUFDcEUsSUFBWSxPQUtYO0FBTEQsV0FBWSxPQUFPO0lBQ2YsMkNBQU8sQ0FBQTtJQUNQLHFDQUFJLENBQUE7SUFDSixxQ0FBSSxDQUFBO0lBQ0osdUNBQUssQ0FBQTtBQUNULENBQUMsRUFMVyxPQUFPLHVCQUFQLE9BQU8sUUFLbEI7QUFDRCxTQUFnQixPQUFPLENBQUMsR0FBVyxFQUFFLE9BQWdCLE9BQU8sQ0FBQyxPQUFPO0lBQ2hFLFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxPQUFPLENBQUMsSUFBSTtZQUNiLE9BQU8sZ0NBQWdDLEdBQUcsTUFBTSxDQUFDO1FBQ3JELEtBQUssT0FBTyxDQUFDLEtBQUs7WUFDZCxPQUFPLHVDQUF1QyxHQUFHLE1BQU0sQ0FBQztRQUM1RCxLQUFLLE9BQU8sQ0FBQyxJQUFJO1lBQ2IsT0FBTyxzQ0FBc0MsR0FBRyxNQUFNLENBQUM7UUFDM0QsS0FBSyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ3JCO1lBQ0ksT0FBTyx3QkFBd0IsR0FBRyxNQUFNLENBQUM7S0FDaEQ7QUFDTCxDQUFDO0FBWkQsMEJBWUM7QUFFRCxJQUFJLGFBQWEsR0FBRyxDQUFDLENBQUM7QUFDdEIsTUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUM3RSxJQUFJLFlBQTRCLENBQUM7QUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBUyxHQUFHLFdBQVcsQ0FBQyxDQUFDO0FBQ3JDLHVCQUF1QjtBQUV2QixjQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDO0lBRXBDLElBQUksbUNBQWdCLENBQUMsWUFBWSxDQUFDLElBQUksSUFBSTtRQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1RCxJQUFJLG1DQUFnQixDQUFDLFlBQVksQ0FBQyxJQUFJLGFBQWE7UUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFeEUsWUFBWSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7UUFDNUIsSUFBSSxDQUFDLEdBQUcsYUFBYSxDQUFDO1FBQ3RCLGFBQWEsR0FBRyxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBRXJELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdEYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RELENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNiLENBQUMsQ0FBQyxDQUFDO0FBRUgsY0FBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3ZCLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFTLEdBQUcsUUFBUSxDQUFDLENBQUM7QUFDdEMsQ0FBQyxDQUFDLENBQUMifQ==