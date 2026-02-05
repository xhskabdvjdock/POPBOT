const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActivityType,
    PresenceUpdateStatus
} = require('discord.js');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    getVoiceConnection
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const { exec } = require('child_process');
require('dotenv').config();

const EMBED_COLOR = 0x000000;
const PREFIX = '!';

// إنشاء الـ Client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// تخزين بيانات السيرفرات (لدعم سيرفرات متعددة)
const guildData = new Map();

// الحصول على بيانات السيرفر
function getGuildData(guildId) {
    if (!guildData.has(guildId)) {
        guildData.set(guildId, {
            voiceConnection: null,
            audioPlayer: null,
            isLoop: false,
            skip: false,
            currentSong: null
        });
    }
    return guildData.get(guildId);
}

// التحقق من أن الرابط يوتيوب
function isYoutubeLink(content) {
    const patterns = [
        /https?:\/\/(?:www\.)?youtu\.be\/([^/?]+)/,
        /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^&]+)/
    ];
    return patterns.some(pattern => pattern.test(content));
}

// تنسيق المدة
function getDuration(seconds) {
    if (!seconds) return "LIVE STREAM 🟣";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// البحث عن فيديو يوتيوب
async function searchYoutube(query) {
    try {
        const searchResults = await ytsr(query, { limit: 1 });
        const video = searchResults.items.find(item => item.type === 'video');
        return video ? video.url : null;
    } catch (error) {
        console.error('خطأ في البحث:', error);
        return null;
    }
}

// الحصول على معلومات الفيديو
async function getVideoInfo(url) {
    try {
        const info = await ytdl.getInfo(url);
        return {
            title: info.videoDetails.title,
            url: url,
            duration: parseInt(info.videoDetails.lengthSeconds),
            thumbnail: info.videoDetails.thumbnails[0]?.url
        };
    } catch (error) {
        console.error('خطأ في جلب معلومات الفيديو:', error);
        return null;
    }
}

// تشغيل الأغنية
async function playSong(message, data, url) {
    const voiceChannel = message.member.voice.channel;
    const guildInfo = getGuildData(message.guild.id);

    // الاتصال بالقناة الصوتية
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: true
    });

    guildInfo.voiceConnection = connection;

    // إنشاء مشغل الصوت
    const player = createAudioPlayer();
    guildInfo.audioPlayer = player;

    connection.subscribe(player);

    // تخزين بيانات الأغنية الحالية
    guildInfo.currentSong = {
        ...data,
        user: message.author,
        originalUrl: url
    };

    // إرسال إشعار التشغيل
    const embed = new EmbedBuilder()
        .setDescription(`**▶️ [${data.title}](${url}) - [\`${getDuration(data.duration)}\`]**`)
        .setColor(EMBED_COLOR)
        .setThumbnail(data.thumbnail)
        .setFooter({ text: `By ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
        .setAuthor({ name: 'Now Playing', iconURL: client.user.displayAvatarURL() });

    await message.channel.send({ embeds: [embed] });

    // تشغيل الموسيقى
    const playStream = async () => {
        try {
            const stream = ytdl(url, {
                filter: 'audioonly',
                quality: 'lowestaudio',
                highWaterMark: 1 << 25
            });

            const resource = createAudioResource(stream);
            player.play(resource);
        } catch (error) {
            console.error('خطأ في التشغيل:', error);
            message.channel.send('**❌ حدث خطأ أثناء تشغيل الأغنية**');
        }
    };

    await playStream();

    // معالجة حالة المشغل
    player.on(AudioPlayerStatus.Idle, async () => {
        if (guildInfo.skip) {
            guildInfo.skip = false;
            return;
        }

        if (guildInfo.isLoop && guildInfo.currentSong) {
            await playStream();
        } else {
            guildInfo.currentSong = null;
        }
    });

    player.on('error', error => {
        console.error('خطأ في المشغل:', error);
    });

    connection.on(VoiceConnectionStatus.Disconnected, () => {
        guildInfo.voiceConnection = null;
        guildInfo.audioPlayer = null;
        guildInfo.currentSong = null;
        guildInfo.isLoop = false;
    });
}

// عند جاهزية البوت
client.once('ready', () => {
    console.log(`Connected To ${client.user.tag}`);
    client.user.setActivity('Music Bot.', { type: ActivityType.Listening });
    client.user.setStatus(PresenceUpdateStatus.Idle);
});

// معالجة الرسائل
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const guildInfo = getGuildData(message.guild.id);

    // ==================== أمر التشغيل ====================
    if (['play', 'p', 'ش'].includes(command)) {
        if (!message.member.voice.channel) {
            return message.reply('**❌ You Need To Be In A Voice Channel To Use This Command**');
        }

        const query = args.join(' ');
        if (!query) {
            return message.reply(`**${PREFIX}play \`<song name || URL>\`**`);
        }

        // التحقق من وجود موسيقى قيد التشغيل
        if (guildInfo.audioPlayer && guildInfo.currentSong) {
            return message.reply('**❌ Music Bot Are Currently In Use. Please Wait A Moment To Complete. ⏱️**');
        }

        await message.channel.sendTyping();

        let url;
        if (!isYoutubeLink(query)) {
            url = await searchYoutube(query);
            if (!url) {
                return message.reply(`**❌ I Couldn't Find A Song With This Name \`${query}\`**`);
            }
        } else {
            url = query;
        }

        const videoInfo = await getVideoInfo(url);
        if (!videoInfo) {
            return message.reply('**❌ Cannot Fetch This Song**');
        }

        await playSong(message, videoInfo, url);
    }

    // ==================== أمر التكرار ====================
    else if (['repeat', 'r', 'loop'].includes(command)) {
        if (!message.member.voice.channel) return;

        const botMember = message.guild.members.cache.get(client.user.id);
        if (!botMember.voice.channel || botMember.voice.channel.id !== message.member.voice.channel.id) {
            return;
        }

        if (!guildInfo.currentSong) {
            return message.reply('**❌ لا يوجد أي أغنية لإعادتها مرة أخرى**');
        }

        if (guildInfo.currentSong.user.id !== message.author.id) {
            return message.reply(`**❌ Only The Music Player (${guildInfo.currentSong.user}) Can Use This Command**`);
        }

        guildInfo.isLoop = !guildInfo.isLoop;

        if (guildInfo.isLoop) {
            message.reply(`🔁 Repeat **${guildInfo.currentSong.title} (\`${getDuration(guildInfo.currentSong.duration)}\`)**`);
        } else {
            message.reply(`▶️ Playing **${guildInfo.currentSong.title} (\`${getDuration(guildInfo.currentSong.duration)}\`)**`);
        }
    }

    // ==================== أمر التخطي ====================
    else if (['skip', 's'].includes(command)) {
        if (!message.member.voice.channel) return;

        const botMember = message.guild.members.cache.get(client.user.id);
        if (!botMember.voice.channel || botMember.voice.channel.id !== message.member.voice.channel.id) {
            return;
        }

        if (!guildInfo.currentSong || !guildInfo.audioPlayer) {
            return message.reply('**❌ There Are No Song To Skip**');
        }

        const voiceChannel = message.member.voice.channel;
        const isSongOwnerPresent = voiceChannel.members.has(guildInfo.currentSong.user.id);

        if (guildInfo.currentSong.user.id !== message.author.id && isSongOwnerPresent) {
            return message.reply(`**❌ Only The Music Player (${guildInfo.currentSong.user}) Can Use This Command**`);
        }

        guildInfo.skip = true;
        guildInfo.isLoop = false;
        const songTitle = guildInfo.currentSong.title;
        const songDuration = guildInfo.currentSong.duration;
        guildInfo.currentSong = null;
        guildInfo.audioPlayer.stop();

        message.reply(`⏭️ Skipped **${songTitle} (\`${getDuration(songDuration)}\`)**`);
    }

    // ==================== أمر الإيقاف ====================
    else if (['stop', 'leave', 'disconnect'].includes(command)) {
        if (!message.member.voice.channel) return;

        const botMember = message.guild.members.cache.get(client.user.id);
        if (!botMember.voice.channel || botMember.voice.channel.id !== message.member.voice.channel.id) {
            return;
        }

        if (guildInfo.currentSong) {
            const voiceChannel = message.member.voice.channel;
            const isSongOwnerPresent = voiceChannel.members.has(guildInfo.currentSong.user.id);

            if (guildInfo.currentSong.user.id !== message.author.id && isSongOwnerPresent) {
                return message.reply(`**❌ Only The Music Player (${guildInfo.currentSong.user}) Can Use This Command**`);
            }
        }

        const connection = getVoiceConnection(message.guild.id);
        if (connection) {
            connection.destroy();
            guildInfo.voiceConnection = null;
            guildInfo.audioPlayer = null;
            guildInfo.currentSong = null;
            guildInfo.isLoop = false;
            guildInfo.skip = false;
            message.reply('**👋 Bye**');
        } else {
            message.reply('**❌ I\'m Not Connected To A Voice Channel**');
        }
    }
});

// معالجة تغيير حالة الصوت
client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.id === client.user.id) {
        const guildInfo = getGuildData(newState.guild.id);

        if (!newState.channel) {
            // البوت غادر القناة
            guildInfo.voiceConnection = null;
            guildInfo.audioPlayer = null;
            guildInfo.currentSong = null;
            guildInfo.isLoop = false;
        }
    }
});

// تشغيل البوت
client.login(process.env.TOKEN);
