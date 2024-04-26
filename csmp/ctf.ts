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
import { ItemUseEvent } from "bdsx/event_impl/entityevent";
import { Form } from "bdsx/bds/form";
import { ItemStack } from "bdsx/bds/inventory";
import { Constants } from "./commands";

const fs = require('fs');
const path = require('path');

export let isGameRunning = false;

// ====
// DATA
// ====

// RED: 0        BLUE: 1
const teams = new Map<string, number>();
const flagsStatus = [true, true]; // True = SAFE, IN BASE, NOT PICKED UP
const flagHolder: string[] = ["", ""];
const bannerPos = [Vec3.create(669, 85, 335), Vec3.create(596, 65, 252)]; // gotta change the default

// CONSTANTS
const canPlaceOnAllBlox = fs.readFileSync(path.join(__dirname, "canPlaceOnBlocks.txt"));
const teamColors = [-54000, 66000];
const teamRawtext = ["§cRed", "§bBlue"];
const teamSpawnPos = [Vec3.create(669, 91, 344), Vec3.create(584, 71, 239)];

export function startGame() {
    const leaders = ["", ""];

    let teamCounter = 0;
    for (const pl of bedrockServer.level.getPlayers()) {
        teams.set(pl.getNameTag(), teamCounter);
        leaders[teamCounter] = pl.getNameTag();
        pl.teleport(teamSpawnPos[teamCounter], DimensionId.Overworld);

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
    bedrockServer.executeCommand("tellraw @a " + rawtext("Each team leader now has to choose a position for their flag! §7§oThe flag's current position is indicated by a square of particles", LogInfo.info));
    const bannerPlaceCooldown = [false, false];
    const areTeamsReady = [false, false];
    const dim = bedrockServer.level.getDimension(DimensionId.Overworld);
    if (!dim) return bedrockServer.executeCommand("tellraw @a " +rawtext("Dimension undefined", LogInfo.error));

    bedrockServer.executeCommand(`tellraw "${leader1Name}" ${rawtext("Pls just pretend the red concrete is a BANNER. So place it somewhere.", LogInfo.warn)}`);
    bedrockServer.executeCommand(`tellraw "${leader2Name}" ${rawtext("Pls just pretend the blue concrete is a BANNER. So place it somewhere.", LogInfo.warn)}`);
    bedrockServer.executeCommand(`give "${leader1Name}" red_concrete 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    bedrockServer.executeCommand(`give "${leader2Name}" blue_concrete 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);

    const blockPlaceLis = (e: BlockPlaceEvent) => {
        if (e.block.getName() === "minecraft:red_concrete" || e.block.getName() === "minecraft:blue_concrete") {
            const pl = e.player;
            const pos = e.blockPos;
            let team = 0;
            if (pl.getNameTag() === leader1Name) team = 0
                else if (pl.getNameTag() === leader2Name) team = 1
                else return;
            if (bannerPlaceCooldown[team]) {
                pl.runCommand("tellraw @s " +rawtext("You're on cooldown!", LogInfo.error));
                return CANCEL;
            }
            bannerPlaceCooldown[team] = true;
            setTimeout(() => bannerPlaceCooldown[team] = false, 5e3);
            pl.runCommand("clear @s slime");
            const item = createCItemStack({ item: "slime", name: "§r§2Ready §7[§fRight click§7]" });
            pl.addItem(item);
            pl.sendInventory();
            item.destruct();
            if (!checkAirSpace(BlockPos.create(pos.x+1, pos.y, pos.z+1), BlockPos.create(pos.x-1, 200, pos.z-1))) {
                pl.sendMessage("§cThe airspace isn't empty!");
                pl.playSound("note.bass");
                return CANCEL;
            }
            bannerPos[team] = Vec3.create(pos.x, pos.y, pos.z);
            pl.sendMessage("§aSuccesfully registered flag position. Right click the slime block when you are sure of the current positioning.");
            pl.playSound("note.harp");
            return CANCEL;
        }
    }
    const itemUseLis = async (e: ItemUseEvent) => {
        console.log(e.itemStack.getName());
        if (e.itemStack.getName() === "minecraft:slime") {
            const pl = e.player;
            let team = 0;
            if (pl.getNameTag() === leader1Name) team = 0
                else if (pl.getNameTag() === leader2Name) team = 1
                else return;

            const ni = pl.getNetworkIdentifier();
            const confirmForm = await Form.sendTo(ni, {
                type: "modal",
                title: "Confirm team is ready?",
                content: "Confirm team is ready? Please make sure your team agrees with the flag position.",
                button1: "§2YES",
                button2: "§cnah"
            });
            if (confirmForm) {
                areTeamsReady[team] = true;
                if (areTeamsReady[0] && areTeamsReady[1]) {
                    stopChooseFlagPos();
                    setup();
                } else {
                    bedrockServer.executeCommand("tellraw @a " + rawtext(teamRawtext[team] + " §ais ready!", LogInfo.info));
                    bedrockServer.executeCommand("playsound random.pop @a");
                }
            }
        }
    }

    const bannerParticlesInterval = setInterval(() => {
        if (bedrockServer.isClosed()) clearInterval(bannerParticlesInterval);

        for (let i=0; i<bannerPos.length; i++) {
            let {x, y, z} = bannerPos[i];
            x += 0.5; y += 0.5; z += 0.5;
            bedrockServer.level.spawnParticleEffect("minecraft:blue_flame_particle", Vec3.create(x, y, z), dim);

            let X = x-1.5,
                Z = z-1.5;
            while (X < x+1.5) {
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(X, y, z+1.5), dim);
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(X, y, z-1.5), dim);
                X += 0.5;
            }
            while (Z < z+1.5) {
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x+1.5, y, Z), dim);
                bedrockServer.level.spawnParticleEffect("minecraft:endrod", Vec3.create(x-1.5, y, Z), dim);
                Z += 0.5;
            }
        }
    }, 2_000);

    events.blockPlace.on(blockPlaceLis);
    events.itemUse.on(itemUseLis);
    console.log("events fired");

    function stopChooseFlagPos() {
        events.blockPlace.remove(blockPlaceLis);
        events.itemUse.remove(itemUseLis);
        clearInterval(bannerParticlesInterval);
    }
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

    //
    // FLAGS SETUP
    //
    for (let i=0; i < bannerPos.length; i++) {
        const bannerBlocks = [Block.create("un:red_banner_block"), Block.create("un:blue_banner_block")];

        const region = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
        if (!region) {
            bedrockServer.executeCommand("tellraw @a " + rawtext("Couldn't place banners: region undefined", LogInfo.error));
            return;
        }
        if (!bannerBlocks[0] || !bannerBlocks[1]) {
            bedrockServer.executeCommand("tellraw @a " + rawtext("Couldn't place banners: banner block undefined", LogInfo.error));
            return;
        }
        const {x, y, z} = bannerPos[i];
        bedrockServer.executeCommand(`tickingarea add ${x+1} ${y-1} ${z+1} ${x-1} ${y+2} ${z-1} banner${i}`);
        bedrockServer.executeCommand(`fill ${x+1} ${y-1} ${z+1} ${x-1} ${y-1} ${z-1} bedrock`);
        region.setBlock(BlockPos.create(bannerPos[i]), bannerBlocks[i]!);
    }


    //
    // ITEMS SETUP
    //
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

    const coloredBlocks = ["red_terracotta", "blue_terracotta"];

    for (const pl of bedrockServer.level.getPlayers()) {
        if (!teams.has(pl.getNameTag())) teams.set(pl.getNameTag(), Math.floor(Math.random()*2));
        const team = teams.get(pl.getNameTag())!;

        const items = [];
        for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "oak_log", "arrow"]) {
            if (itemName === "oak_log") items.push(createCItemStack({ item: itemName, amount: 64 }))
                else if (itemName === "arrow") items.push(createCItemStack({ item: itemName, amount: 32 }))
                else items.push(createCItemStack({ item: itemName }));
        }
        for (const item of items) {
            pl.addItem(item);
        }
        const coloredBlock = createCItemStack({ item: coloredBlocks[team], amount: 64 });
        pl.addItem(coloredBlock);
        pl.sendInventory();

        for (const item of items) {
            item.destruct();
        }
        coloredBlock.destruct();

        if (team === 0) {
            for (let i = 0; i < armorRed.length; i++) {
                pl.setArmor(i, armorRed[i]);
            }
        } else {
            for (let i = 0; i < armorBlue.length; i++) {
                pl.setArmor(i, armorBlue[i]);
            }
        }

        pl.teleport(teamSpawnPos[team]);
        pl.sendTitle("§9Capture the Flag", `${teamRawtext[team]} §7team`);
        pl.playSound("mob.enderdragon.growl", undefined, 0.5);
    }

    for (let i = 0; i < armorNames.length; i++) {
        armorRed[i].destruct();
        armorBlue[i].destruct();
    }

}

function giveItems(pl: Player, team: number) {
    const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];

    for (let i = 0; i < armorNames.length; i++) {
        const item = createCItemStack({ item: armorNames[i] });

        const tag = item.save();
        const nbt = NBT.allocate({
            ...tag,
            tag: {
                ...tag.tag,
                "customColor": NBT.int(teamColors[team])
            }
        }) as CompoundTag;
        item.load(nbt);

        pl.setArmor(i, item);
        item.destruct();
    }

    for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "oak_log", "arrow"]) {
        let item: ItemStack;
        if (itemName === "oak_log") item = (createCItemStack({ item: itemName, amount: 64 }))
            else if (itemName === "arrow") item = (createCItemStack({ item: itemName, amount: 32 }))
            else item = (createCItemStack({ item: itemName }));
        pl.addItem(item);
        item.destruct();
    }
    const item = team === 0 ? createCItemStack({ item: "red_terracotta", amount: 64 }) : createCItemStack({ item: "blue_terracotta", amount: 64 });
    pl.addItem(item);
    item.destruct();

    pl.sendInventory();
}

function flagCaptured(pl: Player, teamStolen: number) {
    pl.runCommand("clear @s " + (teamStolen === 0 ? "un:red_banner_helmet" : "un:blue_banner_helmet"));
    pl.sendTitle("§r", "§aFlag Captured");

    bedrockServer.executeCommand("tellraw @a " + rawtext(`§f${pl.getNameTag()} §7has §acaptured ${teamRawtext[teamStolen]}§7's flag!`));
    bedrockServer.executeCommand("playsound @a random.levelup");

    const bannerBlock = [Block.create("un:red_banner_block"), Block.create("un:blue_banner_block")][teamStolen];
    const region = pl.getRegion();
    region.setBlock(BlockPos.create(bannerPos[teamStolen]), bannerBlock!);
    flagsStatus[teamStolen] = true;
    flagHolder[0] = ""; flagHolder[1] = "";
}

function flagDropped(pl: Player) {
    const team = teams.get(pl.getNameTag());
    if (!team) return;
    const teamDropped = team === 0 ? 1 : 0;

    if (pl.isPlayerInitialized()) pl.runCommand("clear @s " + (teamDropped === 0 ? "un:red_banner_helmet" : "un:blue_banner_helmet"));

    bedrockServer.executeCommand("tellraw @a " + rawtext(`${teamRawtext[teamDropped]}§7's flag §7was §cdropped §7by §f${pl.getNameTag()}§7!`));
    bedrockServer.executeCommand("playsound @a random.pop");

    const bannerBlock = [Block.create("un:red_banner_block"), Block.create("un:blue_banner_block")][teamDropped];
    const region = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
    if (!region) {
        bedrockServer.executeCommand("tellraw @a " + rawtext("Couldn't replace banner: region undefined", LogInfo.error));
        return false;
    }
    region.setBlock(BlockPos.create(bannerPos[teamDropped]), bannerBlock!);
    flagsStatus[teamDropped] = true;
    flagHolder[flagHolder.indexOf(pl.getNameTag())] = "";
}



function end() {
    return;
}



let ticks = 0;
events.levelTick.on(e => {
    if (!isGameRunning) return;
    const level = e.level;

    if (level.getActivePlayerCount() < 2) {
        end();
        return;
    }

    level.getPlayers().forEach(pl => {
        const pos = pl.getPosition();
        const plName = pl.getNameTag();
        if (!teams.has(plName)) return;
        const team = teams.get(plName)!;

        if (ticks === 80) {
            pl.runCommand("fill ~+5 68 ~-5 ~-5 71 ~+5 air replace border_block");
        }

        if (pos.y > 130 || pos.y < 50) { // BUILD LIMIT
            pl.teleport(teamSpawnPos[team]);
            pl.sendMessage("§cYou were teleported for reaching build limit!");
        } else if (flagHolder[0] === plName) { // Red player
            if ((pos.x >= bannerPos[0].x-1 && pos.x <= bannerPos[0].x+1)
             && (pos.y >= bannerPos[0].y && pos.y <= bannerPos[0].y+2)
             && (pos.z >= bannerPos[0].z-1 && pos.z <= bannerPos[0].z+1)) {
                if (!flagsStatus[team]) return; // Player's team's flag is taken
                flagCaptured(pl, 1);
            }
        } else if (flagHolder[1] === plName) { // Blue player
            if ((pos.x >= bannerPos[1].x-1 && pos.x <= bannerPos[1].x+1)
             && (pos.y >= bannerPos[1].y && pos.y <= bannerPos[1].y+2)
             && (pos.z >= bannerPos[1].z-1 && pos.z <= bannerPos[1].z+1)) {
                if (!flagsStatus[team]) return; // Player's team's flag is taken
                flagCaptured(pl, 0);
            }
        }
    });

    ticks === 80 ? ticks = 0 : ticks++;
});

events.blockDestroy.on(e => {
    if (!isGameRunning) return;
    const bl = e.blockSource.getBlock(e.blockPos).getName();
    if (bl === "un:red_banner_block" || "un:blue_banner_block") {
        const teamStolen = bl === "un:red_banner_block" ? 0 : 1;
        // Just to check if flag is where it's supposed to be
        if ((e.blockPos.x === bannerPos[teamStolen].x && e.blockPos.y === bannerPos[teamStolen].y && e.blockPos.z === bannerPos[teamStolen].z)) {
            // BANNER TAKEN
            const pl = e.player;
            const team = teams.get(pl.getNameTag());
            if (!team) return CANCEL;
            if (team === teamStolen) {
                pl.sendMessage("§cYou can't break your own flag!");
                return CANCEL;
            }

            bedrockServer.executeCommand("tellraw @a " + rawtext(`§f${pl.getNameTag()} §7has stolen ${teamRawtext[teamStolen]}§7's flag!`));
            bedrockServer.executeCommand("playsound @a note.banjo");

            flagsStatus[teamStolen] = false;
            flagHolder[team] = pl.getNameTag();
            const helmet = teamStolen === 0 ? createCItemStack({ item: "un:red_banner_helmet" }) : createCItemStack({ item: "un:blue_banner_helmet" });
            const tag = helmet.save();
            const nbt = NBT.allocate({
                ...tag,
                tag: {
                    ...tag.tag,
                    "minecraft:item_lock": NBT.byte(1),
                    "minecraft:keep_on_death": NBT.byte(1)
                }
            }) as CompoundTag;
            helmet.load(nbt);
            pl.setArmor(0, helmet);
            helmet.destruct();

            pl.runCommand("§7>> §fReturn the flag to your base! §7<<");


            // Block breaks but doesn't drop
            const reg = pl.getRegion();
            const airBlock = Block.create("minecraft:air")!;
            reg.setBlock(e.blockPos, airBlock);
        }
        return CANCEL;
    }
});

events.playerRespawn.on(async e => {
    if (!isGameRunning) return;
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }

    pl.runCommand("clear @s");
    const plName = pl.getNameTag();
    if (!teams.has(plName)) return;
    const team = teams.get(plName)!;

    giveItems(pl, team);

    if (flagHolder.includes(plName)) {
        flagDropped(pl);
    }
});

events.playerLeft.on(e => {
    if (!isGameRunning) return;
    const pl = e.player;
    const plName = pl.getNameTag();
    if (flagHolder.includes(plName)) {
        flagDropped(pl);
    }
});

events.playerJoin.on(async e => {
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }
    if (!isGameRunning) {
        pl.teleport(Vec3.create(731, 89, 288), DimensionId.Overworld);
        pl.runCommand("clear");
    } else {
        pl.runCommand("clear @s");

        const plName = pl.getNameTag();
        if (!teams.has(plName)) {
            teams.set(plName, Math.floor(Math.random()*2));
            pl.sendTitle(`${teamRawtext[teams.get(plName)!]} team`, "§7You were assigned to a team");
            pl.playSound("note.harp");
        }
        const team = teams.get(plName)!;

        giveItems(pl, team);

        pl.teleport(teamSpawnPos[team]);
    }
});

events.playerDimensionChange.on(() => {
    return CANCEL;
});


// DEBUG
export function getConstant(constant: Constants) {
    switch (constant) {
        case Constants.isGameRunning:
            return (isGameRunning);
        case Constants.bannerPos:
            return (bannerPos);
        case Constants.flagHolder:
            return (flagHolder);
        case Constants.flagsStatus:
            return (flagsStatus);
        case Constants.teams:
            return (teams);
        default:
            return ("No constant provided");
    }
}

function getPlayerByName(name: string): Player | null {
    const plList = bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name) return plList[i]
    }
    return null;
}
