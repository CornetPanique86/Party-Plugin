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
    secEmerald: 1,
    secIron: 1,
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
        if (this.secIron === 2) {
            for (let i = 0; i < this.ironSpawns.length; i++) {
                const pos = blockpos_1.Vec3.create(this.ironSpawns[i][0], this.ironSpawns[i][1], this.ironSpawns[i][2]);
                const itemActor = launcher_1.bedrockServer.level.getSpawner().spawnItem(this.blockSource, this.iron_ingot, pos, 0.25);
                itemActor.teleport(pos);
            }
            this.secIron = 0;
        }
        if (this.secEmerald === 30) {
            for (let i = 0; i < this.emeraldSpawns.length; i++) {
                const pos = blockpos_1.Vec3.create(this.emeraldSpawns[i][0], this.emeraldSpawns[i][1], this.emeraldSpawns[i][2]);
                const itemActor = launcher_1.bedrockServer.level.getSpawner().spawnItem(this.blockSource, this.emerald, pos, 0.25);
                itemActor.teleport(pos);
            }
            this.secEmerald = 0;
        }
        this.secEmerald++;
        this.secIron++;
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
        player.playSound("mob.enderdragon.growl", player.getPosition(), 0.1);
        if (teams[team].pls.includes(player.getNameTag()))
            player.sendTitle("§r", "§7>> §fBED §cDESTROYED §7<<");
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
        launcher_1.bedrockServer.executeCommand(`playanimation "${winner}" animation.player.wincelebration a`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQTZIO0FBQzdILHdCQUF1QztBQUN2QyxnREFBcUQ7QUFDckQsc0NBQWdEO0FBRWhELHNDQUFvQztBQUNwQyx3Q0FBcUM7QUFFckMsZ0RBQXlDO0FBQ3pDLDBDQUFrRjtBQUVsRiwwQ0FBeUU7QUFDekUsNENBQW1EO0FBQ25ELGtEQUE0RDtBQUM1RCxnREFBMEM7QUFHMUMsSUFBSyxRQWlCSjtBQWpCRCxXQUFLLFFBQVE7SUFDVCx5Q0FBSyxDQUFBO0lBQ0wsMkNBQU0sQ0FBQTtJQUNOLDZDQUFPLENBQUE7SUFDUCxpREFBUyxDQUFBO0lBQ1QsMkNBQU0sQ0FBQTtJQUNOLHVDQUFJLENBQUE7SUFDSix1Q0FBSSxDQUFBO0lBQ0osdUNBQUksQ0FBQTtJQUNKLGlEQUFTLENBQUE7SUFDVCx1Q0FBSSxDQUFBO0lBQ0osNENBQU0sQ0FBQTtJQUNOLHdDQUFJLENBQUE7SUFDSiwwQ0FBSyxDQUFBO0lBQ0wsMENBQUssQ0FBQTtJQUNMLHNDQUFHLENBQUE7SUFDSCwwQ0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQWpCSSxRQUFRLEtBQVIsUUFBUSxRQWlCWjtBQUdELElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxrQkFBVTtDQUdyQyxDQUFBO0FBREc7SUFEQyxJQUFBLHlCQUFXLEVBQUMsb0JBQU8sRUFBRSxJQUFJLENBQUM7NENBQ1o7QUFGYixhQUFhO0lBRGxCLElBQUEseUJBQVcsR0FBRTtHQUNSLGFBQWEsQ0FHbEI7QUFHRCx3QkFBd0I7QUFDakIsS0FBSyxVQUFVLFlBQVksQ0FBQyxLQUF5QixFQUFFLE1BQXFCLEVBQUUsTUFBcUI7O0lBQ3RHLHFCQUFxQjtJQUNyQixJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO1FBQ3pCLE1BQU0sRUFBRSxD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