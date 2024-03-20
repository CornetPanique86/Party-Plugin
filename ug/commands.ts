import { CommandOutput, CommandPermissionLevel } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedwarsstart, clearMap } from "./bedwars";
import { createCItemStack, joinqueue, leavequeue, spectate, spectateStop } from "./utils";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { int32_t } from "bdsx/nativetype";
import { Block } from "bdsx/bds/block";
import { BlockPos } from "bdsx/bds/blockpos";
import { ArmorSlot } from "bdsx/bds/inventory";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { AbilitiesIndex } from "bdsx/bds/abilities";
import { bedrockServer } from "bdsx/launcher";
import { isGameRunning } from ".";

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

// Spectate currently running game
command.register("spectate", "Spectate the current game", /* Command permission */ CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (actor.hasTag("spectator")) {
            spectateStop(actor);
        } else {
            if (isGameRunning.isRunning) spectate(actor);
        }
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

command.register("bedwarsclearmap", "cleazr map", /* Command permission */ CommandPermissionLevel.Operator).overload(
    (param, origin, output) => {
        clearMap();
    }, { }
);


function test(param: { action: string, value: number }, origin: CommandOrigin, output: CommandOutput) {
    const actor = origin.getEntity();
    if (!actor?.isPlayer()) return;

    const actorName = actor.getNameTag();
    console.log(actorName);
    const result1 = bedrockServer.executeCommand(`clear "${actorName}"`).result;
    const result2 = bedrockServer.executeCommand(`clear ${actorName}`).result;
    console.log("result1: " + result1 + " ; result2: " + result2);

    // if (!actor.hasTag("abilityTrue")) {
    //     actor.addTag("abilityTrue");
    //     const abilities = actor.getAbilities();
    //     abilities.setAbility(AbilitiesIndex.MayFly, true);
    //     abilities.setAbility(AbilitiesIndex.Flying, true);
    //     abilities.setAbility(AbilitiesIndex.NoClip, true);
    //     abilities.setAbility(AbilitiesIndex.Invulnerable, true);
    //     abilities.setAbility(AbilitiesIndex.AttackPlayers, false);
    //     actor.syncAbilities();
    // } else {
    //     actor.removeTag("abilityTrue");
    //     const abilities = actor.getAbilities();
    //     abilities.setAbility(AbilitiesIndex.Flying, false);
    //     abilities.setAbility(AbilitiesIndex.MayFly, false);
    //     abilities.setAbility(AbilitiesIndex.NoClip, false);
    //     abilities.setAbility(AbilitiesIndex.Invulnerable, false);
    //     abilities.setAbility(AbilitiesIndex.AttackPlayers, true);
    //     actor.syncAbilities();
    // }

    // let armorSlot = ArmorSlot.Head;
    // let armor = "minecraft:diamond_helmet";
    // switch (param.value) {
    //     case 1:
    //         armorSlot = ArmorSlot.Chest;
    //         armor = "minecraft:diamond_chestplate";
    //         break;
    //     case 2:
    //         armorSlot = ArmorSlot.Legs;
    //         armor = "minecraft:diamond_leggings";
    //         break;
    //     case 3:
    //         armorSlot = ArmorSlot.Feet;
    //         armor = "minecraft:diamond_boots";
    //         break;
    //     default:
    //         break;
    // }
    // console.log(actor.getArmor(armorSlot));
    // let userData = actor.getArmor(ArmorSlot.Chest).getUserData();
    // console.log("\n\n" + NBT.stringify(userData, 4));

    // const item = createCItemStack({
    //     item: armor,
    //     amount: 1
    // });
    // const tag = item.save();
    // const nbt = NBT.allocate({
    //     ...tag,
    //     tag: {
    //         ...tag.tag,
    //         "Trim": {
    //             "Material": "redstone",
    //             "Pattern": "wayfinder"
    //         },
    //         "minecraft:item_lock": NBT.byte(2),
    //         "minecraft:keep_on_death": NBT.byte(1)
    //     }
    // }) as CompoundTag;
    // item.load(nbt);
    // actor.setArmor(param.value, item);
    // item.destruct();
}