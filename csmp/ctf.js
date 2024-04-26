"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConstant = exports.startGameLeaders = exports.startGame = exports.isGameRunning = void 0;
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("../utils");
const nbt_1 = require("bdsx/bds/nbt");
const common_1 = require("bdsx/common");
const blockpos_1 = require("bdsx/bds/blockpos");
const block_1 = require("bdsx/bds/block");
const actor_1 = require("bdsx/bds/actor");
const form_1 = require("bdsx/bds/form");
const commands_1 = require("./commands");
const fs = require('fs');
const path = require('path');
exports.isGameRunning = false;
// ====
// DATA
// ====
// RED: 0        BLUE: 1
const teams = new Map();
const flagsStatus = [true, true]; // True = SAFE, IN BASE, NOT PICKED UP
const flagHolder = ["", ""];
const bannerPos = [blockpos_1.Vec3.create(669, 85, 335), blockpos_1.Vec3.create(596, 65, 252)]; // gotta change the default
// CONSTANTS
const canPlaceOnAllBlox = fs.readFileSync(path.join(__dirname, "canPlaceOnBlocks.txt"));
const teamColors = [-54000, 66000];
const teamRawtext = ["§cRed", "§bBlue"];
const teamSpawnPos = [blockpos_1.Vec3.create(669, 91, 344), blockpos_1.Vec3.create(584, 71, 239)];
function startGame() {
    const leaders = ["", ""];
    let teamCounter = 0;
    for (const pl of launcher_1.bedrockServer.level.getPlayers()) {
        teams.set(pl.getNameTag(), teamCounter);
        leaders[teamCounter] = pl.getNameTag();
        pl.teleport(teamSpawnPos[teamCounter], actor_1.DimensionId.Overworld);
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }
    chooseFlagPos(leaders[0], leaders[1]);
}
exports.startGame = startGame;
function startGameLeaders(leader1, leader2) {
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Not implemented", __1.LogInfo.error));
}
exports.startGameLeaders = startGameLeaders;
function chooseFlagPos(leader1Name, leader2Name) {
    if (leader1Name === "" || leader2Name === "")
        return launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Leaders undefined", __1.LogInfo.error));
    if (getPlayerByName(leader1Name) === null || getPlayerByName(leader2Name) === null)
        return launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Leaders players offline", __1.LogInfo.error));
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Each team leader now has to choose a position for their flag! §7§oThe flag's current position is indicated by a square of particles", __1.LogInfo.info));
    const bannerPlaceCooldown = [false, false];
    const areTeamsReady = [false, false];
    const dim = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld);
    if (!dim)
        return launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Dimension undefined", __1.LogInfo.error));
    launcher_1.bedrockServer.executeCommand(`tellraw "${leader1Name}" ${(0, __1.rawtext)("Pls just pretend the red concrete is a BANNER. So place it somewhere.", __1.LogInfo.warn)}`);
    launcher_1.bedrockServer.executeCommand(`tellraw "${leader2Name}" ${(0, __1.rawtext)("Pls just pretend the blue concrete is a BANNER. So place it somewhere.", __1.LogInfo.warn)}`);
    launcher_1.bedrockServer.executeCommand(`give "${leader1Name}" red_concrete 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    launcher_1.bedrockServer.executeCommand(`give "${leader2Name}" blue_concrete 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    const blockPlaceLis = (e) => {
        if (e.block.getName() === "minecraft:red_concrete" || e.block.getName() === "minecraft:blue_concrete") {
            const pl = e.player;
            const pos = e.blockPos;
            let team = 0;
            if (pl.getNameTag() === leader1Name)
                team = 0;
            else if (pl.getNameTag() === leader2Name)
                team = 1;
            else
                return;
            if (bannerPlaceCooldown[team]) {
                pl.runCommand("tellraw @s " + (0, __1.rawtext)("You're on cooldown!", __1.LogInfo.error));
                return common_1.CANCEL;
            }
            bannerPlaceCooldown[team] = true;
            setTimeout(() => bannerPlaceCooldown[team] = false, 5e3);
            pl.runCommand("clear @s slime");
            const item = (0, utils_1.createCItemStack)({ item: "slime", name: "§r§2Ready §7[§fRight click§7]" });
            pl.addItem(item);
            pl.sendInventory();
            item.destruct();
            if (!checkAirSpace(blockpos_1.BlockPos.create(pos.x + 1, pos.y, pos.z + 1), blockpos_1.BlockPos.create(pos.x - 1, 200, pos.z - 1))) {
                pl.sendMessage("§cThe airspace isn't empty!");
                pl.playSound("note.bass");
                return common_1.CANCEL;
            }
            bannerPos[team] = blockpos_1.Vec3.create(pos.x, pos.y, pos.z);
            pl.sendMessage("§aSuccesfully registered flag position. Right click the slime block when you are sure of the current positioning.");
            pl.playSound("note.harp");
            return common_1.CANCEL;
        }
    };
    const itemUseLis = async (e) => {
        console.log(e.itemStack.getName());
        if (e.itemStack.getName() === "minecraft:slime") {
            const pl = e.player;
            let team = 0;
            if (pl.getNameTag() === leader1Name)
                team = 0;
            else if (pl.getNameTag() === leader2Name)
                team = 1;
            else
                return;
            const ni = pl.getNetworkIdentifier();
            const confirmForm = await form_1.Form.sendTo(ni, {
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
                }
                else {
                    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(teamRawtext[team] + " §ais ready!", __1.LogInfo.info));
                    launcher_1.bedrockServer.executeCommand("playsound random.pop @a");
                }
            }
        }
    };
    const bannerParticlesInterval = setInterval(() => {
        if (launcher_1.bedrockServer.isClosed())
            clearInterval(bannerParticlesInterval);
        for (let i = 0; i < bannerPos.length; i++) {
            let { x, y, z } = bannerPos[i];
            x += 0.5;
            y += 0.5;
            z += 0.5;
            launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:blue_flame_particle", blockpos_1.Vec3.create(x, y, z), dim);
            let X = x - 1.5, Z = z - 1.5;
            while (X < x + 1.5) {
                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(X, y, z + 1.5), dim);
                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(X, y, z - 1.5), dim);
                X += 0.5;
            }
            while (Z < z + 1.5) {
                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(x + 1.5, y, Z), dim);
                launcher_1.bedrockServer.level.spawnParticleEffect("minecraft:endrod", blockpos_1.Vec3.create(x - 1.5, y, Z), dim);
                Z += 0.5;
            }
        }
    }, 2000);
    event_1.events.blockPlace.on(blockPlaceLis);
    event_1.events.itemUse.on(itemUseLis);
    console.log("events fired");
    function stopChooseFlagPos() {
        event_1.events.blockPlace.remove(blockPlaceLis);
        event_1.events.itemUse.remove(itemUseLis);
        clearInterval(bannerParticlesInterval);
    }
}
function checkAirSpace(from, to) {
    var _a;
    const region = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
    if (!region) {
        launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Couldn't check airspace: region undefined", __1.LogInfo.error));
        return false;
    }
    const sourceX = Math.min(from.x, to.x), destX = Math.max(from.x, to.x), sourceY = Math.min(from.y, to.y), destY = Math.max(from.y, to.y), sourceZ = Math.min(from.z, to.z), destZ = Math.max(from.z, to.z);
    let isAirSpaceClear = true;
    for (let x = sourceX; x <= destX; x++) {
        if (!isAirSpaceClear)
            break;
        for (let y = sourceY; y <= destY; y++) {
            if (!isAirSpaceClear)
                break;
            for (let z = sourceZ; z <= destZ; z++) {
                if (!isAirSpaceClear)
                    break;
                const blockPos = blockpos_1.BlockPos.create(x, y, z);
                if (region.getBlock(blockPos).getName() !== "minecraft:air") {
                    isAirSpaceClear = false;
                }
            }
        }
    }
    return isAirSpaceClear;
}
function setup() {
    var _a;
    launcher_1.bedrockServer.executeCommand("clear @a");
    //
    // FLAGS SETUP
    //
    for (let i = 0; i < bannerPos.length; i++) {
        const bannerBlocks = [block_1.Block.create("un:red_banner_block"), block_1.Block.create("un:blue_banner_block")];
        const region = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
        if (!region) {
            launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Couldn't place banners: region undefined", __1.LogInfo.error));
            return;
        }
        if (!bannerBlocks[0] || !bannerBlocks[1]) {
            launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Couldn't place banners: banner block undefined", __1.LogInfo.error));
            return;
        }
        const { x, y, z } = bannerPos[i];
        launcher_1.bedrockServer.executeCommand(`tickingarea add ${x + 1} ${y - 1} ${z + 1} ${x - 1} ${y + 2} ${z - 1} banner${i}`);
        launcher_1.bedrockServer.executeCommand(`fill ${x + 1} ${y - 1} ${z + 1} ${x - 1} ${y - 1} ${z - 1} bedrock`);
        region.setBlock(blockpos_1.BlockPos.create(bannerPos[i]), bannerBlocks[i]);
    }
    //
    // ITEMS SETUP
    //
    const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
    const armorRed = [];
    const armorBlue = [];
    for (let i = 0; i < armorNames.length; i++) {
        const item1 = (0, utils_1.createCItemStack)({ item: armorNames[i] });
        const item2 = (0, utils_1.createCItemStack)({ item: armorNames[i] });
        const tag1 = item1.save(), tag2 = item2.save();
        const nbt1 = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag1), { tag: Object.assign(Object.assign({}, tag1.tag), { "customColor": nbt_1.NBT.int(teamColors[0]) }) })), nbt2 = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag2), { tag: Object.assign(Object.assign({}, tag2.tag), { "customColor": nbt_1.NBT.int(teamColors[1]) }) }));
        item1.load(nbt1);
        item2.load(nbt2);
        armorRed.push(item1);
        armorBlue.push(item2);
    }
    const coloredBlocks = ["red_terracotta", "blue_terracotta"];
    for (const pl of launcher_1.bedrockServer.level.getPlayers()) {
        if (!teams.has(pl.getNameTag()))
            teams.set(pl.getNameTag(), Math.floor(Math.random() * 2));
        const team = teams.get(pl.getNameTag());
        const items = [];
        for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "oak_log", "arrow"]) {
            if (itemName === "oak_log")
                items.push((0, utils_1.createCItemStack)({ item: itemName, amount: 64 }));
            else if (itemName === "arrow")
                items.push((0, utils_1.createCItemStack)({ item: itemName, amount: 32 }));
            else
                items.push((0, utils_1.createCItemStack)({ item: itemName }));
        }
        for (const item of items) {
            pl.addItem(item);
        }
        const coloredBlock = (0, utils_1.createCItemStack)({ item: coloredBlocks[team], amount: 64 });
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
        }
        else {
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
function giveItems(pl, team) {
    const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
    for (let i = 0; i < armorNames.length; i++) {
        const item = (0, utils_1.createCItemStack)({ item: armorNames[i] });
        const tag = item.save();
        const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "customColor": nbt_1.NBT.int(teamColors[team]) }) }));
        item.load(nbt);
        pl.setArmor(i, item);
        item.destruct();
    }
    for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "oak_log", "arrow"]) {
        let item;
        if (itemName === "oak_log")
            item = ((0, utils_1.createCItemStack)({ item: itemName, amount: 64 }));
        else if (itemName === "arrow")
            item = ((0, utils_1.createCItemStack)({ item: itemName, amount: 32 }));
        else
            item = ((0, utils_1.createCItemStack)({ item: itemName }));
        pl.addItem(item);
        item.destruct();
    }
    const item = team === 0 ? (0, utils_1.createCItemStack)({ item: "red_terracotta", amount: 64 }) : (0, utils_1.createCItemStack)({ item: "blue_terracotta", amount: 64 });
    pl.addItem(item);
    item.destruct();
    pl.sendInventory();
}
function flagCaptured(pl, teamStolen) {
    pl.runCommand("clear @s " + (teamStolen === 0 ? "un:red_banner_helmet" : "un:blue_banner_helmet"));
    pl.sendTitle("§r", "§aFlag Captured");
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`§f${pl.getNameTag()} §7has §acaptured ${teamRawtext[teamStolen]}§7's flag!`));
    launcher_1.bedrockServer.executeCommand("playsound @a random.levelup");
    const bannerBlock = [block_1.Block.create("un:red_banner_block"), block_1.Block.create("un:blue_banner_block")][teamStolen];
    const region = pl.getRegion();
    region.setBlock(blockpos_1.BlockPos.create(bannerPos[teamStolen]), bannerBlock);
    flagsStatus[teamStolen] = true;
    flagHolder[0] = "";
    flagHolder[1] = "";
}
function flagDropped(pl) {
    var _a;
    const team = teams.get(pl.getNameTag());
    if (!team)
        return;
    const teamDropped = team === 0 ? 1 : 0;
    if (pl.isPlayerInitialized())
        pl.runCommand("clear @s " + (teamDropped === 0 ? "un:red_banner_helmet" : "un:blue_banner_helmet"));
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`${teamRawtext[teamDropped]}§7's flag §7was §cdropped §7by §f${pl.getNameTag()}§7!`));
    launcher_1.bedrockServer.executeCommand("playsound @a random.pop");
    const bannerBlock = [block_1.Block.create("un:red_banner_block"), block_1.Block.create("un:blue_banner_block")][teamDropped];
    const region = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
    if (!region) {
        launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Couldn't replace banner: region undefined", __1.LogInfo.error));
        return false;
    }
    region.setBlock(blockpos_1.BlockPos.create(bannerPos[teamDropped]), bannerBlock);
    flagsStatus[teamDropped] = true;
    flagHolder[flagHolder.indexOf(pl.getNameTag())] = "";
}
function end() {
    return;
}
let ticks = 0;
event_1.events.levelTick.on(e => {
    if (!exports.isGameRunning)
        return;
    const level = e.level;
    if (level.getActivePlayerCount() < 2) {
        end();
        return;
    }
    level.getPlayers().forEach(pl => {
        const pos = pl.getPosition();
        const plName = pl.getNameTag();
        if (!teams.has(plName))
            return;
        const team = teams.get(plName);
        if (ticks === 40) {
            pl.runCommand("fill ~~~ ~  ~");
        }
        if (pos.y > 130 || pos.y < 50) { // BUILD LIMIT
            pl.teleport(teamSpawnPos[team]);
            pl.sendMessage("§cYou were teleported for reaching build limit!");
        }
        else if (flagHolder[0] === plName) { // Red player
            if ((pos.x >= bannerPos[0].x - 1 && pos.x <= bannerPos[0].x + 1)
                && (pos.y >= bannerPos[0].y && pos.y <= bannerPos[0].y + 2)
                && (pos.z >= bannerPos[0].z - 1 && pos.z <= bannerPos[0].z + 1)) {
                if (!flagsStatus[team])
                    return; // Player's team's flag is taken
                flagCaptured(pl, 1);
            }
        }
        else if (flagHolder[1] === plName) { // Blue player
            if ((pos.x >= bannerPos[1].x - 1 && pos.x <= bannerPos[1].x + 1)
                && (pos.y >= bannerPos[1].y && pos.y <= bannerPos[1].y + 2)
                && (pos.z >= bannerPos[1].z - 1 && pos.z <= bannerPos[1].z + 1)) {
                if (!flagsStatus[team])
                    return; // Player's team's flag is taken
                flagCaptured(pl, 0);
            }
        }
    });
    ticks === 40 ? ticks = 0 : ticks++;
});
event_1.events.blockDestroy.on(e => {
    if (!exports.isGameRunning)
        return;
    const bl = e.blockSource.getBlock(e.blockPos).getName();
    if (bl === "un:red_banner_block" || "un:blue_banner_block") {
        const teamStolen = bl === "un:red_banner_block" ? 0 : 1;
        // Just to check if flag is where it's supposed to be
        if ((e.blockPos.x === bannerPos[teamStolen].x && e.blockPos.y === bannerPos[teamStolen].y && e.blockPos.z === bannerPos[teamStolen].z)) {
            // BANNER TAKEN
            const pl = e.player;
            const team = teams.get(pl.getNameTag());
            if (!team)
                return common_1.CANCEL;
            if (team === teamStolen) {
                pl.sendMessage("§cYou can't break your own flag!");
                return common_1.CANCEL;
            }
            launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`§f${pl.getNameTag()} §7has stolen ${teamRawtext[teamStolen]}§7's flag!`));
            launcher_1.bedrockServer.executeCommand("playsound @a note.banjo");
            flagsStatus[teamStolen] = false;
            flagHolder[team] = pl.getNameTag();
            const helmet = teamStolen === 0 ? (0, utils_1.createCItemStack)({ item: "un:red_banner_helmet" }) : (0, utils_1.createCItemStack)({ item: "un:blue_banner_helmet" });
            const tag = helmet.save();
            const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "minecraft:item_lock": nbt_1.NBT.byte(1), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
            helmet.load(nbt);
            pl.setArmor(0, helmet);
            helmet.destruct();
            pl.runCommand("§7>> §fReturn the flag to your base! §7<<");
            // Block breaks but doesn't drop
            const reg = pl.getRegion();
            const airBlock = block_1.Block.create("minecraft:air");
            reg.setBlock(e.blockPos, airBlock);
        }
        return common_1.CANCEL;
    }
});
event_1.events.playerRespawn.on(async (e) => {
    if (!exports.isGameRunning)
        return;
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }
    pl.runCommand("clear @s");
    const plName = pl.getNameTag();
    if (!teams.has(plName))
        return;
    const team = teams.get(plName);
    giveItems(pl, team);
    if (flagHolder.includes(plName)) {
        flagDropped(pl);
    }
});
event_1.events.playerLeft.on(e => {
    if (!exports.isGameRunning)
        return;
    const pl = e.player;
    const plName = pl.getNameTag();
    if (flagHolder.includes(plName)) {
        flagDropped(pl);
    }
});
event_1.events.playerJoin.on(async (e) => {
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }
    if (!exports.isGameRunning) {
        pl.teleport(blockpos_1.Vec3.create(731, 89, 288), actor_1.DimensionId.Overworld);
        pl.runCommand("clear");
    }
    else {
        pl.runCommand("clear @s");
        const plName = pl.getNameTag();
        if (!teams.has(plName)) {
            teams.set(plName, Math.floor(Math.random() * 2));
            pl.sendTitle(`${teamRawtext[teams.get(plName)]} team`, "§7You were assigned to a team");
            pl.playSound("note.harp");
        }
        const team = teams.get(plName);
        giveItems(pl, team);
        pl.teleport(teamSpawnPos[team]);
    }
});
event_1.events.playerDimensionChange.on(() => {
    return common_1.CANCEL;
});
// DEBUG
function getConstant(constant) {
    switch (constant) {
        case commands_1.Constants.isGameRunning:
            return (exports.isGameRunning);
        case commands_1.Constants.bannerPos:
            return (bannerPos);
        case commands_1.Constants.flagHolder:
            return (flagHolder);
        case commands_1.Constants.flagsStatus:
            return (flagsStatus);
        case commands_1.Constants.teams:
            return (teams);
        default:
            return ("No constant provided");
    }
}
exports.getConstant = getConstant;
function getPlayerByName(name) {
    const plList = launcher_1.bedrockServer.level.getPlayers();
    for (let i = 0; i < plList.length; i++) {
        if (plList[i].getNameTag() === name)
            return plList[i];
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3RmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3RmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNDQUFvQztBQUNwQyw0Q0FBOEM7QUFDOUMsMEJBQXNDO0FBQ3RDLG9DQUE0QztBQUM1QyxzQ0FBZ0Q7QUFHaEQsd0NBQXFDO0FBQ3JDLGdEQUFtRDtBQUNuRCwwQ0FBdUM7QUFDdkMsMENBQTZDO0FBRTdDLHdDQUFxQztBQUVyQyx5Q0FBdUM7QUFFdkMsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUVsQixRQUFBLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFFakMsT0FBTztBQUNQLE9BQU87QUFDUCxPQUFPO0FBRVAsd0JBQXdCO0FBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0FBQ3hDLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsc0NBQXNDO0FBQ3hFLE1BQU0sVUFBVSxHQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLENBQUMsZUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLGVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsMkJBQTJCO0FBRXJHLFlBQVk7QUFDWixNQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDbkMsTUFBTSxXQUFXLEdBQUcsQ0FBQyxPQUFP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