"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Constants = void 0;
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const launcher_1 = require("bdsx/launcher");
const ctf_1 = require("./ctf");
const blockpos_1 = require("bdsx/bds/blockpos");
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
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    // const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
    // const armorRed: ItemStack[] = [];
    // for (let i = 0; i < armorNames.length; i++) {
    //     const item = createCItemStack({ item: armorNames[i] });
    //     const tag = item.save();
    //     const nbt = NBT.allocate({
    //         ...tag,
    //         tag: {
    //             ...tag.tag,
    //             "customColor": NBT.int(-54000)
    //         }
    //     }) as CompoundTag;
    //     item.load(nbt);
    //     armorRed.push(item);
    // }
    // bedrockServer.level.getPlayers().forEach(pl => {
    //     for (let i = 0; i < armorRed.length; i++) {
    //         pl.setArmor(i, armorRed[i]);
    //     }
    // });
    actor.teleport(blockpos_1.Vec3.create(param.x.value, param.y.value, param.z.value));
    output.success(`relative float example> origin=${origin.getName()}\n` +
        `${param.x.value} ${param.x.is_relative}\n` +
        `${param.y.value} ${param.y.is_relative}\n` +
        `${param.z.value} ${param.z.is_relative}\n`);
}, {
    x: blockpos_1.RelativeFloat,
    y: blockpos_1.RelativeFloat,
    z: blockpos_1.RelativeFloat,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4Q0FBaUY7QUFDakYsMENBQXVDO0FBQ3ZDLDRDQUE4QztBQUM5QywrQkFBZ0Y7QUFDaEYsZ0RBQXdEO0FBS3hELElBQVksU0FPWDtBQVBELFdBQVksU0FBUztJQUNqQiwyREFBYSxDQUFBO0lBQ2IsMkNBQUssQ0FBQTtJQUNMLHVEQUFXLENBQUE7SUFDWCxxREFBVSxDQUFBO0lBQ1YsbURBQVMsQ0FBQTtJQUNULG1EQUFTLENBQUE7QUFDYixDQUFDLEVBUFcsU0FBUyx5QkFBVCxTQUFTLFFBT3BCO0FBRUQsaUJBQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLGlDQUFpQyxFQUFFLGdDQUFzQixDQUFDLFFBQVEsQ0FBQztLQUMxRixRQUFRLENBQ0wsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBRS9CLElBQUksd0JBQWEsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsS0FBSyxDQUFDO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDekcsSUFBSSxtQkFBYTtRQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3JFLElBQUEsZUFBUyxHQUFFLENBQUM7QUFDaEIsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUM7Q0FDaEQsQ0FDSjtLQUNBLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxF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