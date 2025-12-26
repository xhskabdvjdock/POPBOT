"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoLinesHandler = exports.handleAutoLines = void 0;
const discord_js_1 = require("discord.js");
class AutoLinesHandler {
    constructor(client) {
        this.client = client;
        this.timers = new Map();
    }
    start() {
        this.loadTimers();
        setInterval(() => {
            this.checkAndSendMessages();
        }, 60000); // Check every minute
    }
    async addDivider(message) {
        try {
            if (message.author.bot)
                return;
            if (!message.guild || !message.member)
                return;
            const settings = message.client.settings;
            if (!settings.autoLines?.enabled)
                return;
            const channel = message.channel;
            if (!channel || channel.type !== discord_js_1.ChannelType.GuildText)
                return;
            const autoLinesSettings = settings.autoLines;
            let dividerText = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
            if (autoLinesSettings.customFormat && autoLinesSettings.customFormat.trim()) {
                dividerText = autoLinesSettings.customFormat;
            }
            else if (autoLinesSettings.style) {
                switch (autoLinesSettings.style) {
                    case 'dashed':
                        dividerText = "┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅";
                        break;
                    case 'dotted':
                        dividerText = "┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈";
                        break;
                    case 'equals':
                        dividerText = "════════════════════════════════════════";
                        break;
                    case 'solid':
                    default:
                        dividerText = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
                        break;
                }
            }
            await channel.send(dividerText).catch(() => { });
        }
        catch (error) {
            console.error("Error adding auto line divider:", error);
        }
    }
    loadTimers() {
        const settings = this.client.settings;
        if (!settings.autoLines?.enabled) {
            return;
        }
        const autoLines = settings.autoLines.lines || [];
        for (const line of autoLines) {
            if (line.enabled && line.channelId && line.interval) {
                this.startTimer(line);
            }
        }
    }
    startTimer(line) {
        const timerId = `${line.channelId}_${line.id}`;
        if (this.timers.has(timerId)) {
            clearInterval(this.timers.get(timerId));
        }
        const interval = setInterval(async () => {
            await this.sendMessage(line);
        }, line.interval * 1000);
        this.timers.set(timerId, interval);
    }
    stopTimer(channelId, lineId) {
        const timerId = `${channelId}_${lineId}`;
        if (this.timers.has(timerId)) {
            clearInterval(this.timers.get(timerId));
            this.timers.delete(timerId);
        }
    }
    async sendMessage(line) {
        try {
            const channel = await this.client.channels.fetch(line.channelId);
            if (!channel || channel.type !== discord_js_1.ChannelType.GuildText) {
                return;
            }
            let content = line.message || "";
            // Replace variables
            if (line.guild) {
                const guild = await this.client.guilds.fetch(line.guild);
                content = content
                    .replace(/{server}/g, guild.name)
                    .replace(/{memberCount}/g, guild.memberCount.toString());
            }
            if (line.embed) {
                const embed = new discord_js_1.EmbedBuilder()
                    .setDescription(line.embed.description || "")
                    .setColor(line.embed.color || "#3498db");
                if (line.embed.title) {
                    embed.setTitle(line.embed.title);
                }
                if (line.embed.thumbnail) {
                    embed.setThumbnail(line.embed.thumbnail);
                }
                if (line.embed.image) {
                    embed.setImage(line.embed.image);
                }
                if (line.embed.footer) {
                    embed.setFooter({
                        text: line.embed.footer.text || "",
                        iconURL: line.embed.footer.iconURL || undefined
                    });
                }
                if (line.embed.timestamp !== false) {
                    embed.setTimestamp();
                }
                await channel.send({
                    content: content || undefined,
                    embeds: [embed]
                });
            }
            else {
                await channel.send(content);
            }
        }
        catch (error) {
            console.error("Error sending auto line:", error);
        }
    }
    async checkAndSendMessages() {
        const settings = this.client.settings;
        if (!settings.autoLines?.enabled) {
            return;
        }
        const autoLines = settings.autoLines.lines || [];
        for (const line of autoLines) {
            if (line.enabled && line.channelId && line.interval) {
                const timerId = `${line.channelId}_${line.id}`;
                if (!this.timers.has(timerId)) {
                    this.startTimer(line);
                }
            }
        }
    }
    reload() {
        // Clear all timers
        for (const timer of this.timers.values()) {
            clearInterval(timer);
        }
        this.timers.clear();
        // Reload
        this.loadTimers();
    }
}
exports.AutoLinesHandler = AutoLinesHandler;
async function handleAutoLines(message) {
    const handler = new AutoLinesHandler(message.client);
    await handler.addDivider(message);
}
exports.handleAutoLines = handleAutoLines;

