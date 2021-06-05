const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.token);

var music = [];
const musicFolder = './LodgeMusic/';
const fs = require('fs');

var RTH;
var MainCat;
var Gamecen;
var memRole;
var gusRole;
var botRole;
var modRole;
var djRole;
var gmRole;

var playing = false;
var lodge;
var ch;
var connected = false;

var risusThingScoreBoardCH;

//
// yo, to whoever are looking at this code
// the code is supper old. I learn js just to write discord bot lol.
client.once('ready', () => {
    console.log('Ready!\n---');

    //setup
    fs.readdir(musicFolder, (err, files) => music = files);
    RTH = client.guilds.cache.get('685745431107338271');
    MainCat = RTH.channels.cache.get('731715856840785951');
    lodge = RTH.channels.cache.get('844910312083423232'); //685745431107338275
    Gamecen = RTH.channels.cache.get('733718518754836490');
    risusThingScoreBoardCH = RTH.channels.cache.get('831413587813466152');
    memRole = RTH.roles.cache.get('685759082702962715');
    gusRole = RTH.roles.cache.get('734830200944066591');
    botRole = RTH.roles.cache.get('685760520946843694');
    modRole = RTH.roles.cache.get('726052487257391125');
    djRole = RTH.roles.cache.get('747273333090812024');
    gmRole = RTH.roles.cache.get('760441106160287744');

    //update
    RTH.members.fetch().then(mem => {
        mem.filter(members => members.roles.cache.size === 1).forEach(member => joinSever(member));
    });
    updatestat();
    StartVC();

    //loop
    setInterval(() => {
        let infiLobby = [];
        for (let i = 0; true; i++) {
            const lobby = RTH.channels.cache.find(channel => channel.name === 'Lobby ' + i);
            if (lobby === undefined)
                break;
            infiLobby.push(lobby);
        }

        if (infiLobby.every(lobby => {
                return lobby.members.size > 0;
            })) {
            console.log('New Lobby Created - ' + infiLobby.length + '\n---');
            RTH.channels.create('Lobby ' + infiLobby.length, {
                type: 'voice',
                parent: MainCat
            }).then(NewLobby => NewLobby.setPosition(infiLobby.length));
        } else {
            let emptyroom = [];
            infiLobby.forEach(lobby => {
                if (!lobby.members.size > 0) emptyroom.push(lobby);
            })
            if (emptyroom.length > 1)
                for (let i = 1; i < emptyroom.length; i++)
                    emptyroom[i].delete();
            let i = 0;
            infiLobby.forEach(lobby => {
                for (let j = 1; j < emptyroom.length; j++)
                    if (emptyroom[j] === lobby) return true;
                lobby.setName('Lobby ' + i);
                i++;
            })
        }
    }, 20 * 1000);
});

client.on('message', message => { //return;//X
    if (message.channel.type === "dm") {
        if (message.author.id == '240092744331165696') {
            message.channel.messages.fetch('850627734274179083').then(CHSENTDER => {
                message.react('👍');
                client.channels.cache.get(CHSENTDER.content).send(message.content);
            })
        }
        return;
    }
    const LOG = RTH.channels.cache.get('748200435701121035');
    if (message.channel !== LOG) {
        LOG.send(`${message.author.username} (||${message.author.id}||) : ${message.channel} - \`${message.content}\``).catch(console.error);
    }
    if (message.type !== 'DEFAULT') return;
    if (message.author.bot) return;
    if (message.member.nickname !== null && message.member.nickname.charAt(0) === '<') {
        message.member.roles.add(memRole);
        message.member.roles.remove(gusRole);
    }
    if (!message.member.roles.cache.find(r => r.name.indexOf('Game_GM:') > -1)) {
        message.member.roles.remove(djRole);
        message.member.roles.remove(gmRole);
    };
    updatestat();

    switch (message.channel.id) {
        case '744171230080401519':
            if (message.content.startsWith('+')) {
                const ReturnText = CreateNewGame(message.content.charAt(1), message.content.slice(2), message.member);
                let color = '#e70e02';
                if (ReturnText.suss) color = '#2ecc71';
                message.channel.send(new Discord.MessageEmbed()
                    .setColor(color)
                    .setAuthor(message.member.displayName, message.member.user.avatarURL())
                    .setDescription(ReturnText.t));
                return;
            }
            break;
        case '841744308204863488':
            if (message.content.startsWith('&')) {
                const message_array = message.content.slice(1).split('\n');
                message.channel.send(message_array[Math.floor(Math.random() * message_array.length)]);
                message.delete();
                return;
            }
            break;
            /*case '731766891512856576':
                if (message.content.startsWith('%') && message.member.roles.cache.get(modRole.id)) {
                    const args = message.content.trim().split(/ +/);
                    const warnM = message.mentions.members.first();
                    args.shift();
                    if (args[0] && warnM) {
                        const Wnum = parseInt(args[0]);
                        if (Wnum && Wnum !== 0) {
                            const oldWarn = warnM.roles.cache.find(r => r.name.indexOf('Warning:') > -1);
                            let WarnNum = Wnum;
                            if (oldWarn) WarnNum += parseInt(oldWarn.name.slice(8));
                            RTH.roles.create({
                                data: {
                                    name: 'Warning:' + WarnNum,
                                    color: 'e70e02'
                                }
                            }).then(newWarn => {
                                if (oldWarn) {
                                    warnM.roles.remove(oldWarn);
                                    if (oldWarn.members.size <= 1)
                                        oldWarn.delete();
                                }
                                warnM.roles.add(newWarn);
                            });
                            message.react('📌');
                            return;
                        }
                    }
                    message.channel.send('> **`% [+/-, จำนวนWarning] [@ผู้จะแก้จำนวนWarning]`**');
                    return;
                }
                break;*/
        case '731743829207547954':
            if (message.content.startsWith('$#$')) {
                if (message.content.startsWith('$#$X')) {
                    StartVC();
                } else
                    lodge.leave().then(() => StartVC());
                return;
            }
            break;
        case '831413587813466152':
            if (message.content.startsWith('+')) {
                let allScore;
                risusThingScoreBoardCH.messages.fetch("831417840371236894")
                    .then(scoretext => {
                        allScore = scoretext.content.split('\n');
                        for (let i = 0; i < allScore.length; i++) {
                            if (message.author.id === allScore[i].split('!')[1].split('>')[0]) {
                                {
                                    allScore[i] = `<@!${message.author.id}> ${parseInt(allScore[i].split(' ')[1]) + 1}`;
                                    let ret = '';
                                    allScore.forEach(oneLINER => {
                                        ret += `${oneLINER}\n`;
                                    })
                                    scoretext.edit(ret);
                                    return;
                                }
                            }
                        }
                        scoretext.edit(`${scoretext.content}\n<@!${message.author.id}> 1`);
                    });
            }
            message.delete();
            break;

    }

    if (message.content.startsWith('&') && message.channel.parent !== null && message.channel.parent.name.indexOf('-') > -1) {
        const args = message.content.trim().split(/ +/);
        const command = args.shift().slice(1).toLowerCase();
        const GR = message.channel.parent;
        const NAME = GR.name;
        const ID = NAME.split('-')[0];

        if (message.channel.topic.includes('&join')) {
            if (message.member.roles.cache.find(r => r.name === `Game_GM:${ID}`)) {
                message.channel.send(`> **GM ไม่สามารถใช้คำสั่งใน<\#${message.channel.id}>ได้!**\n` +
                    '> **คุณทำได้เฉพาะรับผู้เล่นเข้า Game Room ผ่านการReactที่เครื่องหมาย :white_check_mark:**');
                return;
            }
            const roleMem = message.member.roles.cache.find(r => r.name === `Game:${ID}`);
            switch (command) {
                case 'join':
                    if (roleMem) {
                        message.channel.send('> **คุณเป็นผู้เล่นอยู่แล้ว!**')
                        return;
                    }
                    message.react('✅');
                    return;
                case 'leave':
                    if (!roleMem) {
                        message.channel.send('> **คุณไม่ได้เป็นผู้เล่นของ Game Room นี้!**')
                        return;
                    }
                    message.channel.send(`> **<@${message.member.id}> ได้ทำการออกจาก Game Room!**`);
                    message.member.roles.remove(roleMem);
                    return;
                default:
                    message.channel.send('> **`&join [ข้อความ]` - ขอเข้าร่วม Game Room**\n' +
                        '> **`&leave [ข้อความ]` - ออกจาก Game Room**');
            }
            return;
        }
        switch (message.channel.name.slice(2)) {
            /*case '-player':
                if (message.member.roles.cache.find(r => r.name === `Game_GM:${ID}`)) {
                    message.channel.send(`> **GM ไม่สามารถใช้คำสั่งใน<\#${message.channel.id}>ได้!**\n` +
                        '> **คุณทำได้เฉพาะรับผู้เล่นเข้า Game Room ผ่านการReactที่เครื่องหมาย :white_check_mark:**');
                    return;
                }
                const roleMem = message.member.roles.cache.find(r => r.name === `Game:${ID}`);
                switch (command) {
                    case 'join':
                        if (roleMem) {
                            message.channel.send('> **คุณเป็นผู้เล่นอยู่แล้ว!**')
                            return;
                        }
                        message.react('✅');
                        return;
                    case 'leave':
                        if (!roleMem) {
                            message.channel.send('> **คุณไม่ได้เป็นผู้เล่นของ Game Room นี้!**')
                            return;
                        }
                        message.channel.send(`> **<@${message.member.id}> ได้ทำการออกจาก Game Room!**`);
                        message.member.roles.remove(roleMem);
                        return;
                    default:
                        message.channel.send('> **`&join [ข้อความ]` - ขอเข้าร่วม Game Room**\n' +
                            '> **`&leave [ข้อความ]` - ออกจาก Game Room**');
                }
                return;*/
            case '-console':
                const Role = RTH.roles.cache.find(role => role.name === `Game:${ID}`);
                const GMRole = RTH.roles.cache.find(role => role.name === `Game_GM:${ID}`);
                switch (command) {
                    case 'remove':
                        const kickMem = message.mentions.members.first();
                        if (!kickMem) {
                            message.channel.send('> **`&remove [@ผู้เล่นที่จะลบออก]`**');
                            return;
                        }
                        const KMemRole = kickMem.roles.cache.find(r => r.name === `Game:${ID}`);
                        if (!KMemRole) {
                            message.channel.send('> **เขาไม่ได้เป็นผู้เล่นของ Game Room นี้!**');
                            return;
                        }
                        if (kickMem.roles.cache.find(r => r.name === `Game_GM:${ID}`)) {
                            message.channel.send('> **คุณลบตัวเองจากการเป็นสมาชิกไม่ได้!**');
                            return;
                        }
                        const playerroom = RTH.channels.cache.find(channel => channel.topic.includes('&join')); //.name === `${ID}-player`);
                        if (playerroom !== undefined)
                            playerroom.send(`> **<@${kickMem.id}> ได้ถูกลบออกจาก Game Room โดย <@${message.member.id}>!**`);
                        kickMem.roles.remove(KMemRole);
                        return;
                        /*case 'v_activity':
                            const vadMem = message.mentions.members.first();
                            if (!vadMem) {
                                message.channel.send('> **`&v_activity [@ผู้เล่นที่จะให้สิทธ์เสียง]`**');
                                return;
                            }
                            const MvadRole = vadMem.roles.cache.find(r => r.name === `Game:${ID}`);
                            if (!MvadRole) {
                                message.channel.send('> **ผู้เล่นไม่ได้เป็นผู้เล่นของ Game Room นี้!**');
                                return;
                            }
                            const vadRole = vadMem.roles.cache.find(r => r.name === `Game_Talk:${ID}`);
                            if (vadRole) {
                                message.channel.send('> **ผู้เล่นมีสิทธ์เสียงใน Game Room นี้อยู่แล้ว!**');
                                return;
                            }
                            RTH.channels.cache.find(channel => channel.name === `${ID}-0-player`).send(`> **<@${vadMem.id}> ได้รับสิทธ์เสียง โดย <@${message.member.id}>!**`);
                            vadMem.roles.add(RTH.roles.cache.find(role => role.name === `Game_Talk:${ID}`));
                            return;
                        case 'v_activity_remove':
                            const vadMemX = message.mentions.members.first();
                            if (!vadMemX) {
                                message.channel.send('> **`&v_activity_remove [@ผู้เล่นที่จะลบสิทธ์เสียงออก]`**');
                                return;
                            }
                            const MvadRoleX = vadMemX.roles.cache.find(r => r.name === `Game:${ID}`);
                            if (!MvadRoleX) {
                                message.channel.send('> **ผู้เล่นไม่ได้เป็นผู้เล่นของ Game Room นี้!**');
                                return;
                            }
                            const vadRoleX = vadMemX.roles.cache.find(r => r.name === `Game_Talk:${ID}`);
                            if (!vadRoleX) {
                                message.channel.send('> **ผู้เล่นไม่ได้มีสิทธ์เสียงใน Game Room นี้!**');
                                return;
                            }
                            RTH.channels.cache.find(channel => channel.name === `${ID}-0-player`).send(`> **<@${vadMemX.id}> ได้ถูกลบสิทธ์เสียง โดย <@${message.member.id}>!**`);
                            vadMemX.roles.remove(vadRoleX);
                            return;*/
                    case 'tc':
                        /*if (!(args[0] && args[1] && args[2] && (args[0] === 't' || args[0] === 'v') && (args[1] >= 1 && args[1] <= 5) && (args[2].length >= 2 && args[2].length <= 60))) {
                            message.channel.send('> **รายละเอียดไม่ครบ!**\n' +
                                '> **`&add-channel [t/v] [1/2/3/4/5] [ชื่อห้อง]`**\n' +
                                '> **t - ห้องข้อความ / v - ห้องพูดคุย**\n' +
                                '> **1 - ทุกคนใช้ห้องได้**\n' +
                                '> **2 - เฉพาะผู้เล่นใช้ห้องได้**\n' +
                                '> **3 - เฉพาะGMใช้ห้องได้**\n' +
                                '> **4 - เฉพาะผู้เล่นที่เห็นห้อง**\n' +
                                '> **5 - เฉพาะGMที่เห็นห้อง**'); */
                        if (!(args[0] && args[1] && (args[0] >= 0 && args[0] <= 2) && (args[1].length >= 1 && args[1].length <= 60))) {
                            message.channel.send('> **รายละเอียดไม่ครบ!**\n' +
                                '> **`&tc [0/1/2] [ชื่อห้อง]`**\n' +
                                '> **0 - คนนอกส่งข้อความได้**\n' +
                                '> **1 - ผู้เล่นส่งข้อความได้**\n' +
                                '> **2 - เฉพาะGMส่งข้อความได้**\n' +
                                '> ***ชื่อห้องไม่สามารถถูกเว้นวรรคได้***');
                            return;
                        }; //let IsVoice = false;
                        //if (args[0] === 'v') IsVoice = true
                        let gm_only = 2;
                        if (args[0] == 2) gm_only = 3;
                        if (args[0] == 0) gm_only = 1;
                        GRCreateChannel(ID, GR, args[1], '', false, gm_only, 0, Role, GMRole); //, `<@${message.author.id}>`);
                        return;
                    case 'vc':
                        if (!(args[0] && (args[0].length >= 1 && args[0].length <= 60))) {
                            message.channel.send('> **`&vc [ชื่อห้อง]` - เพิ่มChannelเสียงใหม่**\n' +
                                '> ***ชื่อห้องไม่สามารถถูกเว้นวรรคได้***');
                            return;
                        } //IsVoice, permLv, NonGmPower,
                        GRCreateChannel(ID, GR, args[0], '', true, 2, 0, Role, GMRole);
                        return;
                    case 'disband':
                        if (message.channel.id == '766249707038310440')
                            return;
                        message.channel.send(`> **คุณแน่ใจนะ? ว่าต้องการจะลบ** ***Game Room ID: ${ID}}***\n` +
                            '> __**ประวัติข้อความทั้งหมดจะโดนลบทิ้ง**__\n' +
                            '> **ถ้าใช้งานเสร็จ หากแน่ใจให้พิม: `&%%disband%%&`**');
                        return;
                    case '%%disband%%&':
                        RTH.roles.cache.forEach(role => {
                            if (role.name.endsWith(ID)) role.delete();
                        });
                        GR.children.forEach(channel => channel.delete());
                        GR.delete();
                        return;
                    default:
                        message.channel.send(
                            /*'> **`&v_activity [@ผู้เล่นที่จะให้สิทธ์เสียง]` - ให้สิทธ์ในการเปิดไมค์ตลอด**\n' +
                                                        '> **`&v_activity_remove [@ผู้เล่นที่จะลบสิทธ์เสียงออก]` - ลบสิทธ์การเปิดไมค์ตลอด**\n' +*/
                            '> **`&remove [@ผู้เล่นที่จะลบออก]` - ลบผู้เล่นออกจาก Game Room**\n' +
                            '> **`&tc [0/1/2] [ชื่อห้อง]` - เพิ่มChannelข้อความใหม่** (0:คนนอกส่งข้อความได้, 1:ผู้เล่นพิมข้อความได้, 2:เฉพาะGM)\n' +
                            '> **`&vc [ชื่อห้อง]` - เพิ่มChannelเสียงใหม่**\n' +
                            '> **`&disband` - ลบ Game Room**');
                }
                return;
        }
    }
});

/*const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
async function sendmshtoall(text) {
    const allemem = await RTH.members.cache.array;
    for (const mem of allemem) {
        try {
            await mem.send(text);
            delay(100);
        } catch (e) {} finally {}
    }
}*/

//ROLE &WELCOME

client.on('guildMemberRemove', member => {
    updatestat();
    /*const wanrNum = member.roles.cache.find(r => r.name.indexOf('Warning:') > -1);
    if (wanrNum) RTH.channels.cache.get('748200435701121035').send(`${member.user.username} - ${wanrNum}`).catch(console.error);*/
});

client.on('guildMemberAdd', member => joinSever(member));

function joinSever(member) {
    if (member.user.bot) {
        member.roles.add(botRole);
        return;
    }
    member.send('https://cdn.discordapp.com/attachments/732198249946939448/748232742306709632/welcome6.png').then(() =>
        member.send('> **ยินดีต้อนรับสู่ServerเกมสวมบทบาทRisusไทยทางการฮะ!**\n' +
            '\n> **ข้อมูลทุกๆอย่างสามารถเช็คได้ที่ https://www.risusiverse-thai.com/**\n' +
            '\n> **รวมถึงเนื้อหาวีดีโอส่วนใหญ่จะอยู่ใน https://www.youtube.com/c/pume_plus/videos**\n' +
            '\n> *คุณจะสามารถเป็นสมาชิกในServerได้ถ้าคุณ ตั้งชื่อเล่นด้วยเครื่องหมาย<ชื่อเล่น> และทักทาย!*\n'
            //'> **Serverเรานั้นมีLeaugeหลักที่ทุกคนร่วมได้ เช็คใน #01-info ได้เลยนะครับ**\n' +
            /*'> **แล้วก็! ขอให้ตั้งชื่อเล่นในServer ด้วยเครื่องหมาย <>**'*/
        ));

    member.roles.add(gusRole);
    client.channels.cache.get('685761491760447518').send(new Discord.MessageEmbed()
        .setColor(getRandomColor())
        .setAuthor(`ยินดีต้อนรับ ${member.displayName} สู่Risusiverse Thai!`, member.user.avatarURL())
        .setDescription(`${member}\n\n` +
            `***${getRandomWelcomeText()}***`
        )).then(msg => msg.react('👋'));
}

function getRandomColor() {
    if (randomColor.length == 0)
        randomColor = randomCOlorHEX.map((x) => x);
    var randomNUM = Math.floor(Math.random() * randomColor.length);
    let RANDOMWELCOME = randomColor[randomNUM];
    randomColor.splice(randomNUM, 1);
    return RANDOMWELCOME;
}
const randomCOlorHEX = ['#2ecc71', '#0aa6e2', '#e25b0a', '#e62424', '#e5fe04', '#76008a', '#ffafc8'];
var randomColor = randomCOlorHEX.map((x) => x);


function getRandomWelcomeText() {
    if (randomWelcomeTextCurrent.length == 0)
        randomWelcomeTextCurrent = randomWelcomeTextOG.map((x) => x);
    var randomNUM = Math.floor(Math.random() * randomWelcomeTextCurrent.length);
    let RANDOMWELCOME = randomWelcomeTextCurrent[randomNUM];
    randomWelcomeTextCurrent.splice(randomNUM, 1);
    return RANDOMWELCOME;
}
const randomWelcomeTextOG = ['ลองเช็คเว็บเรารึยัง!? https://www.risusiverse-thai.com/',
    'ลองแนะนำตัวดูสิฮะ! อย่าลืมตั้ง<ชื่อเล่น>',
    'รู้เปล่า!? ถ้าคุณตั้งชื่อเล่นเป็น<ชื่อเล่น> แล้วถ้าคุณพิมทักทายคุณจะได้roleสมาชิก!',
    'ลองเช็ควีดีโอวิธีการเล่นเรารึยัง? https://www.youtube.com/watch?v=q5AAxlOouuc&list=PLYxvQ7DmSOyqMYmWVCWGmfUZU5mouwzXl&index=1',
    'SUB ช่องผมยัง??? https://www.youtube.com/channel/UC_fPSpcgug1uG6gcGIlo1UA',
    'Serverเราเกี่ยวกับเกมสวมบทาทRisus เพียงหนึ่งเดียว',
    'สบายดีไหม? เคยเล่นเกมสวมบทบาทมาก่อนรึเปล่า',
    'serverเรามีemojiเยอะนะ',
    'ถ้าสนใจเล่น ก็บอกเหล่าGMที่นี่ได้นะฮะ',
    'วันนี้เป็นวันที่ดี เรามีผู้มาเยือน',
    'มีสมาชิกเพิ่ม1คน = ชื่อเสียงrisusก้าวไกลมากขึ้น',
    'ถ้าคุณขี้เกียจอ่านกฎหลัก4หน้าหรือดูวีดีโอ คุณอ่านสรุปกฎได้ https://www.risusiverse-thai.com/lexicon',
    'รู้ไหมว่าเรามีbot discord ทางการของเราเอง https://www.risusiverse-thai.com/risus-bot',
    'risus > dnd & เกมtrpgอื่นๆ',
    'อย่าลืมเผยแพร่risusไปสู่เพื่อนๆนะ',
    'คุณชื่อว่าอะไร?',
    'เคยเล่นtrpgไหม?',
    'พร้อมที่จะก้าวไปสู่โลกของความเป็นไปได้ไม่สิ้นสุดรึเปล่า...',
    'รู้หรือไม่ว่าrisusจะครบรอบ30ปี ณ ปี 2023',
    'risusบัจจุบัน ณ ปี2021 มีอายุ28ปี!',
    'ขอให้สนุก',
    'ไม่ไร! ถ้าคุณไม่เคยเล่นเกมสวมบทบาทมาก่อน เพราะคนส่วนใหญ่เล่นrisusเป็นครั้งแรก',
    'จงภาวนาต่อพระเจ้าแห่งลูกเต๋า',
    'อย่าลืมว่าbotไม่รู้ว่าใครทอยลูกเต๋า! ผลทอยมาจากการสุ่มทางคณิตศาสตร์ 100%',
    'รู้หรือไม่ว่าrisusประเทศไทย บุกเบิกขึ้นในปี2020',
    'อย่าเกรงใจ! สนใจคุยอะไรก็คุยได้เลย!',
    'คุณมาจากไหนกันเนี่ย??? แต่ก็ยินดีต้อนรับล่ะกัน',
    'บุคคลในตำนานที่คำทำนายพูดถึงได้มาเยือนแล้ว...',
    'ฮัลโหล',
    'ดีจ้า',
    'แนะนำตัวกันบ้างสิ! อย่าลืมตั้ง<ชื่อเล่น>',
    'serverนี้มีห้องเกมอยู่นะ มันแค่ซ่อนอยู่จนกว่าคุณจะทักทาย!'
];
var randomWelcomeTextCurrent = randomWelcomeTextOG.map((x) => x);
//STAT

function updatestat() {
    // memRole.members.size
    //guild.members.filter(member => !member.user.bot).size

    RTH.members.fetch().then(guild => {
        const CurrentNUMMEM = guild.filter(member => member.roles.cache.get(memRole.id)).size;
        if (MainCat.name != '▬ สมาชิก : ' + CurrentNUMMEM + ' ▬')
            MainCat.setName('▬ สมาชิก : ' + CurrentNUMMEM + ' ▬');
    });
}

//GAMEMANGER

function CreateNewGame(Type, Name, Creator) {
    let newRoom = '';
    if (Creator.roles.cache.filter(r => r.name.indexOf('GM') > -1).size >= 1 && !Creator.roles.cache.get('685759790562934795'))
        return {
            t: '**คุณไม่สามารถคุม Game Room มากกว่า1ได้!**\n' +
                '(เฉพาะ Game Master+)',
            suss: false
        };
    if (!(Type === 'O' || Type === 'C' || Type === 'L'))
        return {
            t: '**รูปแบบคำสั่งไม่ถูกต้อง!**\n' +
                '***"+[ประเภทเกม:O,C,L][ชื่อเกม]"***\n' +
                '**เช่น:** ***"+Oบุกเข้าปราสาทจอมมาร!"***\n' +
                '**Oneshot\📜 - การเล่นครั้งเดียว  จบสมบูรณ์ภายในSessionนั้น**\n' +
                '**Campaign\📑 - เส้นเรื่องราวต่อเนื่อง มีผู้เล่นตายตัว เล่นพร้อมกันทุกSession**\n' +
                '**League\📚 - เส้นเรื่องราวไม่ต่อเนื่อง มีผู้เล่นทั้งหมดมากกว่า 1 Party**',
            suss: false
        };
    if (Name.length < 3)
        return {
            t: '**ชื่อนั้นสั้นเกินไป!**',
            suss: false
        };
    if (Name.length > 60)
        return {
            t: '**ชื่อนั้นยาวเกินไป!**',
            suss: false
        };

    const ID = CreateGameRoomID();
    RTH.roles.create({
        data: {
            name: 'Game_GM:' + ID,
            color: '07beb8',
            position: RTH.roles.cache.get('760441106160287744').position,
            mentionable: true
        }
    }).then(GMRole =>
        /*
                RTH.roles.create({
                    data: {
                        name: 'Game_Talk:' + ID,
                        color: '68b6d8',
                        position: RTH.roles.cache.get('744006726285787227').position
                    }
                }).then(TalkRole =>*/
        RTH.roles.create({
            data: {
                name: 'Game:' + ID,
                color: '68d8d6',
                position: RTH.roles.cache.get('744006726285787227').position,
                mentionable: true
            }
        }).then(Role => {
            Creator.roles.add(GMRole);
            Creator.roles.add(Role);
            Creator.roles.add(djRole);
            Creator.roles.add(gmRole);

            const allowperm = ['SEND_MESSAGES', 'VIEW_CHANNEL', 'SPEAK', 'CONNECT'];
            RTH.channels.create(`${ID}-${GREmojiType(Type)}${Name}`, {
                type: 'category',
                permissionOverwrites: [{
                        id: botRole.id,
                        allow: allowperm.concat(['MANAGE_MESSAGES'])
                    }, {
                        id: modRole.id,
                        allow: allowperm.concat(['MANAGE_MESSAGES', 'MANAGE_CHANNELS'])
                    }, {
                        id: GMRole.id,
                        allow: allowperm.concat(['MANAGE_MESSAGES', 'PRIORITY_SPEAKER'])
                    }, {
                        id: Role.id,
                        allow: allowperm
                    }
                    /*, {
                                        id: TalkRole.id,
                                        allow: ['USE_VAD']
                                    }*/
                ]
            }).then(NewGameRoom => {
                NewGameRoom.setPosition(Gamecen.position + 1);
                GRCreateChannel(ID, NewGameRoom, 'console', 'ห้องควบคุม Game Room | & เพื่อดูคำสั่ง', false, 5, 1, Role, GMRole);
                switch (Type) {
                    case 'O':
                        GRCreateChannel(ID, NewGameRoom, 'info', 'ห้องสำหรับลงข้อมูล Game', false, 3, 2, Role, GMRole, `<@${Creator.id}>`);
                        GRCreateChannel(ID, NewGameRoom, 'chat', 'ห้องchatเกม! | &join เพื่อเข้า | GMกด✅เพื่อรับผู้เล่น', false, 1, 0, Role, GMRole);
                        break;
                    case 'C':
                        GRCreateChannel(ID, NewGameRoom, 'chat', 'ห้องchatเกม! | &join เพื่อเข้า | GMกด✅เพื่อรับผู้เล่น | อย่าลืมpin', false, 1, 0, Role, GMRole, `<@${Creator.id}>`);
                        break;
                    case 'L':
                        GRCreateChannel(ID, NewGameRoom, 'info', 'ห้องสำหรับลงข้อมูล Game', false, 3, 2, Role, GMRole, `<@${Creator.id}>`);
                        GRCreateChannel(ID, NewGameRoom, 'player', 'ห้องรับ/ออก ผู้เล่น | &join เพื่อเข้า / &leave เพื่อออก | GMกด✅เพื่อรับผู้เล่น', false, 1, 2, Role, GMRole);
                        GRCreateChannel(ID, NewGameRoom, 'roll', 'ห้องchatเกม!', false, 1, 0, Role, GMRole);
                        break;
                }
                GRCreateChannel(ID, NewGameRoom, 'talk', '', true, 2, 0, Role, GMRole);
            }); //IsVoice, permLv, NonGmPower,
        })
    );

    return {
        t: '**สร้างสำเร็จ!**',
        suss: true
    };
}

function GetGameRooms() {
    cats = [];
    RTH.channels.cache.forEach(channel => {
        if (channel.type === 'category' && channel.name.indexOf('-') > -1) cats.push(channel);
    })
    return cats;
}

function CreateGameRoomID() {
    let TakenIds = [];
    GetGameRooms().forEach(cat => TakenIds.push(cat.name.split('-')[0]));
    for (let i = 1; true; i++) {
        let id = i.toString();
        if (i < 10)
            id = '0' + i;
        if (TakenIds.some(TakenId => {
                if (TakenId === id) return true;
            })) continue;
        else return id;
    }
}

function GREmojiType(char) {
    switch (char) {
        case 'O':
            return '📜';
            //  case 'A':
            //       return '';
        case 'C':
            return '📑';
        case 'L':
            return '📚';
    }
}

function GRCreateChannel(ID, NewGameRoom, name, topic, IsVoice, permLv, NonGmPower, Role, GMRole, MentionGM) {
    let permID = permLv;
    let Type = 'text';
    if (IsVoice) Type = 'voice';
    if (NonGmPower >= 1) permID = 0;
    RTH.channels.create(`${ID}-${name}`, { //`${ID}-${permID}-${name}`
        parent: NewGameRoom,
        type: Type,
        topic: topic
    }).then(NewChannel => {
        GRSetPerm(NewChannel, IsVoice, permLv, NonGmPower, Role, GMRole)
        if (Type === 'text' && MentionGM) NewChannel.send(MentionGM +
            '\nเมื่อสร้างแล้ว (ตัวอย่างเกมแบบOneshot)\n' +
            'สิ่งที่คุณอยากเขียนลงไปคือ\n' +
            ': __เนื้อหาคราวๆ, แนวเกม, เกมจริงจังหรือไม่จริงจัง(ในแง่Risus), วันที่&เวลาเริ่มถึงจบ, เงื่อนไขตัวละคร, รายชื่อผู้เล่น(+จำนวนผู้เล่น)__');
    });
}

function GRSetPerm(channel, IsVoice, permLv, NonGmPower, Role, GMRole) {
    let REMOVEpermAcess = {
        VIEW_CHANNEL: false
    };
    let REMOVEpermInteract = {
        SEND_MESSAGES: false
    };
    if (IsVoice) {
        REMOVEpermInteract = {
            SPEAK: false
        };
    }
    switch (permLv) {
        case 1:
            break;
        case 2:
            channel.updateOverwrite(RTH.roles.everyone, REMOVEpermInteract);
            break;
        case 3:
            channel.updateOverwrite(RTH.roles.everyone, REMOVEpermInteract);
            channel.updateOverwrite(Role, REMOVEpermInteract);
            break;
        case 4:
            channel.updateOverwrite(RTH.roles.everyone, REMOVEpermAcess);
            break;
        case 5:
            channel.updateOverwrite(RTH.roles.everyone, REMOVEpermAcess);
            channel.updateOverwrite(Role, REMOVEpermAcess);
            break;
    }
    switch (NonGmPower) {
        case 0:
            channel.updateOverwrite(GMRole, {
                MANAGE_CHANNELS: true
            });
            channel.updateOverwrite(RTH.roles.cache.find(role => role.id == '767090190836563989'), { //RTH.members.cache.find(mem => mem.id == `766644729848528916`).user, { 
                VIEW_CHANNEL: true
            });
        case 2:
            if (!IsVoice)
                channel.updateOverwrite(botRole, REMOVEpermAcess);
    }
    return;
}

client.on('messageReactionAdd', (messageReaction, user) => {
    if (messageReaction.emoji.name != '✅') return;
    if (!messageReaction.message.channel.topic.includes('&join')) return; //name.slice(2) !== '-player') return;
    const ID = messageReaction.message.channel.name.split('-')[0];
    if (messageReaction.message.member.roles.cache.find(r => r.name === `Game:${ID}`)) return;
    if (RTH.member(user).roles.cache.find(r => r.name === `Game_GM:${ID}`)) {
        messageReaction.message.member.roles.add(RTH.roles.cache.find(role => role.name === `Game:${ID}`));
        messageReaction.message.channel.send(`> **<@${messageReaction.message.author.id}> ได้ถูกรับเข้า Game Room โดย <@${user.id}>!**`);
    }
});

//MUSIC CONTROL

client.on('voiceStateUpdate', () => {
    if (connected) CheckUserInLodge();
});

function StartVC() {
    client.user.setActivity('Risus v2.01', {
        type: 'PLAYING',
        url: 'https://sites.google.com/site/risusiverseth/home'
    });
    lodge.join().then(connection => {
        ch = connection;
        connected = true;
        console.log('Lodge joined\n---');
        CheckUserInLodge();
    });
}

function CheckUserInLodge() {
    if (lodge.members.size > 1 && !playing) {
        loopmusic(ch, lodge);
        playing = true;
        console.log('Start playing music in Lodge\n---');
    }
}

function loopmusic(connection, lodge, PrevMusic) {
    try {
        let CurrentMusic = '';
        do {
            CurrentMusic = music[Math.floor(Math.random() * music.length)];
        } while (PrevMusic && PrevMusic === CurrentMusic);
        const dispatcher = connection.play(musicFolder + CurrentMusic, {
            volume: 0.275
        });
        client.user.setActivity(CurrentMusic.slice(0, -4), {
            type: 'PLAYING',
            url: 'https://sites.google.com/site/risusiverseth/home'
        });
        dispatcher.on('finish', () => {
            console.log('music finish playing\n---');
            if (lodge.members.size > 1) {
                loopmusic(connection, lodge, CurrentMusic);
                console.log('restarting music\n---');
            } else {
                playing = false;
                client.user.setActivity('Risus v2.01', {
                    type: 'PLAYING',
                    url: 'https://sites.google.com/site/risusiverseth/home'
                });
            }
        });
    } catch (e) {} finally {}
}