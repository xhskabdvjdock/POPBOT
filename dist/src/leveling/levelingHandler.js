"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLeveling = exports.LevelingHandler = void 0;
const discord_js_1 = require("discord.js");
const UserLevel_1 = require("../models/UserLevel");
// Canvas is optional - rank card generation can be done without it
class LevelingHandler {
    constructor(client) {
        this.client = client;
    }
    async addXP(message) {
        try {
            if (message.author.bot)
                return;
            if (!message.guild || !message.member)
                return;
            const settings = message.client.settings;
            if (!settings.leveling?.enabled)
                return;
            const levelingSettings = settings.leveling;
            // Check ignored channels
            if (levelingSettings.ignoredChannels?.includes(message.channel.id)) {
                return;
            }
            // Check cooldown
            const cooldownKey = `${message.guild.id}_${message.author.id}`;
            const lastXP = message.client.xpCooldown?.get(cooldownKey) || 0;
            const cooldown = (levelingSettings.cooldown || 60) * 1000;
            if (Date.now() - lastXP < cooldown) {
                return;
            }
            message.client.xpCooldown = message.client.xpCooldown || new Map();
            message.client.xpCooldown.set(cooldownKey, Date.now());
            // Get or create user level
            let userLevel = await UserLevel_1.UserLevel.findOne({
                userId: message.author.id,
                guildId: message.guild.id
            });
            if (!userLevel) {
                userLevel = new UserLevel_1.UserLevel({
                    userId: message.author.id,
                    guildId: message.guild.id,
                    xp: 0,
                    level: 1
                });
            }
            // Add XP
            const xpGain = levelingSettings.xpPerMessage || 15;
            const randomXP = Math.floor(Math.random() * (xpGain + 5)) + xpGain;
            userLevel.xp += randomXP;
            // Check for level up
            const oldLevel = userLevel.level;
            const newLevel = this.calculateLevel(userLevel.xp);
            if (newLevel > oldLevel) {
                userLevel.level = newLevel;
                await this.handleLevelUp(message.member, oldLevel, newLevel, levelingSettings);
            }
            await userLevel.save();
        }
        catch (error) {
            console.error("Error adding XP:", error);
        }
    }
    calculateLevel(xp) {
        // Formula: XP = 5 × (level²) + (50 × level) + 100
        // Solving for level: level = (-50 + sqrt(2500 + 20*(XP - 100))) / 10
        if (xp < 100) return 1;
        const discriminant = 2500 + 20 * (xp - 100);
        if (discriminant < 0) return 1;
        const level = Math.floor((-50 + Math.sqrt(discriminant)) / 10);
        return Math.max(1, level);
    }
    calculateXPForLevel(level) {
        // Formula: XP = 5 × (level²) + (50 × level) + 100
        return 5 * (level * level) + (50 * level) + 100;
    }
    async handleLevelUp(member, oldLevel, newLevel, settings) {
        try {
            // Send level up message
            if (settings.levelUpChannel) {
                const channel = await member.guild.channels.fetch(settings.levelUpChannel);
                if (channel && channel.type === discord_js_1.ChannelType.GuildText) {
                    const embed = new discord_js_1.EmbedBuilder()
                        .setTitle("🎉 Level Up!")
                        .setDescription(`${member} has reached level **${newLevel}**!`)
                        .setColor("#3498db")
                        .setThumbnail(member.user.displayAvatarURL({ size: 1024 }))
                        .setTimestamp();
                    await channel.send({ embeds: [embed] });
            }
            }
            // Assign auto roles
            if (settings.autoRoles) {
                for (const roleConfig of settings.autoRoles) {
                    if (newLevel >= roleConfig.level) {
                        const role = await member.guild.roles.fetch(roleConfig.roleId);
                        if (role && !member.roles.cache.has(role.id)) {
                            await member.roles.add(role, `Level ${newLevel} reward`);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error("Error handling level up:", error);
        }
    }
    async generateRankCard(user, userLevel, settings) {
        // Rank card generation - can be enhanced with canvas library if needed
        // For now, we'll use embed-based rank display
        return null;
    }
    async getLeaderboard(guildId, limit = 10) {
        try {
            const leaderboard = await UserLevel_1.UserLevel.find({ guildId })
                .sort({ xp: -1 })
                .limit(limit)
                .exec();
            return leaderboard;
        }
        catch (error) {
            console.error("Error getting leaderboard:", error);
            return [];
        }
    }
    async getUserLevel(userId, guildId) {
        try {
            const userLevel = await UserLevel_1.UserLevel.findOne({ userId, guildId });
            return userLevel || { xp: 0, level: 1 };
        }
        catch (error) {
            console.error("Error getting user level:", error);
            return { xp: 0, level: 1 };
        }
    }
}
exports.LevelingHandler = LevelingHandler;
async function handleLeveling(message) {
    const handler = new LevelingHandler(message.client);
    await handler.addXP(message);
}
exports.handleLeveling = handleLeveling;

