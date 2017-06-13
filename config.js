"use strict";
const
    fs = require('fs'),
    log = require('./utility/logSys.js'),
    getConfig = function () {
        let CONFIG;
        try {
            return require('./config.json');
        } catch (e) {
            if (e) {
                log.warn('Config not existing! Creating it with empty set.');
                log.debug('ERROR: ', e);
                let exampleConf = require('./config.example.json');
                fs.writeFileSync('./config.json', JSON.stringify(exampleConf, null, 2));
                return exampleConf;
            }
        }
    }
module.exports = getConfig;
