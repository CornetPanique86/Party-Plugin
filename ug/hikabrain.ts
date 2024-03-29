import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { countdownActionbar, startGame, stopGame } from "./utils";
import { Games, lobbyCoords } from ".";
import { Player } from "bdsx/bds/player";
import { AbilitiesIndex } from "bdsx/bds/abilities";
import { events } from "bdsx/event";
import { PlayerAttackEvent, PlayerJoinEvent, PlayerLeftEvent, PlayerRespawnEvent } from "bdsx/event_impl/entityevent";
import { BlockDestroyEvent, BlockPlaceEvent } from "bdsx/event_impl/blockevent";
import { CANCEL } from "bdsx/common";

export async function hikabrainstart(param: { option: string }, origin: CommandOrigin, output: CommandOutput) {
    // /hikabrainstart stop
    if (param.option === "stop") {
        stopHb();
        return;
    }

    // /hikabrainstart start
    if (bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.getEntity()?.isPlayer() ? origin.getEntity()!.runCommand("tellraw @s " +rawtext("Minimum 2 players to start", LogInfo.error))
                                       : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await startGame(Games.hikabrain, bedrockServer.level.getPlayers(), 10);
        if (participants !== null) setup(participants);
    } catch (err) {
        bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while starting hikabrain", LogInfo.error)}`);
        console.log(err);
        return;
    }
}

// 0 = red; 1 = blue   string: playerName
const teams = new Map<string, number>();
const points = [0, 0];
const teamNames = ["§cRed", "§1Blue"];
const teamPos = ["-258 15 -237", "-222 15 -237"];

function setup(pls: string[]) {
    console.log("setup() participants:\n" + pls + "\n");
    bedrockServer.executeCommand("tag @a remove hikabrain");

    let teamCounter = 0;
    pls.forEach(pl => {
        bedrockServer.executeCommand(`tag "${pl}" add hikabrain`);
        teams.set(pl, teamCounter);
        teamCounter === 2 ? teamCounter = 0 : teamCounter++;
    });

    bedrockServer.executeCommand("inputpermission set @a[tag=hikabrain] movement disabled"); // block player movement
    teams.forEach((key, value) => {
        bedrockServer.executeCommand(`tp "${value}" ${teamPos[key]}`);
        bedrockServer.executeCommand(`spawnpoint "${value}" ${teamPos[key]}`);
    });

    bedrockServer.executeCommand("clear @a[tag=hikabrain]");
    const lock_in_slot = '{"minecraft:item_lock":{"mode":"lock_in_slot"},"minecraft:keep_on_death":{}}';
    const lock_in_inventory = '{"minecraft:item_lock":{"mode":"lock_in_inventory"}}';
    bedrockServer.executeCommand("replaceitem entity @a[tag=hikabrain] slot.armor.head 0 iron_helmet 1 0 " + lock_in_slot);
    bedrockServer.executeCommand("replaceitem entity @a[tag=hikabrain] slot.armor.chest 0 iron_chestplate 1 0 " + lock_in_slot);
    bedrockServer.executeCommand("replaceitem entity @a[tag=hikabrain] slot.armor.legs 0 iron_leggings 1 0 " + lock_in_slot);
    bedrockServer.executeCommand("replaceitem entity @a[tag=hikabrain] slot.armor.feet 0 iron_boots 1 0 " + lock_in_slot);
    bedrockServer.executeCommand("give @a[tag=hikabrain] iron_sword 1 0 " + lock_in_inventory);
    bedrockServer.executeCommand("give @a[tag=hikabrain] iron_pickaxe 1 0 " + lock_in_inventory);
    bedrockServer.executeCommand("give @a[tag=hikabrain] golden_apple 64 0 " + lock_in_inventory);
    bedrockServer.executeCommand("replaceitem entity @a[tag=hikabrain] slot.hotbar 3 sandstone 64 0 " + lock_in_inventory);
    bedrockServer.executeCommand("replaceitem entity @a[tag=hikabrain] slot.hotbar 8 sandstone 64 0 " + lock_in_inventory);
    bedrockServer.executeCommand("effect @a[tag=hikabrain] clear");
    bedrockServer.executeCommand("kill @e[type=item]");

    startListeners();
    roundReset();
}

function addPoint(team: number, scorer: string) {
    if (team < 0 || team > 1) return;
    points[team]++;
    if (points[team] === 5) {
        end(team);
    } else {
        bedrockServer.executeCommand(`tellraw @a[tag=hikabrain] ${rawtext(scorer + "§ascored!")}`);
        bedrockServer.executeCommand(`tellraw @a[tag=hikabrain] \n§a§l+1 POINT §7> ${teamNames[team]} team §ris at §e§l${points[team]}§r§e/5\n`);
        bedrockServer.executeCommand("playsound firework.blast @a[tag=hikabrain]");
        scoreboardUpdate();
        roundReset(team, scorer);
    }
}

function roundReset(team?: number, scorer?: string) {
    bedrockServer.executeCommand("clone -213 4 -149 -212 4 -149 -222 11 -237"); // BLUE BED
    bedrockServer.executeCommand("clone -215 4 -149 -216 4 -149 -259 11 -237"); // RED BED
    bedrockServer.executeCommand("fill -222 1 -230 -258 30 -244 air replace sandstone"); // clear map
    bedrockServer.executeCommand("inputpermission set @a[tag=hikabrain] movement disabled"); // block player movement
    teams.forEach((key, value) => bedrockServer.executeCommand(`tp "${value}" ${teamPos[key]}`));

    const pls = getHikabrainPlayers();
    pls.forEach(pl => {
        pl.getAbilities().setAbility(AbilitiesIndex.AttackPlayers, false);
        pl.syncAbilities();
    }); // PVP OFF

    const plsName = [...teams.keys()];
    const title = (team !== undefined) && (scorer !== undefined) ? teamNames[team].substring(0, 2) + scorer + " scored" : "§r";
    countdownActionbar(3, plsName, false, title)
        .then(() => {
            bedrockServer.executeCommand("inputpermission set @a[tag=hikabrain] movement enabled");
            bedrockServer.executeCommand("title @a[tag=hikabrain] title §r");
            bedrockServer.executeCommand("title @a[tag=hikabrain] subtitle §2LET'S GO!");
            bedrockServer.executeCommand("playsound note.harp @a[tag=hikabrain]");
            pls.forEach(pl => {
                pl.getAbilities().setAbility(AbilitiesIndex.AttackPlayers, true);
                pl.syncAbilities();
            }); // PVP ON
        })
        .catch(err => {
            bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext("Error while finishing to setup hikabrain", LogInfo.error));
            console.log(err.message);
            return;
        });
}

const scoreboardTitle = "§l§bHika§3brain";

function scoreboardUpdate() {
    let ptsStr = ["§c[R] ", "§1[B] "];
    for (let pts=0; pts<points.length; pts++) {
        for (let i=0; i<points[pts]; i++) {
            ptsStr[pts] += "";
        }
        ptsStr[pts] += "§7";
        for (let i=0; i<(5-points[pts]); i++) {
            ptsStr[pts] += "";
        }
    }
    const scoreContent: string[] = ["", ptsStr[0], ptsStr[1]];
    getHikabrainPlayers().forEach(pl => {
        const plTeam = teams.get(pl.getNameTag());
        let plScoreContent = [...scoreContent];
        if (plTeam === 0 || plTeam === 1) plScoreContent.unshift("You are " + teamNames[plTeam]);
        pl.setFakeScoreboard(scoreboardTitle, plScoreContent);
    });
}

function scoreboardStop() {
    getHikabrainPlayers().forEach(pl => pl.removeFakeScoreboard());
}


function end(w: number) {
    console.log("called end()");
    const pls = getHikabrainPlayers();
    let winnersStr = "";
    pls.forEach(pl => {
        const plName = pl.getNameTag();
        if (teams.get(plName) === w) {
            pl.playSound("mob.pillager.celebrate", lobbyCoords);
            pl.sendTitle("§aYou won!");
            winnersStr += plName + ", ";
            return;
        }
        pl.sendTitle("§cYou lost!");
    });
    winnersStr.substring(0, winnersStr.length - 2); // remove the last ", "
    bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext(`
§7==================
        §l§aVICTORY
 ${teamNames[w]}§r§7: §f${winnersStr}
§7==================
    `));
    bedrockServer.executeCommand("tellraw @a " + rawtext(`§a§l${winnersStr} §r§awon a game of §2Bedwars§a!`));
    stopHb();
}

function stopHb() {
    scoreboardStop();
    teams.clear();
    points[0] = 0;
    points[1] = 0;
    stopGame();
}

function getHikabrainPlayers() {
    let out: Player[] = [];
    bedrockServer.level.getPlayers().forEach(pl => {
        if (pl.hasTag("hikabrain")) out.push(pl);
    });
    return out;
}

// -------------
//   LISTENERS
// -------------

function respawn(pl: Player) {
    const plName = pl.getNameTag();

    if (teams.get(plName) === undefined) {
        pl.removeTag("hikabrain");
        bedrockServer.executeCommand(`clear "${plName}"`);
        bedrockServer.executeCommand(`effect "${plName}" clear`);
        bedrockServer.executeCommand(`tp "${plName}" 0 106 0`);
        return;
    }
    const lock_in_inventory = '{"minecraft:item_lock":{"mode":"lock_in_inventory"}}';
    bedrockServer.executeCommand(`give "${plName}" iron_sword 1 0 ${lock_in_inventory}`);
    bedrockServer.executeCommand(`give "${plName}" iron_pickaxe 1 0 ${lock_in_inventory}`);
    bedrockServer.executeCommand(`give "${plName}" golden_apple 64 0 ${lock_in_inventory}`);
    bedrockServer.executeCommand(`replaceitem entity "${plName}" slot.hotbar 3 sandstone 64 0 ${lock_in_inventory}`);
    bedrockServer.executeCommand(`replaceitem entity "${plName}" slot.hotbar 8 sandstone 64 0 ${lock_in_inventory}`);
    bedrockServer.executeCommand(`tp "${plName}" ${teamPos[teams.get(plName)!]}`);
}

const playerRespawnLis = (e: PlayerRespawnEvent) => {
    if (!e.player.hasTag("hikabrain")) return;

    const pl = e.player;
    (async () => {
        while (!pl.isAlive()) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Tick delay to avoid server load
        }
        respawn(pl);
    })();
}
const blockDestroyLis = (e: BlockDestroyEvent) => {
    if (!e.player.hasTag("hikabrain")) return;

    const bl = e.blockSource.getBlock(e.blockPos).getName();
    if (bl === "minecraft:sandstone") {
        return;
    } else if (bl === "minecraft:bed") {
        const {x, y, z} = e.blockPos;
        console.log(`mc bed blockPos: ${x} ${y} ${z}`);
        if ((x===-259 && y===11 && z===-237) ||
            (x===-258 && y===11 && z===-237)) { // RED
                addPoint(0, e.player.getNameTag());
                return;
        } else if ((x===-221 && y===11 && z===-237) ||
            (x===-222 && y===11 && z===-237)) {
                addPoint(1, e.player.getNameTag());
                return;
        } else {
            return CANCEL;
        }
    }
    else {
        const pl = e.player;
        pl.runCommand("clear @s " + bl);
        return CANCEL;
    }
}
const blockPlaceLis = (e: BlockPlaceEvent) => {
    if (!e.player.hasTag("hikabrain")) return;

    const bl = e.blockSource.getBlock(e.blockPos).getName();
    if (bl !== "minecraft:sandstone") {
        e.player.runCommand("clear @s " + bl);
        return CANCEL;
    }
    return;
}

const playerAttackLis = (e: PlayerAttackEvent) => {
    if (!e.player.hasTag("hikabrain")) return;
    const pl = e.player;
    const victim = e.victim;
    const plTeam = teams.get(pl.getNameTag());
    const victimTeam = teams.get(victim.getNameTag());
    if (!plTeam || !victimTeam) return;

    if (plTeam === victimTeam) return CANCEL;
}

const playerJoinLis = (e: PlayerJoinEvent) => {
    if (!e.player.hasTag("hikabrain")) return;
    const pl = e.player;
    (async () => {
        while (!pl.isPlayerInitialized()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
        }
        respawn(pl);
        bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext(`${pl.getNameTag()} §7reconnected.`));
    })();
}

function startListeners() {
    events.playerRespawn.on(playerRespawnLis);
    events.blockDestroy.on(blockDestroyLis);
    events.blockPlace.on(blockPlaceLis);
    events.playerAttack.on(playerAttackLis);
    events.playerJoin.on(playerJoinLis);
}
function stopListeners() {
    events.playerRespawn.remove(playerRespawnLis);
    events.blockDestroy.remove(blockDestroyLis);
    events.blockPlace.on(blockPlaceLis);
    events.playerAttack.remove(playerAttackLis);
    events.playerJoin.remove(playerJoinLis);
}