import { CommandPermissionLevel, PlayerCommandSelector } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { getConstant, isGameRunning, isPreGameRunning, startGame, startGameLeaders } from "./ctf";
import { RelativeFloat, Vec3 } from "bdsx/bds/blockpos";
import { createCItemStack } from "../utils";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { ItemStack } from "bdsx/bds/inventory";
import { Form } from "bdsx/bds/form";
import { Player } from "bdsx/bds/player";
import { ActorDamageCause } from "bdsx/bds/actor";

export enum Constants {
    isGameRunning,
    teams,
    flagsStatus,
    flagHolder,
    flagCount,
    bannerPos
}

command.register("ctf", "Start the capture the flag game", CommandPermissionLevel.Operator)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (bedrockServer.level.getActivePlayerCount() !== 2) return output.error("You need 2 people to start!");
        if (isGameRunning) return output.error("A game is already running!");
        startGame();
    },
    {
        option: command.enum("option.start", "start"),
    },
)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;


        if (bedrockServer.level.getActivePlayerCount() < 3) return output.error("You need at least 3 people to start!");
        if (isGameRunning) return output.error("A game is already running!");
        if (isPreGameRunning) return output.error("A pre game is already running!");
        if (!param.leader1 || !param.leader2) return output.error("Select 2 online players!");
        if (param.leader1 === param.leader2) return output.error("Select 2 different players!");
        if (!param.leader1.isExplicitIdSelector || !param.leader2.isExplicitIdSelector) return output.error("Select a single player for each leader!");
        const pl1 = param.leader1.getName();
        const pl2 = param.leader2.getName();
        console.log(pl1 + "\n" + pl2);
        startGameLeaders(pl1, pl2);
    },
    {
        option: command.enum("option.start", "start"),
        leaders: command.enum("leaders.leaders", "leaders"),
        leader1: [PlayerCommandSelector, true],
        leader2: [PlayerCommandSelector, true],
    },
)
.overload(
    (param, origin, output) => {
        output.success(getConstant(param.constant).toString());
        console.log(getConstant(param.constant));
    },
    {
        action: command.enum("action.constants", "constants"),
        constant: command.enum("constant.value", Constants)
    },
);

command.register("test", "the csmp test cmd", CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        if (!param.target) return output.error("Select online player!");
        if (!param.target.isExplicitIdSelector) return output.error("Has to be explicit target");

        let target: Player | undefined;
        bedrockServer.level.getPlayers().forEach(pl => {
            if (pl.getNameTag() === param.target?.getName()) target = pl;
        });
        if (!target) return;

        const plName = target.getNameTag();
        Form.sendTo(target.getNetworkIdentifier(), {
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
    },
    {
        target: [PlayerCommandSelector, true]
    }
)
