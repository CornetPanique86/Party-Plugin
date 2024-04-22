"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const launcher_1 = require("bdsx/launcher");
const ctf_1 = require("./ctf");
const __1 = require("..");
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
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (!ctf_1.isGameRunning)
        return output.error("No game is even running");
    const worldsPath = path.join(process.cwd(), "worlds");
    try {
        console.log(__1.logPrefix + "Starting copy...");
        fs.cpSync(path.join(worldsPath, "CSMP_backup"), path.join(worldsPath, "CSMP"), {
            recursive: true,
            force: true
        });
        console.log(__1.logPrefix + "Ended copy, closing server...");
        launcher_1.bedrockServer.stop();
    }
    catch (error) {
        console.log(error.message);
    }
}, {
    option: command_2.command.enum("option.reset", "reset")
});
command_2.command.register("test", "the csmp test cmd", command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    actor.runCommand('tellraw @a {"rawtext":[{"text":"AAAAAAAA"}]}');
    /*
    ItemStack<[ItemStackNetId: [TypedServerNetId: 13]] 1 x Lodestone Compass(615)@0> {
vftable: VoidPointer { 0x00007FF676A774C0 },
item: Item {},
userData: CompoundTag { 'trackingHandle' => IntTag 1 },
block: null,
aux: 0,
amount: 1,
valid: true,
pickupTime: '�湨䑤\u0000',
showPickup: true,
canPlaceOn: CxxVector [],
canDestroy: CxxVector [] }


CompoundTag { 'trackingHandle' => IntTag 1 }


INTTAG: lodestone number in the whole world! hardcorded coords?
    */
}, {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUFpRjtBQUNqRiwwQ0FBdUM7QUFDdkMsNENBQThDO0FBQzlDLCtCQUFtRTtBQUNuRSwwQkFBK0I7QUFFL0IsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUU3QixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsaUNBQWlDLEVBQUUsZ0NBQXNCLENBQUMsUUFBUSxDQUFDO0tBQzFGLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxRQUFRLEVBQUUsQ0FBQTtRQUFFLE9BQU87SUFFL0IsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUM7UUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUN6RyxJQUFJLG1CQUFhO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDckUsSUFBQSxlQUFTLEdBQUUsQ0FBQztBQUNoQixDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQztDQUNoRCxDQUNKO0tBQ0EsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDakMsSUFBSSxDQUFDLENB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