"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const { existsSync, readFileSync, writeFileSync } = require("fs");
const { join } = require("path");

const config = {
    token: process.env.TOKEN,                 // Discord Bot Token
    clientId: process.env.CLIENT_ID,           // Application ID
    mongoUri: process.env.MONGO_URI,           // MongoDB URI
    defaultPrefix: '!',
    mainGuildId: process.env.MAIN_GUILD_ID,    // Main Guild ID
    defaultLanguage: 'en',
    dashboard: {
        port: process.env.PORT || 3000,        // Railway PORT
        secret: process.env.DASHBOARD_SECRET || 'wickstudio',
        callbackUrl: process.env.CALLBACK_URL  // Railway callback URL
    }
};

function loadSettingsFile() {
    let settingsPath = join(__dirname, 'settings.json');

    if (!existsSync(settingsPath)) {
        settingsPath = join(__dirname, '../settings.json');

        if (!existsSync(settingsPath)) {
            settingsPath = join(process.cwd(), 'settings.json');

            if (!existsSync(settingsPath)) {
                const defaultSettings = {
                    defaultLanguage: "en",
                    logs: {},
                    protection: {
                        enabled: true,
                        modules: {}
                    }
                };

                writeFileSync(
                    settingsPath,
                    JSON.stringify(defaultSettings, null, 4),
                    'utf8'
                );

                console.log(`Created default settings file at ${settingsPath}`);
                return defaultSettings;
            }
        }
    }

    try {
        console.log(`Loading settings from: ${settingsPath}`);
        return JSON.parse(readFileSync(settingsPath, 'utf-8'));
    } catch (error) {
        console.error(`Error reading settings file: ${error}`);
        throw new Error('Failed to load settings.json file');
    }
}

const settings = loadSettingsFile();

exports.default = {
    ...config,
    ...settings,
    token: config.token,
    clientId: config.clientId,
    mongoUri: config.mongoUri,
    defaultPrefix: config.defaultPrefix,
    mainGuildId: config.mainGuildId,
    dashboard: config.dashboard
};
