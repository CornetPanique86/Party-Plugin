"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("bdsx/bds/command");
const command_2 = require("bdsx/command");
const launcher_1 = require("bdsx/launcher");
const pvparena_1 = require("./pvparena");
command_2.command.register("pvparena", "Start the pvp arena game", command_1.CommandPermissionLevel.Operator)
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (launcher_1.bedrockServer.level.getActivePlayerCount() < 2)
        return output.error("You need at least 2 people to start!");
    if (pvparena_1.isGameRunning)
        return output.error("A game is already running!");
    (0, pvparena_1.startGame)();
}, {
    option: command_2.command.enum("option.start", "start"),
})
    .overload((param, origin, output) => {
    const actor = origin.getEntity();
    if (!(actor === null || actor === void 0 ? void 0 : actor.isPlayer()))
        return;
    if (!pvparena_1.isGameRunning)
        return output.error("No game is even running");
    (0, pvparena_1.stopGame)();
}, {
    option: command_2.command.enum("option.stop", "stop")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUEwRDtBQUMxRCwwQ0FBdUM7QUFDdkMsNENBQThDO0FBQzlDLHlDQUFnRTtBQUVoRSxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsMEJBQTBCLEVBQUUsZ0NBQXNCLENBQUMsUUFBUSxDQUFDO0tBQ3hGLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxRQUFRLEVBQUUsQ0FBQTtRQUFFLE9BQU87SUFFL0IsSUFBSSx3QkFBYSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUM7UUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztJQUNoSCxJQUFJLHdCQUFhO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDckUsSUFBQSxvQkFBUyxHQUFFLENBQUM7QUFDaEIsQ0FBQyxFQUNEO0lBQ0ksTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUM7Q0FDaEQsQ0FDSjtLQUNBLFFBQVEsQ0FDTCxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUU7SUFDdEIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ2pDLElBQUksQ0FBQyxDQUFBLEtBQUssYUFBTCxLQUFLLHVCQUFMLEtBQUssQ0FBRSxRQUFRLEVBQUUsQ0FBQTtRQUFFLE9BQU87SUFFL0IsSUFBSSxDQUFDLHdCQUFhO1FBQUUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDbkUsSUFBQSxtQkFBUSxHQUFFLENBQUM7QUFDZixDQUFDLEVBQ0Q7SUFDSSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQztDQUM5QyxDQUNKLENBQUMifQ==