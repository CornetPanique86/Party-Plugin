"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const launcher_1 = require("bdsx/launcher");
const ctf_1 = require("./ctf");
const blockpos_1 = require("bdsx/bds/blockpos");
const fs = require('fs');
const path = require('path');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUFpRjtBQUNqRiwwQ0FBdUM7QUFDdkMsNENBQThDO0FBQzlDLCtCQUFtRTtBQUVuRSxnREFBd0Q7QUFLeEQsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU3QixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsaUNBQWlDLEVBQUUsZ0NBQXNCLENBQUMsUUFBUSxDQUFDO0tBQzFGLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxRQUFRLEVBQUUsQ0FBQTtRQUFFLE9BQU87SUFFL0IsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUM7UUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUN6RyxJQUFJLG1CQUFhO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDckUsSUFBQSxlQUFTLEdBQUUsQ0FBQztBQUNoQixDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQztDQUNoRCxDQUNKO0tBQ0EsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLENB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