import { CommandOutput } from "bdsx/bds/command";
import { CommandOrigin } from "bdsx/bds/commandorigin";
import { bedrockServer } from "bdsx/launcher";
import { LogInfo, rawtext } from "..";
import { Player } from "bdsx/bds/player";
import { countdownActionbar, createCItemStack, getPlayerByName, startGame, stopGame } from "./utils";
import { Games } from ".";
import { EnchantmentNames } from "bdsx/bds/enchants";
import { CompoundTag, NBT } from "bdsx/bds/nbt";
import { ItemStack } from "bdsx/bds/inventory";
import { events } from "bdsx/event";
import { CANCEL } from "bdsx/common";
import { PlayerJumpEvent } from "bdsx/event_impl/entityevent";
import { Vec3 } from "bdsx/bds/blockpos";
import { DimensionId } from "bdsx/bds/actor";

let genInterval: NodeJS.Timeout;

// /bedwarsstart command
export async function bedwarsstart(param: { option: string}, origin: CommandOrigin, output: CommandOutput) {
    // /bedwarsstart stop
    if (param.option === "stop") {
        clearInterval(genInterval);
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
        const participants = await startGame(Games.bedwars, bedrockServer.level.getPlayers(), 15);
        if (participants !== null) setup(participants);
    } catch (err) {
        bedrockServer.executeCommand(`tellraw @a ${rawtext("Error while starting bedwars", LogInfo.error)}`);
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
const teamColors = [-54000, 66000, 64000, -67000]

function setup(pls: string[]) {
    console.log(pls + "\n");
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
        bedrockServer.executeCommand(`tp "${pl}" -1001 68 -1035`)
        bedrockServer.executeCommand(`tp "${pl}" -1001 68 -1035`)
    });
    teams[1].pls.forEach(pl => bedrockServer.executeCommand(`tp "${pl}" -1000 68 -965`));
    teams[2].pls.forEach(pl => bedrockServer.executeCommand(`tp "${pl}" -966 68 -1000`));
    teams[3].pls.forEach(pl => bedrockServer.executeCommand(`tp "${pl}" -1034 68 -1000`));

    bedrockServer.executeCommand("clear @a[tag=bedwars]");
    bedrockServer.executeCommand("effect @a[tag=bedwars] clear");
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

    countdownActionbar(5, pls)
        .then(() => {
            bedrockServer.executeCommand("inputpermission set @a[tag=bedwars] movement enabled");
            gen();
            return;
        })
        .catch(error => {
            console.error(error.message);
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

function gen() {
    const blockSource = bedrockServer.level.getDimension(DimensionId.Overworld)?.getBlockSource(),
          iron_ingot = createCItemStack({ item: "minecraft:iron_ingot", amount: 1, data: 0 }),
          emerald = createCItemStack({ item: "minecraft:emerald", amount: 1, data: 0 }),
          ironSpawns = [[-1001, 68, -1038], [-1000, 68, -962], [-963, 68, -1000], [-1037, 68, -1000]],
          emeraldSpawns = [[-1001, 70, -1008], [-1007, 70, -1000], [-993, 70, -1001], [-1000, 70, -993]];

    if (!blockSource) return;

    let sec = 1;
    genInterval = setInterval(() => {
        for (let i = 0; i < 4; i++) {
            bedrockServer.level.getSpawner().spawnItem(
                blockSource,
                iron_ingot,
                Vec3.create(ironSpawns[i][0], ironSpawns[i][1], ironSpawns[i][2]),
                1
            );
        }
        if (sec === 10) {
            for (let i = 0; i < 4; i++) {
                bedrockServer.level.getSpawner().spawnItem(
                    blockSource,
                    emerald,
                    Vec3.create(emeraldSpawns[i][0], emeraldSpawns[i][1], emeraldSpawns[i][2]),
                    1
                );
            }
            sec = 0;
        }
        sec++;
    }, 1000);
}

events.serverClose.on(() => {
    clearInterval(genInterval);
})