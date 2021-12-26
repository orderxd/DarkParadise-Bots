const {
    MessageEmbed,
    Discord
    } = require("discord.js");
    const conf = client.ayarlar;
    let mongoose = require("mongoose");
    let sunucuayar = require("../../models/sunucuayar");
    module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    
    if (message.member.permissions.has(8) || durum) {
    let data = await sunucuayar.findOne({});
    let sunucuTAG = data.TAG;
    let tag = await message.guild.members.cache.filter(member => member.user.username.includes(sunucuTAG)).size;
    let sesli = message.guild.channels.cache.filter(channel => channel.type == "voice").map(channel => channel.members.filter(member => !member.user.bot).size).reduce((a, b) => a + b);
    let bot = message.guild.channels.cache.filter(channel => channel.type == "voice").map(channel => channel.members.filter(member => member.user.bot).size).reduce((a, b) => a + b);
    let embed = new MessageEmbed()
    .setColor("BLACK")
    .setDescription(`\`❯\` Şu anda toplam **${sesli}** (**+${bot} bot**) kişi seslide.
    \`❯\` Sunucuda **${message.guild.memberCount}** adet üye var (**${message.guild.members.cache.filter(member => member.presence.status !== "offline").size}** Aktif)
    \`❯\` Toplamda **${tag}** kişi tagımızı alarak bizi desteklemiş.
    \`❯\` Toplamda **${message.guild.premiumSubscriptionCount}** adet boost basılmış! ve Sunucu **${message.guild.premiumTier}** seviye`);
    message.channel.send(embed)
    }
    }
    exports.conf = {
    aliases: ["sunucusay", "serversay", "Say"]
    };
    exports.help = {
    name: 'say'
    };
    