"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const levelingHandler_1 = require("./levelingHandler");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("rank")
        .setDescription("View your level and rank")
        .addUserOption((option) => option
        .setName("user")
        .setDescription("The user to check (optional)")
        .setRequired(false)),
    command: {
        name: "rank",
        enabled: true,
        execute: async (interaction, args, client) => {
            if (!interaction.isChatInputCommand())
                return;
            const targetUser = interaction.options.getUser("user") || interaction.user;
            const handler = new levelingHandler_1.LevelingHandler(client);
            const userLevel = await handler.getUserLevel(targetUser.id, interaction.guildId || "");
            const xpForNextLevel = handler.calculateXPForLevel(userLevel.level + 1);
            const xpForCurrentLevel = handler.calculateXPForLevel(userLevel.level);
            const progress = ((userLevel.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(`${targetUser.tag}'s Rank`)
                .setThumbnail(targetUser.displayAvatarURL({ size: 1024 }))
                .addFields({
                name: "Level",
                value: userLevel.level.toString(),
                inline: true
            }, {
                name: "XP",
                value: `${userLevel.xp.toLocaleString()} XP`,
                inline: true
            }, {
                name: "Progress to Next Level",
                value: `${Math.round(progress)}% (${userLevel.xp - xpForCurrentLevel} / ${xpForNextLevel - xpForCurrentLevel} XP)`,
                inline: false
            })
                .setColor("#3498db")
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
    }
};

