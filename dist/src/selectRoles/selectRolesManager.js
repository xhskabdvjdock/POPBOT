"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectRolesManager = void 0;
const discord_js_1 = require("discord.js");
class SelectRolesManager {
    constructor(client) {
        this.client = client;
    }
    async handleInteraction(interaction) {
        if (interaction.isButton() && interaction.customId.startsWith("rolerole_")) {
            await this.handleButtonInteraction(interaction);
            return;
        }
        if (interaction.isStringSelectMenu() && interaction.customId.startsWith("selectroles_")) {
            await this.handleSelectMenuInteraction(interaction);
            return;
        }
    }
    async handleButtonInteraction(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });
            const settings = this.client.settings;
            if (!settings.selectRoles?.enabled) {
                return interaction.editReply({
                    content: "❌ Select Roles system is disabled."
                });
            }
            const roleId = interaction.customId.replace("rolerole_", "");
            const buttonConfig = settings.selectRoles.buttons?.find((b) => b.roleId === roleId);
            if (!buttonConfig) {
                return interaction.editReply({
                    content: "❌ This role button was not found."
                });
            }
            const member = interaction.member;
            if (!member || !(member instanceof discord_js_1.GuildMember)) {
                return interaction.editReply({
                    content: "❌ Could not find member."
                });
            }
            const role = await interaction.guild?.roles.fetch(roleId);
            if (!role || !role.editable) {
                return interaction.editReply({
                    content: "❌ Could not find or assign this role."
                });
            }
            if (member.roles.cache.has(roleId)) {
                await member.roles.remove(role, "Role button clicked");
                await interaction.editReply({
                    content: `✅ Removed role **${role.name}**`
                });
            }
            else {
                await member.roles.add(role, "Role button clicked");
                await interaction.editReply({
                    content: `✅ Added role **${role.name}**`
                });
            }
        }
        catch (error) {
            console.error("Error handling button interaction:", error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({
                    content: "❌ An error occurred while updating roles."
                });
            }
        }
    }
    async handleSelectMenuInteraction(interaction) {
        if (!interaction.isStringSelectMenu())
            return;
        try {
            await interaction.deferReply({ ephemeral: true });
            const settings = this.client.settings;
            if (!settings.selectRoles?.enabled) {
                return interaction.editReply({
                    content: "❌ Select Roles system is disabled."
                });
            }
            const menuId = interaction.customId.replace("selectroles_", "");
            const menuConfig = settings.selectRoles.menus?.find((m) => m.id === menuId);
            if (!menuConfig) {
                return interaction.editReply({
                    content: "❌ This role menu was not found."
                });
            }
            const selectedRoleIds = interaction.values;
            const member = interaction.member;
            if (!member || !(member instanceof discord_js_1.GuildMember)) {
                return interaction.editReply({
                    content: "❌ Could not find member."
                });
            }
            const rolesToAdd = [];
            const rolesToRemove = [];
            // Get all roles from this menu
            const allMenuRoleIds = menuConfig.roles || [];
            // Remove roles not selected
            for (const roleId of allMenuRoleIds) {
                if (member.roles.cache.has(roleId)) {
                    if (!selectedRoleIds.includes(roleId)) {
                        rolesToRemove.push(roleId);
                    }
                }
            }
            // Add selected roles
            for (const roleId of selectedRoleIds) {
                if (!allMenuRoleIds.includes(roleId)) {
                    continue; // Role not in this menu
                }
                if (!member.roles.cache.has(roleId)) {
                    rolesToAdd.push(roleId);
                }
            }
            // Check for conflicting roles
            if (menuConfig.exclusive && selectedRoleIds.length > 1) {
                return interaction.editReply({
                    content: `❌ This menu only allows selecting one role at a time.`
                });
            }
            // Apply role changes
            let addedCount = 0;
            let removedCount = 0;
            for (const roleId of rolesToAdd) {
                try {
                    const role = await interaction.guild?.roles.fetch(roleId);
                    if (role && role.editable) {
                        await member.roles.add(role);
                        addedCount++;
                    }
                }
                catch (error) {
                    console.error(`Error adding role ${roleId}:`, error);
                }
            }
            for (const roleId of rolesToRemove) {
                try {
                    const role = await interaction.guild?.roles.fetch(roleId);
                    if (role && role.editable) {
                        await member.roles.remove(role);
                        removedCount++;
                    }
                }
                catch (error) {
                    console.error(`Error removing role ${roleId}:`, error);
                }
            }
            let message = "✅ Roles updated successfully!";
            if (addedCount > 0 && removedCount > 0) {
                message = `✅ Added ${addedCount} role(s) and removed ${removedCount} role(s).`;
            }
            else if (addedCount > 0) {
                message = `✅ Added ${addedCount} role(s).`;
            }
            else if (removedCount > 0) {
                message = `✅ Removed ${removedCount} role(s).`;
            }
            await interaction.editReply({ content: message });
        }
        catch (error) {
            console.error("Error handling select roles interaction:", error);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({
                    content: "❌ An error occurred while updating roles."
                });
            }
        }
    }
    async sendRoleButtons(channel) {
        try {
            const settings = this.client.settings;
            if (!settings.selectRoles?.enabled) {
                throw new Error("Select Roles system is disabled.");
            }
            const buttons = settings.selectRoles.buttons || [];
            if (buttons.length === 0) {
                throw new Error("No role buttons configured. Please configure them in the dashboard first.");
            }
            const buttonComponents = [];
            for (const buttonConfig of buttons) {
                const role = await channel.guild.roles.fetch(buttonConfig.roleId).catch(() => null);
                if (!role) continue;
                const button = new discord_js_1.ButtonBuilder()
                    .setCustomId(`rolerole_${buttonConfig.roleId}`)
                    .setLabel(buttonConfig.label || role.name)
                    .setStyle(discord_js_1.ButtonStyle.Secondary);
                if (buttonConfig.emoji) {
                    button.setEmoji(buttonConfig.emoji);
                }
                buttonComponents.push(button);
            }
            if (buttonComponents.length === 0) {
                throw new Error("No valid roles found for buttons.");
            }
            const rows = [];
            for (let i = 0; i < buttonComponents.length; i += 5) {
                const row = new discord_js_1.ActionRowBuilder().addComponents(buttonComponents.slice(i, i + 5));
                rows.push(row);
            }
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle("Select Roles")
                .setDescription("Click the buttons below to add or remove roles.")
                .setColor("#3498db");
            await channel.send({
                embeds: [embed],
                components: rows
            });
        }
        catch (error) {
            console.error("Error sending role buttons:", error);
            throw error;
        }
    }
    async sendRoleMenu(channel, menuId) {
        try {
            const settings = this.client.settings;
            if (!settings.selectRoles?.enabled) {
                throw new Error("Select Roles system is disabled.");
            }
            const menuConfig = settings.selectRoles.menus?.find((m) => m.id === menuId);
            if (!menuConfig) {
                throw new Error(`Menu with ID ${menuId} not found.`);
            }
            const roles = menuConfig.roles || [];
            if (roles.length === 0) {
                throw new Error("No roles configured for this menu.");
            }
            const roleOptions = [];
            for (const roleId of roles) {
                const role = await channel.guild.roles.fetch(roleId);
                if (role) {
                    roleOptions.push({
                        label: role.name,
                        value: roleId,
                        description: menuConfig.descriptions?.[roleId] || undefined,
                        emoji: menuConfig.emojis?.[roleId] || undefined
                    });
                }
            }
            if (roleOptions.length === 0) {
                throw new Error("No valid roles found.");
            }
            const selectMenu = new discord_js_1.StringSelectMenuBuilder()
                .setCustomId(`selectroles_${menuId}`)
                .setPlaceholder(menuConfig.placeholder || "Select roles...")
                .setMinValues(menuConfig.exclusive ? 1 : menuConfig.minValues || 0)
                .setMaxValues(menuConfig.exclusive ? 1 : menuConfig.maxValues || roleOptions.length)
                .addOptions(roleOptions);
            const embed = new discord_js_1.EmbedBuilder()
                .setTitle(menuConfig.title || "Select Roles")
                .setDescription(menuConfig.description || "Choose your roles from the menu below.")
                .setColor(menuConfig.color || "#3498db");
            if (menuConfig.thumbnail) {
                embed.setThumbnail(menuConfig.thumbnail);
            }
            if (menuConfig.image) {
                embed.setImage(menuConfig.image);
            }
            const row = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
            await channel.send({
                embeds: [embed],
                components: [row]
            });
        }
        catch (error) {
            console.error("Error sending role menu:", error);
            throw error;
        }
    }
}
exports.SelectRolesManager = SelectRolesManager;

