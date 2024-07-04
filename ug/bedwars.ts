import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { countdownActionbar, getPlayerByName, spectate, spectateStop, startGame, stopGame } from "./utils";
import { Games, lobbyCoords } from ".";
import { EnchantmentNames } from "bdsx/bds/enchants";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { ItemStack } from "bdsx/bds/inventory";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { PlayerAttackEvent, PlayerJoinEvent, PlayerLeftEvent, PlayerRespawnEvent } from "bdsx/event_impl/entityevent";
import { Vec3 } from "bdsx/bds/blockpos";
import { ActorDamageCause, ActorDamageSource, DimensionId } from "bdsx/bds/actor";
import { BlockDestroyEvent, BlockPlaceEvent } from "bdsx/event_impl/blockevent";
import { BlockActor, BlockActorType, BlockSource } from "bdsx/bds/block";
import { GameType, Player } from "bdsx/bds/player";
import { nativeClass, nativeField } from "bdsx/nativeclass";
import { int32_t } from "bdsx/nativetype";
import { createCItemStack } from "../utils";


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
        origin.getEntity()?.isPlayer() ? origin.getEntity()!.runCommand("tellraw @s " +rawtext("Minimum 2 players to start", LogInfo.error))
                                       : output.error("Min 2 players to start");
        return;
    }
    try {
        const participants = await startGame(Games.bedwars, bedrockServer.level.getPlayers(), 15);
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
const teamNames = ["§cRed", "§9Blue", "§2Green", "§6Yellow"];
const teamSpawns = [[-1001, 68, -1035], [-1000, 68, -965], [-966, 68, -1000], [-1034, 68, -1000]];

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
    bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement disabled"); // block player movement

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
            armor.forEach((armorItem, index) => {
                player.setArmor(index, armorItem);
                armorItem.destruct();
            });
        })
    });

    scoreboardUpdate();

    clearMap();

    countdownActionbar(5, pls, false)
        .then(() => {
            // Clear/reset map
            bedrockServer.executeCommand("clone 116 20 112 116 20 113 -1000 68 -968"); // blue bed
            bedrockServer.executeCommand("clone 115 20 111 114 20 111 -1031 68 -1000"); // yellow bed
            bedrockServer.executeCommand("clone 116 20 110 116 20 109 -1001 68 -1032"); // red bed
            bedrockServer.executeCommand("clone 117 20 111 118 20 111 -969 68 -1000"); // lime bed

            bedrockServer.executeCommand("setblock -997 68 -969 chest [\"minecraft:cardinal_direction\"=\"south\"]"); // blue chest
            bedrockServer.executeCommand("setblock -1033 68 -996 chest [\"minecraft:cardinal_direction\"=\"west\"]"); // yellow chest
            bedrockServer.executeCommand("setblock -998 68 -1033 chest"); // red chest
            bedrockServer.executeCommand("setblock -970 68 -997 chest [\"minecraft:cardinal_direction\"=\"east\"]"); // lime chest

            bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled"); // let players move
            bedrockServer.executeCommand("gamemode s @a[tag=bedwars]");
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

async function clearMap() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §eClearing map...");
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
    ]
    const parts = ["blue-yellow", "yellow-red", "red-green", "green-blue"];
    const results: number[] = [];
    for (let i=0; i<fills.length; i++) {
        let fail = 0;
        for (const block of blocksToClear) {
            if (bedrockServer.executeCommand(`fill ${fills[i]} air replace ${block}`).result !== 1) fail++;
        }
        if (fail > 3) {
            results.push(i);
            bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext("Error while clearing map at quadrant " + parts[i], LogInfo.error));
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (results.length > 0) {
        if (results.length < 4) bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §2Cleared map with errors");
        await new Promise(resolve => setTimeout(resolve, 2000));
        bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §6Retrying to clear map...");
        let newResult = true;
        for (const fill of results) {
            let fail = 0;
            for (const block of blocksToClear) {
                if (bedrockServer.executeCommand(`fill ${fills[fill]} air replace ${block}`).result !== 1) fail++;
            }
            if (fail > 3) {
                newResult = false;
                bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext("Error while clearing map at quadrant " + parts[fill], LogInfo.error));
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (newResult) {
            bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §aCleared map");
        } else {
            bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §cFull map clear failed. Abandon ship");
        }
        return;
    }
    bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §aCleared map");
}

const scoreboardTitle = "§l§bBed§3Wars";

function scoreboardUpdate() {
    let scoreContent: string[] = [];
    teams.forEach((team, index) => {
        let str = "";
        team.bed ? str += "§l§a✓ " + teamNames[index] : str += "§l§4⨉ " + teamNames[index];
        team.pls.length === 0 ? str += "§r§7: §80/4" : str += "§r§7: §f" + team.pls.length + "§7/4";
        scoreContent.push(str);
    });
    bedrockServer.level.getPlayers().forEach(pl => {
        if (pl.hasTag("bedwars")) {
            const plName = pl.getNameTag();
            let plTeam = -1;
            teams.forEach((team, index) => { if (team.pls.includes(plName)) plTeam = index });
            if (plTeam === -1) return;
            let plScoreContent = [...scoreContent];
            plScoreContent[plTeam] += " §7YOU";
            pl.setFakeScoreboard(scoreboardTitle, plScoreContent);
        }
    });
}

function scoreboardStop() {
    bedrockServer.level.getPlayers().forEach(pl => {
        if (pl.hasTag("bedwars")) pl.removeFakeScoreboard();
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
    secEmerald: 1,
    secIron: 1,
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
        if (this.secIron === 2) {
            for (let i = 0; i < this.ironSpawns.length; i++) {
            const pos = Vec3.create(this.ironSpawns[i][0], this.ironSpawns[i][1], this.ironSpawns[i][2]);
            const itemActor = bedrockServer.level.getSpawner().spawnItem(
                this.blockSource!,
                this.iron_ingot,
                pos,
                0.25
            );
            itemActor.teleport(pos);
            }
            this.secIron = 0;
        }
        if (this.secEmerald === 30) {
            for (let i = 0; i < this.emeraldSpawns.length; i++) {
                const pos = Vec3.create(this.emeraldSpawns[i][0], this.emeraldSpawns[i][1], this.emeraldSpawns[i][2]);
                const itemActor = bedrockServer.level.getSpawner().spawnItem(
                    this.blockSource!,
                    this.emerald,
                    pos,
                    0.25
                );
                itemActor.teleport(pos);
            }
            this.secEmerald = 0;
        }
        this.secEmerald++;
        this.secIron++;
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
            if (!player.hasTag("bedwars")) continue;
            if (player.getPosition().y < 0) {
                if (!player.isAlive()) return;
                player.die(ActorDamageSource.create(ActorDamageCause.Void));
            }
            const plName = player.getNameTag();
            // Replace armor
            const armorNames = ["_helmet", "_chestplate", "_leggings", "_boots"];
            if (bedrockServer.executeCommand(`clear "${plName}" iron_chestplate`).result === 1) {
                // bedrockServer.executeCommand(`execute as "${plName}" run function bw_iron_armor`);
                bedrockServer.executeCommand(`tellraw "${plName}" ${rawtext("§l§d> §r§eEquipped §iIron §eArmor Set")}`);
                player.playSound("armor.equip_chain");
                const armor: ItemStack[] = [];
                for (let i = 0; i < armorNames.length; i++) {
                    const item = createCItemStack({
                        item: "minecraft:iron" + armorNames[i],
                        amount: 1,
                        data: 0,
                        name: "§r§iIron set",
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
                            "minecraft:item_lock": NBT.byte(1),
                            "minecraft:keep_on_death": NBT.byte(1)
                        }
                    }) as CompoundTag;
                    item.load(nbt);
                    armor.push(item);
                }
                armor.forEach((armorItem, index) => {
                    if (index !== 1) player.setArmor(index, armorItem);
                    armorItem.destruct();
                });
                continue;
            }
            if (bedrockServer.executeCommand(`clear "${plName}" diamond_chestplate`).result === 1) {
                bedrockServer.executeCommand(`tellraw "${plName}" ${rawtext("§l§d> §r§eEquipped §sDiamond §eArmor Set")}`);
                player.playSound("armor.equip_chain");
                const armor: ItemStack[] = [];
                for (let i = 0; i < armorNames.length; i++) {
                    const item = createCItemStack({
                        item: "minecraft:diamond" + armorNames[i],
                        amount: 1,
                        data: 0,
                        name: "§r§sDiamond set",
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
                            "minecraft:item_lock": NBT.byte(1),
                            "minecraft:keep_on_death": NBT.byte(1)
                        }
                    }) as CompoundTag;
                    item.load(nbt);
                    armor.push(item);
                }
                armor.forEach((armorItem, index) => {
                    if (index !== 1) player.setArmor(index, armorItem);
                    armorItem.destruct();
                });
                continue;
            }
        }
    },
    interval: 0 as unknown as NodeJS.Timeout,
    stop: function(){
        clearInterval(this.interval);
    }
}

function eliminate(pl: Player) {
    const plName = pl.getNameTag();
    console.log("called eliminate() for: " + plName);
    teams.forEach((team, index) => { if (team.pls.includes(plName)) {
        team.pls.splice(team.pls.indexOf(plName), 1);
        if (team.pls.length === 0)
            bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`§l${teamNames[index]} team §r§7is §celiminated!`, LogInfo.info));
    }});

    bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`${plName} §cwas eliminated. §l§2FINAL KILL!`));
    pl.removeTag("bedwars");
    pl.runCommand("clear");
    pl.runCommand("effect @s clear");
    spectate(pl);
    scoreboardUpdate();
    isGameEnd();
}
function respawn(pl: Player) {
    spectate(pl);

    const plName = pl.getNameTag();
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(plName)) plTeam = index });
    if (plTeam === -1) return;
    countdownActionbar(5, [plName], false, "§7Respawning...")
        .then(() => {
            spectateStop(pl, Vec3.create(teamSpawns[plTeam][0], teamSpawns[plTeam][1], teamSpawns[plTeam][2]));
            pl.setGameType(GameType.Survival);
            pl.sendJukeboxPopup("§7§oYou are immune for §r§75 §7§oseconds.");
            pl.addTag("invulnerable");
            setTimeout(() => {
                pl.removeTag("invulnerable");
                pl.sendJukeboxPopup("§7§oYou are no longer immune.");
            }, 5000);
        })
        .catch(err => console.log(err.message));
}
function bedBreak(pl: string, team: number) {
    teams[team].bed = false;
    scoreboardUpdate();
    bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`§l${teamNames[team]} bed §r§7was broken by §r${pl}§7!`, LogInfo.info));
    bedrockServer.level.getPlayers().forEach(player => {
        if (!player.hasTag("bedwars")) return;
        player.playSound("mob.enderdragon.growl", player.getPosition(), 0.1);
        if (teams[team].pls.includes(player.getNameTag())) player.sendTitle("§r", "§7>> §fBED §cDESTROYED §7<<");
    });
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
    console.log("step 1: remainingTeams = " + remainingTeams);
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
    console.log("step 2: lastTeam = " + lastTeam);
    if (lastTeam === -1) return;

    // If beds remaining, it means a team has a bed but no players = still alive
    let beds = 0;
    teams.forEach((team, index) => {
        if (team.bed && index !== lastTeam) beds++;
    });
    console.log("step 3: beds = " + beds);
    if (beds > 0) return;

    // isGameEnd = TRUE
    end(lastTeam);
}

function end(w: number) {
    console.log("called end()");
    let winners: string[] = [];
    let winnersStr = "";
    teams[w].pls.forEach((winner, index) => {
        winners.push(winner);
        index === teams[w].pls.length - 1 ? winnersStr += winner : winnersStr += winner + ", ";
        bedrockServer.executeCommand(`playanimation "${winner}" animation.player.wincelebration a`);
    });
    bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`
§7==================
        §l§aVICTORY
 ${teamNames[w]}§r§7: §f${winnersStr}
§7==================
    `));
    for (const winner of winners) {
        const pl = getPlayerByName(winner);
        pl?.playSound("mob.pillager.celebrate", lobbyCoords);
    }
    bedrockServer.executeCommand("tellraw @a " + rawtext(`§a§l${winnersStr} §r§awon a game of §2Bedwars§a!`));
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
        if (team.pls.includes(pl.getNameTag()) && !team.bed) isPlEliminated = true;
    });

    // Wait for player to be properly alive -> avoid bugs
    (async () => {
        while (!pl.isAlive()) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Tick delay to avoid server load
        }
        console.log("playerRespawnLis: player alive!")
        isPlEliminated ? eliminate(pl) : respawn(pl);
    })();
}
const blockDestroyLis = (e: BlockDestroyEvent) => {
    // BEDS data: red=14 ; blue=11 ; green=5 ; yellow=4
    if (!e.player.hasTag("bedwars")) return;

    const bl = e.blockSource.getBlock(e.blockPos).getName();
    if (bl === "minecraft:white_wool" || bl === "minecraft:oak_planks" || bl === "minecraft:end_stone" || bl === "minecraft:ladder") {
        return;
    }
    else if (e.blockSource.getBlockEntity(e.blockPos)?.getType() === BlockActorType.Bed) {
        const bedActor = e.blockSource.getBlockEntity(e.blockPos)!.as(BedBlockActor);
        let bed: number;
        // Check if bed color is of a team and give the correct team index
        switch (bedActor.color) {
            case BedColor.Red:
                bed = 0; break;
            case BedColor.Blue:
                bed = 1; break;
            case BedColor.Lime:
                bed = 2; break;
            case BedColor.Yellow:
                bed = 3; break;
            default:
                return CANCEL;
        }
        const pl = e.player;
        // Get player's team otherwise eliminate (just in case)
        let plTeam = -1;
        teams.forEach((team, index) => { if (team.pls.includes(pl.getNameTag())) plTeam = index });
        if (plTeam === -1) {
            eliminate(pl);
            return CANCEL;
        };

        // If player breaks his own bed
        if (bed === plTeam) {
            pl.sendMessage("§cYou can't break your own bed! (u stoopid or what?)");
            return CANCEL;
        }

        // Team's bed was broken
        bedBreak(pl.getNameTag(), bed);
        return;
    } else {
        return CANCEL;
    }
}
const blockPlaceLis = (e: BlockPlaceEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const bl = e.block.getName();
    if (bl === "minecraft:white_wool" || bl === "minecraft:oak_planks" || bl === "minecraft:end_stone" || bl === "minecraft:ladder") {
        const {x, y, z} = e.blockPos;
        if (x<-1048 || x>-945 || y<30 || y>100 || z<-1048 || z>-945) {
            e.player.sendMessage("§cOut of map bounds");
            return CANCEL;
        }
        return;
    }
    return CANCEL;
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

    if (victim.hasTag("invulnerable")) {
        pl.playSound("random.anvil_land", pl.getPosition(), 0.5);
        pl.sendActionbar("§cPlayer is on cooldown");
        return CANCEL;
    }
}

const playerJoinLis = (e: PlayerJoinEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const pl = e.player;
    if (pl.hasTag("spectator")) {
        const plSpawn = pl.getSpawnPosition();
        spectateStop(pl, Vec3.create(plSpawn.x, plSpawn.y, plSpawn.z));
        pl.setGameType(GameType.Survival);
        return;
    }
    (async () => {
        while (!pl.isPlayerInitialized()) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Tick delay to avoid server load
        }
        pl.die(ActorDamageSource.create(ActorDamageCause.Override));
        pl.sendMessage("§7You were killed do to reconnecting.");
        bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`${pl.getNameTag()} §7reconnected.`));
    })();
}
const playerLeftLis = (e: PlayerLeftEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const plName = e.player.getNameTag();
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(plName)) plTeam = index });
    if (plTeam === -1) return;
    if (!teams[plTeam].bed) teams[plTeam].pls.splice(teams[plTeam].pls.indexOf(plName), 1);
    scoreboardUpdate();
    isGameEnd();
}


function startListeners() {
    events.playerRespawn.on(playerRespawnLis);
    events.blockDestroy.on(blockDestroyLis);
    events.blockPlace.on(blockPlaceLis);
    events.playerAttack.on(playerAttackLis);
    events.playerJoin.on(playerJoinLis);
    events.playerLeft.on(playerLeftLis);
}
function stopListeners() {
    events.playerRespawn.remove(playerRespawnLis);
    events.blockDestroy.remove(blockDestroyLis);
    events.blockPlace.on(blockPlaceLis);
    events.playerAttack.remove(playerAttackLis);
    events.playerJoin.remove(playerJoinLis);
    events.playerLeft.remove(playerLeftLis);
}


events.serverClose.on(() => {
    genObj.serverClose();
    gameIntervalObj.stop();
})