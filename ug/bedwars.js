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
const effects_1 = require("bdsx/bds/effects");
const abilities_1 = require("bdsx/bds/abilities");
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
        ((_a = origin.getEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()) ? launcher_1.bedrockServer.executeCommand(`tellraw "${origin.getName()}" ${(0, __1.rawtext)("Minimum 2 players to start", __1.LogInfo.error)}`)
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
    (0, utils_1.countdownActionbar)(5, pls, false)
        .then(() => {
        // Clear/reset map
        launcher_1.bedrockServer.executeCommand("clone 116 20 112 116 20 113 -1000 68 -968"); // blue bed
        launcher_1.bedrockServer.executeCommand("clone 115 20 111 114 20 111 -1031 68 -1000"); // yellow bed
        launcher_1.bedrockServer.executeCommand("clone 116 20 110 116 20 109 -1001 68 -1032"); // red bed
        launcher_1.bedrockServer.executeCommand("clone 117 20 111 118 20 111 -969 68 -1000"); // lime bed
        launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled");
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
            launcher_1.bedrockServer.level.getSpawner().spawnItem(this.blockSource, this.iron_ingot, blockpos_1.Vec3.create(this.ironSpawns[i][0], this.ironSpawns[i][1], this.ironSpawns[i][2]), 0.25);
        }
        if (this.sec === 10) {
            for (let i = 0; i < this.emeraldSpawns.length; i++) {
                launcher_1.bedrockServer.level.getSpawner().spawnItem(this.blockSource, this.emerald, blockpos_1.Vec3.create(this.emeraldSpawns[i][0], this.emeraldSpawns[i][1], this.emeraldSpawns[i][2]), 0.25);
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
                break;
            if (player.getPosition().y < 0) {
                player.die(actor_1.ActorDamageSource.create(actor_1.ActorDamageCause.Void));
            }
            const plName = player.getNameTag();
            if (launcher_1.bedrockServer.executeCommand(`clear "${plName}" iron_chestplate`).result === 1) {
                launcher_1.bedrockServer.executeCommand(`execute as "${plName}" run function bw_iron_armor`);
                break;
            }
            if (launcher_1.bedrockServer.executeCommand(`clear "${plName}" diamond_chestplate`).result === 1) {
                launcher_1.bedrockServer.executeCommand(`execute as "${plName}" run function bw_diamond_armor`);
                break;
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
    teams.forEach((team, index) => {
        if (team.pls.includes(plName)) {
            team.pls.splice(team.pls.indexOf(plName), 1);
            if (team.pls.length === 0)
                launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`§l${teamNames[index]} team §r§7is §celiminated!`, __1.LogInfo.info));
        }
    });
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`${plName} §cwas eliminated. §l§2FINAL KILL!`));
    launcher_1.bedrockServer.executeCommand(`clear "${plName}"`);
    pl.removeTag("bedwars");
    pl.teleport(blockpos_1.Vec3.create(0, 106, 0));
    isGameEnd();
}
function respawn(pl) {
    const tpSpot = blockpos_1.Vec3.create(-1000, 115, -1000);
    pl.teleport(tpSpot);
    pl.addEffect(effects_1.MobEffectInstance.create(14 /* invis ID */, 200, 255, false, true));
    const abilities = pl.getAbilities();
    abilities.setAbility(abilities_1.AbilitiesIndex.MayFly, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.Flying, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.NoClip, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.Invulnerable, true);
    abilities.setAbility(abilities_1.AbilitiesIndex.AttackPlayers, false);
    pl.syncAbilities();
    const plName = pl.getNameTag();
    const specInterval = setInterval(() => {
        const players = launcher_1.bedrockServer.level.getPlayers();
        for (const player of players) {
            if (!player.hasTag("bedwars") || player.getNameTag() === plName)
                break;
            if (pl.distanceTo(player.getPosition()) < 8) {
                pl.teleport(tpSpot);
            }
        }
    }, 1000);
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(plName))
        plTeam = index; });
    if (plTeam === -1)
        return;
    (0, utils_1.countdownActionbar)(5, [plName], false, "§7Respawning...")
        .then(() => {
        clearInterval(specInterval);
        pl.teleport(blockpos_1.Vec3.create(teamSpawns[plTeam][0], teamSpawns[plTeam][1], teamSpawns[plTeam][2]));
        pl.removeEffect(effects_1.MobEffectIds.Invisibility);
        abilities.setAbility(abilities_1.AbilitiesIndex.Flying, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.MayFly, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.NoClip, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.Invulnerable, false);
        abilities.setAbility(abilities_1.AbilitiesIndex.AttackPlayers, true);
        pl.syncAbilities();
        // abilities.destruct();
    })
        .catch(err => console.log(err.message));
}
function bedBreak(pl, team) {
    teams[team].bed = false;
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`§l${teamNames[team]} bed §r§7was broken by §r${pl}§7!`, __1.LogInfo.info));
    launcher_1.bedrockServer.executeCommand("execute at @a[tag=bedwars] run playsound mob.enderdragon.growl ~~~ 0.5");
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
    if (lastTeam === -1)
        return;
    // If beds remaining, it means a team has a bed but no players = still alive
    let beds = 0;
    teams.forEach((team, index) => {
        if (team.bed && index !== lastTeam)
            beds++;
    });
    if (beds > 0)
        return;
    // isGameEnd = TRUE
    end(lastTeam);
}
function end(w) {
    let winners = [];
    let winnersStr = "";
    teams[w].pls.forEach((winner, index) => {
        winners.push(winner);
        index === teams[w].pls.length - 1 ? winnersStr += winner : winnersStr += winner + ", ";
    });
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + (0, __1.rawtext)(`
    §7===========\n
        §l§aVICTORY\n
    ${teamNames[w]}§r§7: §f${winnersStr}\n
    §7===========\n
    `));
    for (const winner of winners) {
        const pl = (0, utils_1.getPlayerByName)(winner);
        pl === null || pl === void 0 ? void 0 : pl.playSound("mob.pillager.celebrate");
    }
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`§a§l${winnersStr} §r§awon a game of Bedwars!`));
    stopBw();
}
function stopBw() {
    genObj.stop();
    gameIntervalObj.stop();
    stopListeners();
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
        if (team.pls.includes(pl.getNameTag()) && !team.bed) {
            isPlEliminated = true;
            eliminate(pl);
        }
    });
    if (!isPlEliminated)
        respawn(e.player);
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
        case BedColor.Green:
            bed = 2;
            break;
        case BedColor.Yellow:
            bed = 3;
            break;
        default:
            return;
    }
    const pl = e.player.getNameTag();
    // Get player's team otherwise eliminate (just in case)
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl))
        plTeam = index; });
    if (plTeam === -1) {
        eliminate(e.player);
        return;
    }
    ;
    // If player breaks his own bed
    if (bed === plTeam) {
        launcher_1.bedrockServer.executeCommand(`tellraw "${pl}" ${(0, __1.rawtext)("You can't break your own bed! (u stoopid or what?)", __1.LogInfo.error)}`);
        return common_1.CANCEL;
    }
    // Team's bed was broken
    bedBreak(pl, bed);
    return;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVkd2Fycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJlZHdhcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQXFHO0FBQ3JHLHdCQUEwQjtBQUMxQixnREFBcUQ7QUFDckQsc0NBQWdEO0FBRWhELHNDQUFvQztBQUNwQyx3Q0FBcUM7QUFFckMsZ0RBQXlDO0FBQ3pDLDBDQUFrRjtBQUVsRiwwQ0FBeUU7QUFFekUsOENBQW1FO0FBQ25FLGtEQUFvRDtBQUNwRCxrREFBNEQ7QUFDNUQsZ0RBQTBDO0FBRzFDLElBQUssUUFpQko7QUFqQkQsV0FBSyxRQUFRO0lBQ1QseUNBQUssQ0FBQTtJQUNMLDJDQUFNLENBQUE7SUFDTiw2Q0FBTyxDQUFBO0lBQ1AsaURBQVMsQ0FBQTtJQUNULDJDQUFNLENBQUE7SUFDTix1Q0FBSSxDQUFBO0lBQ0osdUNBQUksQ0FBQTtJQUNKLHVDQUFJLENBQUE7SUFDSixpREFBUyxDQUFBO0lBQ1QsdUNBQUksQ0FBQTtJQUNKLDRDQUFNLENBQUE7SUFDTix3Q0FBSSxDQUFBO0lBQ0osMENBQUssQ0FBQTtJQUNMLDBDQUFLLENBQUE7SUFDTCxzQ0FBRyxDQUFBO0lBQ0gsMENBQUssQ0FBQTtBQUNULENBQUMsRUFqQkksUUFBUSxLQUFSLFFBQVEsUUFpQlo7QUFHRCxJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFjLFNBQVEsa0JBQVU7Q0FHckMsQ0FBQTtBQURHO0lBREMsSUFBQSx5QkFBVyxFQUFDLG9CQUFPLEVBQUUsSUFBSSxDQUFDOzRDQUNaO0FBRmIsYUFBYTtJQURsQixJQUFBLHlCQUFXLEdBQUU7R0FDUixhQUFhLENBR2xCO0FBR0Qsd0JBQXdCO0FBQ2pCLEtBQUssVUFBVSxZQUFZLENBQUMsS0FBeUIsRUFBRSxNQUFxQixFQUFFLE1BQXFCOztJQUN0RyxxQkFBcUI7SUFDckIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtRQUN6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