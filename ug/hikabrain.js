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
const teamNames = ["§cRed", "§1Blue"];
const teamPos = ["-258 15 -237", "-222 15 -237"];
function setup(pls) {
    console.log("setup() participants:\n" + pls + "\n");
    launcher_1.bedrockServer.executeCommand("tag @a remove hikabrain");
    let teamCounter = 0;
    pls.forEach(pl => {
        launcher_1.bedrockServer.executeCommand(`tag "${pl}" add hikabrain`);
        teams.set(pl, teamCounter);
        playerStats.set(pl, { kills: 0, goals: 0 });
        teamCounter === 2 ? teamCounter = 0 : teamCounter++;
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
    let ptsStr = ["§c[R] ", "§1[B] "];
    for (let pts = 0; pts < points.length; pts++) {
        for (let i = 0; i < points[pts]; i++) {
            pts === 0 ? ptsStr[pts] += "" : ptsStr[pts] += "";
        }
        for (let i = 0; i < (5 - points[pts]); i++) {
            ptsStr[pts] += "";
        }
    }
    const scoreContent = ["", ptsStr[0], ptsStr[1]];
    getHikabrainPlayers().forEach(pl => {
        const plName = pl.getNameTag();
        const plTeam = teams.get(plName);
        let plScoreContent = [...scoreContent];
        if (plTeam === 0 || plTeam === 1)
            plScoreContent.unshift("You are " + teamNames[plTeam]);
        const stats = playerStats.get(plName) || { kills: 0, goals: 0 };
        if (playerStats.has(plName))
            plScoreContent.push("", `Kills: §a${stats.kills}`, "Goals", "");
        // if (playerStats.has(plName)) plScoreContent.push("", `Kills: §a${playerStats.get(plName)!.kills}`, `Goals: §a${playerStats.get(plName)!.goals}`);
        console.log(playerStats.get(plName));
        console.log(plScoreContent);
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
    const scoreContent = ["", ptsStr[0], ptsStr[1]];
    const plName = pl.getNameTag();
    const plTeam = teams.get(plName);
    if (plTeam === 0 || plTeam === 1)
        scoreContent.unshift("You are " + teamNames[plTeam]);
    const stats = playerStats.get(plName) || { kills: 0, goals: 0 };
    if (playerStats.has(plName))
        scoreContent.push("", `Kills: §a${stats.kills}`, `Goals: §a:(`);
    // if (playerStats.has(plName)) plScoreContent.push("", `Kills: §a${playerStats.get(plName)!.kills}`, `Goals: §a${playerStats.get(plName)!.goals}`);
    console.log(playerStats.get(plName));
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
        const players = getHikabrainPlayers();
        for (const player of players) {
            if (player.getPosition().y < 0 || player.getPosition().y > 30) {
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
        const item = (0, utils_1.createCItemStack)({
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
    const stats = playerStats.get(attacker.getNameTag()) || { kills: 0, goals: 0 };
    stats.kills++;
    playerStats.set(attacker.getNameTag(), stats);
    scoreboardUpdatePl(attacker);
    if (stats.kills > 2) {
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
event_1.events.serverClose.on(() => {
    gameIntervalObj.stop();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlrYWJyYWluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGlrYWJyYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQW9GO0FBQ3BGLHdCQUF1QztBQUV2QyxrREFBb0Q7QUFDcEQsc0NBQW9DO0FBR3BDLHdDQUFxQztBQUNyQyxzQ0FBZ0Q7QUFFaEQsOENBQW1FO0FBRTVELEtBQUssVUFBVSxjQUFjLENBQUMsS0FBeUIsRUFBRSxNQUFxQixFQUFFLE1BQXFCOztJQUN4Ryx1QkFBdUI7SUFDdkIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtRQUN6QixNQUFNLEVBQUUsQ0FBQztRQUNULE9BQU87S0FDVjtJQUVELHdCQUF3QjtJQUN4QixJQUFJLHdCQUFhLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxFQUFFO1FBQ2pELENBQUEsTUFBQSxNQUFNLENBQUMsU0FBUyxFQUFFLDBDQUFFLFFBQVEsRUFBRSxFQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRSxJQUFBLFdBQU8sRUFBQyw0QkFBNEIsRUFBRSxXQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN4RSxPQUFPO0tBQ1Y7SUFDRCxJQUFJO1FBQ0EsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLGlCQUFTLEVBQUMsUUFBSyxDQUFDLFNBQVMsRUFBRSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RixJQUFJLFlBQVksS0FBSyxJQUFJO1lBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ2xEO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxj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