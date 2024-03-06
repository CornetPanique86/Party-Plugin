"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawtext = exports.logPrefix = void 0;
const event_1 = require("bdsx/event");
const config = require("./config.json");
const serverproperties_1 = require("bdsx/serverproperties");
exports.logPrefix = ``.reset + `[${config.pluginName.green}] `;
function rawtext(msg, type = "default") {
    switch (type) {
        case "error":
            return `{"rawtext":[{"text":"§4§lERROR> §r§c${msg}"}]}`;
        case "warn":
            return `{"rawtext":[{"text":"§6§lWARN> §r§e${msg}"}]}`;
        case "default":
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsd0NBQXlDO0FBQ3pDLDREQUF5RDtBQUU1QyxRQUFBLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLElBQUksQ0FBQTtBQUNuRSxTQUFnQixPQUFPLENBQUMsR0FBVyxFQUFFLE9BQWMsU0FBUztJQUN4RCxRQUFRLElBQUksRUFBRTtRQUNWLEtBQUssT0FBTztZQUNSLE9BQU8sdUNBQXVDLEdBQUcsTUFBTSxDQUFDO1FBQzVELEtBQUssTUFBTTtZQUNQLE9BQU8sc0NBQXNDLEdBQUcsTUFBTSxDQUFDO1FBQzNELEtBQUssU0FBUyxDQUFDO1FBQ2Y7WUFDSSxPQUFPLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztLQUNoRDtBQUNMLENBQUM7QUFWRCwwQkFVQztBQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQVMsR0FBRyxXQUFXLENBQUMsQ0FBQztBQUNyQyx1QkFBdUI7QUFFdkIsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQztJQUVwQyxJQUFJLG1DQUFnQixDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUk7UUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUQsSUFBSSxtQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxhQUFhO1FBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzVFLENBQUMsQ0FBQyxDQUFDO0FBRUgsY0FBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUN0QyxDQUFDLENBQUMsQ0FBQyJ9