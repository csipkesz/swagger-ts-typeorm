"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenConfig = void 0;
exports.tokenConfig = {
    maxRemainingToken: 5,
    createAntiflood: {
        state: true,
        timeInMS: 250,
        availableToUse: function (lastTime) { return (Date.now() - lastTime) > this.timeInMS; }
    },
};
