import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { countdownActionbar, startGame, stopGame } from "./utils";
import { Games, lobbyCoords } from ".";
import { Player } from "bdsx/bds/player";
import { AbilitiesIndex } from "bdsx/bds/abilities";
import { events } from "bdsx/event";
import { EntityDieEvent, PlayerAttackEvent, PlayerJoinEvent, PlayerLeftEvent, PlayerRespawnEvent } from "bdsx/event_impl/entityevent";
import { BlockDestroyEvent, BlockPlaceEvent } from "bdsx/event_impl/blockevent";
import { CANCEL } from "bdsx/common";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { ItemStack } from "bdsx/bds/inventory";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";
import { createCItemStack } from "../utils";

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
const playerStats = new Map<string, { kills: number, tempKills: number, goals: number }>();
const points = [0, 0];
const teamNames = ["§cRed", "§bBlue"];
const teamPos = ["-258 15 -237", "-222 15 -237"];

function setup(pls: string[]) {
    console.log("setup() participants:\n" + pls + "\n");
    bedrockServer.executeCommand("tag @a remove hikabrain");

    let teamCounter = 0;
    pls.forEach(pl => {
        bedrockServer.executeCommand(`tag "${pl}" add hikabrain`);
        teams.set(pl, teamCounter);
        playerStats.set(pl, { kills: 0, tempKills: 0, goals: 0 });
        teamCounter === 1 ? teamCounter = 0 : teamCounter++;
    });

    teams.forEach((value, key) => {
        bedrockServer.executeCommand(`tp "${key}" ${teamPos[value]}`);
        bedrockServer.executeCommand(`spawnpoint "${key}" ${teamPos[value]}`);
    });

    bedrockServer.executeCommand("kill @e[type=item]");
    bedrockServer.executeCommand("gamemode s @a[tag=hikabrain]");

    startListeners();
    gameIntervalObj.init();
    scoreboardUpdate();
    roundReset();
}

function addPoint(team: number, scorer: Player) {
    if (team < 0 || team > 1) return;
    const scorerName = scorer.getNameTag();
    if (playerStats.has(scorerName)) playerStats.get(scorerName)!.goals++;
    points[team]++;

    for (const value of playerStats.values()) { // Reset temp kills
        value.tempKills = 0;
    }
    if (points[team] === 5) {
        end(team);
    } else {
        bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext(`${scorerName} §7(§a${scorer.getHealth()}§7) §ascored!`));
        bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext(`§a§l+1 POINT §7> ${teamNames[team]} team §ris at §e§l${points[team]}§r§e/5\n`));
        bedrockServer.executeCommand("playsound firework.blast @a[tag=hikabrain]");
        scoreboardUpdate();
        roundReset(team, scorerName);
    }
}

function roundReset(team?: number, scorer?: string) {
    bedrockServer.executeCommand("inputpermission set @a[tag=hikabrain] movement disabled"); // block player movement

    const pls = getHikabrainPlayers();
    pls.forEach(pl => {
        pl.getAbilities().setAbility(AbilitiesIndex.AttackPlayers, false);
        pl.syncAbilities();
        respawn(pl);
    }); // PVP OFF

    const plsName = [...teams.keys()];
    const title = (team !== undefined) && (scorer !== undefined) ? teamNames[team].substring(0, 2) + scorer + " scored" : "§r";
    countdownActionbar(3, plsName, false, title)
        .then(() => {
            bedrockServer.executeCommand("fill -222 0 -230 -258 30 -244 air replace sandstone"); // clear map
            bedrockServer.executeCommand("clone -213 4 -149 -212 4 -149 -222 11 -237"); // BLUE BED
            bedrockServer.executeCommand("clone -215 4 -149 -216 4 -149 -259 11 -237"); // RED BED
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

// §b §c §7
function scoreboardUpdate() {
    let ptsStr = ["§c[R] ", "§b[B] "];
    for (let pts=0; pts<points.length; pts++) {
        for (let i=0; i<points[pts]; i++) {
            pts === 0 ? ptsStr[pts] += "" : ptsStr[pts] += "";
        }
        for (let i=0; i<(5-points[pts]); i++) {
            ptsStr[pts] += "";
        }
    }
    const scoreContent: string[] = ["§r", ptsStr[0], ptsStr[1]];
    getHikabrainPlayers().forEach(pl => {
        const plName = pl.getNameTag();
        const plTeam = teams.get(plName);
        let plScoreContent = [...scoreContent];
        if (plTeam === 0 || plTeam === 1) plScoreContent.unshift("You are " + teamNames[plTeam]);
        const stats = playerStats.get(plName) || { kills: 0, goals: 0 };
        if (playerStats.has(plName)) plScoreContent.push("§r ", `Kills: §a${stats.kills}`, `Goals: §a${stats.goals}`);
        pl.setFakeScoreboard(scoreboardTitle, plScoreContent);
    });
}
function scoreboardUpdatePl(pl: Player) {
    let ptsStr = ["§c[R] ", "§1[B] "];
    for (let pts=0; pts<points.length; pts++) {
        for (let i=0; i<points[pts]; i++) {
            pts === 0 ? ptsStr[pts] += "" : ptsStr[pts] += "";
        }
        for (let i=0; i<(5-points[pts]); i++) {
            ptsStr[pts] += "";
        }
    }
    const scoreContent: string[] = ["§r", ptsStr[0], ptsStr[1]];
    const plName = pl.getNameTag();
    const plTeam = teams.get(plName);
    if (plTeam === 0 || plTeam === 1) scoreContent.unshift("You are " + teamNames[plTeam]);
    const stats = playerStats.get(plName) || { kills: 0, goals: 0 };
    if (playerStats.has(plName)) scoreContent.push("§r ", `Kills: §a${stats.kills}`, `Goals: §a${stats.goals}`);
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
        if (value === 0) teamsAlive[0] = true
        else if (value === 1) teamsAlive[1] = true;
    }
    if (teamsAlive[0] && teamsAlive[1]) {
        return;
    } else {
        for (const value of teams.values()) {
            end(value);
            break;
        }
        return;
    }
}

function end(w: number) {
    console.log("called end()");
    const pls = getHikabrainPlayers();
    let winnersStr = "";
    pls.forEach(pl => {
        const plName = pl.getNameTag();
        pl.sendMessage(`
§7------------------
§fKills §7- §a${playerStats.get(plName)?.kills}
§fGoals §7- §a${playerStats.get(plName)?.goals}
§7------------------`);
        if (teams.get(plName) === w) {
            pl.playSound("mob.pillager.celebrate", lobbyCoords);
            bedrockServer.executeCommand(`playanimation "${plName}" animation.player.wincelebration a`);
            pl.sendTitle("§aYou won!");
            winnersStr += plName + ", ";
            return;
        }
        pl.sendTitle("§cYou lost!");
    });
    winnersStr = winnersStr.substring(0, winnersStr.length - 2); // remove the last ", "
    bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext(`
§7==================
        §l§aVICTORY
 ${teamNames[w]}§r§7: §f${winnersStr}

§c${points[0]} §7- §fGoals §7- §b${points[1]}
§7==================
    `));
    bedrockServer.executeCommand("tellraw @a " + rawtext(`§a§l${winnersStr} §r§awon a game of §2Hikabrain§a!`));
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

const gameIntervalObj = {
    init: function() {
        this.interval = setInterval(() => this.intervalFunc(), 200);
    },
    intervalFunc: function() {
        if (bedrockServer.isClosed()) {
            this.stop;
            return;
        }
        const players = getHikabrainPlayers();
        for (const player of players) {
            if (player.getPosition().y < 0 || player.getPosition().y > 30) {
                bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext(`§7${player.getNameTag()} fell into the void.`));
                respawn(player);
            }
        }
    },
    interval: 0 as unknown as NodeJS.Timeout,
    stop: function(){
        clearInterval(this.interval);
    }
}

function eliminate(pl: Player) {
    teams.delete(pl.getNameTag());
    pl.removeTag("hikabrain");
    pl.runCommand("clear");
    pl.removeAllEffects();
    pl.teleport(lobbyCoords);
}

function respawn(pl: Player) {
    const plName = pl.getNameTag();
    pl.runCommand("clear");
    pl.removeAllEffects();
    pl.addEffect(MobEffectInstance.create(MobEffectIds.InstantHealth, 1, 15, false, false, false));

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
    const items: ItemStack[] = [];
    for (let i=0; i<itemsData.length; i++) {
        const item = createCItemStack({
            item: itemsData[i].name,
            amount: itemsData[i].count
        });
        const tag = item.save();
        const nbt = NBT.allocate({
            ...tag,
            tag: {
                ...tag.tag,
                "minecraft:item_lock": NBT.byte(2)
            }
        }) as CompoundTag;
        item.load(nbt);

        items.push(item);

        if (i < 4) { // Armor items
            pl.setArmor(i, item);
        } else pl.addItem(item);
    }
    pl.getInventory().swapSlots(4, 8);
    pl.sendInventory();
    for (const item of items) {
        item.destruct();
    }
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
        const pl = e.player;
        const plTeam = teams.get(pl.getNameTag());
        if (plTeam === undefined) return CANCEL;

        const {x, y, z} = e.blockPos;

        if ((x===-259 && y===11 && z===-237) ||
            (x===-258 && y===11 && z===-237)) { // RED
                if (plTeam === 0) {
                    pl.sendMessage("§cYou can't break your own bed!");
                    return CANCEL;
                }
                addPoint(1, pl);
                return;
        } else if ((x===-221 && y===11 && z===-237) ||
            (x===-222 && y===11 && z===-237)) {
                if (plTeam === 1) {
                    pl.sendMessage("§cYou can't break your own bed!");
                    return CANCEL;
                }
                addPoint(0, pl);
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
    const bl = e.block.getName();
    if (bl !== "minecraft:sandstone") {
        e.player.runCommand("clear @s " + bl);
        return CANCEL;
    } else if (e.blockPos.y < 0 || e.blockPos.y > 28) {
        e.player.sendMessage("§cBuild limit reached!");
        return CANCEL;
    }
    return;
}

const playerAttackLis = (e: PlayerAttackEvent) => {
    if (!e.player.hasTag("hikabrain")) return;
    if (e.victim.getIdentifier() !== "minecraft:player") return;
    const pl = e.player;
    const victim = e.victim;
    const plName = pl.getNameTag();
    const plTeam = teams.get(plName);
    const victimTeam = teams.get(victim.getNameTag());
    if (plTeam === undefined || victimTeam === undefined) return;

    if (plTeam === victimTeam) return CANCEL;
}

const entityDieLis = (e: EntityDieEvent) => {
    if (e.entity.getIdentifier() !== "minecraft:player") return;
    if (!e.damageSource.getDamagingEntity()?.isPlayer()) return;
    const attacker = e.damageSource.getDamagingEntity() as Player;
    const stats = playerStats.get(attacker.getNameTag()) || { kills: 0, tempKills: 0, goals: 0 };
    stats.kills++; stats.tempKills++;
    playerStats.set(attacker.getNameTag(), stats);
    scoreboardUpdatePl(attacker);
    if (stats.tempKills > 2) {
        attacker.addEffect(MobEffectInstance.create(MobEffectIds.Strength, 5*20, 1));
        attacker.addEffect(MobEffectInstance.create(MobEffectIds.Speed, 5*20, 1));
        attacker.addEffect(MobEffectInstance.create(MobEffectIds.Haste, 5*20, 3));
    }
}

const playerJoinLis = (e: PlayerJoinEvent) => {
    if (!e.player.hasTag("hikabrain")) return;
    const pl = e.player;
    (async () => {
        while (!pl.isPlayerInitialized()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
        }
        scoreboardUpdatePl(pl);
        respawn(pl);
        bedrockServer.executeCommand("tellraw @a[tag=hikabrain] " + rawtext(`${pl.getNameTag()} §7reconnected.`));
    })();
}

const playerLeftLis = (e: PlayerLeftEvent) => {
    if (!e.player.hasTag("hikabrain")) return;
    const plName = e.player.getNameTag();
    const valueTemp = teams.get(plName);
    if (valueTemp === undefined) { eliminate(e.player); return; }
    teams.delete(plName);
    isEnoughPlayers();
    teams.set(plName, valueTemp);
}

function startListeners() {
    events.playerRespawn.on(playerRespawnLis);
    events.blockDestroy.on(blockDestroyLis);
    events.blockPlace.on(blockPlaceLis);
    events.playerAttack.on(playerAttackLis);
    events.entityDie.on(entityDieLis);
    events.playerJoin.on(playerJoinLis);
    events.playerLeft.on(playerLeftLis);
}
function stopListeners() {
    events.playerRespawn.remove(playerRespawnLis);
    events.blockDestroy.remove(blockDestroyLis);
    events.blockPlace.on(blockPlaceLis);
    events.playerAttack.remove(playerAttackLis);
    events.entityDie.remove(entityDieLis);
    events.playerJoin.remove(playerJoinLis);
    events.playerLeft.remove(playerLeftLis);
}
