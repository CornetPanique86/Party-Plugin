import { events } from "bdsx/event";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { createCItemStack } from "../utils";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { Player } from "bdsx/bds/player";
import { BlockPlaceEvent } from "bdsx/event_impl/blockevent";
import { CANCEL } from "bdsx/common";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { Block } from "bdsx/bds/block";
import { DimensionId } from "bdsx/bds/actor";

const fs = require('fs');

export let isGameRunning = false;

// ====
// DATA
// ====

// RED: 0        BLUE: 1
const teams = new Map<string, number>();
const flagsStatus = [true, true] // True = SAFE, IN BASE, NOT PICKED UP

// CONSTANTS
const canPlaceOnAllBlox = fs.readFileSync("./canPlaceOnBlocks.txt");
const teamColors = [-54000, 66000];

export function startGame() {
    isGameRunning = true;
    const leaders = ["", ""];

    let teamCounter = 0;
    for (const pl of bedrockServer.level.getPlayers()) {
        teams.set(pl.getNameTag(), teamCounter);
        leaders[teamCounter] = pl.getNameTag();

        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }

    chooseFlagPos(leaders[0], leaders[1]);
}

export function startGameLeaders(leader1: string, leader2: string) {
    bedrockServer.executeCommand("tellraw @a " + rawtext("Not implemented", LogInfo.error));
}

function chooseFlagPos(leader1Name: string, leader2Name: string) {
    if (leader1Name === "" || leader2Name === "") return bedrockServer.executeCommand("tellraw @a " +rawtext("Leaders undefined", LogInfo.error));
    if (getPlayerByName(leader1Name) === null || getPlayerByName(leader2Name) === null) return bedrockServer.executeCommand("tellraw @a " +rawtext("Leaders players offline", LogInfo.error));
    const bannerPlaceCooldown = [false, false];
    const bannerPos = [Vec3.create(0, 0, 0), Vec3.create(0, 0, 0)]; // gotta change the default
    const dim = bedrockServer.level.getDimension(DimensionId.Overworld);
    if (!dim) return bedrockServer.executeCommand("tellraw @a " +rawtext("Dimension undefined", LogInfo.error));

    bedrockServer.executeCommand(`give "${leader1Name}" banner 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    bedrockServer.executeCommand(`give "${leader2Name}" banner 1 4 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);

    const blockPlaceLis = (e: BlockPlaceEvent) => {
        if (e.block.getName() === "minecraft:banner") {
            const pl = e.player;
            const pos = e.blockPos;
            let team = 0;
            if (pl.getNameTag() === leader1Name) team = 0
                else if (pl.getNameTag() === leader2Name) team = 1
                else return;
            bannerPlaceCooldown[team] = true;
            if (!checkAirSpace(BlockPos.create(pos.x+1, pos.y, pos.z+1), BlockPos.create(pos.x-1, 200, pos.z-1))) {
                pl.sendMessage("§cThe airspace isn't empty!");
                pl.playSound("note.bass");
                return;
            }
            bannerPos[team] = Vec3.create(pos.x, pos.y, pos.z);
            pl.sendMessage("§aSuccesfully registered flag position. Type §l/ready §r§awhen you are sure of the current positioning.");
            pl.playSound("note.harp");
            setTimeout(() => bannerPlaceCooldown[team] = false, 10e3);
            return CANCEL;
        }
    }

    const bannerParticlesInterval = setInterval(() => {
        for (let i=0; i<bannerPos.length; i++) {
            bedrockServer.level.spawnParticleEffect("minecraft:blue_flame_particle", bannerPos[i], dim);
            const {x, y, z} = bannerPos[i];
            let X = x-1,
                Y = y+0.5,
                Z = z-1;
            while (X < x+1) {
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(X, Y, z+1), dim);
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(X, Y, z-1), dim);
                X += 0.5;
            }
            while (Z < z+1) {
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x+1, Y, Z), dim);
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x-1, Y, Z), dim);
                Z += 0.5;
            }
        }
    }, 1_000)

    events.blockPlace.on(blockPlaceLis);


    events.blockPlace.remove(blockPlaceLis);
    clearInterval(bannerParticlesInterval);
}

function checkAirSpace(from: BlockPos, to: BlockPos) {
    const region = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
    if (!region) {
        bedrockServer.executeCommand("tellraw @a " + rawtext("Couldn't check airspace: region undefined", LogInfo.error));
        return false;
    }
    const sourceX = Math.min(from.x, to.x),
          destX = Math.max(from.x, to.x),
          sourceY = Math.min(from.y, to.y),
          destY = Math.max(from.y, to.y),
          sourceZ = Math.min(from.z, to.z),
          destZ = Math.max(from.z, to.z);

    let isAirSpaceClear = true;
    for (let x = sourceX; x <= destX; x++) {
        if (!isAirSpaceClear) break;
        for (let y = sourceY; y <= destY; y++) {
            if (!isAirSpaceClear) break;
            for (let z = sourceZ; z <= destZ; z++) {
                if (!isAirSpaceClear) break;
                const blockPos = BlockPos.create(x, y, z);
                if (region.getBlock(blockPos).getName() !== "minecraft:air")  {
                    isAirSpaceClear = false;
                }
            }
        }
    }
    return isAirSpaceClear;
}

function setup() {
    bedrockServer.executeCommand("clear @a");

    const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
    const armorRed = [];
    const armorBlue = [];
    for (let i = 0; i < armorNames.length; i++) {
        const item1 = createCItemStack({ item: armorNames[i] });
        const item2 = createCItemStack({ item: armorNames[i] });

        const tag1 = item1.save(), tag2 = item2.save();
        const nbt1 = NBT.allocate({
            ...tag1,
            tag: {
                ...tag1.tag,
                "customColor": NBT.int(teamColors[0])
            }
        }) as CompoundTag,
        nbt2 = NBT.allocate({
            ...tag2,
            tag: {
                ...tag2.tag,
                "customColor": NBT.int(teamColors[1])
            }
        }) as CompoundTag;
        item1.load(nbt1);  item2.load(nbt2);

        armorRed.push(item1); armorBlue.push(item2);
    }
    const items = [];
    const coloredBlocks = [];
    for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "oak_log"]) {
        if (itemName === "oak_log") items.push(createCItemStack({ item: itemName, amount: 64 }))
        else items.push(createCItemStack({ item: itemName }));
    }
    for (const blockName of ["red_terracotta", "blue_terracotta"]) {
        coloredBlocks.push(createCItemStack({ item: blockName, amount: 64 }));
    }

    for (const pl of bedrockServer.level.getPlayers()) {
        if (!teams.has(pl.getNameTag())) teams.set(pl.getNameTag(), Math.floor(Math.random()*2));
        const team = teams.get(pl.getNameTag())!;

        for (const item of items) {
            pl.addItem(item);
        }
        pl.addItem(coloredBlocks[team]);
        pl.sendInventory();

        if (team === 0) {
            for (let i = 0; i < armorRed.length; i++) {
                pl.setArmor(i, armorRed[i]);
            }
        } else {
            for (let i = 0; i < armorBlue.length; i++) {
                pl.setArmor(i, armorBlue[i]);
            }
        }

        pl.sendTitle("§9Capture the Flag", `${ team === 0 ? "§cRed" : "§bBlue" } §7team`);
    }

    for (let i = 0; i < armorNames.length; i++) {
        armorRed[i].destruct();
        armorBlue[i].destruct();
    }
    for (const item of items) {
        item.destruct();
    }
    for (const coloredBlock of coloredBlocks) {
        coloredBlock.destruct();
    }


}

function getPlayerByName(name: string): Player | null {
    const plList = bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name) return plList[i]
    }
    return null;
}
