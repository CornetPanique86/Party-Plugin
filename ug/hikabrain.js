"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hikabrainstart = void 0;
const launcher_1 = require("bdsx/launcher");
const __1 = require("..");
const utils_1 = require("./utils");
const _1 = require(".");
const abilities_1 = require("bdsx/bds/abilities");
const event_1 = require("bdsx/event");
const common_1 = require("bdsx/common");
const nbt_1 = require("bdsx/bds/nbt");
const effects_1 = require("bdsx/bds/effects");
const utils_2 = require("../utils");
async function hikabrainstart(param, origin, output) {
    var _a;
    // /hikabrainstart stop
    if (param.option === "stop") {
        stopHb();
        return;
    }
    // /hikabrainstart start
    if (launcher_1.bedrockServer.level.getActivePlayerCount() <= 1) {
        ((_a = origin.getEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()) ? origin.getEntity().runCommand("tellraw @s " + (0, __1.rawtext)("Minimum 2 players to start", __1.LogInfo.error))
            : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await (0, utils_1.startGame)(_1.Games.hikabrain, launcher_1.bedrockServer.level.getPlayers(), 10);
        if (participants !== null)
            setup(participants);
    }
    catch (err) {
        launcher_1.bedrockServer.executeCommand(`tellraw @a ${(0, __1.rawtext)("Error while starting hikabrain", __1.LogInfo.error)}`);
        console.log(err);
        return;
    }
}
exports.hikabrainstart = hikabrainstart;
// 0 = red; 1 = blue   string: playerName
const teams = new Map();
const playerStats = new Map();
const points = [0, 0];
const teamNames = ["§cRed", "§bBlue"];
const teamPos = ["-258 15 -237", "-222 15 -237"];
function setup(pls) {
    console.log("setup() participants:\n" + pls + "\n");
    launcher_1.bedrockServer.executeCommand("tag @a remove hikabrain");
    let teamCounter = 0;
    pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tag "${pl}" add hikabrain`);
        teams.set(pl, teamCounter);
        playerStats.set(pl, { kills: 0, tempKills: 0, goals: 0 });
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    });
    teams.forEach((value, key) => {
        launcher_1.bedrockServer.executeCommand(`tp "${key}" ${teamPos[value]}`);
        launcher_1.bedrockServer.executeCommand(`spawnpoint "${key}" ${teamPos[value]}`);
    });
    launcher_1.bedrockServer.executeCommand("kill @e[type=item]");
    launcher_1.bedrockServer.executeCommand("gamemode s @a[tag=hikabrain]");
    startListeners();
    gameIntervalObj.init();
    scoreboardUpdate();
    roundReset();
}
function addPoint(team, scorer) {
    if (team < 0 || team > 1)
        return;
    const scorerName = scorer.getNameTag();
    if (playerStats.has(scorerName))
        playerStats.get(scorerName).goals++;
    points[team]++;
    for (const value of playerStats.values()) { // Reset temp kills
        value.tempKills = 0;
    }
    if (points[team] === 5) {
        end(team);
    }
    else {
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + (0, __1.rawtext)(`${scorerName} §7(§a${scorer.getHealth()}§7) §ascored!`));
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + (0, __1.rawtext)(`§a§l+1 POINT §7> ${teamNames[team]} team §ris at §e§l${points[team]}§r§e/5\n`));
        launcher_1.bedrockServer.executeCommand("playsound firework.blast @a[tag=hikabrain]");
        scoreboardUpdate();
        roundReset(team, scorerName);
    }
}
function roundReset(team, scorer) {
    launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=hikabrain] movement disabled"); // block player movement
    const pls = getHikabrainPlayers();
    pls.forEach(pl => {
        pl.getAbilities().setAbility(abilities_1.AbilitiesIndex.AttackPlayers, false);
        pl.syncAbilities();
        respawn(pl);
    }); // PVP OFF
    const plsName = [...teams.keys()];
    const title = (team !== undefined) && (scorer !== undefined) ? teamNames[team].substring(0, 2) + scorer + " scored" : "§r";
    (0, utils_1.countdownActionbar)(3, plsName, false, title)
        .then(() => {
        launcher_1.bedrockServer.executeCommand("fill -222 0 -230 -258 30 -244 air replace sandstone"); // clear map
        launcher_1.bedrockServer.executeCommand("clone -213 4 -149 -212 4 -149 -222 11 -237"); // BLUE BED
        launcher_1.bedrockServer.executeCommand("clone -215 4 -149 -216 4 -149 -259 11 -237"); // RED BED
        launcher_1.bedrockServer.executeCommand("inputpermission set @a[tag=hikabrain] movement enabled");
        launcher_1.bedrockServer.executeCommand("title @a[tag=hikabrain] title §r");
        launcher_1.bedrockServer.executeCommand("title @a[tag=hikabrain] subtitle §2LET'S GO!");
        launcher_1.bedrockServer.executeCommand("playsound note.harp @a[tag=hikabrain]");
        pls.forEach(pl => {
            pl.getAbilities().setAbility(abilities_1.AbilitiesIndex.AttackPlayers, true);
            pl.syncAbilities();
        }); // PVP ON
    })
        .catch(err => {
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + (0, __1.rawtext)("Error while finishing to setup hikabrain", __1.LogInfo.error));
        console.log(err.message);
        return;
    });
}
const scoreboardTitle = "§l§bHika§3brain";
// §b §c §7
function scoreboardUpdate() {
    let ptsStr = ["§c[R] ", "§b[B] "];
    for (let pts = 0; pts < points.length; pts++) {
        for (let i = 0; i < points[pts]; i++) {
            pts === 0 ? ptsStr[pts] += "" : ptsStr[pts] += "";
        }
        for (let i = 0; i < (5 - points[pts]); i++) {
            ptsStr[pts] += "";
        }
    }
    const scoreContent = ["§r", ptsStr[0], ptsStr[1]];
    getHikabrainPlayers().forEach(pl => {
        const plName = pl.getNameTag();
        const plTeam = teams.get(plName);
        let plScoreContent = [...scoreContent];
        if (plTeam === 0 || plTeam === 1)
            plScoreContent.unshift("You are " + teamNames[plTeam]);
        const stats = playerStats.get(plName) || { kills: 0, goals: 0 };
        if (playerStats.has(plName))
            plScoreContent.push("§r ", `Kills: §a${stats.kills}`, `Goals: §a${stats.goals}`);
        pl.setFakeScoreboard(scoreboardTitle, plScoreContent);
    });
}
function scoreboardUpdatePl(pl) {
    let ptsStr = ["§c[R] ", "§1[B] "];
    for (let pts = 0; pts < points.length; pts++) {
        for (let i = 0; i < points[pts]; i++) {
            pts === 0 ? ptsStr[pts] += "" : ptsStr[pts] += "";
        }
        for (let i = 0; i < (5 - points[pts]); i++) {
            ptsStr[pts] += "";
        }
    }
    const scoreContent = ["§r", ptsStr[0], ptsStr[1]];
    const plName = pl.getNameTag();
    const plTeam = teams.get(plName);
    if (plTeam === 0 || plTeam === 1)
        scoreContent.unshift("You are " + teamNames[plTeam]);
    const stats = playerStats.get(plName) || { kills: 0, goals: 0 };
    if (playerStats.has(plName))
        scoreContent.push("§r ", `Kills: §a${stats.kills}`, `Goals: §a${stats.goals}`);
    pl.setFakeScoreboard(scoreboardTitle, scoreContent);
}
function scoreboardStop() {
    getHikabrainPlayers().forEach(pl => pl.removeFakeScoreboard());
}
function isEnoughPlayers() {
    if (getHikabrainPlayers().length < 2) {
        for (const value of teams.values()) {
            end(value);
            break;
        }
        return;
    }
    // If only players from 1 team remain
    const teamsAlive = [false, false];
    for (const value of teams.values()) {
        if (value === 0)
            teamsAlive[0] = true;
        else if (value === 1)
            teamsAlive[1] = true;
    }
    if (teamsAlive[0] && teamsAlive[1]) {
        return;
    }
    else {
        for (const value of teams.values()) {
            end(value);
            break;
        }
        return;
    }
}
function end(w) {
    console.log("called end()");
    const pls = getHikabrainPlayers();
    let winnersStr = "";
    pls.forEach(pl => {
        var _a, _b;
        const plName = pl.getNameTag();
        pl.sendMessage(`
§7------------------
§fKills §7- §a${(_a = playerStats.get(plName)) === null || _a === void 0 ? void 0 : _a.kills}
§fGoals §7- §a${(_b = playerStats.get(plName)) === null || _b === void 0 ? void 0 : _b.goals}
§7------------------`);
        if (teams.get(plName) === w) {
            pl.playSound("mob.pillager.celebrate", _1.lobbyCoords);
            launcher_1.bedrockServer.executeCommand(`playanimation "${plName}" animation.player.wincelebration a`);
            pl.sendTitle("§aYou won!");
            winnersStr += plName + ", ";
            return;
        }
        pl.sendTitle("§cYou lost!");
    });
    winnersStr = winnersStr.substring(0, winnersStr.length - 2); // remove the last ", "
    launcher_1.bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + (0, __1.rawtext)(`
§7==================
        §l§aVICTORY
 ${teamNames[w]}§r§7: §f${winnersStr}

§c${points[0]} §7- §fGoals §7- §b${points[1]}
§7==================
    `));
    launcher_1.bedrockServer.executeCommand("tellraw @a " + (0, __1.rawtext)(`§a§l${winnersStr} §r§awon a game of §2Hikabrain§a!`));
    stopHb();
}
function stopHb() {
    gameIntervalObj.stop();
    stopListeners();
    scoreboardStop();
    teams.clear();
    points[0] = 0;
    points[1] = 0;
    playerStats.clear();
    (0, utils_1.stopGame)();
}
function getHikabrainPlayers() {
    let out = [];
    launcher_1.bedrockServer.level.getPlayers().forEach(pl => {
        if (pl.hasTag("hikabrain"))
            out.push(pl);
    });
    return out;
}
// -------------
//   LISTENERS
// -------------
const gameIntervalObj = {
    init: function () {
        this.interval = setInterval(() => this.intervalFunc(), 200);
    },
    intervalFunc: function () {
        if (launcher_1.bedrockServer.isClosed()) {
            this.stop;
            return;
        }
        const players = getHikabrainPlayers();
        for (const player of players) {
            if (player.getPosition().y < 0 || player.getPosition().y > 30) {
                launcher_1.bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + (0, __1.rawtext)(`§7${player.getNameTag()} fell into the void.`));
                respawn(player);
            }
        }
    },
    interval: 0,
    stop: function () {
        clearInterval(this.interval);
    }
};
function eliminate(pl) {
    teams.delete(pl.getNameTag());
    pl.removeTag("hikabrain");
    pl.runCommand("clear");
    pl.removeAllEffects();
    pl.teleport(_1.lobbyCoords);
}
function respawn(pl) {
    const plName = pl.getNameTag();
    pl.runCommand("clear");
    pl.removeAllEffects();
    pl.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.InstantHealth, 1, 15, false, false, false));
    if (teams.get(plName) === undefined) {
        eliminate(pl);
        isEnoughPlayers();
        return;
    }
    const itemsData = [
        {
            name: "iron_helmet",
            count: 1
        },
        {
            name: "iron_chestplate",
            count: 1
        },
        {
            name: "iron_leggings",
            count: 1
        },
        {
            name: "iron_boots",
            count: 1
        },
        {
            name: "iron_sword",
            count: 1
        },
        {
            name: "iron_pickaxe",
            count: 1
        },
        {
            name: "golden_apple",
            count: 64
        },
        {
            name: "sandstone",
            count: 64
        },
        {
            name: "sandstone",
            count: 64
        }
    ];
    const items = [];
    for (let i = 0; i < itemsData.length; i++) {
        const item = (0, utils_2.createCItemStack)({
            item: itemsData[i].name,
            amount: itemsData[i].count
        });
        const tag = item.save();
        const nbt = nbt_1.NBT.allocate(Object.assign(Object.assign({}, tag), { tag: Object.assign(Object.assign({}, tag.tag), { "minecraft:item_lock": nbt_1.NBT.byte(2) }) }));
        item.load(nbt);
        items.push(item);
        if (i < 4) { // Armor items
            pl.setArmor(i, item);
        }
        else
            pl.addItem(item);
    }
    pl.getInventory().swapSlots(4, 8);
    pl.sendInventory();
    for (const item of items) {
        item.destruct();
    }
    launcher_1.bedrockServer.executeCommand(`tp "${plName}" ${teamPos[teams.get(plName)]}`);
}
const playerRespawnLis = (e) => {
    if (!e.player.hasTag("hikabrain"))
        return;
    const pl = e.player;
    (async () => {
        while (!pl.isAlive()) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Tick delay to avoid server load
        }
        respawn(pl);
    })();
};
const blockDestroyLis = (e) => {
    if (!e.player.hasTag("hikabrain"))
        return;
    const bl = e.blockSource.getBlock(e.blockPos).getName();
    if (bl === "minecraft:sandstone") {
        return;
    }
    else if (bl === "minecraft:bed") {
        const pl = e.player;
        const plTeam = teams.get(pl.getNameTag());
        if (plTeam === undefined)
            return common_1.CANCEL;
        const { x, y, z } = e.blockPos;
        if ((x === -259 && y === 11 && z === -237) ||
            (x === -258 && y === 11 && z === -237)) { // RED
            if (plTeam === 0) {
                pl.sendMessage("§cYou can't break your own bed!");
                return common_1.CANCEL;
            }
            addPoint(1, pl);
            return;
        }
        else if ((x === -221 && y === 11 && z === -237) ||
            (x === -222 && y === 11 && z === -237)) {
            if (plTeam === 1) {
                pl.sendMessage("§cYou can't break your own bed!");
                return common_1.CANCEL;
            }
            addPoint(0, pl);
            return;
        }
        else {
            return common_1.CANCEL;
        }
    }
    else {
        const pl = e.player;
        pl.runCommand("clear @s " + bl);
        return common_1.CANCEL;
    }
};
const blockPlaceLis = (e) => {
    if (!e.player.hasTag("hikabrain"))
        return;
    const bl = e.block.getName();
    if (bl !== "minecraft:sandstone") {
        e.player.runCommand("clear @s " + bl);
        return common_1.CANCEL;
    }
    else if (e.blockPos.y < 0 || e.blockPos.y > 28) {
        e.player.sendMessage("§cBuild limit reached!");
        return common_1.CANCEL;
    }
    return;
};
const playerAttackLis = (e) => {
    if (!e.player.hasTag("hikabrain"))
        return;
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
};
const entityDieLis = (e) => {
    var _a;
    if (e.entity.getIdentifier() !== "minecraft:player")
        return;
    if (!((_a = e.damageSource.getDamagingEntity()) === null || _a === void 0 ? void 0 : _a.isPlayer()))
        return;
    const attacker = e.damageSource.getDamagingEntity();
    const stats = playerStats.get(attacker.getNameTag()) || { kills: 0, tempKills: 0, goals: 0 };
    stats.kills++;
    stats.tempKills++;
    playerStats.set(attacker.getNameTag(), stats);
    scoreboardUpdatePl(attacker);
    if (stats.tempKills > 2) {
        attacker.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Strength, 5 * 20, 1));
        attacker.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Speed, 5 * 20, 1));
        attacker.addEffect(effects_1.MobEffectInstance.create(effects_1.MobEffectIds.Haste, 5 * 20, 3));
    }
};
const playerJoinLis = (e) => {
    if (!e.player.hasTag("hikabrain"))
        return;
    const pl = e.player;
    (async () => {
        while (!pl.isPlayerInitialized()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
        }
        scoreboardUpdatePl(pl);
        respawn(pl);
        launcher_1.bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + (0, __1.rawtext)(`${pl.getNameTag()} §7reconnected.`));
    })();
};
const playerLeftLis = (e) => {
    if (!e.player.hasTag("hikabrain"))
        return;
    const plName = e.player.getNameTag();
    const valueTemp = teams.get(plName);
    if (valueTemp === undefined) {
        eliminate(e.player);
        return;
    }
    teams.delete(plName);
    isEnoughPlayers();
    teams.set(plName, valueTemp);
};
function startListeners() {
    event_1.events.playerRespawn.on(playerRespawnLis);
    event_1.events.blockDestroy.on(blockDestroyLis);
    event_1.events.blockPlace.on(blockPlaceLis);
    event_1.events.playerAttack.on(playerAttackLis);
    event_1.events.entityDie.on(entityDieLis);
    event_1.events.playerJoin.on(playerJoinLis);
    event_1.events.playerLeft.on(playerLeftLis);
}
function stopListeners() {
    event_1.events.playerRespawn.remove(playerRespawnLis);
    event_1.events.blockDestroy.remove(blockDestroyLis);
    event_1.events.blockPlace.on(blockPlaceLis);
    event_1.events.playerAttack.remove(playerAttackLis);
    event_1.events.entityDie.remove(entityDieLis);
    event_1.events.playerJoin.remove(playerJoinLis);
    event_1.events.playerLeft.remove(playerLeftLis);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlrYWJyYWluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGlrYWJyYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQWtFO0FBQ2xFLHdCQUF1QztBQUV2QyxrREFBb0Q7QUFDcEQsc0NBQW9DO0FBR3BDLHdDQUFxQztBQUNyQyxzQ0FBZ0Q7QUFFaEQsOENBQW1FO0FBQ25FLG9DQUE0QztBQUVyQyxLQUFLLFVBQVUsY0FBYyxDQUFDLEtBQXlCLEVBQUUsTUFBcUIsRUFBRSxNQUFxQjs7SUFDeEcsdUJBQXVCO0lBQ3ZCLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7UUFDekIsTUFBTSxFQUFFLENBQUM7UUFDVCxPQUFPO0tBQ1Y7SUFFRCx3QkFBd0I7SUFDeEIsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsRUFBRTtRQUNqRCxDQUFBLE1BQUEsTUFBTSxDQUFDLFNBQVMsRUFBRSwwQ0FBRSxRQUFRLEVBQUUsRUFBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRyxDQUFDLFVBQVUsQ0FBQyxhQUFhLEdBQUUsSUFBQSxXQUFPLEVBQUMsNEJBQTRCLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JHLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDeEUsT0FBTztLQUNWO0lBQ0QsSUFBSTtRQUNBLE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBQSxpQkFBUyxFQUFDLFFBQUssQ0FBQyxTQUFTLEVBQUUsd0JBQWEsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUYsSUFBSSxZQUFZLEtBQUssSUFBSTtZQUFFLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNsRDtJQUFDLE9BQU8sR0FBRyxFQUFFO1FBQ1Ysd0JBQWEsQ0FB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