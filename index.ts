import { events } from "bdsx/event";
import config = require("./config.json");
import { serverProperties } from "bdsx/serverproperties";
import { bedrockServer } from "bdsx/launcher";
import { storageManager } from "bdsx/storage";
import { Form } from "bdsx/bds/form";
import { Player } from "bdsx/bds/player";
import { NetworkIdentifier } from "bdsx/bds/networkidentifier";

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

    if (serverProperties["level-name"] === "UG") require("./ug");
    if (serverProperties["level-name"] === "lobby") require("./lobby");
    if (serverProperties["level-name"] === "WSMP") require("./wsmp");
    if (serverProperties["level-name"] === "CSMP") require("./csmp");

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

type StorageFirstTime = {
    [player: string]: boolean
}
const firstTime = storageManager.getSync<StorageFirstTime>("firstTime");
if (firstTime.data === undefined) {
    firstTime.init({}); // initialize
}

events.playerJoin.on(e => {
    const pl = e.player;
    const plName = pl.getNameTag();
    if (!firstTime.data[plName]) return; // Already joined

    nda(pl, plName);
});

async function nda(pl: Player, plName: string) {
    const form = await Form.sendTo(pl.getNetworkIdentifier(), {
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
    } else {
        const uSureForm = await Form.sendTo(pl.getNetworkIdentifier(), {
            type: "modal",
            title: "Confirm decision",
            content: "Are you sure you reject the agreement? If you confirm, you will be kicked from the server.",
            button1: "Confirm decision",
            button2: "Revise NDA"
        });
        if (uSureForm) {
            bedrockServer.serverInstance.disconnectClient(pl.getNetworkIdentifier());
        } else {
            nda(pl, plName);
        }
    }
}

const connectionList = new Map<NetworkIdentifier, string>();
events.networkDisconnected.on(networkIdentifier => {
    const id = connectionList.get(networkIdentifier);
    connectionList.delete(networkIdentifier);
    console.log(`${id}> disconnected`);
});

events.serverClose.on(() => {
    clearInterval(motdInterval);
    console.log(logPrefix + "Closed");
});