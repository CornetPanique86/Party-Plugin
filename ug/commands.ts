import { CommandOutput, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedwarsstart } from "./bedwars";
import { createCItemStack, joinqueue, leavequeue } from "./utils";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { int32_t } from "bdsx/nativetype";
import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { ArmorSlot } from "bdsx/bds/inventory";
import { CompoundTag, NBT } from "bdsx/bds/nbt";

// Bedwars
command.register("bedwarsstart", "Hehehehe", /* Command permission */ CommandPermissionLevel.Operator)
    .overload(
        (param, origin, output) => {
            bedwarsstart(param, origin, output);
        },
        {
            option: command.enum("option.start", "start"),
        },
    )
    .overload(
        (param, origin, output) => {
            bedwarsstart(param, origin, output);
        },
        {
            option: command.enum("option.stop", "stop"),
        },
    );

// Join game queue
command.register("joinqueue", "Join the queue of a game", /* Command permission */ CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        joinqueue(origin, output);
    },
    { },
);

// Leave game queue
command.register("leavequeue", "Leave the queue you're currently in", /* Command permission */ CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        leavequeue(origin, output);
    },
    { },
);

// test
command.register("testp", "testing", /* Command permission */ CommandPermissionLevel.Operator).overload(
    (param, origin, output) => {
        test(param, origin, output);
    },
    {
        action: command.enum("action.data", "data"),
        value: int32_t
    },
);


function test(param: { action: string, value: number }, origin: CommandOrigin, output: CommandOutput) {
    const actor = origin.getEntity();
    if (!actor?.isPlayer()) return;

    // let armorSlot = ArmorSlot.Head;
    // switch (param.value) {
    //     case 1:
    //         armorSlot = ArmorSlot.Chest; break;
    //     case 2:
    //         armorSlot = ArmorSlot.Legs; break;
    //     case 3:
    //         armorSlot = ArmorSlot.Feet; break;
    //     default:
    //         break;
    // }
    // console.log(actor.getArmor(armorSlot));
    // let userData = actor.getArmor(ArmorSlot.Chest).getUserData();
    // console.log("\n\n" + NBT.stringify(userData, 4));
}