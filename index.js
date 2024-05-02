"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rawtext = exports.LogInfo = exports.logPrefix = void 0;
const event_1 = require("bdsx/event");
const config = require("./config.json");
const serverproperties_1 = require("bdsx/serverproperties");
const launcher_1 = require("bdsx/launcher");
const storage_1 = require("bdsx/storage");
const form_1 = require("bdsx/bds/form");
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
    if (serverproperties_1.serverProperties["level-name"] === "CSMP")
        require("./csmp");
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
const firstTime = storage_1.storageManager.getSync("firstTime");
if (firstTime.data === undefined) {
    firstTime.init({}); // initialize
}
event_1.events.playerJoin.on(e => {
    const pl = e.player;
    const plName = pl.getNameTag();
    if (!firstTime.data[plName])
        return; // Already joined
    nda(pl, plName);
});
async function nda(pl, plName) {
    const form = await form_1.Form.sendTo(pl.getNetworkIdentifier(), {
        type: "modal",
        title: "Non-Disclosure Agreement",
        content: `§lNon-Disclosure Agreement
§rThis Non-Disclosure Agreement ("Agreement") is entered into as of 02/05/2024 by and between Cornet's Server ("Disclosing Party") and ${plName} ("Recipient").

1. Confidential Information
"Confidential Information" shall mean any and all non-public information disclosed by the Disclosing Party to the Recipient, whether disclosed orally or in writing, related to the Minecraft server known as "Cornet's server", including but not limited to, server content, game modifications, and any other proprietary information.

2. Obligations of Recipient
The Recipient agrees that it shall not, without the prior written consent of the Disclosing Party:

(a) Disclose or make available any Confidential Information to any third party;

(b) Use any Confidential Information for any purpose other than as necessary to fulfill its obligations under this Agreement;

(c) Copy or reproduce any Confidential Information, except as expressly permitted by the Disclosing Party;

(d) Modify, reverse engineer, or attempt to derive the composition or underlying information of any Confidential Information; and

(e) Use the Confidential Information in connection with any competing business or purpose.

3. Exceptions
The obligations set forth in Section 2 shall not apply to any Confidential Information that:

(a) Is or becomes publicly available through no fault of the Recipient;

(b) Was rightfully known to the Recipient prior to disclosure by the Disclosing Party;

(c) Is rightfully obtained by the Recipient from a third party without breach of any confidentiality obligation; or

(d) Is independently developed by the Recipient without reference to or use of the Confidential Information.

4. Term and Termination
This Agreement shall remain in effect indefinitely from the effective date of this Agreement unless terminated by either party upon written notice. Upon termination or expiration of this Agreement, the Recipient shall promptly return or destroy all Confidential Information and certify in writing to the Disclosing Party that all Confidential Information has been returned or destroyed.

5. Governing Law
This Agreement shall be governed by and construed in accordance with the laws of Cornstantinople, without regard to its conflicts of law principles.

IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.

Cornet's Server (Disclosing Party)

${plName} (Recipient)`,
        button1: "Accept agreement",
        button2: "Reject agreement"
    });
    if (form) {
        firstTime.data[plName] = false;
        pl.sendMessage("Thank you for accepting the agreement.");
    }
    else {
        const uSureForm = await form_1.Form.sendTo(pl.getNetworkIdentifier(), {
            type: "modal",
            title: "Confirm decision",
            content: "Are you sure you reject the agreement? If you confirm, you will be kicked from the server.",
            button1: "Confirm decision",
            button2: "Revise NDA"
        });
        if (uSureForm) {
            launcher_1.bedrockServer.serverInstance.disconnectClient(pl.getNetworkIdentifier());
        }
        else {
            nda(pl, plName);
        }
    }
}
const connectionList = new Map();
event_1.events.networkDisconnected.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected`);
});
event_1.events.serverClose.on(() => {
    clearInterval(motdInterval);
    console.log(exports.logPrefix + "Closed");
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzQ0FBb0M7QUFDcEMsd0NBQXlDO0FBQ3pDLDREQUF5RDtBQUN6RCw0Q0FBOEM7QUFDOUMsMENBQThDO0FBQzlDLHdDQUFxQztBQUl4QixRQUFBLFNBQVMsR0FBRyxFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQTtBQUNwRSxJQUFZLE9BS1g7QUFMRCxXQUFZLE9BQU87SUFDZiwyQ0FBTyxDQUFBO0lBQ1AscUNBQUksQ0FBQTtJQUNKLHFDQUFJLENBQUE7SUFDSix1Q0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQUxXLE9BQU8sdUJBQVAsT0FBTyxRQUtsQjtBQUNELFNBQWdCLE9BQU8sQ0FBQyxHQUFXLEVBQUUsT0FBZ0IsT0FBTyxDQUFDLE9BQU87SUFDaEUsUUFBUSxJQUFJLEVBQUU7UUFDVixLQUFLLE9BQU8sQ0FBQyxJQUFJO1lBQ2IsT0FBTyxnQ0FBZ0MsR0FBRyxNQUFNLENBQUM7UUFDckQsS0FBSyxPQUFPLENBQUMsS0FBSztZQUNkLE9BQU8sdUNBQXVDLEdBQUcsTUFBTSxDQUFDO1FBQzVELEtBQUssT0FBTyxDQUFDLElBQUk7WUFDYixPQUFPLHNDQUFzQyxHQUFHLE1BQU0sQ0FBQztRQUMzRCxLQUFLLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDckI7WUFDSSxPQUFPLHdCQUF3QixHQUFHLE1BQU0sQ0FBQztLQUNoRDtBQUNMLENBQUM7QUFaRCwwQkFZQztBQUVELElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztBQUN0QixNQUFNLE9BQU8sR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzdFLElBQUksWUFBNEIsQ0FBQztBQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7QUFDckMsdUJBQXVCO0FBRXZCLGNBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRTtJQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFTLEdBQUcsVUFBVSxDQUFDLENBQUM7SUFFcEMsSUFBSSxtQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxJQUFJO1FBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzdELElBQUksbUNBQWdCLENBQUMsWUFBWSxDQUFDLEtBQUssT0FBTztRQUFFLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRSxJQUFJLG1DQUFnQixDQUFDLFlBQVksQ0FBQyxLQUFLLE1BQU07UUFBRSxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakUsSUFBSSxtQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsS0FBSyxNQUFNO1FBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRWpFLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1FBQzVCLElBQUksQ0FBQyxHQUFHLGFBQWEsQ0FBQztRQUN0QixhQUFhLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUVyRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLElBQUk7WUFDQSx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDckQ7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEI7SUFDTCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDYixDQUFDLENBQUMsQ0FBQztBQUtILE1BQU0sU0FBUyxHQUFHLHdCQUFjLENBQUMsT0FBTyxDQUFtQixXQUFXLENBQUMsQ0FBQztBQUN4RSxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO0lBQzlCLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxhQUFhO0NBQ3BDO0FBRUQsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDckIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwQixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDL0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQUUsT0FBTyxDQUFDLGlCQUFpQjtJQUV0RCxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLENBQUMsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLEdBQUcsQ0FBQyxFQUFVLEVBQUUsTUFBYztJQUN6QyxNQUFNLElBQUksR0FBRyxNQUFNLFdBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLEVBQUU7UUFDdEQsSUFBSSxFQUFFLE9BQU87UUFDYixLQUFLLEVBQUUsMEJBQTBCO1FBQ2pDLE9BQU8sRUFBRTt5SUFDd0gsTUFBTTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBdUM3SSxNQUFNLGNBQWM7UUFDZCxPQUFPLEVBQUUsa0JBQWtCO1FBQzNCLE9BQU8sRUFBRSxrQkFBa0I7S0FDOUIsQ0FBQyxDQUFDO0lBRUgsSUFBSSxJQUFJLEVBQUU7UUFDTixTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUMvQixFQUFFLENBQUMsV0FBVyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7S0FDNUQ7U0FBTTtRQUNILE1BQU0sU0FBUyxHQUFHLE1BQU0sV0FBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsRUFBRTtZQUMzRCxJQUFJLEVBQUUsT0FBTztZQUNiLEtBQUssRUFBRSxrQkFBa0I7WUFDekIsT0FBTyxFQUFFLDRGQUE0RjtZQUNyRyxPQUFPLEVBQUUsa0JBQWtCO1lBQzNCLE9BQU8sRUFBRSxZQUFZO1NBQ3hCLENBQUMsQ0FBQztRQUNILElBQUksU0FBUyxFQUFFO1lBQ1gsd0JBQWEsQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztTQUM1RTthQUFNO1lBQ0gsR0FBRyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNuQjtLQUNKO0FBQ0wsQ0FBQztBQUVELE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUE2QixDQUFDO0FBQzVELGNBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsRUFBRTtJQUM5QyxNQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDakQsY0FBYyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDdkMsQ0FBQyxDQUFDLENBQUM7QUFFSCxjQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDdkIsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQztBQUN0QyxDQUFDLENBQUMsQ0FBQyJ9