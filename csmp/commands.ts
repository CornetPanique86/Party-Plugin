import { CommandPermissionLevel, PlayerCommandSelector } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { getConstant, isGameRunning, startGame, startGameLeaders } from "./ctf";
import { RelativeFloat, Vec3 } from "bdsx/bds/blockpos";
import { createCItemStack } from "../utils";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { ItemStack } from "bdsx/bds/inventory";

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
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

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

        actor.teleport(Vec3.create(param.x.value, param.y.value, param.z.value));
        output.success(
            `relative float example> origin=${origin.getName()}\n` +
                `${param.x.value} ${param.x.is_relative}\n` +
                `${param.y.value} ${param.y.is_relative}\n` +
                `${param.z.value} ${param.z.is_relative}\n`,
        );
    },
    {
        x: RelativeFloat,
        y: RelativeFloat,
        z: RelativeFloat,
    }
)
