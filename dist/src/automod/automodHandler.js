"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAutoMod = void 0;
const discord_js_1 = require("discord.js");
const Warning_1 = require("../models/Warning");
async function handleAutoMod(message) {
    try {
        if (message.author.bot)
            return;
        if (!message.guild || !message.member)
            return;
        const settings = message.client.settings;
        if (!settings.autoMod?.enabled)
            return;
        const autoModSettings = settings.autoMod;
        // Check ignored roles and channels
        if (autoModSettings.ignoredRoles?.some((roleId) => message.member.roles.cache.has(roleId))) {
            return;
        }
        if (autoModSettings.ignoredChannels?.includes(message.channel.id)) {
            return;
        }
        // Word Filter
        if (autoModSettings.wordFilter?.enabled) {
            const filteredWords = autoModSettings.wordFilter.bannedWords || autoModSettings.wordFilter.words || [];
            if (filteredWords.length > 0) {
                const messageContent = autoModSettings.wordFilter.caseSensitive ? message.content : message.content.toLowerCase();
                const foundWord = filteredWords.find((word) => {
                    const searchWord = autoModSettings.wordFilter.caseSensitive ? word : word.toLowerCase();
                    return messageContent.includes(searchWord);
                });
                if (foundWord) {
                    await handlePunishment(message, autoModSettings.wordFilter.action || { type: "delete" }, "Word filter violation");
                    return;
                }
            }
        }
        // Anti-Spam
        if (autoModSettings.antiSpam?.enabled) {
            const spamData = message.client.spamData || new Map();
            const key = `${message.guild.id}_${message.author.id}`;
            const userMessages = spamData.get(key) || [];
            const now = Date.now();
            const recentMessages = userMessages.filter((msg) => now - msg.timestamp < (autoModSettings.antiSpam.timeWindow || 5000));
            if (recentMessages.length >= (autoModSettings.antiSpam.messageLimit || 5)) {
                await handlePunishment(message, autoModSettings.antiSpam.action, "Anti-spam violation");
                spamData.delete(key);
                return;
            }
            recentMessages.push({ timestamp: now, content: message.content });
            spamData.set(key, recentMessages);
            message.client.spamData = spamData;
        }
        // Anti-Link
        if (autoModSettings.antiLink?.enabled) {
            const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|discord\.gg\/[^\s]+)/gi;
            const matches = message.content.match(linkRegex);
            if (matches && matches.length > 0) {
                const whitelistedLinks = autoModSettings.antiLink.whitelistedLinks || [];
                const allowedRoles = autoModSettings.antiLink.allowedRoles || [];
                const hasPermission = message.member.roles.cache.some((role) => allowedRoles.includes(role.id));
                if (hasPermission) {
                    return;
                }
                const hasWhitelistedLink = matches.some((link) => {
                    return whitelistedLinks.some((whitelisted) => {
                        const pattern = whitelisted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
                        return new RegExp(pattern, 'i').test(link);
                    });
                });
                if (!hasWhitelistedLink) {
                    await handlePunishment(message, autoModSettings.antiLink.action || { type: "delete" }, "Link detected");
                    return;
                }
            }
        }
    }
    catch (error) {
        console.error("Error in AutoMod handler:", error);
    }
}
async function handlePunishment(message, action, reason) {
    try {
        const member = message.member;
        if (!member)
            return;
        switch (action.type) {
            case "warn":
                await addWarning(member, reason);
                await message.delete().catch(() => { });
                await message.channel.send({
                    content: `⚠️ ${member}, ${action.message || "Your message was deleted for violating server rules."}`
                }).then((msg) => setTimeout(() => msg.delete().catch(() => { }), 5000));
                break;
            case "mute":
                await member.timeout(action.duration || 600000, reason);
                await message.delete().catch(() => { });
                await message.channel.send({
                    content: `🔇 ${member} has been muted for ${action.duration ? `${action.duration / 1000 / 60} minutes` : "10 minutes"}.`
                }).then((msg) => setTimeout(() => msg.delete().catch(() => { }), 5000));
                break;
            case "kick":
                await member.kick(reason);
                await message.delete().catch(() => { });
                break;
            case "ban":
                await member.ban({ reason, deleteMessageDays: 1 });
                break;
            case "delete":
            default:
                await message.delete().catch(() => { });
                await message.channel.send({
                    content: `⚠️ ${member}, ${action.message || "Your message was deleted for violating server rules."}`
                }).then((msg) => setTimeout(() => msg.delete().catch(() => { }), 5000));
                break;
        }
    }
    catch (error) {
        console.error("Error applying punishment:", error);
    }
}
async function addWarning(member, reason) {
    try {
        const warning = new Warning_1.Warning({
            guildId: member.guild.id,
            userId: member.id,
            moderatorId: member.client.user?.id || "AutoMod",
            reason: reason,
            timestamp: new Date()
        });
        await warning.save();
    }
    catch (error) {
        console.error("Error adding warning:", error);
    }
}
exports.handleAutoMod = handleAutoMod;

