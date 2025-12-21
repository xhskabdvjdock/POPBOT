"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const levelingHandler_1 = require("./levelingHandler");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View the leveling leaderboard"),
    command: {
        name: "leaderboard",
        enabled: true,
        execute: async (interaction, args, client) => {
            if (!interaction.isChatInputCommand())
                return;
            const handler = new levelingHandler_1.LevelingHandler(client);
            const leaderboard = await handler.getLeaderboard(interaction.guildId || "", 10);
            if (leaderboard.length === 0) {
                return interaction.reply({
                    content: "📊 No users on the leaderboard yet!",
                    ephemeral: true
                });
            }
            let leaderboardText = "🏆 **Leveling Leaderboard**\n\n";
            for (let i = 0; i < leaderboard.length; i++) {
                const entry = leaderboard[i];
                const user = await client.users.fetch(entry.userId).catch(() => null);
                const username = user ? user.tag : `User ${entry.userId}`;
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
                leaderboardText += `${medal} **${username}** - Level ${entry.level} (${entry.xp.toLocaleString()} XP)\n`;
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("📊 Leveling Leaderboard")
                .setDescription(leaderboardText)
                .setColor("#3498db")
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
    }
};

