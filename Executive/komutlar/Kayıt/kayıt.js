const {
    MessageEmbed,
    Discord
} = require("discord.js");
const conf = client.ayarlar
let teyit = require("../../models/teyit");
let sunucuayar = require("../../models/sunucuayar");
let otokayit = require("../../models/otokayit");
let puansystem = require("../../models/puansystem");
let limit = new Map();
let sure = new Map();
const ms = require("ms");
module.exports.run = async (client, message, args, durum, kanal) => {
    if (!message.guild) return;
    let data = await sunucuayar.findOne({
        guildID: message.guild.id
    });
    let kntrl = limit.get(message.author.id)
    let sre = sure.get(message.author.id)
    if (kntrl >= 5 && sre > Date.now() && !message.member.permissions.has(8) && !message.member.roles.cache.some(rol => data.MUTEAuthorized.includes(rol.id))) {
        client.channels.cache.get("846064756137656330").send(`${message.author} adlı kullanıcı 30 saniye içerisinde 5'den fazla kayıt yaptığı için yetkileri alındı!`)
        return message.member.roles.remove(user.roles.cache.filter(rol => message.guild.roles.cache.get(data.TEAM).position <= rol.position && !rol.managed))
    }
    if (!sre) {
        sure.set(message.author.id, Date.now()+ms("30s"))
    }
    
    limit.set(message.author.id, (limit.get(message.author.id) || 0) +1)
    setTimeout(() => {
        limit.delete(message.author.id)
        sure.delete(message.author.id)
    }, ms("30s"));


    let target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    let erkekRol = data.MAN;
    let kadinRol = data.WOMAN;
    let unRegisterRol = data.UNREGISTER;
    let registerChannel = data.REGISTERChannel;
    let tag = data.TAG;
    let tag2 = data.TAG2;
    let kayitSorumlusu = data.REGISTERAuthorized;
    let ekipRol = data.TEAM;
    let supheliRol = data.SUPHELI;
    let chatKANAL = data.CHAT;
    if (!message.guild.roles.cache.get(erkekRol[0]) &&
        !message.guild.roles.cache.get(kadinRol[0]) &&
        !message.guild.roles.cache.get(unRegisterRol[0]) &&
        !message.guild.roles.cache.get(kayitSorumlusu[0]) &&
        !client.channels.cache.get(registerChannel) &&
        !tag && !tag2) return message.reply(`Lütfen kurulum sistemini tamamen bitiriniz \`${conf.prefix[0]}setup help\``);

    if (message.member.permissions.has(8) || message.member.roles.cache.some(e => kayitSorumlusu.some(x => x == e)) || message.member.permissions.has(8)) {
        if (!target) return message.reply("Lütfen bir üye belirtiniz");
        unreg = unRegisterRol;
        if (target.id === message.author.id) return message.react(client.emojis.cache.find(x => x.name === "axze_iptal"));
        if (message.member.roles.highest.position <= target.roles.highest.position) return message.reply(`Belirttiğin kişi senden üstün veya onunla aynı yetkidesin!`);
        let name = args[1][0].toUpperCase() + args[1].substring(1);
        let age = Number(args[2]);
        if (!name) return message.reply("Lütfen bir isim belirtiniz");
        if (!age) return message.reply("Lütfen bir yaş belirtiniz");
		if (client.ayarlar.taglıAlım && !target.roles.cache.has(data.BOOST) && !target.user.username.includes(data.TAG)) return message.reply("Taglı alım modunda olunduğu için kayıt işlemi yapılamadı!");


        await message.react(`${client.emojis.cache.find(x => x.name === "axze_erkek")}`);
        await message.react(`${client.emojis.cache.find(x => x.name === "axze_kadin")}`);

        const filter = (reaction, user) => {
            return ["axze_erkek", "axze_kadin"].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        const collector = message.createReactionCollector(filter, {
            max: 1,
            time: 30000,
            error: ['time']
        });
        collector.on('collect', async (reaction) => {
            message.reactions.removeAll();
            message.react(`${client.emojis.cache.find(x => x.name === "axze_tik")}`);
            if (reaction.emoji.name == "axze_erkek") {
                if ((limit.get(message.author.id) || 0) >= 3) return message.reply("1 Dakikada en fazla 3 kayıt yapabilirsin.")
                await kayıtSistem(message, target, tag, tag2, name, age, kadinRol, unreg, client, erkekRol, ekipRol, chatKANAL, true);
            } else if (reaction.emoji.name == "axze_kadin") {
                if ((limit.get(message.author.id) || 0) >= 3) return message.reply("1 Dakikada en fazla 3 kayıt yapabilirsin.")
                await kayıtSistem(message, target, tag, tag2, name, age, kadinRol, unreg, client, erkekRol, ekipRol, chatKANAL, false);
            };
        });
    } else return;
};
exports.conf = {
    aliases: ["kayit", "kayıt", "kadın", "Kadın", "k", "kadin", "Kadin", "Woman", "kız", "Kız", "erkek", "Erkek", "e", "ERKEK", "Man", "man"]
};
exports.help = {
    name: 'woman'
};
async function kayıtSistem(message, target, tag, tag2, name, age, kadinRol, unreg, client, erkekRol, ekipRol, chatKANAL, Type) {
    let autoLogin = await puansystem.findOne({
        guildID: message.guild.id
    });

    if (Type == true) {
        target.user.username.includes(tag) ? erkekRol.push(ekipRol) : erkekRol = erkekRol;
        if (target.roles.cache.some(rol => unreg.includes(rol.id))) {
            await target.roles.remove(unreg).then(async x => {
                await target.roles.set(erkekRol).then(async y => {
                    await target.roles.add(["814570663532036138","841802128673472573"]);
                });
                await message.guild.member(target.id).setNickname(`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${name} | ${age}`);
				
                if (target.roles.cache.some(rol => kadinRol.some(rol2 => rol.id == rol2))) {
                    kadinRol.forEach(async (res, i) => {
                        setTimeout(async () => {
                            await target.roles.remove(res)
                        }, i * 1000);
                    })
                };
                await teyit.updateOne({
                    userID: target.id
                }, {
                    $push: {
                        userName: `\`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${name} | ${age}\` (${erkekRol.map(x => `<@&${x}>`)})`
                    }
                }, {
                    upsert: true
                }).exec();
                let isimler = await teyit.findOne({
                    userID: target.id
                });
                let embed = new MessageEmbed().setAuthor(message.guild.name, message.guild.iconURL({
                    dynamic: true
                })).setTimestamp().setFooter(conf.footer).setDescription(`${target} adlı üye başarılı bir şekilde Erkek olarak kaydedildi\n\nBu kullanıcının ${isimler.userName.length} adet isim geçmişi görüntülendi \n${isimler.userName.map(x => x).reverse().join("\n")}`);
                await message.channel.send(embed).then(x => x.delete({
                    timeout: 15000
                }));
                if (autoLogin.AutoLogin.Type == true) {
                    await otokayit.updateOne({
                        userID: target.id
                    }, {
                        $set: {
                            userID: target.id,
                            roleID: erkekRol,
                            name: name,
                            age: age
                        }
                    }, {
                        upsert: true
                    }).exec();
                }
                client.dailyMission(message.author.id, "teyit", 1, 3)
                client.easyMission(message.author.id, "teyit", 1)
                client.addAudit(message.author.id, 1, "Erkek");
            })
        }
    } else {
        target.user.username.includes(tag) ? kadinRol.push(ekipRol) : kadinRol = kadinRol;
        if (target.roles.cache.some(rol => unreg.includes(rol.id))) {
            await target.roles.remove(unreg).then(async x => {
                await target.roles.set(kadinRol).then(async y => {
                    await target.roles.add(["814570663532036138","841802128673472573"]);
                });
               
                await message.guild.member(target.id).setNickname(`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${name} | ${age}`);
				
                if (target.roles.cache.some(rol => erkekRol.some(rol2 => rol.id == rol2))) {
                    await erkekRol.forEach(async (res, i) => {
                        setTimeout(async () => {
                            await target.roles.remove(res)
                        }, i * 1000);
                    })
                };
                await teyit.updateOne({
                    userID: target.id
                }, {
                    $push: {
                        userName: `\`${target.user.username.includes(tag) ? tag : tag2 ? tag2 : tag} ${name} | ${age}\` (${kadinRol.map(x => `<@&${x}>`)})`
                    }
                }, {
                    upsert: true
                }).exec();
                let isimler = await teyit.findOne({
                    userID: target.id
                });
                let embed = new MessageEmbed().setAuthor(message.guild.name, message.guild.iconURL({
                    dynamic: true
                })).setTimestamp().setFooter(conf.footer).setDescription(`${target} adlı üye başarılı bir şekilde Kadın olarak kaydedildi\n\nBu kullanıcının ${isimler.userName.length} adet isim geçmişi görüntülendi \n${isimler.userName.map(x => x).reverse().splice(0,10).join("\n")}`);
                await message.channel.send(embed).then(x => x.delete({
                    timeout: 15000
                }));
                if (autoLogin.AutoLogin.Type == true) {
                    await otokayit.updateOne({
                        userID: target.id
                    }, {
                        $set: {
                            userID: target.id,
                            roleID: kadinRol,
                            name: name,
                            age: age
                        }
                    }, {
                        upsert: true
                    }).exec();
                }
                client.channels.cache.get(chatKANAL).send(client.ayarlar.chatMesajı.replace("-member-", target)).then(msg => msg.delete({
                    timeout: 1000 * 15
                }))
                client.dailyMission(message.author.id, "teyit", 1,3)
                client.easyMission(message.author.id, "teyit", 1)
                return client.addAudit(message.author.id, 1, "Kadin");
            })
        }
    };

};