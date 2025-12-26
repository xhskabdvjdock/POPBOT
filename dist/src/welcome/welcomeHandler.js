"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWelcome = void 0;
const discord_js_1 = require("discord.js");
async function handleWelcome(member) {
    try {
        const client = member.client;
        const settings = client.settings;
        console.log('[Welcome] Checking welcome settings:', {
            enabled: settings.welcome?.enabled,
            hasChannelId: !!settings.welcome?.channelId,
            channelId: settings.welcome?.channelId
        });
        if (!settings.welcome?.enabled) {
            console.log('[Welcome] Welcome system is disabled');
            return;
        }
        const welcomeSettings = settings.welcome;
        if (!welcomeSettings.channelId) {
            console.log('[Welcome] No channel ID configured');
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
            .setColor(embedData.color || "#3498db");
        // Handle thumbnail
        if (embedData.thumbnail) {
            const thumbnailUrl = typeof embedData.thumbnail === 'string' ? embedData.thumbnail : embedData.thumbnail.url;
            if (thumbnailUrl && thumbnailUrl.trim()) {
                embed.setThumbnail(thumbnailUrl);
            } else {
                embed.setThumbnail(member.user.displayAvatarURL({ size: 1024 }));
            }
        } else {
            embed.setThumbnail(member.user.displayAvatarURL({ size: 1024 }));
        }
        // Handle image
        if (embedData.image) {
            const imageUrl = typeof embedData.image === 'string' ? embedData.image : embedData.image.url;
            if (imageUrl && imageUrl.trim()) {
                embed.setImage(imageUrl);
            }
        }
        // Handle footer
        if (embedData.footer) {
            const footerText = typeof embedData.footer === 'string' ? embedData.footer : embedData.footer.text;
            const footerIcon = typeof embedData.footer === 'object' ? embedData.footer.iconURL : undefined;
            if (footerText || footerIcon) {
                embed.setFooter({
                    text: footerText || "",
                    iconURL: footerIcon || undefined
                });
            }
        }
        // Handle timestamp
        if (embedData.timestamp !== false) {
            embed.setTimestamp();
        }
        console.log('[Welcome] Sending welcome message to channel:', channel.id);
        await channel.send({
            content: welcomeSettings.message || undefined,
            embeds: [embed]
        });
        console.log('[Welcome] Welcome message sent successfully');
    }
    catch (error) {
        console.error("[Welcome] Error handling welcome:", error);
    }
}
exports.handleWelcome = handleWelcome;

