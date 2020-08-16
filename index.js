const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.token);

var music = [];
const musicFolder = './LodgeMusic/';
const fs = require('fs');

var RTH;
var MainCat;
var memRole;
var gusRole;

var playing = false;
var lodge;
var ch;
var connected = false;

client.once('ready', () => {
    console.log('Ready!\n---');

    //setup
    client.user.setActivity('THE POWER GAME', {
        type: 'LISTENING'
    });
    fs.readdir(musicFolder, (err, files) => music = files);
    RTH = client.guilds.cache.get('685745431107338271');
    MainCat = RTH.channels.cache.get('731715856840785951');
    lodge = RTH.channels.cache.get('685745431107338275');
    memRole = RTH.roles.cache.get('685759082702962715');
    gusRole = RTH.roles.cache.get('734830200944066591');

    //update
    RTH.members.cache.filter(members => members.roles.cache.size == 1).forEach(member => joinSever(member)); 
    updatestat();
    lodge.join().then(connection => {
        ch = connection;
        connected = true;
        console.log('Lodge joined\n---');
        CheckUserInLodge();
    });

    //loop
    setInterval(function () {
        var infiLobby = [];
        for (var i = 0; true; i++) {
            var lobby = RTH.channels.cache.find(channel => channel.name === 'Lobby-' + i);
            if (lobby == undefined)
                break;
            infiLobby.push(lobby);
        }

        if (infiLobby.every(ThereAnyone)) {
            console.log('New Lobby Created - ' + infiLobby.length + '\n---');
            RTH.channels.create('Lobby-' + infiLobby.length, {
                type: 'voice',
                parent: MainCat
            }).then(function (NewLobby) {
                NewLobby.setPosition(infiLobby.length)
            });
        } else {
            var emptyroom = [];
            infiLobby.forEach(function (lobby) {
                if (!ThereAnyone(lobby)) emptyroom.push(lobby);
            })
            if (emptyroom.length > 1)
                for (var i = 1; i < emptyroom.length; i++)
                    emptyroom[i].delete();
            var i = 0;
            infiLobby.forEach(function (lobby) {
                for (var j = 1; j < emptyroom.length; j++)
                    if (emptyroom[j] == lobby) return true;
                lobby.setName('Lobby-' + i);
                i++;
            })
        }
    }, 20 * 1000);
});

client.on('message', message => {
    if (message.type != 'DEFAULT') return;
    if (message.author.bot) return;
    /*    message.member.roles.add(memRole);
        message.member.roles.remove(gusRole);*/
    updatestat();

    if (message.channel.id == '735060157003989003')
        if (message.content.startsWith('+')) {
            message.channel.send(CreateNewGame(message.content.charAt(1), message.content.slice(2)));
            return;
        }
    
    if (message.content.charAt(0) === '!') {
        rollall(message, false)
    } else if (message.content.charAt(0) === '$') {
        rollall(message, true)
    }
});


//ROLE &WELCOME

client.on('guildMemberRemove', member => {
    updatestat();
});

client.on('guildMemberAdd', member => joinSever(member));

function joinSever(member) {
    return; //hiatus
    member.send('**ยินดีต้อนรับสู่Risusiverse Thai!**');
    if (member.user.bot) {
        member.roles.add(RTH.roles.cache.get('685760520946843694'));
        return;
    }
    member.roles.add(gusRole);
    client.channels.cache.get('685761491760447518').send('**ยินดีต้อนรับสมาชิกใหม่<<@' + member.id + '>>สู่Risusiverse Thai!**');
}

//STAT

function updatestat() {
    MainCat.setName('main | member : ' + memRole.members.size);
}


//INFILOBBY

function ThereAnyone(lobby) {
    return lobby.members.size > 0;
}

//GAMEMANGER

function CreateNewGame(Type, Name) {
    if (!(Type == 'O' || Type == 'A' || Type == 'C'))
        return 'ไม่สามารถอ่านประเภทของเกมได้, กดอ่านเพิ่มเติมตรงหัวข้อChannel';
    if (Name.length > 60)
        return 'ชื่อนั้นยาวเกินไป';
    RTH.channels.create(`${CreateGameRoomID()}-✔-${RoomtypeEmoji(Type)}-${Name}`, {
        type: 'category',
        permissionOverwrites: [{
            id: '685760520946843694',
            allow: 'VIEW_CHANNEL'
        }]
    }).then(function (NewGameRoom) {
        NewGameRoom.setPosition(3)
    });
    return 'สร้างสำเร็จ';
}

function GetGameRooms() {
    cats = [];
    RTH.channels.cache.forEach(function (channel) {
        if (!(channel.type === 'category' && channel.name.indexOf('-') > -1)) return;
        cats.push(channel);
    })
    return cats;
}

function CreateGameRoomID() {
    var TakenIds = [];
    GetGameRooms().forEach(function (cat) {
        TakenIds.push(cat.name.split('-')[0]);
    });
    for (var i = 1; true; i++) {
        var id = i.toString();
        if (i < 10)
            id = '0' + i;
        if (TakenIds.some(function (TakenId) {
                if (TakenId == id) return true;
            })) continue;
        else return id;
    }
}

function RoomtypeEmoji(char) {
    switch (char) {
        case 'O':
            return '📜';
        case 'A':
            return '🧾';
        case 'C':
            return '📄';
    }
}

//MUSIC CONTROL

client.on('voiceStateUpdate', () => {
    if (connected) CheckUserInLodge();
});

function CheckUserInLodge() {
    if (lodge.members.size > 1 && !playing) {
        loopmusic(ch, lodge);
        playing = true;
        console.log('Start playing music in Lodge\n---');
    }
}

function loopmusic(connection, lodge) {
    try {
        const dispatcher = connection.play(musicFolder + music[Math.floor(Math.random() * music.length)], {
            volume: 0.275
        });
        dispatcher.on('finish', () => {
            console.log('music finish playing\n---');
            if (lodge.members.size > 1) {
                loopmusic(connection, lodge);
                console.log('restarting music\n---');
            } else playing = false;
        });
    } catch (e) {} finally {}
}


//DICE CONTROL

function rollall(message, TEAMmode) {
    var cliches = message.content.split('\n');
    cliches[0] = cliches[0].slice(1);
    var TEAMscore6s = 0;
    var rolled = 0;
    cliches.forEach(function (cliche) {
        try {
            if (rolled >= 15) return;
            if (cliche.length < 1) return;
            var result = 0;
            var eachdice = '';
            var dices = 0;
            var modifier = '';
            if (cliche.indexOf('(') + cliche.indexOf('[') < 0) {
                dices = parseInt(cliche.split(' ')[0].split('+')[0].split('-')[0].replace(/[^0-9-]/g, ''));
                if (isNaN(dices)) return;
                if (cliche.indexOf('+') > -1)
                    dices += parseInt(cliche.split('+')[1].replace(/[^0-9-]/g, ''));
                if (dices > 30) {
                    sendMsgUnder2000(`> *${cliche} - !เกินขีดจำกัด30*`, false, message);
                    return;
                }
                for (var i = 0; i < dices; i++) {
                    var random = Math.floor(Math.random() * 6) + 1;
                    eachdice += typeEmoji(random);
                    if (TEAMmode)
                        if (random == 6) TEAMscore6s++;
                        else random = 0;
                    result += random;
                }
                sendMsgUnder2000(`> **${eachdice} :${result}${modifier}**`, false, message);
                rolled++;
                return;
            }
            var bracket = '('
            var bracket2 = ')'
            if (cliche.indexOf('(') < 0)
                if (cliche.indexOf('[') > -1) bracket = '[';
            if (cliche.indexOf(')') < 0)
                if (cliche.indexOf(']') > -1) bracket2 = ']';
            dices = parseInt(cliche.split(bracket)[1].split(bracket2)[0].split('/')[0].split('+')[0].split('-')[0].replace(/[^0-9-]/g, ''));
            if (isNaN(dices)) return;
            if (cliche.indexOf('+') > -1)
                dices += parseInt(cliche.split('+')[1].replace(/[^0-9-]/g, ''));
            if (dices > 30) {
                sendMsgUnder2000(`> *${cliche} - !เกินขีดจำกัด30*`, false, message);
                return;
            }
            for (var i = 0; i < dices; i++) {
                var random = Math.floor(Math.random() * 6) + 1;
                eachdice += typeEmoji(random);
                if (TEAMmode)
                    if (random == 6) TEAMscore6s++;
                    else random = 0;
                result += random;
            }
            sendMsgUnder2000(`> **${cliche.split(bracket2)[0]}${bracket2}: ${eachdice} :${result}${modifier}**`, false, message);
            rolled++;
        } catch (e) {} finally {}
    });
    var TEAMscore = '';
    if (TEAMmode)
        TEAMscore = `> ***TEAM= ${TEAMscore6s}\\* =${TEAMscore6s * 6}***`;
    sendMsgUnder2000(TEAMscore, true, message);
    console.log(`${message.member.displayName} - ${message.channel.name}\n${message.content}\n---`);
}

var allText = '';

function sendMsgUnder2000(text, final, message) {
    if (allText.length + text.length >= 2000 || final) {
        if (final) {
            if (allText.length + text.length >= 2000) {
                message.channel.send(allText);
                allText = '';
            }
            allText += text + '\n'
        }
        message.channel.send(allText);
        allText = '';
    }
    if (!final) allText += text + '\n';
}

function typeEmoji(num) {
    var id;
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
            id = '726851299152232515'
            break;
    }
    return `<:d${num}:${id}>`;
}