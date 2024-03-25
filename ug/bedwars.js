"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearMap = exports.clearMap2 = exports.clearMapFills = exports.clearMapFill = exports.bedwarsstart = void 0;
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
async function clearMapFill() {
    const before = Date.now();
    const result = launcher_1.bedrockServer.executeCommand("fill -1058 30 -942 -942 100 -1058 air replace white_wool").result;
    //  /fill -1040 30 -961 -961 100 -1041 air replace white_wool
    console.log(result);
    console.log(Date.now() - before);
}
exports.clearMapFill = clearMapFill;
async function clearMapFills() {
    const fills = [
        "-1058 30 -942 -1001 100 -999",
        "-1058 30 -1058 -1001 100 -1000",
        "-942 30 -1058 -1000 100 -1000",
        "-942 30 -942 -1000 100 -999"
    ];
    for (const fill of fills) {
        launcher_1.bedrockServer.executeCommand("fill " + fill + " air replace white_wool");
        await new Promise(resolve => setTimeout(resolve, 2500));
    }
}
exports.clearMapFills = clearMapFills;
async function clearMap2() {
    var _a;
    const before = Date.now();
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
    console.log(Date.now() - before);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQTZIO0FBQzdILHdCQUF1QztBQUN2QyxnREFBcUQ7QUFDckQsc0NBQWdEO0FBRWhELHNDQUFvQztBQUNwQyx3Q0FBcUM7QUFFckMsZ0RBQW1EO0FBQ25ELDBDQUFnSTtBQUVoSSwwQ0FBZ0Y7QUFFaEYsa0RBQTREO0FBQzVELGdEQUEwQztBQUkxQyxJQUFLLFFBaUJKO0FBakJELFdBQUssUUFBUTtJQUNULHlDQUFLLENBQUE7SUFDTCwyQ0FBTSxDQUFBO0lBQ04sNkNBQU8sQ0FBQTtJQUNQLGlEQUFTLENBQUE7SUFDVCwyQ0FBTSxDQUFBO0lBQ04sdUNBQUksQ0FBQTtJQUNKLHVDQUFJLENBQUE7SUFDSix1Q0FBSSxDQUFBO0lBQ0osaURBQVMsQ0FBQTtJQUNULHVDQUFJLENBQUE7SUFDSiw0Q0FBTSxDQUFBO0lBQ04sd0NBQUksQ0FBQTtJQUNKLDBDQUFLLENBQUE7SUFDTCwwQ0FBSyxDQUFBO0lBQ0wsc0NBQUcsQ0FBQTtJQUNILDBDQUFLLENBQUE7QUFDVCxDQUFDLEVBakJJLFFBQVEsS0FBUixRQUFRLFFBaUJaO0FBR0QsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLGtCQUFVO0NBR3JDLENBQUE7QUFERztJQURDLElBQUEseUJBQVcsRUFBQyxvQkFBTyxFQUFFLElBQUksQ0FBQzs0Q0FDWjtBQUZiLGFBQWE7SUFEbEIsSUFBQSx5QkFBVyxHQUFFO0dBQ1IsYUFBYSxDQUdsQjtBQUdELHdCQUF3QjtBQUNqQixLQUFLLFVBQVUsWUFBWSxDQUFDLEtBQXlCLEVBQUUsTUFBcUIsRUFBRSxNQUFxQjs7SUFDdEcscUJBQXFCO0lBQ3JCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7UUFDekIsTUFBTSxFQUFFLENBQUM7UUFDVCxPQUFPO0tBQ1Y7SUFFRCxzQkFBc0I7SUFDdEIsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUNqRCxDQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVMsRUFBRSwwQ0FBRSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEdBQUUsSUFBQSxXQUFPLEVBQUMsNEJBQTRCLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDeEUsT0FBTztLQUNWO0lBQ0QsSUFBSTtRQUNBLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBQSxpQkFBUyxFQUFDLFFBQUssQ0FBQyxPQUFPLEVBQUUsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDMUYsSUFBSSxZQUFZLEtBQUssSUFBSTtZQUFFLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNsRDtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1Ysd0JBQWEsQ0FBQyxjQUFjLENBQUMsY0FBYyxJQUFBLFdBQU8sRUFBQyw4QkFBOEIsRUFBRSxXQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3JHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsT0FBTztLQUNWO0FBQ0wsQ0FBQztBQXJCRCxvQ0FxQkM7QUFTRCxNQUFNLEtBQUssR0FBVSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO0lBQ3RCLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO0lBQ3RCLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO0lBQ3RCLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUM3QyxNQUFNLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFBO0FBQzVELE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBRWpHLFNBQVMsS0FBSyxDQUFDLEdBQWE7SUFDeEIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFakQsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDcEQsd0JBQWEsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUN0RCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNiLHdCQUFhLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUV4RCxjQUFjO1FBQ2QsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEMsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDeEQsQ0FBQyxDQUFDLENBQUM7SUFFSCxXQUFXO0lBQ1gsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDdEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFBLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELHdCQUFhLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFDSCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUN0QixNQUFNLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksR0FBRyxHQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ3JHLHdCQUFhLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDakQsd0JBQWEsQ0FBQyxjQUFjLENBQUMsZUFBZSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztJQUM3RCxDQUFDLENBQUMsQ0FBQztJQUNILEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3RCLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxHQUFHLEdBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDckcsd0JBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNqRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQzdELENBQUMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDdEIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEdBQUcsR0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFBLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNyRyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELHdCQUFhLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDN0QsQ0FBQyxDQUFDLENBQUM7SUFFSCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ3RELHdCQUFhLENBQUMsY0FBYyxDQUFDLDhCQUE4QixDQUFDLENBQUM7SUFDN0Qsd0JBQWEsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNuRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO0lBRXRGLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDMUIsTUFBTSxVQUFVLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSw4QkFBOEIsRUFBRSw0QkFBNEIsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3pJLE1BQU0sS0FBSyxHQUFnQixFQUFFLENBQUM7UUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QixNQUFNLElBQUksR0FBRyxJQUFBLHdCQUFnQixFQUFDO2dCQUMxQixJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxFQUFFLEtBQUssU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPO2dCQUNsQyxXQUFXLEVBQUU7b0JBQ1QsT0FBTyxFQUFFLDJCQUFnQixDQUFDLFVBQVU7b0JBQ3BDLEtBQUssRUFBRSxDQUFDO29CQUNSLFFBQVEsRUFBRSxJQUFJO2lCQUNqQjthQUNKLENBQUMsQ0FBQztZQUNILE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QixNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsUUFBUSxpQ0FDakIsR0FBRyxLQUNOLEdBQUcsa0NBQ0ksR0FBRyxDQUFDLEdBQUcsS0FDVixhQUFhLEVBQUUsU0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDekMscUJBQXFCLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDbEMseUJBQXlCLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FFN0IsQ0FBQztZQUNsQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNwQjtRQUNELElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3RCLE1BQU0sTUFBTSxHQUFHLElBQUEsdUJBQWUsRUFBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxJQUFJLENBQUMsTUFBTTtnQkFBRSxPQUFPO1lBQ3BCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQyxDQUFDLENBQUM7SUFFSCxTQUFTLEVBQUUsQ0FBQztJQUVaLElBQUEsMEJBQWtCLEVBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUM7U0FDNUIsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNQLGtCQUFrQjtRQUNsQix3QkFBYSxDQUFDLGNBQWMsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLENBQUMsV0FBVztRQUN0Rix3QkFBYSxDQUFDLGNBQWMsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUMsYUFBYTtRQUN6Rix3QkFBYSxDQUFDLGNBQWMsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUMsVUFBVTtRQUN0Rix3QkFBYSxDQUFDLGNBQWMsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLENBQUMsV0FBVztRQUN0Rix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1FBRXJGLHlEQUF5RDtRQUN6RCx5REFBeUQ7UUFDekQsMkRBQTJEO1FBQzNELDJEQUEyRDtRQUMzRCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDYixlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsY0FBYyxFQUFFLENBQUM7UUFDakIsT0FBTztJQUNYLENBQUMsQ0FBQztTQUNELEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNYLHdCQUFhLENBQUMsY0FBYyxDQUFDLGNBQWMsSUFBQSxXQUFPLEVBQUMsd0NBQXdDLENBQUMsRUFBRSxXQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMvRyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzQixPQUFPO0lBQ1gsQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRU0sS0FBSyxVQUFVLFlBQVk7SUFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzFCLE1BQU0sTUFBTSxHQUFHLHdCQUFhLENBQUMsY0FBYyxDQUFDLDBEQUEwRCxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQy9HLDZEQUE2RDtJQUM3RCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDO0FBQ3JDLENBQUM7QUFORCxvQ0FNQztBQUNNLEtBQUssVUFBVSxhQUFhO0lBQy9CLE1BQU0sS0FBSyxHQUFHO1FBQ1YsOEJBQThCO1FBQzlCLGdDQUFnQztRQUNoQywrQkFBK0I7UUFDL0IsNkJBQTZCO0tBQ2hDLENBQUE7SUFDRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN0Qix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEdBQUUsSUFBSSxHQUFFLHlCQUF5QixDQUFDLENBQUM7UUFDdkUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUMzRDtBQUNMLENBQUM7QUFYRCxzQ0FXQztBQUVNLEtBQUssVUFBVSxTQUFTOztJQUMzQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDMUIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsb0VBQW9FLENBQUMsQ0FBQztJQUNuRyxNQUFNLEdBQUcsR0FBRyxhQUFLLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBRSxDQUFDO0lBQzNDLE1BQU0sTUFBTSxHQUFHO1FBQ1gsYUFBSyxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBRTtRQUNyQyxhQUFLLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFFO1FBQ3JDLGFBQUssQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUU7UUFDcEMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBRTtLQUNwQyxDQUFDO0lBQ0YsTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUM7SUFDMUIsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLE1BQU0sV0FBVyxHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ3pCLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxDQUFDO0lBQ3ZCLE1BQU0sU0FBUyxHQUFHLEdBQUcsQ0FBQztJQUN0QixNQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQztJQUV4Qix5Q0FBeUM7SUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFDakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFDakQsTUFBTSxXQUFXLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFL0QsSUFBSSxXQUFXLEdBQUcsT0FBTyxFQUFFO1FBQ3ZCLHdCQUFhLENBQUMsY0FBYyxDQUFDLDBCQUEwQixHQUFHLElBQUEsV0FBTyxFQUFDLGlEQUFpRCxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sT0FBTyxXQUFXLEVBQUUsRUFBRSxXQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNuTCxPQUFPO0tBQ1Y7SUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFBLHdCQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxtQkFBVyxDQUFDLFNBQVMsQ0FBQywwQ0FBRSxjQUFjLEVBQUUsQ0FBQztJQUN6RixJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1Qsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEdBQUcsSUFBQSxXQUFPLEVBQUMsMENBQTBDLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUgsT0FBTztLQUNWO0lBRUQsMkNBQTJDO0lBQzNDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUMxQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQ3hDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsRUFDMUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUN4QyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQzFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUMvQyxJQUFJLG9CQUFvQixHQUFHLENBQUMsQ0FBQztJQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsT0FBTyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDbkMsTUFBTSxRQUFRLEdBQUcsbUJBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDMUMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7b0JBQ3hCLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7d0JBQ3pDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUMvQixvQkFBb0IsRUFBRSxDQUFDO3dCQUN2QixNQUFNO3FCQUNUO29CQUFBLENBQUM7aUJBQ0w7YUFDSjtTQUNKO0tBQ0o7SUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUNqQyx3QkFBYSxDQUFDLGNBQWMsQ0FBQywrQ0FBK0Msb0JBQW9CLGFBQWEsQ0FBQyxDQUFDO0lBRS9HLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLFdBQVcsS0FBSyxXQUFXLEtBQUssV0FBVyxTQUFTLFNBQVMsS0FBSyxTQUFTLEtBQUssU0FBUyxVQUFVLFdBQVcsVUFBVSxDQUFDLENBQUM7QUFDbEssQ0FBQztBQTVERCw4QkE0REM7QUFFTSxLQUFLLFVBQVUsUUFBUTs7SUFDMUIsTUFBTSxHQUFHLEdBQUc7UUFDUixDQUFDLEVBQUUsQ0FBQyxNQUFNO1FBQ1YsQ0FBQyxFQUFFLEVBQUU7UUFDTCxDQUFDLEVBQUUsQ0FBQyxNQUFNO0tBQ2IsQ0FBQTtJQUNELE1BQU0sTUFBTSxHQUFHO1FBQ1gsQ0FBQyxFQUFFLEVBQUU7UUFDTCxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ04sQ0FBQyxFQUFFLEVBQUU7S0FDUixDQUFBO0lBRUQsTUFBTSxLQUFLLEdBQUcsd0JBQWEsQ0FBQyxLQUFLLENBQUM7SUFDbEMsTUFBTSxNQUFNLEdBQUcsTUFBQSxLQUFLLENBQUMsWUFBWSxDQUFDLG1CQUFXLENBQUMsU0FBUyxDQUFDLDBDQUFFLGNBQWMsRUFBRSxDQUFDO0lBQzNFLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCx3QkFBYSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsR0FBRyxJQUFBLFdBQU8sRUFBQywwQ0FBMEMsRUFBRSxXQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM5SCxPQUFPO0tBQ1Y7SUFDRCxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdkMsTUFBTSxVQUFVLEdBQUcsaUNBQXlCLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUM7SUFDcEYsTUFBTSxVQUFVLEdBQUcsYUFBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsZUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqRyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDdEIsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO1FBQ3JCLHdCQUFhLENBQUMsY0FBYyxDQUFDLDBCQUEwQixHQUFHLElBQUEsV0FBTyxFQUFDLG1EQUFtRCxFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3ZJLE9BQU87S0FDVjtJQUNELFVBQVUsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUM1QyxVQUFVLENBQUMsYUFBYSxDQUFDLGtCQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2hELHVHQUF1RztJQUV2RyxxREFBcUQ7SUFDakQsaURBQWlEO0lBQzdDLDZDQUE2QztJQUM3QyxvREFBb0Q7SUFDcEQsb0RBQW9EO0lBQ3BELDRFQUE0RTtJQUM1RSwwQ0FBMEM7SUFDMUMseUJBQXlCO0lBQ3pCLGtJQUFrSTtJQUNsSSxRQUFRO0lBQ1IsK0RBQStEO0lBQy9ELElBQUk7SUFDUixJQUFJO0lBQ1IsSUFBSTtJQUdKLDBDQUEwQztJQUMxQyxvQ0FBb0M7SUFDcEMsa0NBQWtDO0lBQ2xDLGdIQUFnSDtJQUNoSCxnSEFBZ0g7SUFDaEgsa0hBQWtIO0lBQ2xILGtIQUFrSDtJQUNsSCxnRkFBZ0Y7SUFDaEYsa0ZBQWtGO0lBQ2xGLGtGQUFrRjtJQUNsRixrRkFBa0Y7SUFDbEYsMkZBQTJGO0lBQzNGLG1CQUFtQjtJQUNuQixJQUFJO0FBQ1IsQ0FBQztBQTVERCw0QkE0REM7QUFFRCxjQUFjO0FBQ2Qsc0JBQXNCO0FBQ3RCLHNCQUFzQjtBQUN0Qix1QkFBdUI7QUFDdkIseUJBQXlCO0FBRXpCLFdBQVc7QUFDWCxpQkFBaUI7QUFDakIsaUJBQWlCO0FBQ2pCLGdCQUFnQjtBQUNoQixnQkFBZ0I7QUFFaEIsMkJBQTJCO0FBRzNCLE1BQU0sTUFBTSxHQUFHO0lBQ1gsVUFBVSxFQUFFLElBQUEsd0JBQWdCLEVBQUMsRUFBRSxJQUFJLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3pFLE9BQU8sRUFBRSxJQUFBLHdCQUFnQixFQUFDLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztJQUNuRSxXQUFXLEVBQUUsQ0FBdUM7SUFDcEQsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxRixhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdGLEdBQUcsRUFBRSxDQUFDO0lBQ04sR0FBRyxFQUFFOztRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFBLHdCQUFhLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxtQkFBVyxDQUFDLFNBQVMsQ0FBQywwQ0FBRSxjQUFjLEVBQUUsQ0FBQztRQUM3RixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNuQix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxjQUFjLElBQUEsV0FBTyxFQUFDLDBCQUEwQixFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUIsT0FBTztTQUNWO1FBQUEsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBQ0QsWUFBWSxFQUFFO1FBQ1YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLE1BQU0sR0FBRyxHQUFHLGVBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3RixNQUFNLFNBQVMsR0FBRyx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQ3hELElBQUksQ0FBQyxXQUFZLEVBQ2pCLElBQUksQ0FBQyxVQUFVLEVBQ2YsR0FBRyxFQUNILElBQUksQ0FDUCxDQUFDO1lBQ0YsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUMzQjtRQUNELElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUU7WUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoRCxNQUFNLEdBQUcsR0FBRyxlQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RHLE1BQU0sU0FBUyxHQUFHLHdCQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FDeEQsSUFBSSxDQUFDLFdBQVksRUFDakIsSUFBSSxDQUFDLE9BQU8sRUFDWixHQUFHLEVBQ0gsSUFBSSxDQUNQLENBQUM7Z0JBQ0YsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMzQjtZQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2YsQ0FBQztJQUNELFFBQVEsRUFBRSxDQUE4QjtJQUN4QyxJQUFJLEVBQUU7UUFDRixhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ2hDLENBQUM7SUFDRCxXQUFXLEVBQUU7UUFDVCxhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1QixDQUFDO0NBQ0osQ0FBQTtBQUNELE1BQU0sZUFBZSxHQUFHO0lBQ3BCLElBQUksRUFBRTtRQUNGLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBQ0QsWUFBWSxFQUFFO1FBQ1YsTUFBTSxPQUFPLEdBQUcsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDakQsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUFFLFNBQVM7WUFDeEMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7b0JBQUUsT0FBTztnQkFDOUIsTUFBTSxDQUFDLEdBQUcsQ0FBQyx5QkFBaUIsQ0FBQyxNQUFNLENBQUMsd0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUMvRDtZQUNELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNuQyxnQkFBZ0I7WUFDaEIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyRSxJQUFJLHdCQUFhLENBQUMsY0FBYyxDQUFDLFVBQVUsTUFBTSxtQkFBbUIsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2hGLHFGQUFxRjtnQkFDckYsd0JBQWEsQ0FBQyxjQUFjLENBQUMsWUFBWSxNQUFNLEtBQUssSUFBQSxXQUFPLEVBQUMsdUNBQXVDLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hHLE1BQU0sQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsQ0FBQztnQkFDdEMsTUFBTSxLQUFLLEdBQWdCLEVBQUUsQ0FBQztnQkFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ3hDLE1BQU0sSUFBSSxHQUFHLElBQUEsd0JBQWdCLEVBQUM7d0JBQzFCLElBQUksRUFBRSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDO3dCQUN0QyxNQUFNLEVBQUUsQ0FBQzt3QkFDVCxJQUFJLEVBQUUsQ0FBQzt3QkFDUCxJQUFJLEVBQUUsY0FBYzt3QkFDcEIsV0FBVyxFQUFFOzRCQUNULE9BQU8sRUFBRSwyQkFBZ0IsQ0FBQyxVQUFVOzRCQUNwQyxLQUFLLEVBQUUsQ0FBQzs0QkFDUixRQUFRLEVBQUUsSUFBSTt5QkFDakI7cUJBQ0osQ0FBQyxDQUFDO29CQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3BCO2dCQUNELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUU7b0JBQy9CLElBQUksS0FBSyxLQUFLLENBQUM7d0JBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ25ELFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsU0FBUzthQUNaO1lBQ0QsSUFBSSx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxVQUFVLE1BQU0sc0JBQXNCLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNuRix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxZQUFZLE1BQU0sS0FBSyxJQUFBLFdBQU8sRUFBQywwQ0FBMEMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0csTUFBTSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUN0QyxNQUFNLEtBQUssR0FBZ0IsRUFBRSxDQUFDO2dCQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDeEMsTUFBTSxJQUFJLEdBQUcsSUFBQSx3QkFBZ0IsRUFBQzt3QkFDMUIsSUFBSSxFQUFFLG1CQUFtQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7d0JBQ3pDLE1BQU0sRUFBRSxDQUFDO3dCQUNULElBQUksRUFBRSxDQUFDO3dCQUNQLElBQUksRUFBRSxpQkFBaUI7d0JBQ3ZCLFdBQVcsRUFBRTs0QkFDVCxPQUFPLEVBQUUsMkJBQWdCLENBQUMsVUFBVTs0QkFDcEMsS0FBSyxFQUFFLENBQUM7NEJBQ1IsUUFBUSxFQUFFLElBQUk7eUJBQ2pCO3FCQUNKLENBQUMsQ0FBQztvQkFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNwQjtnQkFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUMvQixJQUFJLEtBQUssS0FBSyxDQUFDO3dCQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNuRCxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3pCLENBQUMsQ0FBQyxDQUFDO2dCQUNILFNBQVM7YUFDWjtTQUNKO0lBQ0wsQ0FBQztJQUNELFFBQVEsRUFBRSxDQUE4QjtJQUN4QyxJQUFJLEVBQUU7UUFDRixhQUFhLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7Q0FDSixDQUFBO0FBRUQsU0FBUyxTQUFTLENBQUMsRUFBVTtJQUN6QixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsR0FBRyxNQUFNLENBQUMsQ0FBQztJQUNqRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUM1RCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQ3JCLHdCQUFhLENBQUMsY0FBYyxDQUFDLDBCQUEwQixHQUFHLElBQUEsV0FBTyxFQUFDLEtBQUssU0FBUyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxXQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMzSTtJQUFBLENBQUMsQ0FBQyxDQUFDO0lBRUosd0JBQWEsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEdBQUcsSUFBQSxXQUFPLEVBQUMsR0FBRyxNQUFNLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztJQUNsSCxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hCLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2pDLElBQUEsZ0JBQVEsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUNiLFNBQVMsRUFBRSxDQUFDO0FBQ2hCLENBQUM7QUFDRCxTQUFTLE9BQU8sQ0FBQyxFQUFVO0lBQ3ZCLElBQUEsZ0JBQVEsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUViLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMvQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEYsSUFBSSxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQUUsT0FBTztJQUMxQixJQUFBLDBCQUFrQixFQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsQ0FBQztTQUNwRCxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ1AsSUFBQSxvQkFBWSxFQUFDLEVBQUUsRUFBRSxlQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN2RyxDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQ2hELENBQUM7QUFDRCxTQUFTLFFBQVEsQ0FBQyxFQUFVLEVBQUUsSUFBWTtJQUN0QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztJQUN4Qix3QkFBYSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsR0FBRyxJQUFBLFdBQU8sRUFBQyxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxFQUFFLFdBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzFJLHdCQUFhLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFBRSxPQUFPO1FBQ3RDLE1BQU0sQ0FBQyxTQUFTLENBQUMsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzlELENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBQSx1QkFBZSxFQUFDLEdBQUcsQ0FBQztRQUFFLElBQUksRUFBRSxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEUsSUFBSSxJQUFJLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7UUFDakMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDckIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsMEJBQTBCLEdBQUcsSUFBQSxXQUFPLEVBQUMsS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLFdBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25JLFNBQVMsRUFBRSxDQUFDO0tBQ2Y7QUFDTCxDQUFDO0FBRUQsb0JBQW9CO0FBQ3BCLFNBQVMsU0FBUztJQUNkLElBQUksY0FBYyxHQUFHLENBQUMsQ0FBQztJQUN2QixLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2pCLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQztZQUFFLGNBQWMsRUFBRSxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsR0FBRyxjQUFjLENBQUMsQ0FBQztJQUMxRCxJQUFJLGNBQWMsR0FBRyxDQUFDO1FBQUUsT0FBTztJQUMvQixJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7UUFDdEIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxHQUFHLElBQUEsV0FBTyxFQUFDLHlEQUF5RCxFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2hJLE1BQU0sRUFBRSxDQUFDO1FBQ1QsT0FBTztLQUNWO0lBQ0QsMEJBQTBCO0lBQzFCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDMUIsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQUUsUUFBUSxHQUFHLEtBQUssQ0FBQztJQUM5QyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsUUFBUSxDQUFDLENBQUM7SUFDOUMsSUFBSSxRQUFRLEtBQUssQ0FBQyxDQUFDO1FBQUUsT0FBTztJQUU1Qiw0RUFBNEU7SUFDNUUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUMxQixJQUFJLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxLQUFLLFFBQVE7WUFBRSxJQUFJLEVBQUUsQ0FBQztJQUMvQyxDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDdEMsSUFBSSxJQUFJLEdBQUcsQ0FBQztRQUFFLE9BQU87SUFFckIsbUJBQW1CO0lBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBRUQsU0FBUyxHQUFHLENBQUMsQ0FBUztJQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVCLElBQUksT0FBTyxHQUFhLEVBQUUsQ0FBQztJQUMzQixJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDbkMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQixLQUFLLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztJQUMzRixDQUFDLENBQUMsQ0FBQztJQUNILHdCQUFhLENBQUMsY0FBYyxDQUFDLDBCQUEwQixHQUFHLElBQUEsV0FBTyxFQUFDOzs7R0FHbkUsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLFVBQVU7O0tBRS9CLENBQUMsQ0FBQyxDQUFDO0lBQ0osS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7UUFDMUIsTUFBTSxFQUFFLEdBQUcsSUFBQSx1QkFBZSxFQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLEVBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxTQUFTLENBQUMsd0JBQXdCLEVBQUUsY0FBVyxDQUFDLENBQUM7S0FDeEQ7SUFDRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxhQUFhLEdBQUcsSUFBQSxXQUFPLEVBQUMsT0FBTyxVQUFVLGlDQUFpQyxDQUFDLENBQUMsQ0FBQztJQUMxRyxNQUFNLEVBQUUsQ0FBQztBQUNiLENBQUM7QUFDRCxTQUFTLE1BQU07SUFDWCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsYUFBYSxFQUFFLENBQUM7SUFDaEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNqQixJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztRQUNoQixJQUFJLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQztJQUNILElBQUEsZ0JBQVEsR0FBRSxDQUFDO0FBQ2YsQ0FBQztBQUVELGdCQUFnQjtBQUNoQixjQUFjO0FBQ2QsZ0JBQWdCO0FBRWhCLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxDQUFxQixFQUFFLEVBQUU7SUFDL0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUFFLE9BQU87SUFDeEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwQixJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7SUFDM0IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNqQixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUc7WUFBRSxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQy9FLENBQUMsQ0FBQyxDQUFDO0lBRUgscURBQXFEO0lBQ3JELENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDUixPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0M7U0FDNUY7UUFDRCxPQUFPLENBQUMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7UUFDOUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ1QsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFvQixFQUFFLEVBQUU7SUFDN0MsbURBQW1EO0lBQ25ELE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsS0FBSztRQUFFLE9BQU87SUFDbkIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLHNCQUFjLENBQUMsR0FBRyxDQUFDO1FBQUUsT0FBTztJQUVwRixNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3pDLElBQUksR0FBVyxDQUFDO0lBQ2hCLGtFQUFrRTtJQUNsRSxRQUFRLFFBQVEsQ0FBQyxLQUFLLEVBQUU7UUFDcEIsS0FBSyxRQUFRLENBQUMsR0FBRztZQUNiLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFBQyxNQUFNO1FBQ25CLEtBQUssUUFBUSxDQUFDLElBQUk7WUFDZCxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQUMsTUFBTTtRQUNuQixLQUFLLFFBQVEsQ0FBQyxJQUFJO1lBQ2QsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUFDLE1BQU07UUFDbkIsS0FBSyxRQUFRLENBQUMsTUFBTTtZQUNoQixHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQUMsTUFBTTtRQUNuQjtZQUNJLE9BQU87S0FDZDtJQUNELE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDcEIsdURBQXVEO0lBQ3ZELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUFFLE1BQU0sR0FBRyxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzRixJQUFJLE1BQU0sS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNmLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNkLE9BQU87S0FDVjtJQUFBLENBQUM7SUFFRiwrQkFBK0I7SUFDL0IsSUFBSSxHQUFHLEtBQUssTUFBTSxFQUFFO1FBQ2hCLEVBQUUsQ0FBQyxVQUFVLENBQUMsYUFBYSxHQUFFLElBQUEsV0FBTyxFQUFDLG9EQUFvRCxFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzNHLE9BQU8sZUFBTSxDQUFDO0tBQ2pCO0lBRUQsd0JBQXdCO0lBQ3hCLFFBQVEsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDbkMsQ0FBQyxDQUFBO0FBRUQsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFvQixFQUFFLEVBQUU7SUFDN0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUFFLE9BQU87SUFDeEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNwQixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBRXhCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hCLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUFFLE1BQU0sR0FBRyxLQUFLLENBQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzRixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFBRSxVQUFVLEdBQUcsS0FBSyxDQUFBLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkcsSUFBSSxNQUFNLEtBQUssQ0FBQyxDQUFDLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQztRQUFFLE9BQU87SUFFL0MsZ0NBQWdDO0lBQ2hDLElBQUksTUFBTSxLQUFLLFVBQVU7UUFBRSxPQUFPLGVBQU0sQ0FBQztBQUM3QyxDQUFDLENBQUE7QUFFRCxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQWtCLEVBQUUsRUFBRTtJQUN6QyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQUUsT0FBTztJQUN4QyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3BCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUMvQixFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDVix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxZQUFZLE1BQU0sS0FBSyxJQUFBLFdBQU8sRUFBQyx1Q0FBdUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN4Ryx3QkFBYSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsR0FBRyxJQUFBLFdBQU8sRUFBQyxHQUFHLE1BQU0saUJBQWlCLENBQUMsQ0FBQyxDQUFDO0FBQ25HLENBQUMsQ0FBQTtBQUNELE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBa0IsRUFBRSxFQUFFO0lBQ3pDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFBRSxPQUFPO0lBQ3hDLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDckMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xGLElBQUksTUFBTSxLQUFLLENBQUMsQ0FBQztRQUFFLE9BQU87SUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHO1FBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDdkYsU0FBUyxFQUFFLENBQUM7QUFDaEIsQ0FBQyxDQUFBO0FBR0QsU0FBUyxjQUFjO0lBQ25CLGNBQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDMUMsY0FBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEMsY0FBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEMsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEMsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUNELFNBQVMsYUFBYTtJQUNsQixjQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzlDLGNBQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLGNBQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLGNBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hDLGNBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFHRCxjQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDdkIsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUMzQixDQUFDLENBQUMsQ0FBQSJ9