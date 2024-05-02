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
        if (leaders[teamCounter].length === 0)
            leaders[teamCounter] = pl.getNameTag();
        pl.teleport(teamSpawnPos[teamCounter], actor_1.DimensionId.Overworld);
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    }
    chooseFlagPos(leaders[0], leaders[1]);
}
exports.startGame = startGame;
function startGameLeaders(leader1, leader2) {
    let leaderRed = undefined;
    let leaderBlue = undefined;
    for (const pl of launcher_1.bedrockServer.level.getPlayers()) {
        const plName = pl.getNameTag();
        if (plName === leader1) {
            leaderRed = pl;
        }
        else if (plName === leader2) {
            leaderBlue = pl;
        }
    }
    if (leaderRed == undefined || leaderBlue == undefined) {
        launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("Leader undefined", __1.LogInfo.error));
        return;
    }
    let remainingPls = [];
    const teamPls = [[], []];
    async function choosePlayerForm(leaderN) {
        const leader = leaderN === 0 ? leaderRed : leaderBlue;
        const teamPlsStr = ["§cRed: §r", "§bBlue: §r"];
        const plsDropdown = [];
        for (let i = 0; i < teamPls.length; i++) {
            for (const pl of teamPls[i]) {
                teamPlsStr[i] += pl + ", ";
            }
            teamPlsStr[i] = teamPlsStr[i].substring(0, teamPlsStr[i].length - 2);
        }
        remainingPls.forEach(pl => {
            plsDropdown.push(pl.getNameTag());
        });
        if (plsDropdown.length === 0) {
            launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("It appears there aren't anymore players to add to dropdown!", __1.LogInfo.error));
            return;
        }
        const ni = leader.getNetworkIdentifier();
        const form = await form_1.Form.sendTo(ni, {
            type: "custom_form",
            title: "Choose 1 member for your team",
            content: [
                {
                    "type": "label",
                    "text": `Choose a member to add to your team!\nYour team: ${teamRawtext[leaderN]}\n${teamPlsStr[0]}\n${teamPlsStr[1]}`
                },
                {
                    "type": "dropdown",
                    "text": "Choose a player",
                    "options": plsDropdown,
                    "default": 0
                }
            ]
        });
        if (form !== null) {
            const plName = plsDropdown[form[1]];
            teamPls[leaderN].push(plName);
            launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`§7§l> §r${plName} §7was added to ${teamRawtext[leaderN]}§7!`));
            launcher_1.bedrockServer.executeCommand("playsound random.pop @a");
            resetPlsList();
            if (remainingPls.length === 0) {
                playersChosen();
                return;
            }
            leader.sendActionbar("§7Waiting for other team leader's choice...");
            leaderN === 0 ? choosePlayerForm(1) : choosePlayerForm(0);
        }
        else {
            choosePlayerForm(leaderN);
        }
    }
    function resetPlsList() {
        remainingPls = [];
        launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
            const plName = pl.getNameTag();
            if (teamPls[0].includes(plName) || teamPls[0].includes(plName))
                return;
            if (plName === leader1 || plName === leader2)
                return;
            remainingPls.push(pl);
        });
    }
    resetPlsList();
    choosePlayerForm(0);
    function playersChosen() {
        launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("§aAll players were selected into a team! Starting step 2"));
        for (const pl of launcher_1.bedrockServer.level.getPlayers()) {
            const plName = pl.getNameTag();
            if (leader1 === plName) {
                teams.set(plName, 0);
                pl.teleport(teamSpawnPos[0], actor_1.DimensionId.Overworld);
            }
            else if (leader2 === plName) {
                teams.set(plName, 1);
                pl.teleport(teamSpawnPos[1], actor_1.DimensionId.Overworld);
            }
            else if (teamPls[0].includes(plName)) {
                teams.set(plName, 0);
                pl.teleport(teamSpawnPos[0], actor_1.DimensionId.Overworld);
            }
            else if (teamPls[1].includes(plName)) {
                teams.set(plName, 1);
                pl.teleport(teamSpawnPos[1], actor_1.DimensionId.Overworld);
            }
            else {
                const randTeam = Math.floor(Math.random() * 2);
                teams.set(plName, randTeam);
                pl.teleport(teamSpawnPos[randTeam], actor_1.DimensionId.Overworld);
            }
        }
        chooseFlagPos(leader1, leader2);
    }
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
        for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "bread", "oak_log", "arrow"]) {
            if (itemName === "oak_log")
                items.push((0, utils_1.createCItemStack)({ item: itemName, amount: 64 }));
            else if (itemName === "bread")
                items.push((0, utils_1.createCItemStack)({ item: itemName, amount: 16 }));
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
        pl.playSound("mob.enderdragon.growl", pl.getPosition(), 0.2);
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
    for (const itemName of ["stone_sword", "bow", "stone_pickaxe", "stone_axe", "stone_shovel", "bread", "oak_log", "arrow"]) {
        let item;
        if (itemName === "oak_log")
            item = ((0, utils_1.createCItemStack)({ item: itemName, amount: 64 }));
        else if (itemName === "bread")
            item = ((0, utils_1.createCItemStack)({ item: itemName, amount: 16 }));
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
    if (flagCount[0] < 3 && flagCount[1] < 3)
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
    // console.log(pl);
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
        case commands_1.Constants.flagCount:
            return (flagCount);
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