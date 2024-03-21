"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearMap = exports.clearMap2 = exports.bedwarsstart = void 0;
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
    launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement disabled");
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
            player.setArmor(0, armor[0]);
            player.setArmor(1, armor[1]);
            player.setArmor(2, armor[2]);
            player.setArmor(3, armor[3]);
        });
    });
    clearMap2();
    (0, utils_1.countdownActionbar)(5, pls, false)
        .then(() => {
        // Clear/reset map
        launcher_1.bedrockServer.executeCommand("clone 116 20 112 116 20 113 -1000 68 -968"); // blue bed
        launcher_1.bedrockServer.executeCommand("clone 115 20 111 114 20 111 -1031 68 -1000"); // yellow bed
        launcher_1.bedrockServer.executeCommand("clone 116 20 110 116 20 109 -1001 68 -1032"); // red bed
        launcher_1.bedrockServer.executeCommand("clone 117 20 111 118 20 111 -969 68 -1000"); // lime bed
        launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled");
        // /fill ~19 ~ ~-19 ~-19 ~-20 ~19 purple_wool replace air
        // /fill ~18 ~ ~-18 ~-18 ~-20 ~18 air replace purple_wool
        // /fill ~19 ~-1 ~-18 ~-19 ~-19 ~18 air replace purple_wool
        // /fill ~18 ~-1 ~-19 ~-18 ~-19 ~19 air replace purple_wool
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
async function clearMap2() {
    var _a;
    launcher_1.bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §eClearing map... §7(lag expected)");
    const air = block_1.Block.create("minecraft:air");
    const blocks = [
        block_1.Block.create("minecraft:white_wool"),
        block_1.Block.create("minecraft:oak_planks"),
        block_1.Block.create("minecraft:end_stone"),
        block_1.Block.create("minecraft:ladder")
    ];
    const fromCoordsX = -1058;
    const fromCoordsY = 30;
    const fromCoordsZ = -942;
    const toCoordsX = -942;
    const toCoordsY = 100;
    const toCoordsZ = -1058;
    // Calculate the number of blocks to fill
    const deltaX = Math.abs(toCoordsX - fromCoordsX);
    const deltaY = Math.abs(toCoordsY - fromCoordsY);
    const deltaZ = Math.abs(toCoordsZ - fromCoordsZ);
    const totalBlocks = (deltaX + 1) * (deltaY + 1) * (deltaZ + 1);
    if (totalBlocks > 1000000) {
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`Couldn't clear the map: 1 million blocks max! ${deltaX}x${deltaY}x${deltaZ} => ${totalBlocks}`, __1.LogInfo.error));
        return;
    }
    const region = (_a = launcher_1.bedrockServer.level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
    if (!region) {
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)("Couldn't clear the map: region undefined", __1.LogInfo.error));
        return;
    }
    // Fill the region with the specified block
    const sourceX = Math.min(fromCoordsX, toCoordsX), destX = Math.max(fromCoordsX, toCoordsX), sourceY = Math.min(fromCoordsY, toCoordsY), destY = Math.max(fromCoordsY, toCoordsY), sourceZ = Math.min(fromCoordsZ, toCoordsZ), destZ = Math.max(fromCoordsZ, toCoordsZ);
    let clearedBlocksCounter = 0;
    for (let x = sourceX; x <= destX; x++) {
        for (let y = sourceY; y <= destY; y++) {
            for (let z = sourceZ; z <= destZ; z++) {
                const blockPos = blockpos_1.BlockPos.create(x, y, z);
                for (const block of blocks) {
                    if (region.getBlock(blockPos).equals(block)) {
                        region.setBlock(blockPos, air);
                        clearedBlocksCounter++;
                        break;
                    }
                    ;
                }
            }
        }
    }
    launcher_1.bedrockServer.executeCommand(`title @a[tag=bedwars] actionbar §aCleared §l${clearedBlocksCounter} §r§ablocks`);
    console.log(`Cleared region from (${fromCoordsX}, ${fromCoordsY}, ${fromCoordsZ}) to (${toCoordsX}, ${toCoordsY}, ${toCoordsZ}) with ${totalBlocks} blocks.`);
}
exports.clearMap2 = clearMap2;
async function clearMap() {
    var _a;
    const pos = {
        x: -1038.5,
        y: 99,
        z: -1038.5
    };
    const offset = {
        x: 39,
        y: -21,
        z: 39
    };
    const level = launcher_1.bedrockServer.level;
    const region = (_a = level.getDimension(actor_1.DimensionId.Overworld)) === null || _a === void 0 ? void 0 : _a.getBlockSource();
    if (!region) {
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)("Couldn't clear the map: region undefined", __1.LogInfo.error));
        return;
    }
    const levelID = level.getNewUniqueID();
    const identifier = actor_1.ActorDefinitionIdentifier.constructWith("minecraft:armor_stand");
    const armorStand = actor_1.Actor.summonAt(region, blockpos_1.Vec3.create(pos.x, pos.y, pos.z), identifier, levelID);
    identifier.destruct();
    if (armorStand === null) {
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)("Couldn't clear the map: armor stand returned null", __1.LogInfo.error));
        return;
    }
    armorStand.setNameTag("clearMapArmorStand");
    armorStand.setStatusFlag(actor_1.ActorFlags.NoAI, true);
    // armorStand.addEffect(MobEffectInstance.create(MobEffectIds.Invisibility, 99999, 255, false, false));
    // for (let i=0; i<3; i++) {             /* Z AXIS */
    // for (let j=0; j<3; j++) {         /* Y AXIS */
    // for (let k=0; k<3; k++) {     /* X AXIS */
    //     const colors = ["pink", "magenta", "purple"];
    //     console.log(`posX: ${pos.x + k * offset.x}`);
    //     armorStand.teleport(Vec3.create(pos.x + k * offset.x, pos.y, pos.z));
    //     const fillResult = fill(colors[k]);
    //     if (!fillResult) {
    //         bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext("Error while clearing parts of map", LogInfo.error));
    //     }
    //     await new Promise(resolve => setTimeout(resolve, 2500));
    // }
    // }
    // }
    // function fill(color: string): boolean {
    //     console.log("fill: " +color);
    //     let results: number[] = [];
    //     // results.push(armorStand.runCommand(`fill ~19 ~ ~-19 ~-19 ~-20 ~19 ${color}_wool replace air`).result);
    //     // results.push(armorStand.runCommand(`fill ~18 ~ ~-18 ~-18 ~-20 ~18 air replace ${color}_wool`).result);
    //     // results.push(armorStand.runCommand(`fill ~19 ~-1 ~-18 ~-19 ~-19 ~18 air replace ${color}_wool`).result);
    //     // results.push(armorStand.runCommand(`fill ~18 ~-1 ~-19 ~-18 ~-19 ~19 air replace ${color}_wool`).result);
    //     results.push(armorStand.runCommand(`setblock ~~~ ${color}_wool`).result);
    //     results.push(armorStand.runCommand(`setblock ~~-1~ ${color}_wool`).result);
    //     results.push(armorStand.runCommand(`setblock ~~-2~ ${color}_wool`).result);
    //     results.push(armorStand.runCommand(`setblock ~~-3~ ${color}_wool`).result);
    //     results.forEach(result => { console.log(result); if (result !== 1) return false; });
    //     return true;
    // }
}
exports.clearMap = clearMap;
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
    })
        .catch(err => console.log(err.message));
}
function bedBreak(pl, team) {
    teams[team].bed = false;
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
    // BEDS data: red=14 ; blue=11 ; green=5 ; yellow=4
    const block = e.blockSource.getBlockEntity(e.blockPos);
    if (!block)
        return;
    if (!(e.player.hasTag("bedwars") && block.getType() === block_1.BlockActorType.Bed))
        return;
    const bedActor = block.as(BedBlockActor);
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
            return;
    }
    const pl = e.player;
    // Get player's team otherwise eliminate (just in case)
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl.getNameTag()))
        plTeam = index; });
    if (plTeam === -1) {
        eliminate(pl);
        return;
    }
    ;
    // If player breaks his own bed
    if (bed === plTeam) {
        pl.runCommand("tellraw @s " + (0, __1.rawtext)("You can't break your own bed! (u stoopid or what?)", __1.LogInfo.error));
        return common_1.CANCEL;
    }
    // Team's bed was broken
    bedBreak(pl.getNameTag(), bed);
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
};
const playerJoinLis = (e) => {
    if (!e.player.hasTag("bedwars"))
        return;
    const pl = e.player;
    const plName = pl.getNameTag();
    pl.kill();
    launcher_1.bedrockServer.executeCommand(`tellraw "${plName}" ${(0, __1.rawtext)("§7You were killed do to reconnecting.")}`);
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`${plName} §7reconnected.`));
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
    isGameEnd();
};
function startListeners() {
    event_1.events.playerRespawn.on(playerRespawnLis);
    event_1.events.blockDestroy.on(blockDestroyLis);
    event_1.events.playerAttack.on(playerAttackLis);
    event_1.events.playerJoin.on(playerJoinLis);
    event_1.events.playerLeft.on(playerLeftLis);
}
function stopListeners() {
    event_1.events.playerRespawn.remove(playerRespawnLis);
    event_1.events.blockDestroy.remove(blockDestroyLis);
    event_1.events.playerAttack.remove(playerAttackLis);
    event_1.events.playerJoin.remove(playerJoinLis);
    event_1.events.playerLeft.remove(playerLeftLis);
}
event_1.events.serverClose.on(() => {
    genObj.serverClose();
    gameIntervalObj.stop();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQTZIO0FBQzdILHdCQUF1QztBQUN2QyxnREFBcUQ7QUFDckQsc0NBQWdEO0FBRWhELHNDQUFvQztBQUNwQyx3Q0FBcUM7QUFFckMsZ0RBQW1EO0FBQ25ELDBDQUFnSTtBQUVoSSwwQ0FBZ0Y7QUFFaEYsa0RBQTREO0FBQzVELGdEQUEwQztBQUkxQyxJQUFLLFFBaUJKO0FBakJELFdBQUssUUFBUTtJQUNULHlDQUFLLENBQUE7SUFDTCwyQ0FBTSxDQUFBO0lBQ04sNkNBQU8sQ0FBQTtJQUNQLGlEQUFTLENBQUE7SUFDVCwyQ0FBTSxDQUFBO0lBQ04sdUNBQUksQ0FBQTtJQUNKLHVDQUFJLENBQUE7SUFDSix1Q0FBSSxDQUFBO0lBQ0osaURBQVMsQ0FBQTtJQUNULHVDQUFJLENBQUE7SUFDSiw0Q0FBTSxDQUFBO0lBQ04sd0NBQUksQ0FBQTtJQUNKLDBDQUFLLENBQUE7SUFDTCwwQ0FBSyxDQUFBO0lBQ0wsc0NBQUcsQ0FBQTtJQUNILDBDQUFLLENBQUE7QUFDVCxDQUFDLEVBakJJLFFBQVEsS0FBUixRQUFRLFFBaUJaO0FBR0QsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLGtCQUFVO0NBR3JDLENBQUE7QUFERztJQURDLElBQUEseUJBQVcsRUFBQyxvQkFBTyxFQUFFLElBQUksQ0FBQzs0Q0FDWjtBQUZiLGFBQWE7SUFEbEIsSUFBQSx5QkFBVyxHQUFFO0dBQ1IsYUFBYSxDQUdsQjtBQUdELHdCQUF3QjtBQUNqQixLQUFLLFVBQVUsWUFBWSxDQUFDLEtBQXlCLEVBQUUsTUFBcUIsRUFBRSxNQUFxQjs7SUFDdEcscUJBQXFCO0lBQ3JCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7UUFDekIsTUFBTSxFQUFFLENBQUM7UUFDVCxPQUFP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