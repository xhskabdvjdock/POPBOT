"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWelcome = void 0;
const discord_js_1 = require("discord.js");
async function handleWelcome(member) {
    try {
        const client = member.client;
        const settings = client.settings;
        if (!settings.welcome?.enabled) {
            return;
        }
        const welcomeSettings = settings.welcome;
        if (!welcomeSettings.channelId) {
            return;
        }
        const channel = await client.channels.fetch(welcomeSettings.channelId);
        if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
            return;
        }
        let embedData = welcomeSettings.embed || {
            title: "Welcome!",
            description: "Welcome to {server}, {user}!",
            color: "#3498db"
        };
        // Replace variables
        let title = embedData.title || "Welcome!";
        let description = embedData.description || "Welcome to {server}, {user}!";
        const memberCount = member.guild.memberCount;
        title = title
            .replace(/{user}/g, member.user.toString())
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, memberCount.toString());
        description = description
            .replace(/{user}/g, member.user.toString())
            .replace(/{server}/g, member.guild.name)
            .replace(/{memberCount}/g, memberCount.toString());
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(embedData.color || "#3498db")
            .setTimestamp();
        if (embedData.thumbnail) {
            embed.setThumbnail(embedData.thumbnail);
        }
        else {
            embed.setThumbnail(member.user.displayAvatarURL({ size: 1024 }));
        }
        if (embedData.image) {
            embed.setImage(embedData.image);
        }
        if (embedData.footer) {
            embed.setFooter({
                text: embedData.footer.text || "",
                iconURL: embedData.footer.iconURL || undefined
            });
        }
        if (embedData.timestamp !== false) {
            embed.setTimestamp();
        }
        await channel.send({
            content: welcomeSettings.message || undefined,
            embeds: [embed]
        });
    }
    catch (error) {
        console.error("Error handling welcome:", error);
    }
}
exports.handleWelcome = handleWelcome;

