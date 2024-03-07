"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGameRunning = exports.Games = void 0;
// On server start
const __1 = require("..");
require("./commands");
var Games;
(function (Games) {
    Games["none"] = "None";
    Games["bedwars"] = "Bedwars";
    Games["hikabrain"] = "Hikabrain";
})(Games || (exports.Games = Games = {}));
exports.isGameRunning = {
    game: Games.none,
    isRunning: false
};
console.log(__1.logPrefix + "UG plugin loaded");
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrQkFBa0I7QUFDbEIsMEJBQStCO0FBQy9CLHNCQUFvQjtBQUVwQixJQUFZLEtBSVg7QUFKRCxXQUFZLEtBQUs7SUFDYixzQkFBYSxDQUFBO0lBQ2IsNEJBQW1CLENBQUE7SUFDbkIsZ0NBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQUpXLEtBQUsscUJBQUwsS0FBSyxRQUloQjtBQUtVLFFBQUEsYUFBYSxHQUFrQjtJQUN0QyxJQUFJLEVBQUUsS0FBSyxDQUFDLElBQUk7SUFDaEIsU0FBUyxFQUFFLEtBQUs7Q0FDbkIsQ0FBQztBQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBUyxHQUFHLGtCQUFrQixDQUFDLENBQUMifQ==