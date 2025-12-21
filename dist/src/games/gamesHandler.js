"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGameInteraction = exports.GamesHandler = void 0;
const discord_js_1 = require("discord.js");
const GamePoints_1 = require("../models/GamePoints");
class GamesHandler {
    constructor(client) {
        this.client = client;
    }
    async handleInteraction(interaction) {
        if (!interaction.isButton())
            return;
        if (!interaction.customId.startsWith("game_"))
            return;
        const gameType = interaction.customId.replace("game_", "");
        try {
            await interaction.deferReply({ ephemeral: true });
            switch (gameType) {
                case "rps":
                    await this.handleRockPaperScissors(interaction);
                    break;
                case "coinflip":
                    await this.handleCoinFlip(interaction);
                    break;
                case "number":
                    await this.handleNumberGuess(interaction);
                    break;
                default:
                    await interaction.editReply({
                        content: "❌ Unknown game type."
                    });
            }
        }
        catch (error) {
            console.error("Error handling game interaction:", error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({
                    content: "❌ An error occurred while playing the game."
                });
            }
        }
    }
    async handleRockPaperScissors(interaction) {
        const choices = ["rock", "paper", "scissors"];
        const userChoice = interaction.customId.split("_")[2];
        if (!choices.includes(userChoice)) {
            return interaction.editReply({
                content: "❌ Invalid choice."
            });
        }
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        let result = "tie";
        let points = 0;
        if (userChoice === "rock" && botChoice === "scissors") {
            result = "win";
            points = 10;
        }
        else if (userChoice === "paper" && botChoice === "rock") {
            result = "win";
            points = 10;
        }
        else if (userChoice === "scissors" && botChoice === "paper") {
            result = "win";
            points = 10;
        }
        else if (userChoice !== botChoice) {
            result = "lose";
            points = 0;
        }
        if (result === "win") {
            await this.addPoints(interaction.user.id, interaction.guildId || "", points);
        }
        const emojis = {
            rock: "🪨",
            paper: "📄",
            scissors: "✂️"
        };
        const resultMessages = {
            win: "🎉 You won!",
            lose: "😢 You lost!",
            tie: "🤝 It's a tie!"
        };
        await interaction.editReply({
            content: `${resultMessages[result]}\n\nYou chose: ${emojis[userChoice]} ${userChoice}\nBot chose: ${emojis[botChoice]} ${botChoice}\n\n${result === "win" ? `+${points} points!` : ""}`
        });
    }
    async handleCoinFlip(interaction) {
        const userChoice = interaction.customId.split("_")[2];
        const result = Math.random() < 0.5 ? "heads" : "tails";
        const won = userChoice === result;
        let points = 0;
        if (won) {
            points = 15;
            await this.addPoints(interaction.user.id, interaction.guildId || "", points);
        }
        await interaction.editReply({
            content: `${won ? "🎉 You won!" : "😢 You lost!"}\n\nYou chose: ${userChoice}\nResult: ${result}\n\n${won ? `+${points} points!` : ""}`
        });
    }
    async handleNumberGuess(interaction) {
        const userGuess = parseInt(interaction.customId.split("_")[2]);
        const targetNumber = Math.floor(Math.random() * 100) + 1;
        const difference = Math.abs(userGuess - targetNumber);
        let points = 0;
        if (difference === 0) {
            points = 50;
        }
        else if (difference <= 5) {
            points = 30;
        }
        else if (difference <= 10) {
            points = 20;
        }
        else if (difference <= 20) {
            points = 10;
        }
        if (points > 0) {
            await this.addPoints(interaction.user.id, interaction.guildId || "", points);
        }
        await interaction.editReply({
            content: `Your guess: ${userGuess}\nTarget number: ${targetNumber}\nDifference: ${difference}\n\n${points > 0 ? `+${points} points!` : "No points this time!"}`
        });
    }
    async addPoints(userId, guildId, points) {
        try {
            let userPoints = await GamePoints_1.GamePoints.findOne({ userId, guildId });
            if (!userPoints) {
                userPoints = new GamePoints_1.GamePoints({
                    userId,
                    guildId,
                    points: 0,
                    gamesPlayed: 0,
                    gamesWon: 0
                });
            }
            userPoints.points += points;
            userPoints.gamesPlayed += 1;
            if (points > 0) {
                userPoints.gamesWon += 1;
            }
            await userPoints.save();
        }
        catch (error) {
            console.error("Error adding points:", error);
        }
    }
    async getLeaderboard(guildId, limit = 10) {
        try {
            const leaderboard = await GamePoints_1.GamePoints.find({ guildId })
                .sort({ points: -1 })
                .limit(limit)
                .exec();
            return leaderboard;
        }
        catch (error) {
            console.error("Error getting leaderboard:", error);
            return [];
        }
    }
    async getUserPoints(userId, guildId) {
        try {
            const userPoints = await GamePoints_1.GamePoints.findOne({ userId, guildId });
            return userPoints || { points: 0, gamesPlayed: 0, gamesWon: 0 };
        }
        catch (error) {
            console.error("Error getting user points:", error);
            return { points: 0, gamesPlayed: 0, gamesWon: 0 };
        }
    }
}
exports.GamesHandler = GamesHandler;
async function handleGameInteraction(interaction) {
    const handler = new GamesHandler(interaction.client);
    await handler.handleInteraction(interaction);
}
exports.handleGameInteraction = handleGameInteraction;

