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

client.once('ready', () => {
    console.log('Ready!\n---');

    //setup
    fs.readdir(musicFolder, (err, files) => music = files);
    RTH = client.guilds.cache.get('685745431107338271');
    MainCat = RTH.channels.cache.get('731715856840785951');
    lodge = RTH.channels.cache.get('685745431107338275');
    Gamecen = RTH.channels.cache.get('733718518754836490');
    memRole = RTH.roles.cache.get('685759082702962715');
    gusRole = RTH.roles.cache.get('734830200944066591');
    botRole = RTH.roles.cache.get('685760520946843694');
    modRole = RTH.roles.cache.get('726052487257391125');
    djRole = RTH.roles.cache.get('747273333090812024');
    gmRole = RTH.roles.cache.get('760441106160287744');

    //update
    RTH.members.cache.filter(members => members.roles.cache.size === 1).forEach(member => joinSever(member));
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
    const LOG = RTH.channels.cache.get('748200435701121035');
    if (message.channel !== LOG) {
        LOG.send(`${message.author.username} (||${message.author.id}||) : ${message.channel} - \`${message.content}\``).catch(console.error);
    }
    if (message.type !== 'DEFAULT') return;
    if (message.author.bot) return;
    message.member.roles.add(memRole);
    message.member.roles.remove(gusRole);
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
        case '731766891512856576':
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
            break;
        case '731743829207547954':
            if (message.content.startsWith('$#$')) {
                if (message.content.startsWith('$#$X')) {
                    StartVC();
                } else
                    lodge.leave().then(() => StartVC());
                return;
            }
    }

    if (message.content.startsWith('&') && message.channel.parent !== null && message.channel.parent.name.indexOf('-') > -1) {
        const args = message.content.trim().split(/ +/);
        const command = args.shift().slice(1).toLowerCase();
        const GR = message.channel.parent;
        const NAME = GR.name;
        const ID = NAME.split('-')[0];
        switch (message.channel.name.slice(2)) {
            case '-0-player':
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
            case '-0-console':
                switch (command) {
                    case 'remove':
                        const kickMem = message.mentions.members.first();
                        if (!kickMem) {
                            message.channel.send('> **`&remove [@ผู้เล่นที่จะลบออก]`**');
                            return;
                        }
                        const KMemRole = kickMem.roles.cache.find(r => r.name === `Game:${ID}`);
                        if (!KMemRole) {
                            message.channel.send('> **ผู้เล่นไม่ได้เป็นผู้เล่นของ Game Room นี้!**');
                            return;
                        }
                        RTH.channels.cache.find(channel => channel.name === `${ID}-0-player`).send(`> **<@${kickMem.id}> ได้ถูกลบออกจาก Game Room โดย <@${message.member.id}>!**`);
                        kickMem.roles.remove(KMemRole);
                        return;
                    case 'add-channel':
                        if (!(args[0] && args[1] && args[2] && (args[0] === 't' || args[0] === 'v') && (args[1] >= 1 && args[1] <= 5) && (args[2].length >= 2 && args[2].length <= 60))) {
                            message.channel.send('> **รายละเอียดไม่ครบ!**\n' +
                                '> **`&add-channel [t/v] [1/2/3/4/5] [ชื่อห้อง]`**\n' +
                                '> **t - ห้องข้อความ / v - ห้องพูดคุย**\n' +
                                '> **1 - ทุกคนใช้ห้องได้**\n' +
                                '> **2 - เฉพาะผู้เล่นใช้ห้องได้**\n' +
                                '> **3 - เฉพาะGMใช้ห้องได้**\n' +
                                '> **4 - เฉพาะผู้เล่นที่เห็นห้อง**\n' +
                                '> **5 - เฉพาะGMที่เห็นห้อง**');
                            return;
                        }
                        let IsVoice = false;
                        if (args[0] === 'v') IsVoice = true
                        const Role = RTH.roles.cache.find(role => role.name === `Game:${ID}`);
                        const GMRole = RTH.roles.cache.find(role => role.name === `Game_GM:${ID}`);
                        GRCreateChannel(ID, GR, args[2], '', IsVoice, parseInt(args[1]), false, Role, GMRole, `<@${message.author.id}>`);
                        return;
                    case 'disband':
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
                        message.channel.send('> **`&remove [@ผู้เล่นที่จะลบออก]` - ลบผู้เล่นออกจาก Game Room**\n' +
                            '> **`&add-channel [t/v] [1/2/3/4/5] [ชื่อห้อง]` - เพิ่มChannelใหม่** (พิมเพื่อเช็คสิทธิ1-5)\n' +
                            '> **`&disband` - ลบ Game Room**');
                }
                return;
        }
    }

    let diceMode = 0;
    let rollcommmand = message.content;
    if (message.content.charAt(0) === '*') {
        diceMode = 1;
        rollcommmand = rollcommmand.slice(1);
    } else if (message.content.charAt(0) === '^') {
        diceMode = 2;
        rollcommmand = rollcommmand.slice(1);
    }

    if (rollcommmand.charAt(0) === '!')
        rollall(message, false, diceMode);
    else if (rollcommmand.charAt(0) === '$')
        rollall(message, true, diceMode);
    else if (message.content.charAt(0) === '%') {
        let total = 0,
            s = message.content.match(/[+\-]*(\.\d+|\d+(\.\d+)?)/g) || [];
        while (s.length) {
            total += parseFloat(s.shift());
        }
        message.channel.send(total);
    }
})


//ROLE &WELCOME

client.on('guildMemberRemove', member => {
    updatestat();
    const wanrNum = member.roles.cache.find(r => r.name.indexOf('Warning:') > -1);
    if (wanrNum) RTH.channels.cache.get('748200435701121035').send(`${member.user.username} - ${wanrNum}`).catch(console.error);
});

client.on('guildMemberAdd', member => joinSever(member));

function joinSever(member) {
    if (member.user.bot) {
        member.roles.add(botRole);
        return;
    }
    member.send('https://cdn.discordapp.com/attachments/732198249946939448/748232742306709632/welcome6.png').then(() =>
        member.send('> **แจ้งเตือนสมาชิก!**\n' +
            '> **คือว่า Serverเรานั้นบังคับใช้ Push to Talk (กดเพื่อพูด)**\n' +
            '> **ดังนั้นการจะพูดในServerได้ จะต้องSetModeพูด เป็น Push to Talk**\n' +
            '\n> **แล้วก็! ขอให้ตั้งชื่อเล่นในServer ด้วยเครื่องหมาย <>**'));

    member.roles.add(gusRole);
    client.channels.cache.get('685761491760447518').send(new Discord.MessageEmbed()
        .setColor('#2ecc71')
        .setAuthor(`ยินดีต้อนรับ ${member.displayName} สู่Risusiverse Thai!`, member.user.avatarURL())
        .setDescription(member)).then(msg => msg.react('👋'));
}

//STAT

function updatestat() {
    MainCat.setName('▬ main | member : ' + memRole.members.size + ' ▬');
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
    if (!(Type === 'O' || Type === 'A' || Type === 'C'))
        return {
            t: '**รูปแบบคำสั่งไม่ถูกต้อง!**\n' +
                '***"+[ประเภทเกม:O,A,C][ชื่อเกม]"***\n' +
                '**เช่น:** ***"+Oบุกเข้าปราสาทจอมมาร!"***\n' +
                '**Oneshot - การเล่นครั้งเดียว**\n' +
                '**Adventure - การเล่นหลายครั้งจนกว่าจะจบการผจญภัย**\n' +
                '**Campaign - การเล่นเรื่อยๆหลายการผจญภัย**',
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
                }]
            }).then(NewGameRoom => {
                NewGameRoom.setPosition(Gamecen.position + 1);
                GRCreateChannel(ID, NewGameRoom, 'console', 'ห้องควบคุม Game Room | & เพื่อดูคำสั่ง', false, 5, 1, Role, GMRole);
                GRCreateChannel(ID, NewGameRoom, 'player', 'ห้องรับ/ออก ผู้เล่น | &join เพื่อเข้า / &leave เพื่อออก | GMกด✅เพื่อรับผู้เล่น', false, 1, 2, Role, GMRole);
                GRCreateChannel(ID, NewGameRoom, 'info', 'ห้องสำหรับลงข้อมูล Game', false, 3, 2, Role, GMRole, `<@${Creator.id}>`);
                GRCreateChannel(ID, NewGameRoom, 'roll', 'ห้องchatเกม!', false, 2, 0, Role, GMRole);
                GRCreateChannel(ID, NewGameRoom, 'talk', '', true, 2, 0, Role, GMRole);
            });
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
        case 'A':
            return '📑';
        case 'C':
            return '📖';
    }
}

function GRCreateChannel(ID, NewGameRoom, name, topic, IsVoice, permLv, NonGmPower, Role, GMRole, MentionGM) {
    let permID = permLv;
    let Type = 'text';
    if (IsVoice) Type = 'voice';
    if (NonGmPower >= 1) permID = 0;
    RTH.channels.create(`${ID}-${permID}-${name}`, {
        parent: NewGameRoom,
        type: Type,
        topic: topic
    }).then(NewChannel => {
        GRSetPerm(NewChannel, IsVoice, permLv, NonGmPower, Role, GMRole)
        if (Type === 'text' && MentionGM) NewChannel.send(MentionGM +
            '\nเมื่อสร้างแล้ว (ตัวอย่างเกมแบบOneshot)\n' +
            'สิ่งที่คุณอยากเขียนลงไปคือ\n' +
            ': __เนื้อหาคราวๆ, แนวเกม, วันที่&เวลาเริ่มถึงจบ, เงื่อนไขตัวละคร, รายชื่อผู้เล่น(+จำนวนผู้เล่น)__');
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
            break;
        case 2:
            channel.updateOverwrite(botRole, REMOVEpermAcess);
    }
    return;
}

client.on('messageReactionAdd', (messageReaction, user) => {
    if (messageReaction.emoji.name != '✅') return;
    if (messageReaction.message.channel.name.slice(2) !== '-0-player') return;
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

//DICE CONTROL

function rollall(message, TEAMmode, DiceMode) {
    let cliches = message.content.split('\n');
    if (DiceMode !== 0)
        cliches[0] = cliches[0].slice(2);
    else cliches[0] = cliches[0].slice(1);
    let TEAMscore6s = 0;
    let rolled = 0;
    cliches.forEach(cliche => {
        try {
            if (rolled >= 15) return;
            if (cliche.length < 1) return;
            let dices = 0;
            let returnMsg;
            if (cliche.indexOf('(') + cliche.indexOf('[') + cliche.indexOf('<') + cliche.indexOf('{') < 0) {
                dices = parseInt(cliche.split(' ')[0].split('+')[0].split('-')[0].replace(/[^0-9-]/g, ''));
                returnMsg = rollDice(dices, cliche, message, TEAMmode, TEAMscore6s, DiceMode);
                TEAMscore6s = returnMsg.TEAMscore6s;
                sendMsgUnder2000(`> **${returnMsg.eachdice} :${returnMsg.result}**`, false, message);
                rolled++;
                return;
            }
            let bracket = '(';
            let bracket2 = ')';
            if (cliche.indexOf('(') < 0) {
                if (cliche.indexOf('[') > -1) bracket = '[';
                else if (cliche.indexOf('<') > -1) bracket = '<';
                else if (cliche.indexOf('{') > -1) bracket = '{';
            }
            if (cliche.indexOf(')') < 0) {
                if (cliche.indexOf(']') > -1) bracket2 = ']';
                else if (cliche.indexOf('>') > -1) bracket2 = '>';
                else if (cliche.indexOf('}') > -1) bracket2 = '}';
            }
            dices = parseInt(cliche.split(bracket)[1].split(bracket2)[0].split('/')[0].split('+')[0].split('-')[0].replace(/[^0-9-]/g, ''));
            returnMsg = rollDice(dices, cliche, message, TEAMmode, TEAMscore6s, DiceMode);
            TEAMscore6s = returnMsg.TEAMscore6s;
            sendMsgUnder2000(`> **${cliche.split(bracket2)[0]}${bracket2}: ${returnMsg.eachdice} :${returnMsg.result}**`, false, message);
            rolled++;
        } catch (e) {} finally {}
    });
    let TEAMscore = '';
    if (TEAMmode && rolled > 1)
        if (DiceMode === 0)
            TEAMscore = `> ***TEAM= ${TEAMscore6s}\\* =${TEAMscore6s * 6}***`;
        else
            TEAMscore = `> ***TEAM= ${DiceEmoji(TEAMscore6s)}***`;
    sendMsgUnder2000(TEAMscore, true, message);
    console.log(`${message.member.displayName} - ${message.channel.name}\n${message.content}\n---`);
}

function rollDice(dices, cliche, message, TEAMmode, TEAMscore6s, DiceMode) {
    if (isNaN(dices)) return;
    if (cliche.indexOf('+') > -1)
        dices += parseInt(cliche.split('+')[1].replace(/[^0-9-]/g, ''));
    else if (cliche.indexOf('-') > -1)
        dices -= parseInt(cliche.split('-')[1].replace(/[^0-9-]/g, ''));
    if (dices > 30) {
        sendMsgUnder2000(`> *${cliche} - !เกินขีดจำกัด30*`, false, message);
        return;
    }
    let resultInt = 0;
    let returnMsg = {
        eachdice: '',
        result: '',
        TEAMscore6s: TEAMscore6s,
    }
    for (let i = 0; i < dices; i++) {
        let random = Math.floor(Math.random() * 6) + 1;
        if ((!TEAMmode || random === 6 || DiceMode === 1) && (DiceMode !== 2 || (random % 2) === 0)) //สีเทาเฉพาะถ้าเป็นทีมแล้วเลขไม่เป็น6 & mode^ไม่เป็นคู่
            returnMsg.eachdice += DiceEmoji(random);
        else
            returnMsg.eachdice += GrayDiceEmoji(random);

        switch (DiceMode) {
            case 0:
                if (TEAMmode)
                    if (random === 6) returnMsg.TEAMscore6s++;
                    else random = 0;
                resultInt += random;
                break;
            case 1:
                if (resultInt < random)
                    resultInt = random;
                break;
            case 2:
                if ((random % 2) !== 0)
                    resultInt = 1;

        }
    }
    switch (DiceMode) {
        case 0:
            returnMsg.result = resultInt;
            break;
        case 1:
            returnMsg.result = ' ' + DiceEmoji(resultInt);
            if (returnMsg.TEAMscore6s < resultInt)
                returnMsg.TEAMscore6s = resultInt;
            break;
        case 2:
            if (resultInt === 0)
                returnMsg.result = '*** ก้าวหน้าสำเร็จ!***';
            else
                returnMsg.result = ' ไม่สำเร็จ';
    }
    return returnMsg;
}

var allText = '';

function sendMsgUnder2000(text, final, ch) {
    if (allText.length + text.length >= 2000 || final) {
        if (final) {
            if (allText.length + text.length >= 2000) {
                ch.channel.send(allText);
                allText = '';
            }
            allText += text + '\n'
        }
        ch.channel.send(allText);
        allText = '';
    }
    if (!final) allText += text + '\n';
}

function DiceEmoji(num) {
    let id = '';
    switch (num) {
        case 1:
            id = '726851299152232515';
            break;
        case 2:
            id = '726851357784408207';
            break;
        case 3:
            id = '726851383789355028';
            break;
        case 4:
            id = '726851415179395132';
            break;
        case 5:
            id = '726851433693184042';
            break;
        case 6:
            id = '726851451019722882';
            break;
        default:
            id = '726851299152232515';
            break;
    }
    return `<:d${num}:${id}>`;
}

function GrayDiceEmoji(num) {
    let id = '';
    switch (num) {
        case 2:
            id = '760313662707335178';
            break;
        case 3:
            id = '760313684815380480';
            break;
        case 4:
            id = '760313708424855562';
            break;
        case 5:
            id = '760313730688352306';
            break;
        case 6:
            id = '760313749763915808';
            break;
        default:
            id = '760313638807404566';
            break;
    }
    return `<:g${num}:${id}>`;
}

//console feature 
/*case 'rename':
    if (!args[0]) {
        message.channel.send('กรุณาระบุชื่อใหม่ที่ต้องการตั้ง');
        return;
    } else if (message.content.substring(8).length > 60) {
        message.channel.send('ชื่อนั้นยาวเกินไป');
        return;
    }
    const nameLength = NAME.split('-')[3].length;
    let Title = NAME;
    if (nameLength > 0) Title = NAME.slice(0, -1 * NAME.split('-')[3].length);
    Title += message.content.substring(8);
    GR.setName(Title).catch(console.error);
    return;
case 'change-type':
    if (!args[0] && !(args[0] === 'O' || args[0] === 'A' || args[0] === 'C')) {
        message.channel.send('กรุณาระบุประเภทเกมที่ต้องการเปลื่ยนเป็น\n' +
            '[O/A/C]\n' +
            'Oneshot - การเล่นครั้งเดียว,\n' +
            'Adventure - การเล่นหลายครั้งจนกว่าจะจบการผจญภัย,\n' +
            'Campaign - การเล่นไปเรื่อยๆ');
        return;
    }
    const currentType = GREmojiType(NAME.charAt(5));
    if (currentType === args[0]) {
        let fullType;
        switch (currentType) {
            case 'O':
                fullType = 'Oneshot';
                break;
            case 'A':
                fullType = 'Adventure';
                break;
            case 'C':
                fullType = 'Campaign';
                break;
        }
        message.channel.send(`Game Room เป็นประเภท: *${fullType}* อยู่แล้ว`);
        return;
    }NAME.charAt(5)
    const newNAME = NAME.slice(0, 3) + NAME.slice(4);
    GR.setName(newNAME.slice(0, 5) + GREmojiType(args[0]) + newNAME.slice(5)).catch(console.error);
    return;
    

                        case 'close':
                        if (!isOpen) {
                            message.channel.send('> **Game Room มีสถานะปิดอยู่แล้ว!**');
                            return;
                        }
                        GR.setName(NAME.slice(0, 3) + '❌' + NAME.slice(4)).then(() => GR.setPosition(RTH.channels.cache.get('748103478253060106').position + 1)).catch(console.error);
                        return;
                    case 'open':
                        if (isOpen) {
                            message.channel.send('> **Game Room มีสถานะเปิดอยู่แล้ว!**');
                            return;
                        }
                        GR.setName(NAME.slice(0, 3) + '✔' + NAME.slice(4)).then(() => GR.setPosition(Gamecen.position + 1)).catch(console.error);
                        return;*/

/*client.on('channelUpdate', (oldChannel, newChannel) => {
    if (!(newChannel.type === 'text' || newChannel.type === 'voice')) return;
    if (!(newChannel.parent !== null && newChannel.parent.name.indexOf('-') > -1)) return;
    let nID = '';
    if (newChannel.name.split('-')[2]) nID = newChannel.name.slice(0, -1 * newChannel.name.split('-')[2].length);
    if (oldChannel.name.split('-')[2]) {
        const oID = oldChannel.name.slice(0, -1 * oldChannel.name.split('-')[2].length);
        if (nID !== oID) newChannel.setName(oldChannel.name).catch(console.error);
    }
});*/