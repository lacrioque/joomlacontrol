/**
 *
 */
"use strict";
const CreateWatchChange = function () {
    const
        GETCONFIG = require('../config.js'),
        CONFIG = GETCONFIG(),
        glob = {
            noWatch: false,
            watcher: null,
        },
        gaze = require('gaze'),
        readline = require('readline'),
        _ = require('lodash'),
        normalizePath = require('../utility/util.js').normalizePath,
        scriptUtil = require('../utility/scriptUtil.js'),
        log = require('../utility/logSys.js'),
        checkLocation = require('../utility/checkLocation.js'),
        copyUtil = require('../utility/copyUtil.js'),
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
#    c - full copy of all parts` +
                    (CONFIG.parts.component ? "\n#    cc - full copy of the component" : '') +
                    (CONFIG.parts.module ? "\n#    cm - full copy of the module" : '') +
                    (CONFIG.parts.plugin ? "\n#    cp - full copy of the plugin" : '') + `
#    h - toggle direct synchronization (State: ${(glob.noWatch ? 'OFF' : 'ON')})
#    s - toggle Silence, no more logging messages (State: ${process.env.verbosity})
#    e - Show extended methods
#    m - Show this message
####`;
            };
            let menuExtendedString = function () {
                return `###
# Extended functions (be careful!)
#
# Following commands are possible:
#    eza - Zip all extensions to ${CONFIG.parts.packagesDir}
#    ezc - Zip up the component to ${CONFIG.parts.packagesDir}/componennt.zip
#    ezm - Zip up the component to ${CONFIG.parts.packagesDir}/module.zip
#    ezp - Zip up the component to ${CONFIG.parts.packagesDir}/plugin.zip
#    ezg - Start generator for another extension
#    e - Show this message
#    m - Show main menu
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
                    console.log("#######         Thank you for using LimeSurvey JoomMaster         #######");
                    console.log("#########################################################################");
                    process.exit(0);
                    break;
                case 'cc':
                    if (!CONFIG.parts.component) {
                        rl.prompt();
                        break;
                    }
                    log.warn("Updating the component");

                    copyUtil.copyComponent()
                        .then(function () {
                            rl.prompt();
                        })
                    break;
                case 'cm':
                    if (!CONFIG.parts.module) {
                        rl.prompt();
                        break;
                    }
                    log.warn("Updating the module");
                    copyUtil.copyModule()
                        .then(function () {
                            rl.prompt();
                        })
                    break;
                case 'cp':
                    if (!CONFIG.parts.plugin) {
                        rl.prompt();
                        break;
                    }
                    log.warn("Updating the plugin");
                    copyUtil.copyPlugin()
                        .then(function () {
                            rl.prompt();
                        })
                    break;
                case 'c':
                    log.warn("Updating all parts");

                    copyUtil.fullCopy()
                        .then(function () {
                            rl.prompt();
                        })
                    break;
                case 'h':
                    if (!glob.noWatch) {
                        log.warn("Halting the synchronization. Please do a full copy afterwards.")
                    } else {
                        log.warn("Starting the synchronization again. Did you already make a full copy?")
                    }
                    glob.noWatch = !glob.noWatch;
                    rl.prompt();
                    break;
                case 's':
                    process.emit('changeVerbosity');
                    console.log("Verbositiy level: " + (process.env.verbosity === 0 ? "WARN" : (process.env.verbosity === 1 ? "INFO" : "DEBUG")));
                    rl.prompt();
                    break;
                case 'ezc':
                    scriptUtil.zipComponent();
                    console.log(menuExtendedString());
                    rl.prompt();
                    break;
                case 'ezm':
                    scriptUtil.zipModule();
                    console.log(menuExtendedString());
                    rl.prompt();
                    break;
                case 'ezp':
                    scriptUtil.zipPlugin();
                    console.log(menuExtendedString());
                    rl.prompt();
                    break;
                case 'eza':
                    scriptUtil.zipAll();
                    console.log(menuExtendedString());
                    rl.prompt();
                    break;
                case 'eg':
                    console.log(menuExtendedString());
                    rl.prompt();
                    break;
                case 'e':
                    console.log(menuExtendedString());
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
                console.log("#######         Thank you for using LimeSurvey JoomMaster         #######");
                console.log("#########################################################################");
                process.exit(0);
            });
        },
        watchFiles = function () {
            let foldersToWatch = [];
            if (CONFIG.parts.component) foldersToWatch.push(CONFIG.paths.component + "/**/**");
            if (CONFIG.parts.module) foldersToWatch.push(CONFIG.paths.module + "/**/**");
            if (CONFIG.parts.plugin) foldersToWatch.push(CONFIG.paths.plugin + "/**/**");
            glob.watcher = gaze(foldersToWatch, function (err, watcher) {
                if (err) {
                    log.info(err);
                }
                this.on('all', changeOccured);
            });
        },
        changeOccured = function (event, filepath) {
            log.info("File has changed: " + filepath);
            if (glob.noWatch) {
                log.info("Synchronization has been disabled.");
                return true;
            }
            let type = checkLocation(filepath);
            log.debug('Filetype: ' + type);
            let result = copyUtil.copyFile(type, filepath);
            result.then(log.debug, log.debug, log.debug);

        };

    watchFiles();
    watchMenu();
}
module.exports = CreateWatchChange;
