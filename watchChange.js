/**
 *
 */
"use strict";
const CreateWatchChange = function (CONFIG) {
    const
        CONFIG = require('./config.json'),
        glob = {
            noWatch: false,
            watcher: null,
        },
        gaze = require('gaze'),
        readline = require('readline'),
        normalizePath = require('./util.js').normalizePath,
        log = require('./logSys.js'),
        checkLocation = require('./checkLocation.js'),
        copyUtil = require('./copyUtil.js'),
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }),
        watchMenu = function () {
            let menuString = function () {
                return `###
# Watching ` + CONFIG.componentPath + `/**/** for changes
#
# Following commands are possible:
#    x - stop watching and close
#    c - copy the component now
#    h - toggle direct synchronization (State: ` + (glob.noWatch ? 'OFF' : 'ON') + `)
#    s - toggle Silence, no more logging messages (State: ` + process.env.verbosity + `)
#    m - Show this message
####`;
            };
            console.log(menuString());
            rl.setPrompt("LSCC$>");
            rl.prompt();
            rl.on('line', function (answer) {
                switch (answer) {
                case 'x':
                    glob.watcher.close();
                    rl.close()
                    process.stdout.write("\n\n\r");
                    console.log("#########################################################################");
                    console.log("#####         Thank you for using LimeSurvey Component Copy         #####");
                    console.log("#########################################################################");
                    process.exit(0);
                    break;
                case 'c':
                    log('warn', "Doing a full update on the component");
                    copyUtil.fullCopy('component', false)
                        .then(function () {
                            rl.prompt();
                        })
                    break;
                case 'h':
                    if (glob.noWatch) {
                        log('warn', "Halting the synchronization. Please do a full copy afterwards.")
                    } else {
                        log('warn', "Starting the synchronization again. Did you already make a full copy?")
                    }
                    glob.noWatch = !glob.noWatch;
                    rl.prompt();
                    break;
                case 's':
                    process.emit('changeVerbosity');
                    console.log("Verbositiy level: " + (process.env.verbosity === 0 ? "WARN" : (process.env.verbosity === 1 ? "INFO" : "DEBUG")));
                    rl.prompt();
                    break;
                case 'm':
                    console.log(menuString());
                    rl.prompt();
                    break;
                default:
                    rl.prompt();
                    break;
                }
            });
            rl.on('SIGINT', () => {
                glob.watcher.close();
                rl.close()
                process.stdout.write("\n\n\r");
                console.log("#########################################################################");
                console.log("#####         Thank you for using LimeSurvey Component Copy         #####");
                console.log("#########################################################################");
                process.exit(0);
            });
        },
        watchFiles = function () {
            glob.watcher = gaze([CONFIG.componentPath + "/**/**", CONFIG.modulePath + "/**/**"], function (err, watcher) {
                if (err) {
                    log('info', err);
                }
                this.on('all', changeOccured);
            });
        },
        changeOccured = function (event, filepath) {
            if (glob.noWatch) {
                return true;
            }
            log('info', "File has changed: " + filepath);
            let installationPath = normalizePath(CONFIG.installationPath),
                componentPath = normalizePath(CONFIG.componentPath);
            switch (checkLocation(filepath)) {

            }
        };
}
