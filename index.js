const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!\n---');
});

client.login(process.env.token);

client.on('message', message => {
    if (message.content.charAt(0) === '!') {
        rollall(message, false)
    } else if (message.content.charAt(0) === '$') {
        rollall(message, true)
    }
});

function rollall(message, TEAMmode) {
    var cliches = message.content.split('\n');
    cliches[0] = cliches[0].slice(1);
    var allroll = '';
    cliches.forEach(function (cliche) {
        var TEAMscore6s = 0;
        try {
            if (cliche.length < 1) return;
            var result = 0;
            var eachdice = '';
            var dices = 0;
            if (cliche.indexOf('(') + cliche.indexOf('[') < 0) {
                dices = parseInt(cliche.split(' ')[0].split('+')[0].split('-')[0].replace(/[^0-9-]/g, ''));
                if (isNaN(dices)) return;
                if (dices > 50) {
                    allroll += parse('%s - !เกินขีดจำกัด50\n', cliche);
                    return;
                }
                for (var i = 0; i < dices; i++) {
                    var random = Math.floor(Math.random() * 6) + 1;
                    eachdice += random + ' ';
                    if (TEAMmode)
                        if (random == 6) TEAMscore6s++;
                        else random = 0;
                    result += random;
                }
                if (!TEAMmode) var modifier = modification(cliche, result);
                allroll += parse('%s:%s%s\n', eachdice, result, modifier);
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
                allroll += parse('%s - !เกินขีดจำกัด50\n', cliche);
                return;
            }
            for (var i = 0; i < dices; i++) {
                var random = Math.floor(Math.random() * 6) + 1;
                eachdice += random + ' ';
                if (TEAMmode)
                    if (random != 6) random = 0;
                result += random;
            }
            var modifier = modification(cliche, result);
            allroll += parse('%s%s: %s:%s%s\n', cliche.split(bracket2)[0], bracket2, eachdice, result, modifier);
        } catch (e) {} finally {}
    });
    if (allroll.length > 0) {
        var TEAMscore = '';
        if (TEAMmode)
            TEAMscore = parse('\nTEAM= %s* =%s', TEAMscore6s, TEAMscore6s * 6)
        console.log(parse('%s - %s\n%s\n%s\n---', message.member.displayName, message.channel.name, message.content, allroll));
        message.channel.send('```' + allroll + TEAMscore + '```');
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