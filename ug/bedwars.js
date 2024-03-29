"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bedwarsstart = void 0;
const tslib_1 = require("tslib");
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("./utils");
const _1 = require(".");
const enchants_1 = require("bdsx/bds/enchants");
const nbt_1 = require("bdsx/bds/nbt");
const event_1 = require("bdsx/event");
const common_1 = require("bdsx/common");
const blockpos_1 = require("bdsx/bds/blockpos");
const actor_1 = require("bdsx/bds/actor");
const block_1 = require("bdsx/bds/block");
const player_1 = require("bdsx/bds/player");
const nativeclass_1 = require("bdsx/nativeclass");
const nativetype_1 = require("bdsx/nativetype");
var BedColor;
(function (BedColor) {
    BedColor[BedColor["White"] = 0] = "White";
    BedColor[BedColor["Orange"] = 1] = "Orange";
    BedColor[BedColor["Magenta"] = 2] = "Magenta";
    BedColor[BedColor["LightBlue"] = 3] = "LightBlue";
    BedColor[BedColor["Yellow"] = 4] = "Yellow";
    BedColor[BedColor["Lime"] = 5] = "Lime";
    BedColor[BedColor["Pink"] = 6] = "Pink";
    BedColor[BedColor["Gray"] = 7] = "Gray";
    BedColor[BedColor["LightGray"] = 8] = "LightGray";
    BedColor[BedColor["Cyan"] = 9] = "Cyan";
    BedColor[BedColor["Purple"] = 10] = "Purple";
    BedColor[BedColor["Blue"] = 11] = "Blue";
    BedColor[BedColor["Brown"] = 12] = "Brown";
    BedColor[BedColor["Green"] = 13] = "Green";
    BedColor[BedColor["Red"] = 14] = "Red";
    BedColor[BedColor["Black"] = 15] = "Black";
})(BedColor || (BedColor = {}));
let BedBlockActor = class BedBlockActor extends block_1.BlockActor {
};
tslib_1.__decorate([
    (0, nativeclass_1.nativeField)(nativetype_1.int32_t, 0xC8)
], BedBlockActor.prototype, "color", void 0);
BedBlockActor = tslib_1.__decorate([
    (0, nativeclass_1.nativeClass)()
], BedBlockActor);
// /bedwarsstart command
async function bedwarsstart(param, origin, output) {
    var _a;
    // /bedwarsstart stop
    if (param.option === "stop") {
        stopBw();
        return;
    }
    // /bedwarsstart start
    if (launcher_1.bedrockServer.level.getActivePlayerCount() <= 1) {
        ((_a = origin.getEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()) ? origin.getEntity().runCommand("tellraw @s " + (0, __1.rawtext)("Minimum 2 players to start", __1.LogInfo.error))
            : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await (0, utils_1.startGame)(_1.Games.bedwars, launcher_1.bedrockServer.level.getPlayers(), 10);
        if (participants !== null)
            setup(participants);
    }
    catch (err) {
        launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Error while starting bedwars", __1.LogInfo.error)}`);
        console.log(err);
        return;
    }
}
exports.bedwarsstart = bedwarsstart;
const teams = [{ bed: true, pls: [] },
    { bed: true, pls: [] },
    { bed: true, pls: [] },
    { bed: true, pls: [] }];
const teamNames = ["§cRed", "§9Blue", "§2Green", "§6Yellow"];
const teamSpawns = [[-1001, 68, -1035], [-1000, 68, -965], [-966, 68, -1000], [-1034, 68, -1000]];
function setup(pls) {
    const teamColors = [-54000, 66000, 64000, -67000];
    console.log("setup() participants:\n" + pls + "\n");
    launcher_1.bedrockServer.executeCommand("tag @a remove bedwars");
    let teamCounter = 0;
    pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tag "${pl}" add bedwars`);
        // Put in team
        teams[teamCounter].pls.push(pl);
        teamCounter === 5 ? teamCounter = 0 : teamCounter++;
    });
    // TP Teams
    teams[0].pls.forEach(pl => {
        const pos = (() => { let str = ""; teamSpawns[0].forEach(coord => str += " " + coord); return str; })();
        launcher_1.bedrockServer.executeCommand(`tp "${pl}"${pos}`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}"${pos}`);
    });
    teams[1].pls.forEach(pl => {
        const pos = (() => { let str = ""; teamSpawns[1].forEach(coord => str += " " + coord); return str; })();
        launcher_1.bedrockServer.executeCommand(`tp "${pl}"${pos}`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}"${pos}`);
    });
    teams[2].pls.forEach(pl => {
        const pos = (() => { let str = ""; teamSpawns[2].forEach(coord => str += " " + coord); return str; })();
        launcher_1.bedrockServer.executeCommand(`tp "${pl}"${pos}`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}"${pos}`);
    });
    teams[3].pls.forEach(pl => {
        const pos = (() => { let str = ""; teamSpawns[3].forEach(coord => str += " " + coord); return str; })();
        launcher_1.bedrockServer.executeCommand(`tp "${pl}"${pos}`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${pl}"${pos}`);
    });
    launcher_1.bedrockServer.executeCommand("clear @a[tag=bedwars]");
    launcher_1.bedrockServer.executeCommand("effect @a[tag=bedwars] clear");
    launcher_1.bedrockServer.executeCommand("kill @e[type=item]");
    launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement disabled"); // block player movement
    teams.forEach((team, index) => {
        const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
        const armor = [];
        for (let i = 0; i < 4; i++) {
            const item = (0, utils_1.createCItemStack)({
                item: armorNames[i],
                amount: 1,
                data: 0,
                name: `§r${teamNames[index]} team`,
                enchantment: {
                    enchant: enchants_1.EnchantmentNames.Unbreaking,
                    level: 5,
                    isUnsafe: true
                }
            });
            const tag = item.save();
            const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "customColor": nbt_1.NBT.int(teamColors[index]), "minecraft:item_lock": nbt_1.NBT.byte(1), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
            item.load(nbt);
            armor.push(item);
        }
        team.pls.forEach(plName => {
            const player = (0, utils_1.getPlayerByName)(plName);
            if (!player)
                return;
            armor.forEach((armorItem, index) => {
                player.setArmor(index, armorItem);
                armorItem.destruct();
            });
        });
    });
    scoreboardUpdate();
    clearMap();
    (0, utils_1.countdownActionbar)(5, pls, false)
        .then(() => {
        // Clear/reset map
        launcher_1.bedrockServer.executeCommand("clone 116 20 112 116 20 113 -1000 68 -968"); // blue bed
        launcher_1.bedrockServer.executeCommand("clone 115 20 111 114 20 111 -1031 68 -1000"); // yellow bed
        launcher_1.bedrockServer.executeCommand("clone 116 20 110 116 20 109 -1001 68 -1032"); // red bed
        launcher_1.bedrockServer.executeCommand("clone 117 20 111 118 20 111 -969 68 -1000"); // lime bed
        launcher_1.bedrockServer.executeCommand("setblock -997 68 -969 chest [\"minecraft:cardinal_direction\"=\"south\"]"); // blue chest
        launcher_1.bedrockServer.executeCommand("setblock -1033 68 -996 chest [\"minecraft:cardinal_direction\"=\"west\"]"); // yellow chest
        launcher_1.bedrockServer.executeCommand("setblock -998 68 -1033 chest"); // red chest
        launcher_1.bedrockServer.executeCommand("setblock -970 68 -997 chest [\"minecraft:cardinal_direction\"=\"east\"]"); // lime chest
        launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled"); // let players move
        launcher_1.bedrockServer.executeCommand("gamemode s @a[tag=bedwars]");
        genObj.gen();
        gameIntervalObj.init();
        startListeners();
        return;
    })
        .catch(error => {
        launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Error while finishing to setup bedwars"), __1.LogInfo.error}`);
        console.log(error.message);
        return;
    });
}
async function clearMap() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    launcher_1.bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §eClearing map...");
    const fills = [
        "-1048 30 -945 -1001 100 -999",
        "-1048 30 -1048 -1001 100 -1000",
        "-945 30 -1048 -1000 100 -1000",
        "-945 30 -945 -1000 100 -999"
    ];
    const blocksToClear = [
        "white_wool",
        "oak_planks",
        "end_stone",
        "ladder"
    ];
    const parts = ["blue-yellow", "yellow-red", "red-green", "green-blue"];
    const results = [];
    for (let i = 0; i < fills.length; i++) {
        let fail = 0;
        for (const block of blocksToClear) {
            if (launcher_1.bedrockServer.executeCommand(`fill ${fills[i]} air replace ${block}`).result !== 1)
                fail++;
        }
        if (fail > 3) {
            results.push(i);
            launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)("Error while clearing map at quadrant " + parts[i], __1.LogInfo.error));
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (results.length > 0) {
        if (results.length < 4)
            launcher_1.bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §2Cleared map with errors");
        await new Promise(resolve => setTimeout(resolve, 2000));
        launcher_1.bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §6Retrying to clear map...");
        let newResult = true;
        for (const fill of results) {
            let fail = 0;
            for (const block of blocksToClear) {
                if (launcher_1.bedrockServer.executeCommand(`fill ${fills[fill]} air replace ${block}`).result !== 1)
                    fail++;
            }
            if (fail > 3) {
                newResult = false;
                launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)("Error while clearing map at quadrant " + parts[fill], __1.LogInfo.error));
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (newResult) {
            launcher_1.bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §aCleared map");
        }
        else {
            launcher_1.bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §cFull map clear failed. Abandon ship");
        }
        return;
    }
    launcher_1.bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §aCleared map");
}
const scoreboardTitle = "§l§bBed§3Wars";
function scoreboardUpdate() {
    let scoreContent = [];
    teams.forEach((team, index) => {
        let str = "";
        team.bed ? str += "§l§a✓ " + teamNames[index] : str += "§l§4⨉ " + teamNames[index];
        team.pls.length === 0 ? str += "§r§7: §80/4" : str += "§r§7: §f" + team.pls.length + "§7/4";
        scoreContent.push(str);
    });
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        if (pl.hasTag("bedwars")) {
            const plName = pl.getNameTag();
            let plTeam = -1;
            teams.forEach((team, index) => { if (team.pls.includes(plName))
                plTeam = index; });
            if (plTeam === -1)
                return;
            let plScoreContent = [...scoreContent];
            plScoreContent[plTeam] += " §7YOU";
            pl.setFakeScoreboard(scoreboardTitle, plScoreContent);
        }
    });
}
function scoreboardStop() {
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        if (pl.hasTag("bedwars"))
            pl.removeFakeScoreboard();
    });
}
// IRON INGOTS
// RED: -1001 68 -1038
// BLUE: -1000 68 -962
// GREEN: -963 68 -1000
// YELLOW: -1037 68 -1000
// EMERALDS
// -1001 70 -1008
// -1007 70 -1000
// -993 70 -1001
// -1000 70 -993
// 1 iron/s ; 1 diamond/10s
const genObj = {
    iron_ingot: (0, utils_1.createCItemStack)({ item: "minecraft:iron_ingot", amount: 1 }),
    emerald: (0, utils_1.createCItemStack)({ item: "minecraft:emerald", amount: 1 }),
    blockSource: 0,
    ironSpawns: [[-1001, 68, -1038], [-1000, 68, -962], [-963, 68, -1000], [-1037, 68, -1000]],
    emeraldSpawns: [[-1001, 70, -1008], [-1007, 70, -1000], [-993, 70, -1001], [-1000, 70, -993]],
    sec: 1,
    gen: function () {
        var _a;
        console.log("gen() called");
        this.blockSource = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
        if (!this.blockSource) {
            launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Couldn't get blockSource", __1.LogInfo.error)}`);
            console.log(this.blockSource);
            return;
        }
        ;
        this.interval = setInterval(() => this.intervalFunc(), 1000);
    },
    intervalFunc: function () {
        for (let i = 0; i < this.ironSpawns.length; i++) {
            const pos = blockpos_1.Vec3.create(this.ironSpawns[i][0], this.ironSpawns[i][1], this.ironSpawns[i][2]);
            const itemActor = launcher_1.bedrockServer.level.getSpawner().spawnItem(this.blockSource, this.iron_ingot, pos, 0.25);
            itemActor.teleport(pos);
        }
        if (this.sec === 10) {
            for (let i = 0; i < this.emeraldSpawns.length; i++) {
                const pos = blockpos_1.Vec3.create(this.emeraldSpawns[i][0], this.emeraldSpawns[i][1], this.emeraldSpawns[i][2]);
                const itemActor = launcher_1.bedrockServer.level.getSpawner().spawnItem(this.blockSource, this.emerald, pos, 0.25);
                itemActor.teleport(pos);
            }
            this.sec = 0;
        }
        this.sec++;
    },
    interval: 0,
    stop: function () {
        clearInterval(this.interval);
    },
    serverClose: function () {
        clearInterval(this.interval);
        this.iron_ingot.destruct();
        this.emerald.destruct();
    }
};
const gameIntervalObj = {
    init: function () {
        this.interval = setInterval(() => this.intervalFunc(), 200);
    },
    intervalFunc: function () {
        const players = launcher_1.bedrockServer.level.getPlayers();
        for (const player of players) {
            if (!player.hasTag("bedwars"))
                continue;
            if (player.getPosition().y < 0) {
                if (!player.isAlive())
                    return;
                player.die(actor_1.ActorDamageSource.create(actor_1.ActorDamageCause.Void));
            }
            const plName = player.getNameTag();
            // Replace armor
            const armorNames = ["_helmet", "_chestplate", "_leggings", "_boots"];
            if (launcher_1.bedrockServer.executeCommand(`clear "${plName}" iron_chestplate`).result === 1) {
                // bedrockServer.executeCommand(`execute as "${plName}" run function bw_iron_armor`);
                launcher_1.bedrockServer.executeCommand(`tellraw "${plName}" ${(0, __1.rawtext)("§l§d> §r§eEquipped §iIron §eArmor Set")}`);
                player.playSound("armor.equip_chain");
                const armor = [];
                for (let i = 0; i < armorNames.length; i++) {
                    const item = (0, utils_1.createCItemStack)({
                        item: "minecraft:iron" + armorNames[i],
                        amount: 1,
                        data: 0,
                        name: "§r§iIron set",
                        enchantment: {
                            enchant: enchants_1.EnchantmentNames.Unbreaking,
                            level: 5,
                            isUnsafe: true
                        }
                    });
                    const tag = item.save();
                    const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "minecraft:item_lock": nbt_1.NBT.byte(1), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
                    item.load(nbt);
                    armor.push(item);
                }
                armor.forEach((armorItem, index) => {
                    if (index !== 1)
                        player.setArmor(index, armorItem);
                    armorItem.destruct();
                });
                continue;
            }
            if (launcher_1.bedrockServer.executeCommand(`clear "${plName}" diamond_chestplate`).result === 1) {
                launcher_1.bedrockServer.executeCommand(`tellraw "${plName}" ${(0, __1.rawtext)("§l§d> §r§eEquipped §sDiamond §eArmor Set")}`);
                player.playSound("armor.equip_chain");
                const armor = [];
                for (let i = 0; i < armorNames.length; i++) {
                    const item = (0, utils_1.createCItemStack)({
                        item: "minecraft:diamond" + armorNames[i],
                        amount: 1,
                        data: 0,
                        name: "§r§sDiamond set",
                        enchantment: {
                            enchant: enchants_1.EnchantmentNames.Unbreaking,
                            level: 5,
                            isUnsafe: true
                        }
                    });
                    const tag = item.save();
                    const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "minecraft:item_lock": nbt_1.NBT.byte(1), "minecraft:keep_on_death": nbt_1.NBT.byte(1) }) }));
                    item.load(nbt);
                    armor.push(item);
                }
                armor.forEach((armorItem, index) => {
                    if (index !== 1)
                        player.setArmor(index, armorItem);
                    armorItem.destruct();
                });
                continue;
            }
        }
    },
    interval: 0,
    stop: function () {
        clearInterval(this.interval);
    }
};
function eliminate(pl) {
    const plName = pl.getNameTag();
    console.log("called eliminate() for: " + plName);
    teams.forEach((team, index) => {
        if (team.pls.includes(plName)) {
            team.pls.splice(team.pls.indexOf(plName), 1);
            if (team.pls.length === 0)
                launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`§l${teamNames[index]} team §r§7is §celiminated!`, __1.LogInfo.info));
        }
    });
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`${plName} §cwas eliminated. §l§2FINAL KILL!`));
    pl.removeTag("bedwars");
    pl.runCommand("clear");
    pl.runCommand("effect @s clear");
    (0, utils_1.spectate)(pl);
    scoreboardUpdate();
    isGameEnd();
}
function respawn(pl) {
    (0, utils_1.spectate)(pl);
    const plName = pl.getNameTag();
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(plName))
        plTeam = index; });
    if (plTeam === -1)
        return;
    (0, utils_1.countdownActionbar)(5, [plName], false, "§7Respawning...")
        .then(() => {
        (0, utils_1.spectateStop)(pl, blockpos_1.Vec3.create(teamSpawns[plTeam][0], teamSpawns[plTeam][1], teamSpawns[plTeam][2]));
        pl.setGameType(player_1.GameType.Survival);
        pl.sendJukeboxPopup("§7§oYou are immune for §r§75 §7§oseconds.");
        pl.addTag("invulnerable");
        setTimeout(() => {
            pl.removeTag("invulnerable");
            pl.sendJukeboxPopup("§7§oYou are no longer immune.");
        }, 5000);
    })
        .catch(err => console.log(err.message));
}
function bedBreak(pl, team) {
    teams[team].bed = false;
    scoreboardUpdate();
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`§l${teamNames[team]} bed §r§7was broken by §r${pl}§7!`, __1.LogInfo.info));
    launcher_1.bedrockServer.level.getPlayers().forEach(player => {
        if (!player.hasTag("bedwars"))
            return;
        player.playSound("mob.enderdragon.growl", undefined, 0.1);
    });
    let left = 0;
    teams[team].pls.forEach(pl1 => { if (!(0, utils_1.getPlayerByName)(pl1))
        left++; });
    if (left === teams[team].pls.length) {
        teams[team].pls = [];
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`§l${teamNames[team]} team §r§7is §celiminated!`, __1.LogInfo.info));
        isGameEnd();
    }
}
// Is the game done?
function isGameEnd() {
    let remainingTeams = 0;
    teams.forEach(team => {
        if (team.pls.length > 0)
            remainingTeams++;
    });
    console.log("step 1: remainingTeams = " + remainingTeams);
    if (remainingTeams > 1)
        return;
    if (remainingTeams === 0) {
        launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)("A bedwars game ended without winners (everyone left)...", __1.LogInfo.error));
        stopBw();
        return;
    }
    // Get last team remaining
    let lastTeam = -1;
    teams.forEach((team, index) => {
        if (team.pls.length > 0)
            lastTeam = index;
    });
    console.log("step 2: lastTeam = " + lastTeam);
    if (lastTeam === -1)
        return;
    // If beds remaining, it means a team has a bed but no players = still alive
    let beds = 0;
    teams.forEach((team, index) => {
        if (team.bed && index !== lastTeam)
            beds++;
    });
    console.log("step 3: beds = " + beds);
    if (beds > 0)
        return;
    // isGameEnd = TRUE
    end(lastTeam);
}
function end(w) {
    console.log("called end()");
    let winners = [];
    let winnersStr = "";
    teams[w].pls.forEach((winner, index) => {
        winners.push(winner);
        index === teams[w].pls.length - 1 ? winnersStr += winner : winnersStr += winner + ", ";
    });
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`
§7==================
        §l§aVICTORY
 ${teamNames[w]}§r§7: §f${winnersStr}
§7==================
    `));
    for (const winner of winners) {
        const pl = (0, utils_1.getPlayerByName)(winner);
        pl === null || pl === void 0 ? void 0 : pl.playSound("mob.pillager.celebrate", _1.lobbyCoords);
    }
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`§a§l${winnersStr} §r§awon a game of §2Bedwars§a!`));
    stopBw();
}
function stopBw() {
    scoreboardStop();
    genObj.stop();
    gameIntervalObj.stop();
    stopListeners();
    teams.forEach(team => {
        team.bed = true;
        team.pls = [];
    });
    (0, utils_1.stopGame)();
}
// -------------
//   LISTENERS
// -------------
const playerRespawnLis = (e) => {
    if (!e.player.hasTag("bedwars"))
        return;
    const pl = e.player;
    let isPlEliminated = false;
    teams.forEach(team => {
        if (team.pls.includes(pl.getNameTag()) && !team.bed)
            isPlEliminated = true;
    });
    // Wait for player to be properly alive -> avoid bugs
    (async () => {
        while (!pl.isAlive()) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Tick delay to avoid server load
        }
        console.log("playerRespawnLis: player alive!");
        isPlEliminated ? eliminate(pl) : respawn(pl);
    })();
};
const blockDestroyLis = (e) => {
    var _a;
    // BEDS data: red=14 ; blue=11 ; green=5 ; yellow=4
    if (!e.player.hasTag("bedwars"))
        return;
    const bl = e.blockSource.getBlock(e.blockPos).getName();
    if (bl === "minecraft:white_wool" || bl === "minecraft:oak_planks" || bl === "minecraft:end_stone" || bl === "minecraft:ladder") {
        return;
    }
    else if (((_a = e.blockSource.getBlockEntity(e.blockPos)) === null || _a === void 0 ? void 0 : _a.getType()) === block_1.BlockActorType.Bed) {
        const bedActor = e.blockSource.getBlockEntity(e.blockPos).as(BedBlockActor);
        let bed;
        // Check if bed color is of a team and give the correct team index
        switch (bedActor.color) {
            case BedColor.Red:
                bed = 0;
                break;
            case BedColor.Blue:
                bed = 1;
                break;
            case BedColor.Lime:
                bed = 2;
                break;
            case BedColor.Yellow:
                bed = 3;
                break;
            default:
                return common_1.CANCEL;
        }
        const pl = e.player;
        // Get player's team otherwise eliminate (just in case)
        let plTeam = -1;
        teams.forEach((team, index) => { if (team.pls.includes(pl.getNameTag()))
            plTeam = index; });
        if (plTeam === -1) {
            eliminate(pl);
            return common_1.CANCEL;
        }
        ;
        // If player breaks his own bed
        if (bed === plTeam) {
            pl.sendMessage("§cYou can't break your own bed! (u stoopid or what?)");
            return common_1.CANCEL;
        }
        // Team's bed was broken
        bedBreak(pl.getNameTag(), bed);
        return;
    }
    else {
        return common_1.CANCEL;
    }
};
const blockPlaceLis = (e) => {
    if (!e.player.hasTag("bedwars"))
        return;
    const bl = e.block.getName();
    if (bl === "minecraft:white_wool" || bl === "minecraft:oak_planks" || bl === "minecraft:end_stone" || bl === "minecraft:ladder") {
        const { x, y, z } = e.blockPos;
        if (x < -1048 || x > -945 || y < 30 || y > 100 || z < -1048 || z > -945) {
            e.player.sendMessage("§cOut of map bounds");
            return common_1.CANCEL;
        }
        return;
    }
    return common_1.CANCEL;
};
const playerAttackLis = (e) => {
    if (!e.player.hasTag("bedwars"))
        return;
    const pl = e.player;
    const victim = e.victim;
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl.getNameTag()))
        plTeam = index; });
    let victimTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(victim.getNameTag()))
        victimTeam = index; });
    if (plTeam === -1 || victimTeam === -1)
        return;
    // Player attacking his own team
    if (plTeam === victimTeam)
        return common_1.CANCEL;
    if (victim.hasTag("invulnerable")) {
        pl.playSound("random.anvil_land", pl.getPosition(), 0.5);
        pl.sendActionbar("§cPlayer is on cooldown");
        return common_1.CANCEL;
    }
};
const playerJoinLis = (e) => {
    if (!e.player.hasTag("bedwars"))
        return;
    const pl = e.player;
    if (pl.hasTag("spectator")) {
        const plSpawn = pl.getSpawnPosition();
        (0, utils_1.spectateStop)(pl, blockpos_1.Vec3.create(plSpawn.x, plSpawn.y, plSpawn.z));
        pl.setGameType(player_1.GameType.Survival);
        return;
    }
    (async () => {
        while (!pl.isPlayerInitialized()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
        }
        pl.die(actor_1.ActorDamageSource.create(actor_1.ActorDamageCause.Override));
        pl.sendMessage("§7You were killed do to reconnecting.");
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`${pl.getNameTag()} §7reconnected.`));
    })();
};
const playerLeftLis = (e) => {
    if (!e.player.hasTag("bedwars"))
        return;
    const plName = e.player.getNameTag();
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(plName))
        plTeam = index; });
    if (plTeam === -1)
        return;
    if (!teams[plTeam].bed)
        teams[plTeam].pls.splice(teams[plTeam].pls.indexOf(plName), 1);
    scoreboardUpdate();
    isGameEnd();
};
function startListeners() {
    event_1.events.playerRespawn.on(playerRespawnLis);
    event_1.events.blockDestroy.on(blockDestroyLis);
    event_1.events.blockPlace.on(blockPlaceLis);
    event_1.events.playerAttack.on(playerAttackLis);
    event_1.events.playerJoin.on(playerJoinLis);
    event_1.events.playerLeft.on(playerLeftLis);
}
function stopListeners() {
    event_1.events.playerRespawn.remove(playerRespawnLis);
    event_1.events.blockDestroy.remove(blockDestroyLis);
    event_1.events.blockPlace.on(blockPlaceLis);
    event_1.events.playerAttack.remove(playerAttackLis);
    event_1.events.playerJoin.remove(playerJoinLis);
    event_1.events.playerLeft.remove(playerLeftLis);
}
event_1.events.serverClose.on(() => {
    genObj.serverClose();
    gameIntervalObj.stop();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQTZIO0FBQzdILHdCQUF1QztBQUN2QyxnREFBcUQ7QUFDckQsc0NBQWdEO0FBRWhELHNDQUFvQztBQUNwQyx3Q0FBcUM7QUFFckMsZ0RBQXlDO0FBQ3pDLDBDQUFrRjtBQUVsRiwwQ0FBeUU7QUFDekUsNENBQW1EO0FBQ25ELGtEQUE0RDtBQUM1RCxnREFBMEM7QUFHMUMsSUFBSyxRQWlCSjtBQWpCRCxXQUFLLFFBQVE7SUFDVCx5Q0FBSyxDQUFBO0lBQ0wsMkNBQU0sQ0FBQTtJQUNOLDZDQUFPLENBQUE7SUFDUCxpREFBUyxDQUFBO0lBQ1QsMkNBQU0sQ0FBQTtJQUNOLHVDQUFJLENBQUE7SUFDSix1Q0FBSSxDQUFBO0lBQ0osdUNBQUksQ0FBQTtJQUNKLGlEQUFTLENBQUE7SUFDVCx1Q0FBSSxDQUFBO0lBQ0osNENBQU0sQ0FBQTtJQUNOLHdDQUFJLENBQUE7SUFDSiwwQ0FBSyxDQUFBO0lBQ0wsMENBQUssQ0FBQTtJQUNMLHNDQUFHLENBQUE7SUFDSCwwQ0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQWpCSSxRQUFRLEtBQVIsUUFBUSxRQWlCWjtBQUdELElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxrQkFBVTtDQUdyQyxDQUFBO0FBREc7SUFEQyxJQUFBLHlCQUFXLEVBQUMsb0JBQU8sRUFBRSxJQUFJLENBQUM7NENBQ1o7QUFGYixhQUFhO0lBRGxCLElBQUEseUJBQVcsR0FBRTtHQUNSLGFBQWEsQ0FHbEI7QUFHRCx3QkFBd0I7QUFDakIsS0FBSyxVQUFVLFlBQVksQ0FBQyxLQUF5QixFQUFFLE1BQXFCLEVBQUUsTUFBcUI7O0lBQ3RHLHFCQUFxQjtJQUNyQixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO1FBQ3pCLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTztLQUNWO0lBRUQsc0JBQXNCO0lBQ3RCLElBQUksd0JBQWEsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLEVBQUU7UUFDakQsQ0FBQSxNQUFBLE1BQU0sQ0FBQyxTQUFTLEVBQUUsMENBQUUsUUFBUSxFQUFFLEVBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxHQUFFLElBQUEsV0FBTyxFQUFDLDRCQUE0QixFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3hFLE9BQU87S0FDVjtJQUNELElBQUk7UUFDQSxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUEsaUJBQVMsRUFBQyxRQUFLLENBQUMsT0FBTyxFQUFFLHdCQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFGLElBQUksWUFBWSxLQUFLLElBQUk7WUFBRSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7S0FDbEQ7SUFBQyxPQUFPLEdBQUcsRUFBRTtRQUNWLHdCQUFhLENBQUMsY0FBYyxDQUFDLGNBQWMsSUFBQSxXQUFPLEVBQUMsOEJBQThCLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLE9BQU87S0FDVjtBQUNMLENBQUM7QUFyQkQsb0NBcUJDO0FBU0QsTUFBTSxLQUFLLEdBQVUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRTtJQUN0QixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRTtJQUN0QixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRTtJQUN0QixFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDN0MsTUFBTSxTQUFTLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM3RCxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUVsRyxTQUFTLEtBQUssQ0FBQyxHQUFhO0lBQ3hCLE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBRWpELE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3BELHdCQUFhLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDdEQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDYix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7UUFFeEQsY0FBYztRQUNkLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3hELENBQUMsQ0FBQyxDQUFDO0lBRUgsV0FBVztJQUNYLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3RCLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckcsd0JBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNqRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDdEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFBLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELHdCQUFhLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFDSCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUN0QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JHLHdCQUFhLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDakQsd0JBQWEsQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM3RCxDQUFDLENBQUMsQ0FBQztJQUNILEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3RCLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckcsd0JBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNqRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUMsQ0FBQyxDQUFDO0lBRUgsd0JBQWEsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUN0RCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBQzdELHdCQUFhLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDbkQsd0JBQWEsQ0FBQyxjQUFjLENBQUMsdURBQXVELENBQUMsQ0FBQyxDQUFDLHdCQUF3QjtJQUUvRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzFCLE1BQU0sVUFBVSxHQUFHLENBQUMsMEJBQTBCLEVBQUUsOEJBQThCLEVBQUUsNEJBQTRCLEVBQUUseUJBQXlCLENBQUMsQ0FBQztRQUN6SSxNQUFNLEtBQUssR0FBZ0IsRUFBRSxDQUFDO1FBQzlCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEdBQUcsSUFBQSx3QkFBZ0IsRUFBQztnQkFDMUIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sRUFBRSxDQUFDO2dCQUNULElBQUksRUFBRSxDQUFDO2dCQUNQLElBQUksRUFBRSxLQUFLLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTztnQkFDbEMsV0FBVyxFQUFFO29CQUNULE9BQU8sRUFBRSwyQkFBZ0IsQ0FBQyxVQUFVO29CQUNwQyxLQUFLLEVBQUUsQ0FBQztvQkFDUixRQUFRLEVBQUUsSUFBSTtpQkFDakI7YUFDSixDQUFDLENBQUM7WUFDSCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDeEIsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLFFBQVEsaUNBQ2pCLEdBQUcsS0FDTixHQUFHLGtDQUNJLEdBQUcsQ0FBQyxHQUFHLEtBQ1YsYUFBYSxFQUFFLFNBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQ3pDLHFCQUFxQixFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ2xDLHlCQUF5QixFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BRTdCLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNmLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDcEI7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN0QixNQUFNLE1BQU0sR0FBRyxJQUFBLHVCQUFlLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTztZQUNwQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbEMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3pCLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDLENBQUMsQ0FBQztJQUVILGdCQUFnQixFQUFFLENBQUM7SUFFbkIsUUFBUSxFQUFFLENBQUM7SUFFWCxJQUFBLDBCQUFrQixFQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDO1NBQzVCLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDUCxrQkFBa0I7UUFDbEIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDLFdBQVc7UUFDdEYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDLGFBQWE7UUFDekYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDLFVBQVU7UUFDdEYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMkNBQTJDLENBQUMsQ0FBQyxDQUFDLFdBQVc7UUFFdEYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMEVBQTBFLENBQUMsQ0FBQyxDQUFDLGFBQWE7UUFDdkgsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMEVBQTBFLENBQUMsQ0FBQyxDQUFDLGVBQWU7UUFDekgsd0JBQWEsQ0FBQyxjQUFjLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLFlBQVk7UUFDMUUsd0JBQWEsQ0FBQyxjQUFjLENBQUMseUVBQXlFLENBQUMsQ0FBQyxDQUFDLGFBQWE7UUFFdEgsd0JBQWEsQ0FBQyxjQUFjLENBQUMsc0RBQXNELENBQUMsQ0FBQyxDQUFDLG1CQUFtQjtRQUN6Ryx3QkFBYSxDQUFDLGNBQWMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNiLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN2QixjQUFjLEVBQUUsQ0FBQztRQUNqQixPQUFPO0lBQ1gsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ1gsd0JBQWEsQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFBLFdBQU8sRUFBQyx3Q0FBd0MsQ0FBQyxFQUFFLFdBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQy9HLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNCLE9BQU87SUFDWCxDQUFDLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRCxLQUFLLFVBQVUsUUFBUTtJQUNuQixNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3hELHdCQUFhLENBQUMsY0FBYyxDQUFDLG1EQUFtRCxDQUFDLENBQUM7SUFDbEYsTUFBTSxLQUFLLEdBQUc7UUFDViw4QkFBOEI7UUFDOUIsZ0NBQWdDO1FBQ2hDLCtCQUErQjtRQUMvQiw2QkFBNkI7S0FDaEMsQ0FBQztJQUNGLE1BQU0sYUFBYSxHQUFHO1FBQ2xCLFlBQVk7UUFDWixZQUFZO1FBQ1osV0FBVztRQUNYLFFBQVE7S0FDWCxDQUFBO0lBQ0QsTUFBTSxLQUFLLEdBQUcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUN2RSxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7SUFDN0IsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsS0FBSyxNQUFNLEtBQUssSUFBSSxhQUFhLEVBQUU7WUFDL0IsSUFBSSx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEtBQUssRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsSUFBSSxFQUFFLENBQUM7U0FDbEc7UUFDRCxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLHdCQUFhLENBQUMsY0FBYyxDQUFDLDBCQUEwQixHQUFHLElBQUEsV0FBTyxFQUFDLHVDQUF1QyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUN6STtRQUNELE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDMUQ7SUFDRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ3BCLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQUUsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMkRBQTJELENBQUMsQ0FBQztRQUNsSCxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3hELHdCQUFhLENBQUMsY0FBYyxDQUFDLDREQUE0RCxDQUFDLENBQUM7UUFDM0YsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLEtBQUssTUFBTSxJQUFJLElBQUksT0FBTyxFQUFFO1lBQ3hCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQztZQUNiLEtBQUssTUFBTSxLQUFLLElBQUksYUFBYSxFQUFFO2dCQUMvQixJQUFJLHdCQUFhLENBQUMsY0FBYyxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQztvQkFBRSxJQUFJLEVBQUUsQ0FBQzthQUNyRztZQUNELElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtnQkFDVixTQUFTLEdBQUcsS0FBSyxDQUFDO2dCQUNsQix3QkFBYSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsR0FBRyxJQUFBLFdBQU8sRUFBQyx1Q0FBdUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDNUk7WUFDRCxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsSUFBSSxTQUFTLEVBQUU7WUFDWCx3QkFBYSxDQUFDLGNBQWMsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1NBQ2pGO2FBQU07WUFDSCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyx1RUFBdUUsQ0FBQyxDQUFDO1NBQ3pHO1FBQ0QsT0FBTztLQUNWO0lBQ0Qsd0JBQWEsQ0FBQyxjQUFjLENBQUMsK0NBQStDLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBRUQsTUFBTSxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBRXhDLFNBQVMsZ0JBQWdCO0lBQ3JCLElBQUksWUFBWSxHQUFhLEVBQUUsQ0FBQztJQUNoQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzFCLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQzVGLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUM7SUFDSCx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDMUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMvQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQztnQkFBRSxPQUFPO1lBQzFCLElBQUksY0FBYyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztZQUN2QyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDO1lBQ25DLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDekQ7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxTQUFTLGNBQWM7SUFDbkIsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQzFDLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFBRSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUN4RCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxjQUFjO0FBQ2Qsc0JBQXNCO0FBQ3RCLHNCQUFzQjtBQUN0Qix1QkFBdUI7QUFDdkIseUJBQXlCO0FBRXpCLFdBQVc7QUFDWCxpQkFBaUI7QUFDakIsaUJBQWlCO0FBQ2pCLGdCQUFnQjtBQUNoQixnQkFBZ0I7QUFFaEIsMkJBQTJCO0FBQzNCLE1BQU0sTUFBTSxHQUFHO0lBQ1gsVUFBVSxFQUFFLElBQUEsd0JBQWdCLEVBQUMsRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3pFLE9BQU8sRUFBRSxJQUFBLHdCQUFnQixFQUFDLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUNuRSxXQUFXLEVBQUUsQ0FBdUM7SUFDcEQsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxRixhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdGLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFOztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFBLHdCQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxtQkFBVyxDQUFDLFNBQVMsQ0FBQywwQ0FBRSxjQUFjLEVBQUUsQ0FBQztRQUM3RixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNuQix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxjQUFjLElBQUEsV0FBTyxFQUFDLDBCQUEwQixFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUIsT0FBTztTQUNWO1FBQUEsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQ0QsWUFBWSxFQUFFO1FBQ1YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLE1BQU0sR0FBRyxHQUFHLGVBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RixNQUFNLFNBQVMsR0FBRyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQ3hELElBQUksQ0FBQyxXQUFZLEVBQ2pCLElBQUksQ0FBQyxVQUFVLEVBQ2YsR0FBRyxFQUNILElBQUksQ0FDUCxDQUFDO1lBQ0YsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMzQjtRQUNELElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUU7WUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoRCxNQUFNLEdBQUcsR0FBRyxlQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RHLE1BQU0sU0FBUyxHQUFHLHdCQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FDeEQsSUFBSSxDQUFDLFdBQVksRUFDakIsSUFBSSxDQUFDLE9BQU8sRUFDWixHQUFHLEVBQ0gsSUFBSSxDQUNQLENBQUM7Z0JBQ0YsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMzQjtZQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUNELFFBQVEsRUFBRSxDQUE4QjtJQUN4QyxJQUFJLEVBQUU7UUFDRixhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ2hDLENBQUM7SUFDRCxXQUFXLEVBQUU7UUFDVCxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0NBQ0osQ0FBQTtBQUNELE1BQU0sZUFBZSxHQUFHO0lBQ3BCLElBQUksRUFBRTtRQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQ0QsWUFBWSxFQUFFO1FBQ1YsTUFBTSxPQUFPLEdBQUcsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDakQsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUFFLFNBQVM7WUFDeEMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7b0JBQUUsT0FBTztnQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBaUIsQ0FBQyxNQUFNLENBQUMsd0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUMvRDtZQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNuQyxnQkFBZ0I7WUFDaEIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyRSxJQUFJLHdCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsTUFBTSxtQkFBbUIsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2hGLHFGQUFxRjtnQkFDckYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxNQUFNLEtBQUssSUFBQSxXQUFPLEVBQUMsdUNBQXVDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hHLE1BQU0sQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxLQUFLLEdBQWdCLEVBQUUsQ0FBQztnQkFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUEsd0JBQWdCLEVBQUM7d0JBQzFCLElBQUksRUFBRSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUN0QyxNQUFNLEVBQUUsQ0FBQzt3QkFDVCxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsY0FBYzt3QkFDcEIsV0FBVyxFQUFFOzRCQUNULE9BQU8sRUFBRSwyQkFBZ0IsQ0FBQyxVQUFVOzRCQUNwQyxLQUFLLEVBQUUsQ0FBQzs0QkFDUixRQUFRLEVBQUUsSUFBSTt5QkFDakI7cUJBQ0osQ0FBQyxDQUFDO29CQUNILE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDeEIsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLFFBQVEsaUNBQ2pCLEdBQUcsS0FDTixHQUFHLGtDQUNJLEdBQUcsQ0FBQyxHQUFHLEtBQ1YscUJBQXFCLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDbEMseUJBQXlCLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FFN0IsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDZixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNwQjtnQkFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUMvQixJQUFJLEtBQUssS0FBSyxDQUFDO3dCQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNuRCxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDO2dCQUNILFNBQVM7YUFDWjtZQUNELElBQUksd0JBQWEsQ0FBQyxjQUFjLENBQUMsVUFBVSxNQUFNLHNCQUFzQixDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDbkYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxNQUFNLEtBQUssSUFBQSxXQUFPLEVBQUMsMENBQTBDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzNHLE1BQU0sQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxLQUFLLEdBQWdCLEVBQUUsQ0FBQztnQkFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUEsd0JBQWdCLEVBQUM7d0JBQzFCLElBQUksRUFBRSxtQkFBbUIsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUN6QyxNQUFNLEVBQUUsQ0FBQzt3QkFDVCxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsaUJBQWlCO3dCQUN2QixXQUFXLEVBQUU7NEJBQ1QsT0FBTyxFQUFFLDJCQUFnQixDQUFDLFVBQVU7NEJBQ3BDLEtBQUssRUFBRSxDQUFDOzRCQUNSLFFBQVEsRUFBRSxJQUFJO3lCQUNqQjtxQkFDSixDQUFDLENBQUM7b0JBQ0gsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUN4QixNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsUUFBUSxpQ0FDakIsR0FBRyxLQUNOLEdBQUcsa0NBQ0ksR0FBRyxDQUFDLEdBQUcsS0FDVixxQkFBcUIsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNsQyx5QkFBeUIsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUU3QixDQUFDO29CQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNmLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3BCO2dCQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUU7b0JBQy9CLElBQUksS0FBSyxLQUFLLENBQUM7d0JBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ25ELFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsU0FBUzthQUNaO1NBQ0o7SUFDTCxDQUFDO0lBQ0QsUUFBUSxFQUFFLENBQThCO0lBQ3hDLElBQUksRUFBRTtRQUNGLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNKLENBQUE7QUFFRCxTQUFTLFNBQVMsQ0FBQyxFQUFVO0lBQ3pCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQ2pELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzVELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDckIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEdBQUcsSUFBQSxXQUFPLEVBQUMsS0FBSyxTQUFTLENBQUMsS0FBSyxDQUFDLDRCQUE0QixFQUFFLFdBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQzNJO0lBQUEsQ0FBQyxDQUFDLENBQUM7SUFFSix3QkFBYSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsR0FBRyxJQUFBLFdBQU8sRUFBQyxHQUFHLE1BQU0sb0NBQW9DLENBQUMsQ0FBQyxDQUFDO0lBQ2xILEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN2QixFQUFFLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDakMsSUFBQSxnQkFBUSxFQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2IsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQixTQUFTLEVBQUUsQ0FBQztBQUNoQixDQUFDO0FBQ0QsU0FBUyxPQUFPLENBQUMsRUFBVTtJQUN2QixJQUFBLGdCQUFRLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFFYixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDL0IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQztRQUFFLE9BQU87SUFDMUIsSUFBQSwwQkFBa0IsRUFBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsaUJBQWlCLENBQUM7U0FDcEQsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNQLElBQUEsb0JBQVksRUFBQyxFQUFFLEVBQUUsZUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQkFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQ2pFLEVBQUUsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDMUIsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLEVBQUUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDN0IsRUFBRSxDQUFDLGdCQUFnQixDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDekQsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2IsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztBQUNoRCxDQUFDO0FBQ0QsU0FBUyxRQUFRLENBQUMsRUFBVSxFQUFFLElBQVk7SUFDdEMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7SUFDeEIsZ0JBQWdCLEVBQUUsQ0FBQztJQUNuQix3QkFBYSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsR0FBRyxJQUFBLFdBQU8sRUFBQyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxFQUFFLFdBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzFJLHdCQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFBRSxPQUFPO1FBQ3RDLE1BQU0sQ0FBQyxTQUFTLENBQUMsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzlELENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBQSx1QkFBZSxFQUFDLEdBQUcsQ0FBQztRQUFFLElBQUksRUFBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsSUFBSSxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7UUFDakMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDckIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEdBQUcsSUFBQSxXQUFPLEVBQUMsS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLFdBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25JLFNBQVMsRUFBRSxDQUFDO0tBQ2Y7QUFDTCxDQUFDO0FBRUQsb0JBQW9CO0FBQ3BCLFNBQVMsU0FBUztJQUNkLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztJQUN2QixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2pCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLGNBQWMsRUFBRSxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsR0FBRyxjQUFjLENBQUMsQ0FBQztJQUMxRCxJQUFJLGNBQWMsR0FBRyxDQUFDO1FBQUUsT0FBTztJQUMvQixJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7UUFDdEIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxHQUFHLElBQUEsV0FBTyxFQUFDLHlEQUF5RCxFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hJLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTztLQUNWO0lBQ0QsMEJBQTBCO0lBQzFCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDMUIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQUUsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDLENBQUM7SUFDOUMsSUFBSSxRQUFRLEtBQUssQ0FBQyxDQUFDO1FBQUUsT0FBTztJQUU1Qiw0RUFBNEU7SUFDNUUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUMxQixJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxLQUFLLFFBQVE7WUFBRSxJQUFJLEVBQUUsQ0FBQztJQUMvQyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdEMsSUFBSSxJQUFJLEdBQUcsQ0FBQztRQUFFLE9BQU87SUFFckIsbUJBQW1CO0lBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBUyxHQUFHLENBQUMsQ0FBUztJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVCLElBQUksT0FBTyxHQUFhLEVBQUUsQ0FBQztJQUMzQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQixLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztJQUMzRixDQUFDLENBQUMsQ0FBQztJQUNILHdCQUFhLENBQUMsY0FBYyxDQUFDLDBCQUEwQixHQUFHLElBQUEsV0FBTyxFQUFDOzs7R0FHbkUsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLFVBQVU7O0tBRS9CLENBQUMsQ0FBQyxDQUFDO0lBQ0osS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7UUFDMUIsTUFBTSxFQUFFLEdBQUcsSUFBQSx1QkFBZSxFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLEVBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxTQUFTLENBQUMsd0JBQXdCLEVBQUUsY0FBVyxDQUFDLENBQUM7S0FDeEQ7SUFDRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEdBQUcsSUFBQSxXQUFPLEVBQUMsT0FBTyxVQUFVLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztJQUMxRyxNQUFNLEVBQUUsQ0FBQztBQUNiLENBQUM7QUFDRCxTQUFTLE1BQU07SUFDWCxjQUFjLEVBQUUsQ0FBQztJQUNqQixNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsYUFBYSxFQUFFLENBQUM7SUFDaEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNqQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQztJQUNILElBQUEsZ0JBQVEsR0FBRSxDQUFDO0FBQ2YsQ0FBQztBQUVELGdCQUFnQjtBQUNoQixjQUFjO0FBQ2QsZ0JBQWdCO0FBRWhCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFxQixFQUFFLEVBQUU7SUFDL0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUFFLE9BQU87SUFDeEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwQixJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7SUFDM0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNqQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFBRSxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQy9FLENBQUMsQ0FBQyxDQUFDO0lBRUgscURBQXFEO0lBQ3JELENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDUixPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0M7U0FDNUY7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7UUFDOUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ1QsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFvQixFQUFFLEVBQUU7O0lBQzdDLG1EQUFtRDtJQUNuRCxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQUUsT0FBTztJQUV4QyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDeEQsSUFBSSxFQUFFLEtBQUssc0JBQXNCLElBQUksRUFBRSxLQUFLLHNCQUFzQixJQUFJLEVBQUUsS0FBSyxxQkFBcUIsSUFBSSxFQUFFLEtBQUssa0JBQWtCLEVBQUU7UUFDN0gsT0FBTztLQUNWO1NBQ0ksSUFBSSxDQUFBLE1BQUEsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQywwQ0FBRSxPQUFPLEVBQUUsTUFBSyxzQkFBYyxDQUFDLEdBQUcsRUFBRTtRQUNqRixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzdFLElBQUksR0FBVyxDQUFDO1FBQ2hCLGtFQUFrRTtRQUNsRSxRQUFRLFFBQVEsQ0FBQyxLQUFLLEVBQUU7WUFDcEIsS0FBSyxRQUFRLENBQUMsR0FBRztnQkFDYixHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLE1BQU07WUFDbkIsS0FBSyxRQUFRLENBQUMsSUFBSTtnQkFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLE1BQU07WUFDbkIsS0FBSyxRQUFRLENBQUMsSUFBSTtnQkFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUFDLE1BQU07WUFDbkIsS0FBSyxRQUFRLENBQUMsTUFBTTtnQkFDaEIsR0FBRyxHQUFHLENBQUMsQ0FBQztnQkFBQyxNQUFNO1lBQ25CO2dCQUNJLE9BQU8sZUFBTSxDQUFDO1NBQ3JCO1FBQ0QsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNwQix1REFBdUQ7UUFDdkQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDaEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNGLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ2YsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2QsT0FBTyxlQUFNLENBQUM7U0FDakI7UUFBQSxDQUFDO1FBRUYsK0JBQStCO1FBQy9CLElBQUksR0FBRyxLQUFLLE1BQU0sRUFBRTtZQUNoQixFQUFFLENBQUMsV0FBVyxDQUFDLHNEQUFzRCxDQUFDLENBQUM7WUFDdkUsT0FBTyxlQUFNLENBQUM7U0FDakI7UUFFRCx3QkFBd0I7UUFDeEIsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMvQixPQUFPO0tBQ1Y7U0FBTTtRQUNILE9BQU8sZUFBTSxDQUFDO0tBQ2pCO0FBQ0wsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFrQixFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUFFLE9BQU87SUFDeEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixJQUFJLEVBQUUsS0FBSyxzQkFBc0IsSUFBSSxFQUFFLEtBQUssc0JBQXNCLElBQUksRUFBRSxLQUFLLHFCQUFxQixJQUFJLEVBQUUsS0FBSyxrQkFBa0IsRUFBRTtRQUM3SCxNQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBQzdCLElBQUksQ0FBQyxHQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUMsRUFBRSxJQUFJLENBQUMsR0FBQyxHQUFHLElBQUksQ0FBQyxHQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEdBQUcsRUFBRTtZQUN6RCxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sZUFBTSxDQUFDO1NBQ2pCO1FBQ0QsT0FBTztLQUNWO0lBQ0QsT0FBTyxlQUFNLENBQUM7QUFDbEIsQ0FBQyxDQUFBO0FBRUQsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFvQixFQUFFLEVBQUU7SUFDN0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUFFLE9BQU87SUFDeEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwQixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBRXhCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUFFLE1BQU0sR0FBRyxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzRixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFBRSxVQUFVLEdBQUcsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkcsSUFBSSxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQztRQUFFLE9BQU87SUFFL0MsZ0NBQWdDO0lBQ2hDLElBQUksTUFBTSxLQUFLLFVBQVU7UUFBRSxPQUFPLGVBQU0sQ0FBQztJQUV6QyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUU7UUFDL0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLENBQUMsV0FBVyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekQsRUFBRSxDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sZUFBTSxDQUFDO0tBQ2pCO0FBQ0wsQ0FBQyxDQUFBO0FBRUQsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFrQixFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUFFLE9BQU87SUFDeEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwQixJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDeEIsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDdEMsSUFBQSxvQkFBWSxFQUFDLEVBQUUsRUFBRSxlQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRCxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsT0FBTztLQUNWO0lBQ0QsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUNSLE9BQU8sQ0FBQyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsRUFBRTtZQUM5QixNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsa0NBQWtDO1NBQzlGO1FBQ0QsRUFBRSxDQUFDLEdBQUcsQ0FBQyx5QkFBaUIsQ0FBQyxNQUFNLENBQUMsd0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM1RCxFQUFFLENBQUMsV0FBVyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFDeEQsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEdBQUcsSUFBQSxXQUFPLEVBQUMsR0FBRyxFQUFFLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztJQUM1RyxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ1QsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFrQixFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUFFLE9BQU87SUFDeEMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNyQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEYsSUFBSSxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQUUsT0FBTztJQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUc7UUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN2RixnQkFBZ0IsRUFBRSxDQUFDO0lBQ25CLFNBQVMsRUFBRSxDQUFDO0FBQ2hCLENBQUMsQ0FBQTtBQUdELFNBQVMsY0FBYztJQUNuQixjQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzFDLGNBQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3hDLGNBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3BDLGNBQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3hDLGNBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3BDLGNBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFDRCxTQUFTLGFBQWE7SUFDbEIsY0FBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM5QyxjQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM1QyxjQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNwQyxjQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUM1QyxjQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN4QyxjQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBR0QsY0FBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFO0lBQ3ZCLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDM0IsQ0FBQyxDQUFDLENBQUEifQ==