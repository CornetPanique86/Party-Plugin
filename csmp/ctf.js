"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConstant = exports.startGameLeaders = exports.startGame = exports.isPreGameRunning = exports.isGameRunning = void 0;
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
exports.isPreGameRunning = false;
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
    exports.isPreGameRunning = true;
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
    exports.isPreGameRunning = true;
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
            exports.isPreGameRunning = false;
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
            launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("leaderN: " + leaderN));
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
            if (teamPls[0].includes(plName) || teamPls[1].includes(plName))
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
    if (!teams.has(pl.getNameTag()))
        return;
    const team = teams.get(pl.getNameTag());
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
        if (ticks === 20) { // BUILD LIMIT
            if (pos.y > 130 || pos.y < 50) {
                // pl.hurt(ActorDamageCause.Suffocation, 4);
                pl.sendActionbar("§cYou are outside map bounds!");
            }
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
            if (team === undefined) {
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
/*
events.entityHurt.on(e => {
    if (!isGameRunning) return CANCEL;
});
*/
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3RmLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY3RmLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHNDQUFvQztBQUNwQyw0Q0FBOEM7QUFDOUMsMEJBQXNDO0FBQ3RDLG9DQUE0QztBQUM1QyxzQ0FBZ0Q7QUFDaEQsNENBQW1EO0FBRW5ELHdDQUFxQztBQUNyQyxnREFBbUQ7QUFDbkQsMENBQXVDO0FBQ3ZDLDBDQUFrRjtBQUVsRix3Q0FBcUM7QUFFckMseUNBQXVDO0FBQ3ZDLGtEQUFnRDtBQUNoRCw4Q0FBbUU7QUFFbkUsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUVsQixRQUFBLGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDdEIsUUFBQSxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7QUFFcEMsT0FBTztBQUNQLE9BQU87QUFDUCxPQUFPO0FBRVAsd0JBQXdCO0FBQ3hCLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0FBQ3hDLE1BQU0sV0FBVyxHQUFHLElBQUksR0FBRyxFQUE0RCxDQUFDO0FBQ3hGLE1BQU0sV0FBVyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsc0NBQXNDO0FBQ3hFLE1BQU0sVUFBVSxHQUFhLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLE1BQU0sU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sU0FBUyxHQUFHLENBQUMsZUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLGVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsMkJBQTJCO0FBRXJHLFlBQVk7QUFDWixNQUFNLGlCQUFp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