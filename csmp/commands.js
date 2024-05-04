"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const launcher_1 = require("bdsx/launcher");
const ctf_1 = require("./ctf");
const form_1 = require("bdsx/bds/form");
const actor_1 = require("bdsx/bds/actor");
var Constants;
(function (Constants) {
    Constants[Constants["isGameRunning"] = 0] = "isGameRunning";
    Constants[Constants["teams"] = 1] = "teams";
    Constants[Constants["flagsStatus"] = 2] = "flagsStatus";
    Constants[Constants["flagHolder"] = 3] = "flagHolder";
    Constants[Constants["flagCount"] = 4] = "flagCount";
    Constants[Constants["bannerPos"] = 5] = "bannerPos";
})(Constants || (exports.Constants = Constants = {}));
command_2.command.register("ctf", "Start the capture the flag game", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (launcher_1.bedrockServer.level.getActivePlayerCount() !== 2)
        return output.error("You need 2 people to start!");
    if (ctf_1.isGameRunning)
        return output.error("A game is already running!");
    (0, ctf_1.startGame)();
}, {
    option: command_2.command.enum("option.start", "start"),
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (launcher_1.bedrockServer.level.getActivePlayerCount() < 3)
        return output.error("You need at least 3 people to start!");
    if (ctf_1.isGameRunning)
        return output.error("A game is already running!");
    if (ctf_1.isPreGameRunning)
        return output.error("A pre game is already running!");
    if (!param.leader1 || !param.leader2)
        return output.error("Select 2 online players!");
    if (param.leader1 === param.leader2)
        return output.error("Select 2 different players!");
    if (!param.leader1.isExplicitIdSelector || !param.leader2.isExplicitIdSelector)
        return output.error("Select a single player for each leader!");
    const pl1 = param.leader1.getName();
    const pl2 = param.leader2.getName();
    console.log(pl1 + "\n" + pl2);
    (0, ctf_1.startGameLeaders)(pl1, pl2);
}, {
    option: command_2.command.enum("option.start", "start"),
    leaders: command_2.command.enum("leaders.leaders", "leaders"),
    leader1: [command_1.PlayerCommandSelector, true],
    leader2: [command_1.PlayerCommandSelector, true],
})
    .overload((param, origin, output) => {
    output.success((0, ctf_1.getConstant)(param.constant).toString());
    console.log((0, ctf_1.getConstant)(param.constant));
}, {
    action: command_2.command.enum("action.constants", "constants"),
    constant: command_2.command.enum("constant.value", Constants)
});
command_2.command.register("test", "the csmp test cmd", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    if (!param.target)
        return output.error("Select online player!");
    if (!param.target.isExplicitIdSelector)
        return output.error("Has to be explicit target");
    let target;
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        var _a;
        if (pl.getNameTag() === ((_a = param.target) === null || _a === void 0 ? void 0 : _a.getName()))
            target = pl;
    });
    if (!target)
        return;
    console.log(target.hurtEffects(actor_1.ActorDamageCause.Suffocation, 4, false, false));
    const plName = target.getNameTag();
    form_1.Form.sendTo(target.getNetworkIdentifier(), {
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
}, {
    target: [command_1.PlayerCommandSelector, true]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4Q0FBaUY7QUFDakYsMENBQXVDO0FBQ3ZDLDRDQUE4QztBQUM5QywrQkFBa0c7QUFLbEcsd0NBQXFDO0FBRXJDLDBDQUFrRDtBQUVsRCxJQUFZLFNBT1g7QUFQRCxXQUFZLFNBQVM7SUFDakIsMkRBQWEsQ0FBQTtJQUNiLDJDQUFLLENBQUE7SUFDTCx1REFBVyxDQUFBO0lBQ1gscURBQVUsQ0FBQTtJQUNWLG1EQUFTLENBQUE7SUFDVCxtREFBUyxDQUFBO0FBQ2IsQ0FBQyxFQVBXLFNBQVMseUJBQVQsU0FBUyxRQU9wQjtBQUVELGlCQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxpQ0FBaUMsRUFBRSxnQ0FBc0IsQ0FBQyxRQUFRLENBQUM7S0FDMUYsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLENBQUEsS0FBSyxhQUFMLEtBQUssdUJBQUwsS0FBSyxDQUFFLFFBQVEsRUFBRSxDQUFBO1FBQUUsT0FBTztJQUUvQixJQUFJLHdCQUFhLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLEtBQUssQ0FBQztRQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0lBQ3pHLElBQUksbUJBQWE7UUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUNyRSxJQUFBLGVBQVMsR0FBRSxDQUFDO0FBQ2hCLENBQUMsRUFDRDtJQUNJLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0NBQ2hELENBQ0o7S0FDQSxRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFB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