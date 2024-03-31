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
event_1.events.serverClose.on(() => {
    gameIntervalObj.stop();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlrYWJyYWluLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaGlrYWJyYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLDRDQUE4QztBQUM5QywwQkFBc0M7QUFDdEMsbUNBQW9GO0FBQ3BGLHdCQUF1QztBQUV2QyxrREFBb0Q7QUFDcEQsc0NBQW9DO0FBR3BDLHdDQUFxQztBQUNyQyxzQ0FBZ0Q7QUFFaEQsOENBQW1FO0FBRTVELEtBQUssVUFBVSxjQUFjLENBQUMsS0FBeUIsRUFBRSxNQUFxQixFQUFFLE1BQXFCOztJQUN4Ryx1QkFBdUI7SUFDdkIsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU0sRUFBRTtRQUN6QixNQUFNLEVBQUUsQ0FBQztRQUNULE9BQU87S0FDVjtJQUVELHdCQUF3QjtJQUN4QixJQUFJLHdCQUFhLENBQUMsS0FBSyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxFQUFFO1FBQ2pELENBQUEsTUFBQSxNQUFNLENBQUMsU0FBUyxFQUFFLDBDQUFFLFFBQVEsRUFBRSxFQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRSxJQUFBLFdBQU8sRUFBQyw0QkFBNEIsRUFBRSxXQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDckcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN4RSxPQUFPO0tBQ1Y7SUFDRCxJQUFJO1FBQ0EsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLGlCQUFTLEVBQUMsUUFBSyxDQUFDLFNBQVMsRUFBRSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RixJQUFJLFlBQVksS0FBSyxJQUFJO1lBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ2xEO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDVix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxjQUFjLElBQUEsV0FBTyxFQUFDLGdDQUFnQyxFQUFFLFdBQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQixPQUFPO0tBQ1Y7QUFDTCxDQUFDO0FBckJELHdDQXFCQztBQUVELHlDQUF5QztBQUN6QyxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztBQUN4QyxNQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBK0QsQ0FBQztBQUMzRixNQUFNLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0QixNQUFNLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztBQUN0QyxNQUFNLE9BQU8sR0FBRyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUVqRCxTQUFTLEtBQUssQ0FBQyxHQUFhO0lBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3BELHdCQUFhLENBQUMsY0FBYyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFFeEQsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3BCLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDYix3QkFBYSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUMxRCxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMzQixXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRCxXQUFXLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN4RCxDQUFDLENBQUMsQ0FBQztJQUVILEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDekIsd0JBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5RCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxlQUFlLEdBQUcsS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFFLENBQUMsQ0FBQyxDQUFDO0lBRUgsd0JBQWEsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUNuRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0lBRTdELGNBQWMsRUFBRSxDQUFDO0lBQ2pCLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2QixnQkFBZ0IsRUFBRSxDQUFDO0lBQ25CLFVBQVUsRUFBRSxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLFFBQVEsQ0FBQyxJQUFZLEVBQUUsTUFBYztJQUMxQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7UUFBRSxPQUFPO0lBQ2pDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN2QyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO1FBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN0RSxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztJQUVmLEtBQUssTUFBTSxLQUFLLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFLEVBQUUsbUJBQW1CO1FBQzNELEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0tBQ3ZCO0lBQ0QsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3BCLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNiO1NBQU07UUFDSCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyw0QkFBNEIsR0FBRyxJQUFBLFdBQU8sRUFBQyxHQUFHLFVBQVUsU0FBUyxNQUFNLENBQUMsU0FBUyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztRQUMvSCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyw0QkFBNEIsR0FBRyxJQUFBLFdBQU8sRUFBQyxvQkFBb0IsU0FBUyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBQ3JKLHdCQUFhLENBQUMsY0FBYyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7UUFDM0UsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ2hDO0FBQ0wsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLElBQWEsRUFBRSxNQUFlO0lBQzlDLHdCQUFhLENBQUMsY0FBYyxDQUFDLHlEQUF5RCxDQUFDLENBQUMsQ0FBQyx3QkFBd0I7SUFFakgsTUFBTSxHQUFHLEdBQUcsbUJBQW1CLEVBQUUsQ0FBQztJQUNsQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ2IsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLFVBQVUsQ0FBQywwQkFBYyxDQUFDLGFBQWEsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDbkIsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVTtJQUVkLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNsQyxNQUFNLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzNILElBQUEsMEJBQWtCLEVBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1NBQ3ZDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDUCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDLENBQUMsWUFBWTtRQUNqRyx3QkFBYSxDQUFDLGNBQWMsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUMsV0FBVztRQUN2Rix3QkFBYSxDQUFDLGNBQWMsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUMsVUFBVTtRQUN0Rix3QkFBYSxDQUFDLGNBQWMsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO1FBQ3ZGLHdCQUFhLENBQUMsY0FBYyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDakUsd0JBQWEsQ0FBQyxjQUFjLENBQUMsOENBQThDLENBQUMsQ0FBQztRQUM3RSx3QkFBYSxDQUFDLGNBQWMsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQ3RFLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDYixFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLDBCQUFjLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pFLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7SUFDakIsQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ1Qsd0JBQWEsQ0FBQyxjQUFjLENBQUMsNEJBQTRCLEdBQUcsSUFBQSxXQUFPLEVBQUMsMENBQTBDLEVBQUUsV0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDaEksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekIsT0FBTztJQUNYLENBQUMsQ0FBQyxDQUFDO0FBQ1gsQ0FBQztBQUVELE1BQU0sZUFBZSxHQUFHLGlCQUFpQixDQUFDO0FBRTFDLGNBQWM7QUFDZCxTQUFTLGdCQUFnQjtJQUNyQixJQUFJLE1BQU0sR0FBRyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNsQyxLQUFLLElBQUksR0FBRyxHQUFDLENBQUMsRUFBRSxHQUFHLEdBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUN0QyxLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzlCLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7U0FDdkQ7UUFDRCxLQUFLLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQztTQUN0QjtLQUNKO0lBQ0QsTUFBTSxZQUFZLEdBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVELG1CQUFtQixFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQy9CLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMvQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pDLElBQUksY0FBYyxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQztRQUN2QyxJQUFJLE1BQU0sS0FBSyxDQUFDLElBQUksTUFBTSxLQUFLLENBQUM7WUFBRSxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUN6RixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDaEUsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUFFLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFlBQVksS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLFlBQVksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUMxRCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFDRCxTQUFTLGtCQUFrQixDQUFDLEVBQVU7SUFDbEMsSUFBSSxNQUFNLEdBQUcsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDbEMsS0FBSyxJQUFJLEdBQUcsR0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDdEMsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDO1NBQ3ZEO1FBQ0QsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUM7U0FDdEI7S0FDSjtJQUNELE1BQU0sWUFBWSxHQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1RCxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDL0IsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxJQUFJLE1BQU0sS0FBSyxDQUFDLElBQUksTUFBTSxLQUFLLENBQUM7UUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN2RixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDaEUsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUFFLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFlBQVksS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLFlBQVksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDNUcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBRUQsU0FBUyxjQUFjO0lBQ25CLG1CQUFtQixFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRUQsU0FBUyxlQUFlO0lBQ3BCLElBQUksbUJBQW1CLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2xDLEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNYLE1BQU07U0FDVDtRQUNELE9BQU87S0FDVjtJQUNELHFDQUFxQztJQUNyQyxNQUFNLFVBQVUsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsQyxLQUFLLE1BQU0sS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRTtRQUNoQyxJQUFJLEtBQUssS0FBSyxDQUFDO1lBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQTthQUNoQyxJQUFJLEtBQUssS0FBSyxDQUFDO1lBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUM5QztJQUNELElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNoQyxPQUFPO0tBQ1Y7U0FBTTtRQUNILEtBQUssTUFBTSxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ2hDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNYLE1BQU07U0FDVDtRQUNELE9BQU87S0FDVjtBQUNMLENBQUM7QUFFRCxTQUFTLEdBQUcsQ0FBQyxDQUFTO0lBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDNUIsTUFBTSxHQUFHLEdBQUcsbUJBQW1CLEVBQUUsQ0FBQztJQUNsQyxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDcEIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTs7UUFDYixNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDL0IsRUFBRSxDQUFDLFdBQVcsQ0FBQzs7Z0JBRVAsTUFBQSxXQUFXLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQywwQ0FBRSxLQUFLO2dCQUM5QixNQUFBLFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLDBDQUFFLEtBQUs7cUJBQ3pCLENBQUMsQ0FBQztRQUNmLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDekIsRUFBRSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxjQUFXLENBQUMsQ0FBQztZQUNwRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsTUFBTSxxQ0FBcUMsQ0FBQyxDQUFDO1lBQzVGLEVBQUUsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDM0IsVUFBVSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDNUIsT0FBTztTQUNWO1FBQ0QsRUFBRSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUNILFVBQVUsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCO0lBQ3BGLHdCQUFhLENBQUMsY0FBYyxDQUFDLDRCQUE0QixHQUFHLElBQUEsV0FBTyxFQUFDOzs7R0FHckUsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLFVBQVU7O0lBRWhDLE1BQU0sQ0FBQyxDQUFDLENBQUMsc0JBQXNCLE1BQU0sQ0FBQyxDQUFDLENBQUM7O0tBRXZDLENBQUMsQ0FBQyxDQUFDO0lBQ0osd0JBQWEsQ0FBQyxjQUFjLENBQUMsYUFBYSxHQUFHLElBQUEsV0FBTyxFQUFDLE9BQU8sVUFBVSxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7SUFDNUcsTUFBTSxFQUFFLENBQUM7QUFDYixDQUFDO0FBRUQsU0FBUyxNQUFNO0lBQ1gsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZCLGFBQWEsRUFBRSxDQUFDO0lBQ2hCLGNBQWMsRUFBRSxDQUFDO0lBQ2pCLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNkLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZCxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BCLElBQUEsZ0JBQVEsR0FBRSxDQUFDO0FBQ2YsQ0FBQztBQUVELFNBQVMsbUJBQW1CO0lBQ3hCLElBQUksR0FBRyxHQUFhLEVBQUUsQ0FBQztJQUN2Qix3QkFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDMUMsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFFRCxnQkFBZ0I7QUFDaEIsY0FBYztBQUNkLGdCQUFnQjtBQUVoQixNQUFNLGVBQWUsR0FBRztJQUNwQixJQUFJLEVBQUU7UUFDRixJQUFJLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUNELFlBQVksRUFBRTtRQUNWLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixFQUFFLENBQUM7UUFDdEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDMUIsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDM0Qsd0JBQWEsQ0FBQyxjQUFjLENBQUMsNEJBQTRCLEdBQUcsSUFBQSxXQUFPLEVBQUMsS0FBSyxNQUFNLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQztnQkFDckgsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ25CO1NBQ0o7SUFDTCxDQUFDO0lBQ0QsUUFBUSxFQUFFLENBQThCO0lBQ3hDLElBQUksRUFBRTtRQUNGLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQztDQUNKLENBQUE7QUFFRCxTQUFTLFNBQVMsQ0FBQyxFQUFVO0lBQ3pCLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDOUIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxQixFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZCLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3RCLEVBQUUsQ0FBQyxRQUFRLENBQUMsY0FBVyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLEVBQVU7SUFDdkIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQy9CLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkIsRUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDdEIsRUFBRSxDQUFDLFNBQVMsQ0FBQywyQkFBaUIsQ0FBQyxNQUFNLENBQUMsc0JBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFL0YsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFNBQVMsRUFBRTtRQUNqQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDZCxlQUFlLEVBQUUsQ0FBQztRQUNsQixPQUFPO0tBQ1Y7SUFDRCxNQUFNLFNBQVMsR0FBRztRQUNkO1lBQ0ksSUFBSSxFQUFFLGFBQWE7WUFDbkIsS0FBSyxFQUFFLENBQUM7U0FDWDtRQUNEO1lBQ0ksSUFBSSxFQUFFLGlCQUFpQjtZQUN2QixLQUFLLEVBQUUsQ0FBQztTQUNYO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsZUFBZTtZQUNyQixLQUFLLEVBQUUsQ0FBQztTQUNYO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsWUFBWTtZQUNsQixLQUFLLEVBQUUsQ0FBQztTQUNYO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsWUFBWTtZQUNsQixLQUFLLEVBQUUsQ0FBQztTQUNYO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsY0FBYztZQUNwQixLQUFLLEVBQUUsQ0FBQztTQUNYO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsY0FBYztZQUNwQixLQUFLLEVBQUUsRUFBRTtTQUNaO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsV0FBVztZQUNqQixLQUFLLEVBQUUsRUFBRTtTQUNaO1FBQ0Q7WUFDSSxJQUFJLEVBQUUsV0FBVztZQUNqQixLQUFLLEVBQUUsRUFBRTtTQUNaO0tBQ0osQ0FBQztJQUNGLE1BQU0sS0FBSyxHQUFnQixFQUFFLENBQUM7SUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDbkMsTUFBTSxJQUFJLEdBQUcsSUFBQSx3QkFBZ0IsRUFBQztZQUMxQixJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDdkIsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLO1NBQzdCLENBQUMsQ0FBQztRQUNILE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QixNQUFNLEdBQUcsR0FBRyxTQUFHLENBQUMsUUFBUSxpQ0FDakIsR0FBRyxLQUNOLEdBQUcsa0NBQ0ksR0FBRyxDQUFDLEdBQUcsS0FDVixxQkFBcUIsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUV6QixDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFZixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWpCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLGNBQWM7WUFDdkIsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDeEI7O1lBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQjtJQUNELEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUNuQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN0QixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDbkI7SUFDRCx3QkFBYSxDQUFDLGNBQWMsQ0FBQyxPQUFPLE1BQU0sS0FBSyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQXFCLEVBQUUsRUFBRTtJQUMvQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQUUsT0FBTztJQUUxQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3BCLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDUixPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQ0FBa0M7U0FDNUY7UUFDRCxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDaEIsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNULENBQUMsQ0FBQTtBQUNELE1BQU0sZUFBZSxHQUFHLENBQUMsQ0FBb0IsRUFBRSxFQUFFO0lBQzdDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFBRSxPQUFPO0lBRTFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN4RCxJQUFJLEVBQUUsS0FBSyxxQkFBcUIsRUFBRTtRQUM5QixPQUFPO0tBQ1Y7U0FBTSxJQUFJLEVBQUUsS0FBSyxlQUFlLEVBQUU7UUFDL0IsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNwQixNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQzFDLElBQUksTUFBTSxLQUFLLFNBQVM7WUFBRSxPQUFPLGVBQU0sQ0FBQztRQUV4QyxNQUFNLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDO1FBRTdCLElBQUksQ0FBQyxDQUFDLEtBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUcsQ0FBQyxHQUFHLENBQUM7WUFDaEMsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU07WUFDdEMsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUNkLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUNBQWlDLENBQUMsQ0FBQztnQkFDbEQsT0FBTyxlQUFNLENBQUM7YUFDakI7WUFDRCxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2hCLE9BQU87U0FDZDthQUFNLElBQUksQ0FBQyxDQUFDLEtBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUcsQ0FBQyxHQUFHLENBQUM7WUFDdkMsQ0FBQyxDQUFDLEtBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM5QixJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2QsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUNsRCxPQUFPLGVBQU0sQ0FBQzthQUNqQjtZQUNELFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDaEIsT0FBTztTQUNkO2FBQU07WUFDSCxPQUFPLGVBQU0sQ0FBQztTQUNqQjtLQUNKO1NBQ0k7UUFDRCxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sZUFBTSxDQUFDO0tBQ2pCO0FBQ0wsQ0FBQyxDQUFBO0FBQ0QsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFrQixFQUFFLEVBQUU7SUFDekMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUFFLE9BQU87SUFDMUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixJQUFJLEVBQUUsS0FBSyxxQkFBcUIsRUFBRTtRQUM5QixDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDdEMsT0FBTyxlQUFNLENBQUM7S0FDakI7U0FBTSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7UUFDOUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUMvQyxPQUFPLGVBQU0sQ0FBQztLQUNqQjtJQUNELE9BQU87QUFDWCxDQUFDLENBQUE7QUFFRCxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQW9CLEVBQUUsRUFBRTtJQUM3QyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQUUsT0FBTztJQUMxQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEtBQUssa0JBQWtCO1FBQUUsT0FBTztJQUM1RCxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3BCLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDeEIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQy9CLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNsRCxJQUFJLE1BQU0sS0FBSyxTQUFTLElBQUksVUFBVSxLQUFLLFNBQVM7UUFBRSxPQUFPO0lBRTdELElBQUksTUFBTSxLQUFLLFVBQVU7UUFBRSxPQUFPLGVBQU0sQ0FBQztBQUM3QyxDQUFDLENBQUE7QUFFRCxNQUFNLFlBQVksR0FBRyxDQUFDLENBQWlCLEVBQUUsRUFBRTs7SUFDdkMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxLQUFLLGtCQUFrQjtRQUFFLE9BQU87SUFDNUQsSUFBSSxDQUFDLENBQUEsTUFBQSxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLDBDQUFFLFFBQVEsRUFBRSxDQUFBO1FBQUUsT0FBTztJQUM1RCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFZLENBQUM7SUFDOUQsTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDN0YsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLFdBQVcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzlDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdCLElBQUksS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUU7UUFDckIsUUFBUSxDQUFDLFNBQVMsQ0FBQywyQkFBaUIsQ0FBQyxNQUFNLENBQUMsc0JBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdFLFFBQVEsQ0FBQyxTQUFTLENBQUMsMkJBQWlCLENBQUMsTUFBTSxDQUFDLHNCQUFZLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRSxRQUFRLENBQUMsU0FBUyxDQUFDLDJCQUFpQixDQUFDLE1BQU0sQ0FBQyxzQkFBWSxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDN0U7QUFDTCxDQUFDLENBQUE7QUFFRCxNQUFNLGFBQWEsR0FBRyxDQUFDLENBQWtCLEVBQUUsRUFBRTtJQUN6QyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQUUsT0FBTztJQUMxQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQ3BCLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDUixPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLEVBQUU7WUFDOUIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtDQUFrQztTQUM5RjtRQUNELGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNaLHdCQUFhLENBQUMsY0FBYyxDQUFDLDRCQUE0QixHQUFHLElBQUEsV0FBTyxFQUFDLEdBQUcsRUFBRSxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7SUFDOUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNULENBQUMsQ0FBQTtBQUVELE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBa0IsRUFBRSxFQUFFO0lBQ3pDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFBRSxPQUFPO0lBQzFDLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDckMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQyxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7UUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQUMsT0FBTztLQUFFO0lBQzdELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckIsZUFBZSxFQUFFLENBQUM7SUFDbEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFBO0FBRUQsU0FBUyxjQUFjO0lBQ25CLGNBQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDMUMsY0FBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEMsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEMsY0FBTSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDeEMsY0FBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbEMsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDcEMsY0FBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQUNELFNBQVMsYUFBYTtJQUNsQixjQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzlDLGNBQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLGNBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3BDLGNBQU0sQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzVDLGNBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3RDLGNBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hDLGNBQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFDRCxjQUFNLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDdkIsZUFBZSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzNCLENBQUMsQ0FBQyxDQUFBIn0=