"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConstant = exports.startGameLeaders = exports.startGame = exports.isGameRunning = void 0;
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("../utils");
const nbt_1 = require("bdsx/bds/nbt");
const player_1 = require("bdsx/bds/player");
const common_1 = require("bdsx/common");
const blockpos_1 = require("bdsx/bds/blockpos");
const block_1 = require("bdsx/bds/block");
const actor_1 = require("bdsx/bds/actor");
const form_1 = require("bdsx/bds/form");
const commands_1 = require("./commands");
const gamerules_1 = require("bdsx/bds/gamerules");
const effects_1 = require("bdsx/bds/effects");
const fs = require('fs');
const path = require('path');
exports.isGameRunning = false;
// ====
// DATA
// ====
// RED: 0        BLUE: 1
const teams = new Map();
const playerStats = new Map();
const flagsStatus = [true, true]; // True = SAFE, IN BASE, NOT PICKED UP
const flagHolder = ["", ""];
const flagCount = [0, 0];
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
    launcher_1.bedrockServer.executeCommand(`give "${leader1Name}" un:red_banner_block 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    launcher_1.bedrockServer.executeCommand(`give "${leader2Name}" un:blue_banner_block 1 1 {"minecraft:can_place_on":${canPlaceOnAllBlox}, "minecraft:item_lock":{ "mode": "lock_in_slot" }}`);
    const blockPlaceLis = (e) => {
        if (e.block.getName() === "un:red_banner_block" || e.block.getName() === "un:blue_banner_block") {
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
                    pl.runCommand("clear");
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
    launcher_1.bedrockServer.executeCommand("effect clear @a");
    launcher_1.bedrockServer.gameRules.setRule(gamerules_1.GameRuleId.DoImmediateRespawn, true);
    launcher_1.bedrockServer.gameRules.setRule(gamerules_1.GameRuleId.DoMobSpawning, false);
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
        playerStats.set(pl.getNameTag(), { kills: 0, deaths: 0, flags: 0 });
        pl.teleport(teamSpawnPos[team]);
        pl.sendTitle("§9Capture the Flag", `${teamRawtext[team]} §7team`);
        pl.playSound("mob.enderdragon.growl", undefined, 0.5);
        pl.setGameType(player_1.GameType.Survival);
    }
    for (let i = 0; i < armorNames.length; i++) {
        armorRed[i].destruct();
        armorBlue[i].destruct();
    }
    scoreboardUpd();
    exports.isGameRunning = true;
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
    const stats = playerStats.get(pl.getNameTag()) || { kills: 0, deaths: 0, flags: 0 };
    stats.flags++;
    playerStats.set(pl.getNameTag(), stats);
    pl.runCommand("clear @s " + (teamStolen === 0 ? "un:red_banner_helmet" : "un:blue_banner_helmet"));
    pl.sendTitle("§r", "§aFlag Captured");
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`§f${pl.getNameTag()} §7has §acaptured ${teamRawtext[teamStolen]}§7's flag!`));
    launcher_1.bedrockServer.executeCommand("playsound @a random.levelup");
    const bannerBlock = [block_1.Block.create("un:red_banner_block"), block_1.Block.create("un:blue_banner_block")][teamStolen];
    const region = pl.getRegion();
    region.setBlock(blockpos_1.BlockPos.create(bannerPos[teamStolen]), bannerBlock);
    flagsStatus[teamStolen] = true;
    teamStolen === 0 ? flagCount[1]++ : flagCount[0]++;
    flagHolder[0] = "";
    flagHolder[1] = "";
    scoreboardUpd();
    end();
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
function scoreboardUpd() {
    const str = [
        "§7Flags:",
        `§c[R] ${flagCount[0]}§7/3`,
        `§b[B] ${flagCount[1]}§7/3`
    ];
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        pl.setFakeScoreboard("CTF", str);
    });
}
function end() {
    // TESTS
    if (flagCount[0] < 3 || flagCount[1] < 3)
        return;
    const teamW = flagCount[0] === 3 ? 0 : 1;
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        var _a, _b, _c;
        const plName = pl.getNameTag();
        pl.sendMessage(`
§7------------------
§l${teamRawtext[teamW]} §r§awon the game!

§fKills §7- §a${(_a = playerStats.get(plName)) === null || _a === void 0 ? void 0 : _a.kills}
§fDeaths §7- §a${(_b = playerStats.get(plName)) === null || _b === void 0 ? void 0 : _b.deaths}
§fFlags Captured §7- §a${(_c = playerStats.get(plName)) === null || _c === void 0 ? void 0 : _c.flags}
§7------------------`);
        pl.playSound("firework.large_blast");
        const team = teams.get(plName) || 0;
        team === teamW ? pl.sendTitle("§aVICTORY!") : pl.sendTitle("§cYou lost");
        team === teamW ? pl.playSound("horn.call.1") : pl.playSound("horn.call.5");
        pl.setGameType(player_1.GameType.Spectator);
    });
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
    if (ticks === 20) {
        launcher_1.bedrockServer.executeCommand("execute at @a run fill ~+10 68 ~-5 ~-10 71 ~+5 air replace border_block");
    }
    level.getPlayers().forEach(pl => {
        const pos = pl.getPosition();
        const plName = pl.getNameTag();
        if (!teams.has(plName))
            return;
        const team = teams.get(plName);
        if (pos.y > 130 || pos.y < 50) { // BUILD LIMIT
            pl.teleport(teamSpawnPos[team]);
            pl.sendMessage("§cYou were teleported for reaching build limit!");
        }
        else if (flagHolder[0] === plName) { // Red player
            if ((pos.x >= (bannerPos[0].x - 1) && pos.x <= (bannerPos[0].x + 1.5))
                && (pos.y >= (bannerPos[0].y) && pos.y <= (bannerPos[0].y + 2))
                && (pos.z >= (bannerPos[0].z - 1) && pos.z <= (bannerPos[0].z + 1.5))) {
                if (!flagsStatus[team])
                    return; // Player's team's flag is taken
                flagCaptured(pl, 1);
            }
        }
        else if (flagHolder[1] === plName) { // Blue player
            if ((pos.x >= (bannerPos[1].x - 1) && pos.x <= (bannerPos[1].x + 1.5))
                && (pos.y >= (bannerPos[1].y) && pos.y <= (bannerPos[1].y + 2))
                && (pos.z >= (bannerPos[1].z - 1) && pos.z <= (bannerPos[1].z + 1.5))) {
                if (!flagsStatus[team])
                    return; // Player's team's flag is taken
                flagCaptured(pl, 0);
            }
        }
    });
    ticks === 20 ? ticks = 0 : ticks++;
});
event_1.events.blockDestroy.on(e => {
    if (!exports.isGameRunning)
        return;
    const bl = e.blockSource.getBlock(e.blockPos).getName();
    const pl = e.player;
    console.log(pl);
    // console.log(pl.getNameTag());
    if (e.blockPos.y <= 50 || e.blockPos.y >= 130) {
        e.player.sendMessage("§cBlock is outside of map's limits!");
        return common_1.CANCEL;
    }
    if (bl === "un:red_banner_block" || bl === "un:blue_banner_block") {
        const teamStolen = bl === "un:red_banner_block" ? 0 : 1;
        // console.log(`${e.blockPos.x} ${e.blockPos.y} ${e.blockPos.z}`);
        // console.log(`${bannerPos[teamStolen].x} ${bannerPos[teamStolen].y} ${bannerPos[teamStolen].z}`);
        // Just to check if flag is where it's supposed to be
        if ((e.blockPos.x === bannerPos[teamStolen].x) && (e.blockPos.y === bannerPos[teamStolen].y) && (e.blockPos.z === bannerPos[teamStolen].z)) {
            // BANNER TAKEN
            const team = teams.get(pl.getNameTag());
            if (!team) {
                pl.sendMessage("Warning there was a problem you don't have a team pls contact admins");
                return common_1.CANCEL;
            }
            ;
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
    return;
});
event_1.events.blockPlace.on(e => {
    if (!exports.isGameRunning)
        return;
    const { x, y, z } = e.blockPos;
    if (y <= 50 || y >= 130) {
        e.player.sendMessage("§cYou cannot place blocks outside of the map's limits!");
        return common_1.CANCEL;
    }
    for (const banner of bannerPos) {
        if ((x >= (banner.x - 1) && x <= (banner.x + 1))
            && (y >= (banner.y) && y <= (banner.y + 2))
            && (z >= (banner.z - 1) && z <= (banner.z + 1))) {
            return common_1.CANCEL;
        }
    }
    return;
});
event_1.events.playerRespawn.on(async (e) => {
    console.log("events.playerRespawn");
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
    pl.teleport(teamSpawnPos[team]);
    giveItems(pl, team);
    if (flagHolder.includes(plName)) {
        flagDropped(pl);
    }
});
event_1.events.playerLeft.on(e => {
    console.log("events.playerLeft");
    if (!exports.isGameRunning)
        return;
    const pl = e.player;
    const plName = pl.getNameTag();
    if (flagHolder.includes(plName)) {
        flagDropped(pl);
    }
});
event_1.events.playerJoin.on(async (e) => {
    console.log("events.playerJoin");
    const pl = e.player;
    while (!pl.isPlayerInitialized()) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
    }
    if (!exports.isGameRunning) {
        pl.teleport(blockpos_1.Vec3.create(731, 89, 288), actor_1.DimensionId.Overworld);
        pl.runCommand("clear");
        pl.setGameType(player_1.GameType.Adventure);
        pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.InstantHealth, 1, 15, false, false, false));
        pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Saturation, 5 * 60 * 20, 255, false, false, false));
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
event_1.events.entityDie.on(e => {
    var _a;
    if (!exports.isGameRunning)
        return;
    if (e.entity.getIdentifier() !== "minecraft:player")
        return;
    if (!((_a = e.damageSource.getDamagingEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()))
        return;
    const attacker = e.damageSource.getDamagingEntity();
    const victim = e.entity;
    const attackerStats = playerStats.get(attacker.getNameTag()) || { kills: 0, deaths: 0, flags: 0 };
    const victimStats = playerStats.get(victim.getNameTag()) || { kills: 0, deaths: 0, flags: 0 };
    attackerStats.kills++;
    victimStats.deaths++;
    playerStats.set(attacker.getNameTag(), attackerStats);
    playerStats.set(victim.getNameTag(), victimStats);
});
event_1.events.playerAttack.on(e => {
    if (!exports.isGameRunning)
        return common_1.CANCEL;
    if (e.victim.getIdentifier() !== "minecraft:player")
        return;
    const pl = e.player;
    const victim = e.victim;
    const plName = pl.getNameTag();
    const plTeam = teams.get(plName);
    const victimTeam = teams.get(victim.getNameTag());
    if (plTeam === undefined || victimTeam === undefined)
        return;
    if (plTeam === victimTeam)
        return common_1.CANCEL;
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
            return [[bannerPos[0].x, bannerPos[0].y, bannerPos[0].z],
                [bannerPos[1].x, bannerPos[1].y, bannerPos[1].z]];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3RmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3RmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNDQUFvQztBQUNwQyw0Q0FBOEM7QUFDOUMsMEJBQXNDO0FBQ3RDLG9DQUE0QztBQUM1QyxzQ0FBZ0Q7QUFDaEQsNENBQW1EO0FBRW5ELHdDQUFxQztBQUNyQyxnREFBbUQ7QUFDbkQsMENBQXVDO0FBQ3ZDLDBDQUE2QztBQUU3Qyx3Q0FBcUM7QUFFckMseUNBQXVDO0FBQ3ZDLGtEQUFnRDtBQUNoRCw4Q0FBbUU7QUFFbkUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUVsQixRQUFBLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFFakMsT0FBTztBQUNQLE9BQU87QUFDUCxPQUFPO0FBRVAsd0JBQXdCO0FBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0FBQ3hDLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUE0RCxDQUFDO0FBQ3hGLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsc0NBQXNDO0FBQ3hFLE1BQU0sVUFBVSxHQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sU0FBUyxHQUFHLENBQUMsZUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLGVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsMkJBQTJCO0FBRXJHLFlBQVk7QUFDWixNQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxD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