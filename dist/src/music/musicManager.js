"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicManager = void 0;

const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

class MusicManager {
    constructor(client) {
        this.client = client;
        this.guilds = new Map();
    }

    // Get or create guild data
    getGuildData(guildId) {
        if (!this.guilds.has(guildId)) {
            this.guilds.set(guildId, {
                connection: null,
                player: null,
                currentSong: null,
                queue: [],
                isLoop: false,
                isPaused: false,
                volume: 100
            });
        }
        return this.guilds.get(guildId);
    }

    // Check if YouTube link
    isYoutubeLink(content) {
        const patterns = [
            /https?:\/\/(?:www\.)?youtu\.be\/([^/?]+)/,
            /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/
        ];
        return patterns.some(pattern => pattern.test(content));
    }

    // Format duration
    formatDuration(seconds) {
        if (!seconds) return "LIVE 🟣";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Search YouTube
    async searchYoutube(query) {
        try {
            const searchResults = await ytsr(query, { limit: 5 });
            return searchResults.items.filter(item => item.type === 'video');
        } catch (error) {
            console.error('YouTube search error:', error);
            return [];
        }
    }

    // Get video info
    async getVideoInfo(url) {
        try {
            const info = await ytdl.getInfo(url);
            return {
                title: info.videoDetails.title,
                url: url,
                duration: parseInt(info.videoDetails.lengthSeconds),
                thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1]?.url,
                author: info.videoDetails.author.name
            };
        } catch (error) {
            console.error('Video info error:', error);
            return null;
        }
    }

    // Play song in voice channel
    async play(guildId, voiceChannelId, query, requestedBy = null) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) throw new Error('Guild not found');

        const voiceChannel = guild.channels.cache.get(voiceChannelId);
        if (!voiceChannel) throw new Error('Voice channel not found');

        const guildData = this.getGuildData(guildId);

        // Search for song if not a link
        let url = query;
        if (!this.isYoutubeLink(query)) {
            const results = await this.searchYoutube(query);
            if (results.length === 0) throw new Error('No results found');
            url = results[0].url;
        }

        // Get video info
        const videoInfo = await this.getVideoInfo(url);
        if (!videoInfo) throw new Error('Could not fetch video info');

        const song = {
            ...videoInfo,
            requestedBy
        };

        // If already playing, add to queue
        if (guildData.currentSong && guildData.player) {
            guildData.queue.push(song);
            return { queued: true, song, position: guildData.queue.length };
        }

        // Connect to voice channel
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true
        });

        guildData.connection = connection;

        // Create audio player
        const player = createAudioPlayer();
        guildData.player = player;
        connection.subscribe(player);

        // Set current song
        guildData.currentSong = song;

        // Play the song
        await this._playStream(guildId, url);

        // Handle player events
        player.on(AudioPlayerStatus.Idle, () => {
            this._onSongEnd(guildId);
        });

        player.on('error', error => {
            console.error('Player error:', error);
            this._onSongEnd(guildId);
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            this._cleanup(guildId);
        });

        return { queued: false, song };
    }

    // Internal: Play audio stream
    async _playStream(guildId, url) {
        const guildData = this.getGuildData(guildId);
        if (!guildData.player) return;

        try {
            const stream = ytdl(url, {
                filter: 'audioonly',
                quality: 'lowestaudio',
                highWaterMark: 1 << 25
            });

            const resource = createAudioResource(stream, {
                inlineVolume: true
            });

            if (resource.volume) {
                resource.volume.setVolume(guildData.volume / 100);
            }

            guildData.player.play(resource);
            guildData.isPaused = false;
        } catch (error) {
            console.error('Play stream error:', error);
            throw error;
        }
    }

    // Internal: Handle song end
    async _onSongEnd(guildId) {
        const guildData = this.getGuildData(guildId);

        // If loop mode, replay current song
        if (guildData.isLoop && guildData.currentSong) {
            await this._playStream(guildId, guildData.currentSong.url);
            return;
        }

        // Check queue
        if (guildData.queue.length > 0) {
            const nextSong = guildData.queue.shift();
            guildData.currentSong = nextSong;
            await this._playStream(guildId, nextSong.url);
            return;
        }

        // No more songs
        guildData.currentSong = null;
    }

    // Internal: Cleanup
    _cleanup(guildId) {
        const guildData = this.getGuildData(guildId);
        guildData.connection = null;
        guildData.player = null;
        guildData.currentSong = null;
        guildData.queue = [];
        guildData.isLoop = false;
        guildData.isPaused = false;
    }

    // Skip current song
    skip(guildId) {
        const guildData = this.getGuildData(guildId);
        if (!guildData.player || !guildData.currentSong) {
            throw new Error('Nothing is playing');
        }

        const skipped = guildData.currentSong;
        guildData.isLoop = false;
        guildData.player.stop();
        return skipped;
    }

    // Stop playback
    stop(guildId) {
        const guildData = this.getGuildData(guildId);
        const connection = getVoiceConnection(guildId);

        if (connection) {
            connection.destroy();
        }

        this._cleanup(guildId);
        return true;
    }

    // Pause playback
    pause(guildId) {
        const guildData = this.getGuildData(guildId);
        if (!guildData.player) throw new Error('Nothing is playing');

        guildData.player.pause();
        guildData.isPaused = true;
        return true;
    }

    // Resume playback
    resume(guildId) {
        const guildData = this.getGuildData(guildId);
        if (!guildData.player) throw new Error('Nothing is playing');

        guildData.player.unpause();
        guildData.isPaused = false;
        return true;
    }

    // Toggle loop
    toggleLoop(guildId) {
        const guildData = this.getGuildData(guildId);
        guildData.isLoop = !guildData.isLoop;
        return guildData.isLoop;
    }

    // Set volume
    setVolume(guildId, volume) {
        const guildData = this.getGuildData(guildId);
        guildData.volume = Math.max(0, Math.min(100, volume));
        return guildData.volume;
    }

    // Get current status
    getStatus(guildId) {
        const guildData = this.getGuildData(guildId);
        return {
            currentSong: guildData.currentSong,
            queue: guildData.queue,
            isLoop: guildData.isLoop,
            isPaused: guildData.isPaused,
            volume: guildData.volume,
            isPlaying: !!guildData.currentSong && !guildData.isPaused
        };
    }

    // Get queue
    getQueue(guildId) {
        const guildData = this.getGuildData(guildId);
        return guildData.queue;
    }

    // Remove from queue
    removeFromQueue(guildId, index) {
        const guildData = this.getGuildData(guildId);
        if (index < 0 || index >= guildData.queue.length) {
            throw new Error('Invalid queue index');
        }
        return guildData.queue.splice(index, 1)[0];
    }

    // Clear queue
    clearQueue(guildId) {
        const guildData = this.getGuildData(guildId);
        guildData.queue = [];
        return true;
    }

    // Get voice channels
    getVoiceChannels(guildId) {
        const guild = this.client.guilds.cache.get(guildId);
        if (!guild) return [];

        return guild.channels.cache
            .filter(channel => channel.type === 2) // Voice channels
            .map(channel => ({
                id: channel.id,
                name: channel.name,
                members: channel.members.size
            }));
    }
}

exports.MusicManager = MusicManager;
