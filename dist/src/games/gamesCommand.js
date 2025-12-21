"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const gamesHandler_1 = require("./gamesHandler");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("game")
        .setDescription("Play interactive games")
        .addStringOption((option) => option
        .setName("type")
        .setDescription("The type of game to play")
        .setRequired(true)
        .addChoices({ name: "Rock Paper Scissors", value: "rps" }, { name: "Coin Flip", value: "coinflip" }, { name: "Number Guess", value: "number" }, { name: "Leaderboard", value: "leaderboard" })),
    command: {
        name: "game",
        enabled: true,
        execute: async (interaction, args, client) => {
            if (!interaction.isChatInputCommand())
                return;
            const gameType = interaction.options.getString("type", true);
            const handler = new gamesHandler_1.GamesHandler(client);
            if (gameType === "leaderboard") {
                const leaderboard = await handler.getLeaderboard(interaction.guildId || "", 10);
                if (leaderboard.length === 0) {
                    return interaction.reply({
                        content: "📊 No players on the leaderboard yet!",
                        ephemeral: true
                    });
                }
                let leaderboardText = "🏆 **Games Leaderboard**\n\n";
                for (let i = 0; i < leaderboard.length; i++) {
                    const entry = leaderboard[i];
                    const user = await client.users.fetch(entry.userId).catch(() => null);
                    const username = user ? user.tag : `User ${entry.userId}`;
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
                    leaderboardText += `${medal} **${username}** - ${entry.points} points (${entry.gamesWon}/${entry.gamesPlayed} wins)\n`;
                }
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle("🎮 Games Leaderboard")
                    .setDescription(leaderboardText)
                    .setColor("#3498db")
                    .setTimestamp();
                return interaction.reply({ embeds: [embed] });
            }
            if (gameType === "rps") {
                const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("game_rps_rock")
                    .setLabel("Rock")
                    .setEmoji("🪨")
                    .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                    .setCustomId("game_rps_paper")
                    .setLabel("Paper")
                    .setEmoji("📄")
                    .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                    .setCustomId("game_rps_scissors")
                    .setLabel("Scissors")
                    .setEmoji("✂️")
                    .setStyle(discord_js_1.ButtonStyle.Primary));
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle("🪨📄✂️ Rock Paper Scissors")
                    .setDescription("Choose your move!")
                    .setColor("#3498db");
                return interaction.reply({
                    embeds: [embed],
                    components: [row]
                });
            }
            if (gameType === "coinflip") {
                const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setCustomId("game_coinflip_heads")
                    .setLabel("Heads")
                    .setEmoji("🪙")
                    .setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
                    .setCustomId("game_coinflip_tails")
                    .setLabel("Tails")
                    .setEmoji("🪙")
                    .setStyle(discord_js_1.ButtonStyle.Primary));
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle("🪙 Coin Flip")
                    .setDescription("Choose heads or tails!")
                    .setColor("#f39c12");
                return interaction.reply({
                    embeds: [embed],
                    components: [row]
                });
            }
            if (gameType === "number") {
                const embed = new discord_js_1.EmbedBuilder()
                    .setTitle("🎲 Number Guess")
                    .setDescription("Guess a number between 1-100! Use the buttons below.")
                    .setColor("#9b59b6");
                const rows = [];
                for (let i = 0; i < 10; i++) {
                    const row = new discord_js_1.ActionRowBuilder();
                    for (let j = 0; j < 10; j++) {
                        const num = i * 10 + j + 1;
                        row.addComponents(new discord_js_1.ButtonBuilder()
                            .setCustomId(`game_number_${num}`)
                            .setLabel(num.toString())
                            .setStyle(discord_js_1.ButtonStyle.Secondary));
                    }
                    rows.push(row);
                }
                return interaction.reply({
                    embeds: [embed],
                    components: rows
                });
            }
        }
    }
};

