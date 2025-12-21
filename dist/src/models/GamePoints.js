"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePoints = void 0;
const mongoose_1 = require("mongoose");
const gamePointsSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    points: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 }
}, {
    timestamps: true
});
gamePointsSchema.index({ userId: 1, guildId: 1 }, { unique: true });
gamePointsSchema.index({ guildId: 1, points: -1 });
exports.GamePoints = mongoose_1.models.GamePoints || (0, mongoose_1.model)("GamePoints", gamePointsSchema);

