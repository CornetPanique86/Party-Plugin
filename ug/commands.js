"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
const nativetype_1 = require("bdsx/nativetype");
// Bedwars
command_2.command.register("bedwarsstart", "Hehehehe", /* Command permission */ command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    (0, bedwars_1.bedwarsstart)(param, origin, output);
}, {
    option: command_2.command.enum("option.start", "start"),
})
    .overload((param, origin, output) => {
    (0, bedwars_1.bedwarsstart)(param, origin, output);
}, {
    option: command_2.command.enum("option.stop", "stop"),
});
// Join game queue
command_2.command.register("joinqueue", "Join the queue of a game", /* Command permission */ command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    (0, utils_1.joinqueue)(origin, output);
}, {});
// Leave game queue
command_2.command.register("leavequeue", "Leave the queue you're currently in", /* Command permission */ command_1.CommandPermissionLevel.Normal).overload((param, origin, output) => {
    (0, utils_1.leavequeue)(origin, output);
}, {});
// test
command_2.command.register("testp", "testing", /* Command permission */ command_1.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    test(param, origin, output);
}, {
    action: command_2.command.enum("action.data", "data"),
    value: nativetype_1.int32_t
});
function test(param, origin, output) {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    // console.log(actor.getArmor(ArmorSlot.Head));
    // console.log("\nItemStack:\n" + actor.getArmor(ArmorSlot.Head).item);
    // let userData = actor.getArmor(ArmorSlot.Head).getUserData();
    // console.log("\n\n" + NBT.stringify(userData, 4));
    // giveItem(actor, {
    //     item: "minecraft:leather_helmet",
    //     amount: 1,
    //     data: 0,
    //     name: "Yellow team's helmet",
    //     lore: ["Win!"],
    //     enchantment: {
    //         enchant: EnchantmentNames.Unbreaking,
    //         level: 5,
    //         isUnsafe: true
    //     }
    // })
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQXlDO0FBQ3pDLG1DQUFnRDtBQUVoRCxnREFBMEM7QUFJMUMsVUFBVTtBQUNWLGlCQUFPLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUUsd0JBQXdCLENBQUMsZ0NBQXNCLENBQUMsUUFBUSxDQUFDO0tBQ2pHLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxzQkFBWSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUM7Q0FDaEQsQ0FDSjtLQUNBLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxzQkFBWSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUM7Q0FDOUMsQ0FDSixDQUFDO0FBRU4sa0JBQWtCO0FBQ2xCLGlCQUFPLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSwwQkFBMEIsRUFBRSx3QkFBd0IsQ0FBQyxnQ0FBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQ3RILENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLGlCQUFTLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLENBQUMsRUFDRCxFQUFHLENBQ04sQ0FBQztBQUVGLG1CQUFtQjtBQUNuQixpQkFBTyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUscUNBQXFDLEVBQUUsd0JBQXdCLENBQUMsZ0NBQXNCLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUNsSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsSUFBQSxrQkFBVSxFQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvQixDQUFDLEVBQ0QsRUFBRyxDQUNOLENBQUM7QUFFRixPQUFPO0FBQ1AsaUJBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSx3QkFBd0IsQ0FBQyxnQ0FBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQ25HLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNoQyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztJQUMzQyxLQUFLLEVBQUUsb0JBQU87Q0FDakIsQ0FDSixDQUFDO0FBR0YsU0FBUyxJQUFJLENBQUMsS0FBd0MsRUFBRSxNQUFxQixFQUFFLE1BQXFCO0lBQ2hHLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBRS9CLCtDQUErQztJQUMvQyx1RUFBdUU7SUFDdkUsK0RBQStEO0lBQy9ELG9EQUFvRDtJQUVwRCxvQkFBb0I7SUFDcEIsd0NBQXdDO0lBQ3hDLGlCQUFpQjtJQUNqQixlQUFlO0lBQ2Ysb0NBQW9DO0lBQ3BDLHNCQUFzQjtJQUN0QixxQkFBcUI7SUFDckIsZ0RBQWdEO0lBQ2hELG9CQUFvQjtJQUNwQix5QkFBeUI7SUFDekIsUUFBUTtJQUNSLEtBQUs7QUFDVCxDQUFDIn0=