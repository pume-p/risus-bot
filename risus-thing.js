const Discord = require('discord.js');
const client = new Discord.Client();
client.login(process.env.token);

const theme = ["แฟนตาซี", "ไซไฟ", "คาวบอย", "ยอดมนุษย์", "บัจจุบัน", "ซอมบี้", "สยองขวัญ", "สงครามโลก"];
const topic = ["ตัวละครผู้เล่น", "NPC เป็นที่มิตร", "NPC เป็นที่ศัตรู", "สิ่งของ", "อุปกรณ์", "สิ่งมีชีวิต ที่เป็นมิตร", "สิ่งมีชีวิต ที่เป็นศัตรู", "สถานที่"];


client.once('ready', () => {
    const ch = client.channels.cache.get('831206514676596736');
    const TODAYtheme = theme[Math.floor(Math.random() * theme.length)];
    const TODAYtopic = topic[Math.floor(Math.random() * topic.length)];

    ch.setTopic(`ทุกๆคน ไม่ว่า GM หรือ ผู้เล่น มาช่วยกันเขียนเนื้อหาเข้าคลังข้อมูลกลางได้! | ธีม: ${TODAYtheme} | หัวข้อ: ${TODAYtopic}`).then(() =>
        ch.send(
            '▬▬▬▬▬▬ ***เริ่มหัวข้อใหม่!*** ▬▬▬▬▬▬\n' +
            `> __ธีมสัปดาห์นี้คือ ${TODAYtheme}__\n` +
            `> __หัวข้อในวันนี้คือ ${TODAYtopic}__\n` +
            'ทุกคนสามารถพิมมาในห้องนี้ได้เลยนะครับ *อย่าให้chatตาย!*').then((msg) => msg.pin().then(() => client.destroy())));
});