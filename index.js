"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawtext = exports.LogInfo = exports.logPrefix = void 0;
const event_1 = require("bdsx/event");
const config = require("./config.json");
const serverproperties_1 = require("bdsx/serverproperties");
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
console.log(exports.logPrefix + "Allocated");
// before BDS launching
event_1.events.serverOpen.on(() => {
    console.log(exports.logPrefix + "Launched");
    if (serverproperties_1.serverProperties["level-name"] == "UG")
        require("./ug");
    if (serverproperties_1.serverProperties["level-name"] == "Party Lobby")
        require("./lobby");
});
event_1.events.serverClose.on(() => {
    console.log(exports.logPrefix + "Closed");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsd0NBQXlDO0FBQ3pDLDREQUF5RDtBQUU1QyxRQUFBLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQTtBQUNwRSxJQUFZLE9BS1g7QUFMRCxXQUFZLE9BQU87SUFDZiwyQ0FBTyxDQUFBO0lBQ1AscUNBQUksQ0FBQTtJQUNKLHFDQUFJLENBQUE7SUFDSix1Q0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQUxXLE9BQU8sdUJBQVAsT0FBTyxRQUtsQjtBQUNELFNBQWdCLE9BQU8sQ0FBQyxHQUFXLEVBQUUsT0FBZ0IsT0FBTyxDQUFDLE9BQU87SUFDaEUsUUFBUSxJQUFJLEVBQUU7UUFDVixLQUFLLE9BQU8sQ0FBQyxJQUFJO1lBQ2IsT0FBTyxnQ0FBZ0MsR0FBRyxNQUFNLENBQUM7UUFDckQsS0FBSyxPQUFPLENBQUMsS0FBSztZQUNkLE9BQU8sdUNBQXVDLEdBQUcsTUFBTSxDQUFDO1FBQzVELEtBQUssT0FBTyxDQUFDLElBQUk7WUFDYixPQUFPLHNDQUFzQyxHQUFHLE1BQU0sQ0FBQztRQUMzRCxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDckI7WUFDSSxPQUFPLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztLQUNoRDtBQUNMLENBQUM7QUFaRCwwQkFZQztBQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQztBQUNyQyx1QkFBdUI7QUFFdkIsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQztJQUVwQyxJQUFJLG1DQUFnQixDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUk7UUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUQsSUFBSSxtQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxhQUFhO1FBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVFLENBQUMsQ0FBQyxDQUFDO0FBRUgsY0FBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUN0QyxDQUFDLENBQUMsQ0FBQyJ9