"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const selectRolesManager_1 = require("./selectRolesManager");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("setup-roles")
        .setDescription("Send a role selection message with buttons"),
    command: {
        name: "setup-roles",
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
            const manager = new selectRolesManager_1.SelectRolesManager(client);
            try {
                await manager.sendRoleButtons(interaction.channel);
                await interaction.reply({
                    content: `✅ Role selection message sent successfully!`,
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
