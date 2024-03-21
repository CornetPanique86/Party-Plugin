import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { countdownActionbar, createCItemStack, getPlayerByName, spectate, spectateStop, startGame, stopGame } from "./utils";
import { Games, lobbyCoords } from ".";
import { EnchantmentNames } from "bdsx/bds/enchants";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { ItemStack } from "bdsx/bds/inventory";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { PlayerAttackEvent, PlayerJoinEvent, PlayerLeftEvent, PlayerRespawnEvent } from "bdsx/event_impl/entityevent";
import { BlockPos, Vec3 } from "bdsx/bds/blockpos";
import { Actor, ActorDamageCause, ActorDamageSource, ActorDefinitionIdentifier, ActorFlags, DimensionId } from "bdsx/bds/actor";
import { BlockDestroyEvent } from "bdsx/event_impl/blockevent";
import { Block, BlockActor, BlockActorType, BlockSource } from "bdsx/bds/block";
import { Player } from "bdsx/bds/player";
import { nativeClass, nativeField } from "bdsx/nativeclass";
import { int32_t } from "bdsx/nativetype";
import { MobEffectIds, MobEffectInstance } from "bdsx/bds/effects";


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

    clearMap2();

    countdownActionbar(5, pls, false)
        .then(() => {
            // Clear/reset map
            bedrockServer.executeCommand("clone 116 20 112 116 20 113 -1000 68 -968"); // blue bed
            bedrockServer.executeCommand("clone 115 20 111 114 20 111 -1031 68 -1000"); // yellow bed
            bedrockServer.executeCommand("clone 116 20 110 116 20 109 -1001 68 -1032"); // red bed
            bedrockServer.executeCommand("clone 117 20 111 118 20 111 -969 68 -1000"); // lime bed
            bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled");

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
            bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while finishing to setup bedwars"), LogInfo.error}`);
            console.log(error.message);
            return;
        });
}

export async function clearMap2() {
    bedrockServer.executeCommand("title @a[tag=bedwars] actionbar §eClearing map... §7(lag expected)");
    const air = Block.create("minecraft:air")!;
    const blocks = [
        Block.create("minecraft:white_wool")!,
        Block.create("minecraft:oak_planks")!,
        Block.create("minecraft:end_stone")!,
        Block.create("minecraft:ladder")!
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
        bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`Couldn't clear the map: 1 million blocks max! ${deltaX}x${deltaY}x${deltaZ} => ${totalBlocks}`, LogInfo.error));
        return;
    }

    const region = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource();
    if (!region) {
        bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext("Couldn't clear the map: region undefined", LogInfo.error));
        return;
    }

    // Fill the region with the specified block
    const sourceX = Math.min(fromCoordsX, toCoordsX),
          destX = Math.max(fromCoordsX, toCoordsX),
          sourceY = Math.min(fromCoordsY, toCoordsY),
          destY = Math.max(fromCoordsY, toCoordsY),
          sourceZ = Math.min(fromCoordsZ, toCoordsZ),
          destZ = Math.max(fromCoordsZ, toCoordsZ);
    let clearedBlocksCounter = 0;
    for (let x = sourceX; x <= destX; x++) {
        for (let y = sourceY; y <= destY; y++) {
            for (let z = sourceZ; z <= destZ; z++) {
                const blockPos = BlockPos.create(x, y, z);
                for (const block of blocks) {
                    if (region.getBlock(blockPos).equals(block)) {
                        region.setBlock(blockPos, air);
                        clearedBlocksCounter++;
                        break;
                    };
                }
            }
        }
    }
    bedrockServer.executeCommand(`title @a[tag=bedwars] actionbar §aCleared §l${clearedBlocksCounter} §r§ablocks`);

    console.log(`Cleared region from (${fromCoordsX}, ${fromCoordsY}, ${fromCoordsZ}) to (${toCoordsX}, ${toCoordsY}, ${toCoordsZ}) with ${totalBlocks} blocks.`);
}

export async function clearMap() {
    const pos = {
        x: -1038.5,
        y: 99,
        z: -1038.5
    }
    const offset = {
        x: 39,
        y: -21,
        z: 39
    }

    const level = bedrockServer.level;
    const region = level.getDimension(DimensionId.Overworld)?.getBlockSource();
    if (!region) {
        bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext("Couldn't clear the map: region undefined", LogInfo.error));
        return;
    }
    const levelID = level.getNewUniqueID();
    const identifier = ActorDefinitionIdentifier.constructWith("minecraft:armor_stand");
    const armorStand = Actor.summonAt(region, Vec3.create(pos.x, pos.y, pos.z), identifier, levelID);
    identifier.destruct();
    if (armorStand === null) {
        bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext("Couldn't clear the map: armor stand returned null", LogInfo.error));
        return;
    }
    armorStand.setNameTag("clearMapArmorStand");
    armorStand.setStatusFlag(ActorFlags.NoAI, true);
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
            const pos = Vec3.create(this.ironSpawns[i][0], this.ironSpawns[i][1], this.ironSpawns[i][2]);
            const itemActor = bedrockServer.level.getSpawner().spawnItem(
                this.blockSource!,
                this.iron_ingot,
                pos,
                0.25
            );
            itemActor.teleport(pos);
        }
        if (this.sec === 10) {
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
        })
        .catch(err => console.log(err.message));
}
function bedBreak(pl: string, team: number) {
    teams[team].bed = false;
    bedrockServer.executeCommand("tellraw @a[tag=bedwars] " + rawtext(`§l${teamNames[team]} bed §r§7was broken by §r${pl}§7!`, LogInfo.info));
    bedrockServer.level.getPlayers().forEach(player => {
        if (!player.hasTag("bedwars")) return;
        player.playSound("mob.enderdragon.growl", undefined, 0.1);
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
        case BedColor.Lime:
            bed = 2; break;
        case BedColor.Yellow:
            bed = 3; break;
        default:
            return;
    }
    const pl = e.player;
    // Get player's team otherwise eliminate (just in case)
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl.getNameTag())) plTeam = index });
    if (plTeam === -1) {
        eliminate(pl);
        return;
    };

    // If player breaks his own bed
    if (bed === plTeam) {
        pl.runCommand("tellraw @s " +rawtext("You can't break your own bed! (u stoopid or what?)", LogInfo.error));
        return CANCEL;
    }

    // Team's bed was broken
    bedBreak(pl.getNameTag(), bed);
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