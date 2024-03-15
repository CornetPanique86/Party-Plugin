import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { countdownActionbar, createCItemStack, getPlayerByName, startGame, stopGame } from "./utils";
import { Games } from ".";
import { EnchantmentNames } from "bdsx/bds/enchants";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { ItemStack } from "bdsx/bds/inventory";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { PlayerAttackEvent, PlayerInventoryChangeEvent, PlayerJoinEvent, PlayerLeftEvent, PlayerRespawnEvent } from "bdsx/event_impl/entityevent";
import { Vec3 } from "bdsx/bds/blockpos";
import { ActorDamageCause, ActorDamageSource, DimensionId } from "bdsx/bds/actor";
import { BlockDestroyEvent } from "bdsx/event_impl/blockevent";
import { BlockActor, BlockActorType, BlockSource } from "bdsx/bds/block";
import { Player } from "bdsx/bds/player";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";
import { AbilitiesIndex } from "bdsx/bds/abilities";
import { nativeClass, nativeField } from "bdsx/nativeclass";
import { int32_t } from "bdsx/nativetype";


enum BedColor {
    White,
    Orange,
    Magenta,
    LightBlue,
    Yellow,
    Lime,
    Pink,
    Gray,
    LightGray,
    Cyan,
    Purple,
    Blue,
    Brown,
    Green,
    Red,
    Black,
}

@nativeClass()
class BedBlockActor extends BlockActor {
    @nativeField(int32_t, 0xC8)
    color: BedColor
}


// /bedwarsstart command
export async function bedwarsstart(param: { option: string }, origin: CommandOrigin, output: CommandOutput) {
    // /bedwarsstart stop
    if (param.option === "stop") {
        stopBw();
        return;
    }

    // /bedwarsstart start
    if (bedrockServer.level.getActivePlayerCount() <= 1) {
        origin.getEntity()?.isPlayer() ? bedrockServer.executeCommand(`tellraw "${origin.getName()}" ${rawtext("Minimum 2 players to start", LogInfo.error)}`)
                                       : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await startGame(Games.bedwars, bedrockServer.level.getPlayers(), 10);
        if (participants !== null) setup(participants);
    } catch (err) {
        bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while starting bedwars", LogInfo.error)}`);
        console.log(err);
        return;
    }
}

type Teams = [
    {bed: boolean, pls: string[]}, // red
    {bed: boolean, pls: string[]}, // blue
    {bed: boolean, pls: string[]}, // green
    {bed: boolean, pls: string[]}  // yellow
]

const teams: Teams = [{ bed: true, pls: [] },
                      { bed: true, pls: [] },
                      { bed: true, pls: [] },
                      { bed: true, pls: [] }]
const teamNames = ["§cRed", "§9Blue", "§2Green", "§6Yellow"]
const teamSpawns = [[-1001, 68, -1035], [-1000, 68, -965], [-966, 68, -1000], [-1034, 68, -1000]]

function setup(pls: string[]) {
    const teamColors = [-54000, 66000, 64000, -67000]

    console.log("setup() participants:\n" + pls + "\n");
    bedrockServer.executeCommand("tag @a remove bedwars");
    let teamCounter = 0;
    pls.forEach(pl => {
        bedrockServer.executeCommand(`tag "${pl}" add bedwars`);

        // Put in team
        teams[teamCounter].pls.push(pl);
        teamCounter === 5 ? teamCounter = 0 : teamCounter++;
    });

    // TP Teams
    teams[0].pls.forEach(pl => {
        const pos = (() => { let str = ""; teamSpawns[0].forEach(coord => str += " "+coord); return str })();
        bedrockServer.executeCommand(`tp "${pl}"${pos}`);
        bedrockServer.executeCommand(`spawnpoint "${pl}"${pos}`);
    });
    teams[1].pls.forEach(pl => {
        const pos = (() => { let str = ""; teamSpawns[1].forEach(coord => str += " "+coord); return str })();
        bedrockServer.executeCommand(`tp "${pl}"${pos}`);
        bedrockServer.executeCommand(`spawnpoint "${pl}"${pos}`);
    });
    teams[2].pls.forEach(pl => {
        const pos = (() => { let str = ""; teamSpawns[2].forEach(coord => str += " "+coord); return str })();
        bedrockServer.executeCommand(`tp "${pl}"${pos}`);
        bedrockServer.executeCommand(`spawnpoint "${pl}"${pos}`);
    });
    teams[3].pls.forEach(pl => {
        const pos = (() => { let str = ""; teamSpawns[3].forEach(coord => str += " "+coord); return str })();
        bedrockServer.executeCommand(`tp "${pl}"${pos}`);
        bedrockServer.executeCommand(`spawnpoint "${pl}"${pos}`);
    });

    bedrockServer.executeCommand("clear @a[tag=bedwars]");
    bedrockServer.executeCommand("effect @a[tag=bedwars] clear");
    bedrockServer.executeCommand("kill @e[type=item]");
    bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement disabled");

    teams.forEach((team, index) => {
        const armorNames = ["minecraft:leather_helmet", "minecraft:leather_chestplate", "minecraft:leather_leggings", "minecraft:leather_boots"];
        const armor: ItemStack[] = [];
        for (let i = 0; i < 4; i++) {
            const item = createCItemStack({
                item: armorNames[i],
                amount: 1,
                data: 0,
                name: `§r${teamNames[index]} team`,
                enchantment: {
                    enchant: EnchantmentNames.Unbreaking,
                    level: 5,
                    isUnsafe: true
                }
            });
            const tag = item.save();
            const nbt = NBT.allocate({
                ...tag,
                tag: {
                    ...tag.tag,
                    "customColor": NBT.int(teamColors[index]),
                    "minecraft:item_lock": NBT.byte(1),
                    "minecraft:keep_on_death": NBT.byte(1)
                }
            }) as CompoundTag;
            item.load(nbt);
            armor.push(item);
        }
        team.pls.forEach(plName => {
            const player = getPlayerByName(plName);
            if (!player) return;
            player.setArmor(0, armor[0]);
            player.setArmor(1, armor[1]);
            player.setArmor(2, armor[2]);
            player.setArmor(3, armor[3]);
        })
    });

    countdownActionbar(5, pls, false)
        .then(() => {
            // Clear/reset map
            bedrockServer.executeCommand("clone 116 20 112 116 20 113 -1000 68 -968"); // blue bed
            bedrockServer.executeCommand("clone 115 20 111 114 20 111 -1031 68 -1000"); // yellow bed
            bedrockServer.executeCommand("clone 116 20 110 116 20 109 -1001 68 -1032"); // red bed
            bedrockServer.executeCommand("clone 117 20 111 118 20 111 -969 68 -1000"); // lime bed
            bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled");
            genObj.gen();
            gameIntervalObj.init();
            startListeners();
            return;
        })
        .catch(error => {
            bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while finishing to setup bedwars"), LogInfo.error}`);
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
    iron_ingot: createCItemStack({ item: "minecraft:iron_ingot", amount: 1 }),
    emerald: createCItemStack({ item: "minecraft:emerald", amount: 1 }),
    blockSource: 0 as unknown as BlockSource | undefined,
    ironSpawns: [[-1001, 68, -1038], [-1000, 68, -962], [-963, 68, -1000], [-1037, 68, -1000]],
    emeraldSpawns: [[-1001, 70, -1008], [-1007, 70, -1000], [-993, 70, -1001], [-1000, 70, -993]],
    sec: 1,
    gen: function(){
        console.log("gen() called");
        this.blockSource = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
        if (!this.blockSource) {
            bedrockServer.executeCommand(`tellraw @a ${rawtext("Couldn't get blockSource", LogInfo.error)}`);
            console.log(this.blockSource);
            return;
        };
        this.interval = setInterval(() => this.intervalFunc(), 1000);
    },
    intervalFunc: function(){
        for (let i = 0; i < this.ironSpawns.length; i++) {
            bedrockServer.level.getSpawner().spawnItem(
                this.blockSource!,
                this.iron_ingot,
                Vec3.create(this.ironSpawns[i][0], this.ironSpawns[i][1], this.ironSpawns[i][2]),
                0.25
            );
        }
        if (this.sec === 10) {
            for (let i = 0; i < this.emeraldSpawns.length; i++) {
                bedrockServer.level.getSpawner().spawnItem(
                    this.blockSource!,
                    this.emerald,
                    Vec3.create(this.emeraldSpawns[i][0], this.emeraldSpawns[i][1], this.emeraldSpawns[i][2]),
                    0.25
                );
            }
            this.sec = 0;
        }
        this.sec++;
    },
    interval: 0 as unknown as NodeJS.Timeout,
    stop: function(){
        clearInterval(this.interval)
    },
    serverClose: function(){
        clearInterval(this.interval);
        this.iron_ingot.destruct();
        this.emerald.destruct();
    }
}
const gameIntervalObj = {
    init: function() {
        this.interval = setInterval(() => this.intervalFunc(), 200);
    },
    intervalFunc: function() {
        const players = bedrockServer.level.getPlayers();
        for (const player of players) {
            if (!player.hasTag("bedwars")) break;
            if (player.getPosition().y < 0) {
                player.die(ActorDamageSource.create(ActorDamageCause.Void));
            }
            const plName = player.getNameTag();
            if (bedrockServer.executeCommand(`clear "${plName}" iron_chestplate`).result === 1) {
                bedrockServer.executeCommand(`execute as "${plName}" run function bw_iron_armor`);
                break;
            }
            if (bedrockServer.executeCommand(`clear "${plName}" diamond_chestplate`).result === 1) {
                bedrockServer.executeCommand(`execute as "${plName}" run function bw_diamond_armor`);
                break;
            }
        }
    },
    interval: 0 as unknown as NodeJS.Timeout,
    stop: function(){
        clearInterval(this.interval)
    }
}


function eliminate(pl: Player) {
    const plName = pl.getNameTag();
    teams.forEach((team, index) => { if (team.pls.includes(plName)) {
        team.pls.splice(team.pls.indexOf(plName), 1);
        if (team.pls.length === 0)
            bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`§l${teamNames[index]} team §r§7is §celiminated!`, LogInfo.info));
    }});

    bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`${plName} §cwas eliminated. §l§2FINAL KILL!`));
    bedrockServer.executeCommand(`clear "${plName}"`);
    pl.removeTag("bedwars");
    pl.teleport(Vec3.create(0, 106, 0));
    isGameEnd();
}
function respawn(pl: Player) {
    const tpSpot = Vec3.create(-1000, 115, -1000);
    pl.teleport(tpSpot);
    pl.addEffect(MobEffectInstance.create(14 /* invis ID */, 200, 255, false, true));
    const abilities = pl.getAbilities();
    abilities.setAbility(AbilitiesIndex.MayFly, true);
    abilities.setAbility(AbilitiesIndex.Flying, true);
    abilities.setAbility(AbilitiesIndex.NoClip, true);
    abilities.setAbility(AbilitiesIndex.Invulnerable, true);
    abilities.setAbility(AbilitiesIndex.AttackPlayers, false);
    pl.syncAbilities();
    const plName = pl.getNameTag();

    const specInterval = setInterval(() => {
        const players = bedrockServer.level.getPlayers();
        for (const player of players) {
            if (!player.hasTag("bedwars") || player.getNameTag() === plName) break;
            if (pl.distanceTo(player.getPosition()) < 8) {
                pl.teleport(tpSpot);
            }
        }
    }, 1000);

    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(plName)) plTeam = index });
    if (plTeam === -1) return;
    countdownActionbar(5, [plName], false, "§7Respawning...")
        .then(() => {
            clearInterval(specInterval);
            pl.teleport(Vec3.create(teamSpawns[plTeam][0], teamSpawns[plTeam][1], teamSpawns[plTeam][2]));
            pl.removeEffect(MobEffectIds.Invisibility);
            abilities.setAbility(AbilitiesIndex.Flying, false);
            abilities.setAbility(AbilitiesIndex.MayFly, false);
            abilities.setAbility(AbilitiesIndex.NoClip, false);
            abilities.setAbility(AbilitiesIndex.Invulnerable, false);
            abilities.setAbility(AbilitiesIndex.AttackPlayers, true);
            pl.syncAbilities();
            // abilities.destruct();
        })
        .catch(err => console.log(err.message));
}
function bedBreak(pl: string, team: number) {
    teams[team].bed = false;
    bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`§l${teamNames[team]} bed §r§7was broken by §r${pl}§7!`, LogInfo.info));
    bedrockServer.executeCommand("execute at @a[tag=bedwars] run playsound mob.enderdragon.growl ~~~ 0.5");
    let left = 0;
    teams[team].pls.forEach(pl1 => { if (!getPlayerByName(pl1)) left++ });
    if (left === teams[team].pls.length) {
        teams[team].pls = [];
        bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`§l${teamNames[team]} team §r§7is §celiminated!`, LogInfo.info));
        isGameEnd();
    }
}

// Is the game done?
function isGameEnd() {
    let remainingTeams = 0;
    teams.forEach(team => {
        if (team.pls.length > 0) remainingTeams++;
    });
    if (remainingTeams > 1) return;
    if (remainingTeams === 0) {
        bedrockServer.executeCommand("tellraw @a " + rawtext("A bedwars game ended without winners (everyone left)...", LogInfo.error));
        stopBw();
        return;
    }
    // Get last team remaining
    let lastTeam = -1;
    teams.forEach((team, index) => {
        if (team.pls.length > 0) lastTeam = index;
    });
    if (lastTeam === -1) return;

    // If beds remaining, it means a team has a bed but no players = still alive
    let beds = 0;
    teams.forEach((team, index) => {
        if (team.bed && index !== lastTeam) beds++;
    });
    if (beds > 0) return;

    // isGameEnd = TRUE
    end(lastTeam);
}

function end(w: number) {
    let winners: string[] = [];
    let winnersStr = "";
    teams[w].pls.forEach((winner, index) => {
        winners.push(winner);
        index === teams[w].pls.length - 1 ? winnersStr += winner : winnersStr += winner + ", ";
    });
    bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`
    §7===========\n
        §l§aVICTORY\n
    ${teamNames[w]}§r§7: §f${winnersStr}\n
    §7===========\n
    `));
    for (const winner of winners) {
        const pl = getPlayerByName(winner);
        pl?.playSound("mob.pillager.celebrate");
    }
    bedrockServer.executeCommand("tellraw @a " + rawtext(`§a§l${winnersStr} §r§awon a game of Bedwars!`));
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
    stopGame();
}

// -------------
//   LISTENERS
// -------------

const playerRespawnLis = (e: PlayerRespawnEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const pl = e.player;

    let isPlEliminated = false;
    teams.forEach(team => {
        if (team.pls.includes(pl.getNameTag()) && !team.bed) {
            isPlEliminated = true;
            eliminate(pl);
        }
    });
    if (!isPlEliminated) respawn(e.player);
}
const blockDestroyLis = (e: BlockDestroyEvent) => {
    // BEDS data: red=14 ; blue=11 ; green=5 ; yellow=4
    const block = e.blockSource.getBlockEntity(e.blockPos);
    if (!block) return;
    if (!(e.player.hasTag("bedwars") && block.getType() === BlockActorType.Bed)) return;

    const bedActor = block.as(BedBlockActor);
    let bed: number;
    // Check if bed color is of a team and give the correct team index
    switch (bedActor.color) {
        case BedColor.Red:
            bed = 0; break;
        case BedColor.Blue:
            bed = 1; break;
        case BedColor.Green:
            bed = 2; break;
        case BedColor.Yellow:
            bed = 3; break;
        default:
            return;
    }
    const pl = e.player.getNameTag();
    // Get player's team otherwise eliminate (just in case)
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl)) plTeam = index });
    if (plTeam === -1) {
        eliminate(e.player)
        return
    };

    // If player breaks his own bed
    if (bed === plTeam) {
        bedrockServer.executeCommand(`tellraw "${pl}" ${rawtext("You can't break your own bed! (u stoopid or what?)", LogInfo.error)}`);
        return CANCEL;
    }

    // Team's bed was broken
    bedBreak(pl, bed);
    return;
}

const playerAttackLis = (e: PlayerAttackEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const pl = e.player;
    const victim = e.victim;

    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl.getNameTag())) plTeam = index });
    let victimTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(victim.getNameTag())) victimTeam = index });
    if (plTeam === -1 || victimTeam === -1) return;

    // Player attacking his own team
    if (plTeam === victimTeam) return CANCEL;
}

const playerJoinLis = (e: PlayerJoinEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const pl = e.player;
    const plName = pl.getNameTag();
    pl.kill();
    bedrockServer.executeCommand(`tellraw "${plName}" ${rawtext("§7You were killed do to reconnecting.")}`);
    bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`${plName} §7reconnected.`));
}
const playerLeftLis = (e: PlayerLeftEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const plName = e.player.getNameTag();
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(plName)) plTeam = index });
    if (plTeam === -1) return;
    if (!teams[plTeam].bed) teams[plTeam].pls.splice(teams[plTeam].pls.indexOf(plName), 1);
    isGameEnd();
}


function startListeners() {
    events.playerRespawn.on(playerRespawnLis);
    events.blockDestroy.on(blockDestroyLis);
    events.playerAttack.on(playerAttackLis);
    events.playerJoin.on(playerJoinLis);
    events.playerLeft.on(playerLeftLis);
}
function stopListeners() {
    events.playerRespawn.remove(playerRespawnLis);
    events.blockDestroy.remove(blockDestroyLis);
    events.playerAttack.remove(playerAttackLis);
    events.playerJoin.remove(playerJoinLis);
    events.playerLeft.remove(playerLeftLis);
}


events.serverClose.on(() => {
    genObj.serverClose();
    gameIntervalObj.stop();
})