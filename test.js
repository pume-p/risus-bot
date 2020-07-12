var music= [];//['AHIT-7.mp3', 'AHIT-14.mp3', 'AHIT-23.mp3', 'AHIT-25.mp3', 'AHIT-66.mp3', 'AHITB-4.mp3', 'AHITB-7.mp3', 'AHITB-9.mp3', 'AHITB-100.mp3', 'Z-LS-3.mp3'];
const musicFolder = './LodgeMusic/';
const fs = require('fs');


fs.readdir(musicFolder, (err, files) => music = files);

console.log(music);