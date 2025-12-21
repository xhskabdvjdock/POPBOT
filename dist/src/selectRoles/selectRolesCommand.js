"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const selectRolesManager_1 = require("./selectRolesManager");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("selectroles")
        .setDescription("Send a role selection menu")
        .addStringOption((option) => option
        .setName("menu_id")
        .setDescription("The ID of the role menu to send")
        .setRequired(true)),
    command: {
        name: "selectroles",
        enabled: true,
        execute: async (interaction, args, client) => {
            if (!interaction.isChatInputCommand())
                return;
            if (!interaction.memberPermissions?.has("ManageRoles")) {
                return interaction.reply({
                    content: "❌ You need the `ManageRoles` permission to use this command.",
                    ephemeral: true
                });
            }
            const menuId = interaction.options.getString("menu_id", true);
            const manager = new selectRolesManager_1.SelectRolesManager(client);
            try {
                await manager.sendRoleMenu(interaction.channel, menuId);
                await interaction.reply({
                    content: `✅ Role menu sent successfully!`,
                    ephemeral: true
                });
            }
            catch (error) {
                await interaction.reply({
                    content: `❌ Error: ${error.message}`,
                    ephemeral: true
                });
            }
        }
    }
};

