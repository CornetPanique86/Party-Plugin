"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const launcher_1 = require("bdsx/launcher");
const ctf_1 = require("./ctf");
const form_1 = require("bdsx/bds/form");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4Q0FBaUY7QUFDakYsMENBQXVDO0FBQ3ZDLDRDQUE4QztBQUM5QywrQkFBa0c7QUFLbEcsd0NBQXFDO0FBSXJDLElBQVksU0FPWDtBQVBELFdBQVksU0FBUztJQUNqQiwyREFBYSxDQUFBO0lBQ2IsMkNBQUssQ0FBQTtJQUNMLHVEQUFXLENBQUE7SUFDWCxxREFBVSxDQUFBO0lBQ1YsbURBQVMsQ0FBQTtJQUNULG1EQUFTLENBQUE7QUFDYixDQUFDLEVBUFcsU0FBUyx5QkFBVCxTQUFTLFFBT3BCO0FBRUQsaUJBQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLGlDQUFpQyxFQUFFLGdDQUFzQixDQUFDLFFBQVEsQ0FBQztLQUMxRixRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBRS9CLElBQUksd0JBQWEsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDekcsSUFBSSxtQkFBYTtRQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3JFLElBQUEsZUFBUyxHQUFFLENBQUM7QUFDaEIsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUM7Q0FDaEQsQ0FDSjtLQUNBLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxF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