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
import { PlayerAttackEvent, PlayerInventoryChangeEvent, PlayerRespawnEvent } from "bdsx/event_impl/entityevent";
import { Vec3 } from "bdsx/bds/blockpos";
import { DimensionId } from "bdsx/bds/actor";
import { BlockDestroyEvent } from "bdsx/event_impl/blockevent";
import { BlockSource } from "bdsx/bds/block";


// /bedwarsstart command
export async function bedwarsstart(param: { option: string }, origin: CommandOrigin, output: CommandOutput) {
    // /bedwarsstart stop
    if (param.option === "stop") {
        genObj.stop();
        stopGame();
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
        bedrockServer.executeCommand(`tp "${pl}" -1001 68 -1035`);
        bedrockServer.executeCommand(`spawnpoint "${pl}" -1001 68 -1035`);
    });
    teams[1].pls.forEach(pl => {
        bedrockServer.executeCommand(`tp "${pl}" -1000 68 -965`)
        bedrockServer.executeCommand(`spawnpoint "${pl}" -1000 68 -965`)
    });
    teams[2].pls.forEach(pl => {
        bedrockServer.executeCommand(`tp "${pl}" -966 68 -1000`)
        bedrockServer.executeCommand(`spawnpoint "${pl}" -966 68 -1000`)
    });
    teams[3].pls.forEach(pl => {
        bedrockServer.executeCommand(`tp "${pl}" -1034 68 -1000`)
        bedrockServer.executeCommand(`spawnpoint "${pl}" -1034 68 -1000`)
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
                    "minecraft:item_lock": NBT.byte(2),
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

    countdownActionbar(5, "", pls, false)
        .then(() => {
            // Clear/reset map
            bedrockServer.executeCommand("clone 116 20 112 116 20 113 -1000 68 -968"); // blue bed
            bedrockServer.executeCommand("clone 115 20 111 114 20 111 -1031 68 -1000"); // yellow bed
            bedrockServer.executeCommand("clone 116 20 110 116 20 109 -1001 68 -1032"); // red bed
            bedrockServer.executeCommand("clone 117 20 111 118 20 111 -969 68 -1000"); // lime bed
            bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled");
            genObj.gen();
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


function eliminate(pl: string) {
    return;
}
function respawn(pl: string) {
    return;
}
function bedBreak(pl: string, team: number) {
    return;
}

function end() {
    return;
}

// -------------
//   LISTENERS
// -------------

const playerRespawnLis = (e: PlayerRespawnEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const pl = e.player.getNameTag();

    let isPlEliminated = false;
    teams.forEach(team => {
        if (team.pls.includes(pl) && !team.bed) {
            isPlEliminated = true;
            eliminate(pl);
        }
    });
    if (!isPlEliminated) respawn(pl);
}
const blockDestroyLis = (e: BlockDestroyEvent) => {
    // BEDS data: red=14 ; blue=11 ; green=5 ; yellow=4
    if (!(e.player.hasTag("bedwars") && e.itemStack.getName() === "minecraft:bed")) return;
    let bed: number;
    // Check if bed color is of a team and give the correct team index
    switch (e.itemStack.getId()) {
        case 14:
            bed = 0; break;
        case 11:
            bed = 1; break;
        case 5:
            bed = 2; break;
        case 4:
            bed = 3; break;
        default:
            return;
    }
    const pl = e.player.getNameTag();
    // Get player's team otherwise eliminate (just in case)
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl)) plTeam = index });
    if (plTeam === -1) {
        eliminate(pl)
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

const playerInventoryChangeLis = (e: PlayerInventoryChangeEvent) => {
    if (!e.player.hasTag("bedwars")) return;
    const item = e.newItemStack;
    const pl = e.player;
    console.log(item.getName());
    // Clear beds
    if (item.getName() === "minecraft:bed") {
        item.destruct();
        pl.sendInventory();
        return;
    }

    // Replace armor
    const armorNames = ["_chestplate", "_leggings", "_boots"];
    const armorTrimColors = ["redstone", "lapis_lazuli", "emerald", "gold_ingot"];
    let plTeam = -1;
    teams.forEach((team, index) => { if (team.pls.includes(pl.getNameTag())) plTeam = index });
    if (plTeam === -1) return;

    if (item.getName() === "minecraft:diamond_chestplate") {
        const inv = pl.getInventory();
        const diamond_chestplate = createCItemStack({ item: "minecraft:diamond_chestplate" })
        inv.removeResource(diamond_chestplate);
        diamond_chestplate.destruct();
        pl.sendInventory();

        const armor: ItemStack[] = [];
        for (let i = 0; i < armorNames.length; i++) {
            const item = createCItemStack({
                item: "minecraft:diamond" + armorNames[i],
                amount: 1
            });
            const tag = item.save();
            const nbt = NBT.allocate({
                ...tag,
                tag: {
                    ...tag.tag,
                    "Trim": {
                        "Material": armorTrimColors[plTeam],
                        "Pattern": "wayfinder"
                    },
                    "minecraft:item_lock": NBT.byte(2),
                    "minecraft:keep_on_death": NBT.byte(1)
                }
            }) as CompoundTag;
            item.load(nbt);
            armor.push(item);
        }
        armor.forEach((armorItem, index) => pl.setArmor(index+1, armorItem));
        return;
    }
    if (item.getName() === "minecraft:iron_chestplate") {
        const inv = pl.getInventory();
        const iron_chestplate = createCItemStack({ item: "minecraft:iron_chestplate" })
        inv.removeResource(iron_chestplate);
        iron_chestplate.destruct();
        pl.sendInventory();

        const armor: ItemStack[] = [];
        for (let i = 0; i < 4; i++) {
            const item = createCItemStack({
                item: "minecraft:iron" + armorNames[i],
                amount: 1
            });
            const tag = item.save();
            const nbt = NBT.allocate({
                ...tag,
                tag: {
                    ...tag.tag,
                    "Trim": {
                        "Material": armorTrimColors[plTeam],
                        "Pattern": "wayfinder"
                    },
                    "minecraft:item_lock": NBT.byte(2),
                    "minecraft:keep_on_death": NBT.byte(1)
                }
            }) as CompoundTag;
            item.load(nbt);
            armor.push(item);
        }
        armor.forEach((armorItem, index) => pl.setArmor(index+1, armorItem));
        return;
    }
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

    // Player attacking invulnerable
    if (victim.hasTag("invulnerable")) {
        pl.playSound("hit.anvil", undefined, 0.5);
        pl.sendActionbar("§cPlayer is on cooldown")
        return CANCEL;
    }
}

function startListeners() {
    events.playerRespawn.on(playerRespawnLis);
    events.blockDestroy.on(blockDestroyLis);
    events.playerInventoryChange.on(playerInventoryChangeLis)
    events.playerAttack.on(playerAttackLis)
}


events.serverClose.on(() => {
    genObj.serverClose();
})