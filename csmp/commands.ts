import { CommandPermissionLevel, PlayerCommandSelector } from "bdsx/bds/command";
import { command } from "bdsx/command";
import { bedrockServer } from "bdsx/launcher";
import { isGameRunning, startGame, startGameLeaders } from "./ctf";
import { logPrefix } from "..";

const fs = require('fs');
const path = require('path');

command.register("ctf", "Start the capture the flag game", CommandPermissionLevel.Operator)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (bedrockServer.level.getActivePlayerCount() !== 2) return output.error("You need 2 people to start!");
        if (isGameRunning) return output.error("A game is already running!");
        startGame();
    },
    {
        option: command.enum("option.start", "start"),
    },
)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (bedrockServer.level.getActivePlayerCount() < 3) return output.error("You need at least 3 people to start!");
        if (isGameRunning) return output.error("A game is already running!");
        if (!param.leader1 || !param.leader2) return output.error("Select 2 online players!");
        if (param.leader1 === param.leader2) return output.error("Select 2 different players!");
        if (!param.leader1.isExplicitIdSelector || !param.leader2.isExplicitIdSelector) return output.error("Select a single player for each leader!");
        const pl1 = param.leader1.getName();
        const pl2 = param.leader2.getName();
        console.log(pl1 + "\n" + pl2);
        startGameLeaders(pl1, pl2);
    },
    {
        option: command.enum("option.start", "start"),
        leaders: command.enum("leaders.leaders", "leaders"),
        leader1: [PlayerCommandSelector, true],
        leader2: [PlayerCommandSelector, true],
    },
)
.overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        if (!isGameRunning) return output.error("No game is even running");

        const worldsPath = path.join(process.cwd(), "worlds");
        try {
            console.log(logPrefix + "Starting copy...");
            fs.cpSync(path.join(worldsPath, "CSMP_backup"), path.join(worldsPath, "CSMP"), {
              recursive: true,
              force: true
            });
            console.log(logPrefix + "Ended copy, closing server...");
            bedrockServer.stop();

          } catch (error) {
            console.log(error.message);
        }
    },
    {
        option: command.enum("option.reset", "reset")
    },
);

command.register("test", "the csmp test cmd", CommandPermissionLevel.Normal).overload(
    (param, origin, output) => {
        const actor = origin.getEntity();
        if (!actor?.isPlayer()) return;

        actor.runCommand('tellraw @a {"rawtext":[{"text":"AAAAAAAA"}]}');

        /*
        ItemStack<[ItemStackNetId: [TypedServerNetId: 13]] 1 x Lodestone Compass(615)@0> {
  vftable: VoidPointer { 0x00007FF676A774C0 },
  item: Item {},
  userData: CompoundTag { 'trackingHandle' => IntTag 1 },
  block: null,
  aux: 0,
  amount: 1,
  valid: true,
  pickupTime: '�湨䑤\u0000',
  showPickup: true,
  canPlaceOn: CxxVector [],
  canDestroy: CxxVector [] }


CompoundTag { 'trackingHandle' => IntTag 1 }


INTTAG: lodestone number in the whole world! hardcorded coords?
        */
    },
    { }
)
