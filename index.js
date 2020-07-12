const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.token);

var music = [];
const musicFolder = './LodgeMusic/';
const fs = require('fs');

var playing = false;
var lodge;
var ch;
var connected = false;
client.once('ready', () => {
    console.log('Ready!\n---');
    fs.readdir(musicFolder, (err, files) => music = files);
    lodge = client.channels.cache.get('685745431107338275');
    updatestat();
    lodge.join().then(connection => {
        ch = connection;
        connected = true;
        console.log('Lodge joined\n---');
        CheckUserInLodge();
    });
});

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
}

client.on('message', message => {
    if (message.content.charAt(0) === '!') {
        rollall(message, false)
    } else if (message.content.charAt(0) === '$') {
        rollall(message, true)
    }
});

client.on('guildMemberAdd', member => {
    member.send('**ยินดีต้อนรับสู่Risusiverse Thai!**');
    updatestat();
});

client.on('guildMemberRemove', () => {
    updatestat();
});

function updatestat() {
    client.channels.cache.get('731715856840785951').setName('total member : ' + client.guilds.cache.get('685745431107338271').members.cache.filter(member => !member.user.bot).size);
}

function rollall(message, TEAMmode) {
    var cliches = message.content.split('\n');
    cliches[0] = cliches[0].slice(1);
    var allroll = '';
    var TEAMscore6s = 0;
    cliches.forEach(function (cliche) {
        try {
            if (cliche.length < 1) return;
            var result = 0;
            var eachdice = '';
            var dices = 0;
            var modifier = '';
            if (cliche.indexOf('(') + cliche.indexOf('[') < 0) {
                dices = parseInt(cliche.split(' ')[0].split('+')[0].split('-')[0].replace(/[^0-9-]/g, ''));
                if (isNaN(dices)) return;
                if (dices > 50) {
                    allroll += parse('> *%s - !เกินขีดจำกัด50*\n', cliche);
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
                if (!TEAMmode) modifier = modification(cliche, result);
                allroll += parse('> **%s :%s%s**\n', eachdice, result, modifier);
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
            if (dices > 50) {
                allroll += parse('> *%s - !เกินขีดจำกัด50*\n', cliche);
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
            modifier = modification(cliche, result);
            allroll += parse('> **%s%s: %s :%s%s**\n', cliche.split(bracket2)[0], bracket2, eachdice, result, modifier);
        } catch (e) {} finally {}
    });
    if (allroll.length > 0) {
        var TEAMscore = '';
        if (TEAMmode)
            TEAMscore = parse('> ***TEAM= %s\\* =%s***', TEAMscore6s, TEAMscore6s * 6);
        console.log(parse('%s - %s\n%s\n%s\n---', message.member.displayName, message.channel.name, message.content, allroll));
        allroll.replace()
        message.channel.send(allroll + TEAMscore);
    }
}

function parse(str) {
    var args = [].slice.call(arguments, 1),
        i = 0;
    return str.replace(/%s/g, () => args[i++]);
}

function modification(cliche, result) {
    if (cliche.indexOf('+') + cliche.indexOf('-') > -1) {
        if (cliche.indexOf('+') > -1) var symbol = '+';
        else var symbol = '-';
        var modify = parseInt(cliche.split(symbol)[1].replace(/[^0-9-]/g, ''));
        if (cliche.indexOf('+') > -1) var NEWresult = result + modify;
        else var NEWresult = result - modify;
        return (parse(' %s%s: %s', symbol, modify, NEWresult));
    } else return '';
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
    }
    return parse('<:d%s:%s>', num, id);
}