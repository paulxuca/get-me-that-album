const tpb = require('thepiratebay');
const colors = require('colors');
const spawn = require('child_process').spawn;
const torrentEngine = require('torrent-stream');
const path = require('path');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var getInfo = function() {
    return new Promise((resolve, reject) => {
        if (!process.argv[2]) reject(new Error(`Missing album name!`.red));
        if (!process.argv[3]) reject(new Error(`Missing artist name!`.red));
        if (!process.argv[4]) reject(new Error(`Missing output location!`.red));
        resolve([process.argv[2], process.argv[3], process.argv[4]]);
        reject(new Error(`Missing artist and/or album name!`.red));
    });
}

var getTorrents = function(userInfo) {
    return new Promise((resolve, reject) => {
        console.log(`Finding album` + ` ${userInfo[0].capitalize()} `.yellow + 'by' + ` ${userInfo[1].capitalize()}`.yellow);
        tpb.search(`${userInfo[0]} ${userInfo[1]}`, {
            category: '100',
            orderBy: '9'
        }).then((res) => {
            if (res) resolve({ name: res[0].name, torrent: res[0].magnetLink, end: userInfo[2] });
            reject(new Error('No Albums found!'));
        }).catch((err) => { reject(err); });
    })
}

var downloadTorrent = function(torrent) {
    return new Promise((resolve, reject) => {
        var engine = torrentEngine(torrent.torrent, {
            tmp: '/tmp',
            path: torrent.end
        });
        engine.on('ready', () => {
            console.log(`Files to be downloaded`.green);
            engine.files.forEach((file) => {
                if (path.extname(file.name) === '.mp3' || path.extname(file.name) == '.flac') {
                    console.log(file.name);
                    var stream = file.createReadStream();
                }
            });
            resolve('Downloading...');
        });
        engine.on('idle', () => {
            console.log('Done!');
            engine.destroy();
        })
    })
}

module.exports = {
    getInfo,
    getTorrents,
    downloadTorrent
}
