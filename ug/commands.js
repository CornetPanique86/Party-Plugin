"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const bedwars_1 = require("./bedwars");
const utils_1 = require("./utils");
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
    test(origin, output);
}, {
// action: command.enum("action.color", "color"),
// value: int32_t
});
function test(origin, output) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUF5RTtBQUN6RSwwQ0FBdUM7QUFDdkMsdUNBQXlDO0FBQ3pDLG1DQUFnRDtBQUdoRCxVQUFVO0FBQ1YsaUJBQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxnQ0FBc0IsQ0FBQyxRQUFRLENBQUM7S0FDakcsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLHNCQUFZLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQztDQUNoRCxDQUNKO0tBQ0EsUUFBUSxDQUNMLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLHNCQUFZLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUN4QyxDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztDQUM5QyxDQUNKLENBQUM7QUFFTixrQkFBa0I7QUFDbEIsaUJBQU8sQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLDBCQUEwQixFQUFFLHdCQUF3QixDQUFDLGdDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FDdEgsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUEsaUJBQVMsRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDOUIsQ0FBQyxFQUNELEVBQUcsQ0FDTixDQUFDO0FBRUYsbUJBQW1CO0FBQ25CLGlCQUFPLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxxQ0FBcUMsRUFBRSx3QkFBd0IsQ0FBQyxnQ0FBc0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQ2xJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRTtJQUN0QixJQUFBLGtCQUFVLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9CLENBQUMsRUFDRCxFQUFHLENBQ04sQ0FBQztBQUVGLE9BQU87QUFDUCxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixDQUFDLGdDQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDLFFBQVEsQ0FDbkcsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO0lBQ3RCLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDekIsQ0FBQyxFQUNEO0FBQ0ksaURBQWlEO0FBQ2pELGlCQUFpQjtDQUNwQixDQUNKLENBQUM7QUFHRixTQUFTLElBQUksQ0FBQyxNQUFxQixFQUFFLE1BQXFCO0lBQ3RELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNqQyxJQUFJLENBQUMsQ0FBQSxLQUFLLGFBQUwsS0FBSyx1QkFBTCxLQUFLLENBQUUsUUFBUSxFQUFFLENBQUE7UUFBRSxPQUFPO0lBRS9CLCtDQUErQztJQUMvQyx1RUFBdUU7SUFDdkUsK0RBQStEO0lBQy9ELG9EQUFvRDtJQUVwRCxvQkFBb0I7SUFDcEIsd0NBQXdDO0lBQ3hDLGlCQUFpQjtJQUNqQixlQUFlO0lBQ2Ysb0NBQW9DO0lBQ3BDLHNCQUFzQjtJQUN0QixxQkFBcUI7SUFDckIsZ0RBQWdEO0lBQ2hELG9CQUFvQjtJQUNwQix5QkFBeUI7SUFDekIsUUFBUTtJQUNSLEtBQUs7QUFDVCxDQUFDIn0=