"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLevel = void 0;
const mongoose_1 = require("mongoose");
const userLevelSchema = new mongoose_1.Schema({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
}, {
    timestamps: true
});
userLevelSchema.index({ userId: 1, guildId: 1 }, { unique: true });
userLevelSchema.index({ guildId: 1, xp: -1 });
exports.UserLevel = mongoose_1.models.UserLevel || (0, mongoose_1.model)("UserLevel", userLevelSchema);

