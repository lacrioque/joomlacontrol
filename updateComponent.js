#!/usr/bin/env node

"use strict";

//define node-requirements
const
    fs = require("fs-extra"),
    q = require("q"),
    _ = require("lodash"),
    path = require("path"),
    readline = require("readline"),
    xml2js = require("xml2js"),
    gaze = require('gaze'),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }),
    root = process.cwd(),
    args = require("yargs")
    .usage('$0 <cmd> (-i [path] -o [path]) or (-c [config-file]) [-v]')
    .alias('i', 'componentPath')
    .describe('i', 'The basePath to the component')
    .alias('o', 'installationPath')
    .describe('o', "The base path to the Joomla-installation")
    .alias('c', 'configFile')
    .describe('c', "A configuration file with all necessary settings")
    .alias('w', 'watch')
    .describe('w', "Watch changes and update accordingly")
    .alias('v', 'verbose')
    .count('verbose')
    .version()
    .help()
    .argv,
    CONFIG = {
        noWatch: false
    },
    //define used methods
    WARN = function() {
        CONFIG.verbose >= 0 && console.log.apply(console, arguments);
    },
    INFO = function() {
        CONFIG.verbose >= 1 && console.log.apply(console, arguments);
    },
    DEBUG = function() {
        CONFIG.verbose >= 2 && console.log.apply(console, arguments);
    },
    WARNLINE = function(text) {
        CONFIG.verbose >= 0 && process.stdout.write(text);
    },
    INFOLINE = function(text) {
        CONFIG.verbose >= 1 && process.stdout.write(text);
    },
    DEBUGLINE = function(text) {
        CONFIG.verbose >= 2 && process.stdout.write(text);
    },
    normalizePath = function(thisPath) {
        thisPath = path.normalize(thisPath);
        if (path.isAbsolute(thisPath)) {
            return thisPath
        } else {
            return path.join(root, thisPath);
        }
    },
    readDirRecursive = require('./readDirRecursive.js'),
    parseEntry = function(fileOrFolder) {
        DEBUG("Parsing: ", fileOrFolder);
        return q.Promise(function(resolve, reject) {
            let fileStat = fs.statSync(fileOrFolder);
            if (fileStat.isDirectory()) {
                readDirRecursive(fileOrFolder).then(resolve, reject);
            } else {
                resolve(fileOrFolder);
            }
        });
    },
    getComponentInfo = require('./getComponent.js'),
    getComponent = function() {
        //save locations of the admin part
        let componentPath = normalizePath(CONFIG.componentPath);
        return q.Promise(function(resolve, reject) {
            let promiseAdminArray = parseEntry(path.join(componentPath, 'admin')),
                promiseSiteArray = parseEntry(path.join(componentPath, 'site')),
                promiseMediaArray = parseEntry(path.join(componentPath, 'media'));
            q.allSettled([promiseAdminArray, promiseSiteArray, promiseMediaArray]).then(
                function(values) {
                    WARNLINE("###################### Collected Component Files #######################\n\n");
                    resolve({
                        admin: values[0].value,
                        site: values[1].value,
                        media: values[2].value
                    });
                },
                reject
            );
        });
    },
    copyFile = function(filename, from, to, i, count) {
        let def = q.defer();
        fs.copy(path.join(from, filename), path.join(to, filename), function(err) {
            if (err) {
                def.reject(err);
                throw err;
            }
            INFOLINE("" + i + "/" + count + " >>> Copied " + filename + "\n");
            def.resolve(true);
        });
        return def.promise;
    },
    copyAdminPart = function(adminFiles, installation, componentName, component) {
        let correctComponentPath = path.join(installation, 'administrator', 'components', componentName);
        INFOLINE("\n\nCopying: " + adminFiles.length + " files to " + correctComponentPath + "\n");
        let promises = _.map(adminFiles, function(f, i) {
            let from = path.dirname(f),
                filename = path.basename(f),
                to = from.replace(path.join(component, 'admin'), correctComponentPath);
            DEBUG({
                from: from,
                filename: filename,
                to: to
            });
            return copyFile(filename, from, to, i, adminFiles.length);
        });
        return q.allSettled(promises);
    },
    copySitePart = function(siteFiles, installation, componentName, component) {
        let correctComponentPath = path.join(installation, 'components', componentName);
        INFOLINE("\n\nCopying: " + siteFiles.length + " files to " + correctComponentPath + "\n");
        let promises = _.map(siteFiles, function(f, i) {
            let from = path.dirname(f),
                filename = path.basename(f),
                to = from.replace(path.join(component, 'site'), correctComponentPath);
            DEBUG({
                from: from,
                filename: filename,
                to: to
            });
            return copyFile(filename, from, to, i, siteFiles.length);
        });
        return q.allSettled(promises);
    },
    copyMediaPart = function(mediaFiles, installation, componentName, component) {
        let correctComponentPath = path.join(installation, 'media', componentName);
        INFOLINE("\n\nCopying: " + mediaFiles.length + " files to " + correctComponentPath + "\n");
        let promises = _.map(mediaFiles, function(f, i) {
            let from = path.dirname(f),
                filename = path.basename(f),
                to = from.replace(path.join(component, 'media'), correctComponentPath);
            DEBUG({
                from: from,
                filename: filename,
                to: to
            });
            return copyFile(filename, from, to, i, mediaFiles.length);
        });
        return q.allSettled(promises);
    },
    copyTargetAdminFile = function(file, installation, componentName, component) {
        let correctComponentPath = path.join(installation, 'administrator', 'components', componentName);
        INFO(" Copying: " + path.basename(file) + " to " + correctComponentPath + "");
        let from = path.dirname(file),
            filename = path.basename(file),
            to = from.replace(path.join(component, 'admin'), correctComponentPath);
        DEBUG({
            from: from,
            filename: filename,
            to: to
        });
        return copyFile(filename, from, to, 1, 1);
    },
    copyTargetSiteFile = function(file, installation, componentName, component) {
        let correctComponentPath = path.join(installation, 'components', componentName);
        INFO(" Copying: " + path.basename(file) + " to " + correctComponentPath + "");
        let from = path.dirname(file),
            filename = path.basename(file),
            to = from.replace(path.join(component, 'site'), correctComponentPath);
        DEBUG({
            from: from,
            filename: filename,
            to: to
        });
        return copyFile(filename, from, to, 1, 1);
    },
    copyTargetMediaFile = function(file, installation, componentName, component) {
        let correctComponentPath = path.join(installation, 'media', componentName);
        INFO(" Copying: " + path.basename(file) + " to " + correctComponentPath + "");
        let from = path.dirname(file),
            filename = path.basename(file),
            to = from.replace(path.join(component, 'media'), correctComponentPath);
        DEBUG({
            from: from,
            filename: filename,
            to: to
        });
        return copyFile(filename, from, to, 1, 1);
    },
    copyComponent = function(pathObj) {
        //return q.Promise(function(res,err){return res(true);});
        let def = q.defer(),
            installationPath = normalizePath(CONFIG.installationPath),
            componentPath = normalizePath(CONFIG.componentPath);

        WARNLINE("\n###################### Copying Component Files    #######################\n");
        INFO("#### From: ", componentPath);
        INFO("#### To: ", installationPath);
        WARNLINE("\n\n");
        getComponentInfo(componentPath)
            .then(
                function(componentInfo) {
                    WARNLINE("\n###################### Copying Admin Part    #######################\n");
                    copyAdminPart(pathObj.admin, installationPath, componentInfo.basename, componentPath)
                        .then(function() {
                            WARNLINE("\n###################### Copying Site Part    #######################\n");
                            copySitePart(pathObj.site, installationPath, componentInfo.basename, componentPath)
                                .then(function() {
                                    console.log('media')
                                    WARNLINE("\n###################### Copying Media Part    #######################\n");
                                    copyMediaPart(pathObj.media, installationPath, componentInfo.basename, componentPath)
                                        .then(function() {
                                            WARNLINE("\r\n###################### Copied Everything successfully ###################\n");
                                            def.resolve()
                                        }, function(err) {
                                            def.reject(err);
                                            throw err;
                                        });
                                }, console.log);
                        }, console.log);
                }, console.log
            );
        return def.promise;
    },
    fullCopy = function(checkPermission, closeRL) {
        closeRL = closeRL || false;
        return getComponent().then(
            function(files) {
                askForPermission(checkPermission).then(
                    function(answer) {
                        if (answer === true) {
                            copyComponent(files).then(
                                function() {
                                    WARNLINE("\n###################### Component successfully copied ####################\n");
                                    closeRL && rl.close();
                                },
                                function(err) {
                                    DEBUG(err);
                                    rl.close();
                                }
                            );
                        } else {
                            DEBUG(files);
                            closeRL && rl.close();
                        }
                    }
                );

            },
            DEBUG
        );
    },
    askForPermission = function(checkPermission) {
        checkPermission = checkPermission || false;
        if (checkPermission) {
            return q.Promise(function(res, err) {
                rl.question('        Copy the component now? (Y/n)', (answer) => {
                    if (!answer || /^(y|Y)$/.test(answer)) {
                        res(true)
                    } else {
                        res(false);
                    }
                });
            });
        } else {
            return q.Promise(function(res, err) {
                res(true)
            });
        }
    },
    watchMenu = function() {
        let menuString = function() {
            return `###
# Watching ` + CONFIG.componentPath + `/**/** for changes
#
# Following commands are possible:
#    x - stop watching and close
#    c - copy the component now
#    h - toggle direct synchronization (State: ` + (CONFIG.noWatch ? 'OFF' : 'ON') + `)
#    s - toggle Silence, no more logging messages (State: ` + CONFIG.verbose + `)
#    m - Show this message
####`;
        };
        console.log(menuString());
        rl.setPrompt("LSCC$>");
        rl.prompt();
        rl.on('line', function(answer) {
            switch (answer) {
                case 'x':
                    CONFIG.watcher.close();
                    rl.close()
                    process.stdout.write("\n\n\r");
                    console.log("#########################################################################");
                    console.log("#####         Thank you for using LimeSurvey Component Copy         #####");
                    console.log("#########################################################################");
                    process.exit(0);
                    break;
                case 'c':
                    WARN("Doing a full update on the component");
                    fullCopy(false).then(function() {
                        rl.prompt();
                    })
                    break;
                case 'h':
                    if (CONFIG.noWatch) {
                        WARN("Halting the synchronization. Please do a full copy afterwards.")
                    } else {
                        WARN("Starting the synchronization again. Did you already make a full copy?")
                    }
                    CONFIG.noWatch = !CONFIG.noWatch;
                    rl.prompt();
                    break;
                case 's':
                    CONFIG.verbose++;
                    CONFIG.verbose = CONFIG.verbose > 2 ? CONFIG.verbose = 0 : CONFIG.verbose;
                    console.log("Verbositiy level: " + (CONFIG.verbose === 0 ? "WARN" : (CONFIG.verbose === 1 ? "INFO" : "DEBUG")));
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
            CONFIG.watcher.close();
            rl.close()
            process.stdout.write("\n\n\r");
            console.log("#########################################################################");
            console.log("#####         Thank you for using LimeSurvey Component Copy         #####");
            console.log("#########################################################################");
            process.exit(0);
        });
    },
    watchFiles = function() {
        CONFIG.watcher = gaze([CONFIG.componentPath + "/**/**", CONFIG.modulePath + "/**/**"], function(err, watcher) {
            if (err) {
                INFO(err);
            }
            this.on('all', changeOccured);
        });
    },
    isInAdminpath = function(filepath) {
        var checkAdminRegex = new RegExp(/\/admin\//);
        return checkAdminRegex.test(filepath);
    },
    isInSitepath = function(filepath) {
        var checkSiteRegex = new RegExp(/\/site\//);
        return checkSiteRegex.test(filepath);
    },
    isInMediapath = function(filepath) {
        var checkMediaRegex = new RegExp(/\/media\//);
        return checkMediaRegex.test(filepath);
    },
    changeOccured = function(event, filepath) {
        if (CONFIG.noWatch) {
            return true;
        }
        INFO("File has changed: " + filepath);
        let installationPath = normalizePath(CONFIG.installationPath),
            componentPath = normalizePath(CONFIG.componentPath);
        if (isInAdminpath(filepath)) {
            copyTargetAdminFile(filepath, installationPath, CONFIG.componentName, componentPath)
                .then(function() {
                    DEBUG('copied');
                }, DEBUG);
        } else if (isInSitepath(filepath)) {
            copyTargetSiteFile(filepath, installationPath, CONFIG.componentName, componentPath)
                .then(function() {
                    DEBUG('copied');
                }, DEBUG)
        } else if (isInMediapath(filepath)) {
            copyTargetMediaFile(filepath, installationPath, CONFIG.componentName, componentPath)
                .then(function() {
                    DEBUG('copied');
                }, DEBUG)
        } else {
            INFO("Not supported right now");
        }
    };
let counter = 0;

process.stdout.write("\n\n\r");
console.log("####################### LimeSurvey Component Copy #######################");
console.log("#####  The simple solution to keep your joomla component up to date #####");
console.log("#########################################################################");

CONFIG.verbose = args.verbose;

if (args.configFile) {
    try {
        let configString = fs.readFileSync(args.configFile, {
            'encoding': 'utf8'
        });
        let configParsed = JSON.parse(configString);

        CONFIG.installationPath = configParsed.paths.installation;
        CONFIG.componentPath = configParsed.paths.component;
        CONFIG.verbose = configParsed.verbosity !== undefined ? configParsed.verbosity : CONFIG.verbose;
    } catch (e) {
        if (e) {
            WARN("The config file seems to be wrong ore missing.");
            process.abort();

        }
    }
} else {
    if (!args.installationPath || !args.componentPath) {
        WARN("There has to be an installation and a component path.\nEither define them with -i and -o or use a config file");
        process.abort();
    }
    CONFIG.installationPath = args.installationPath;
    CONFIG.componentPath = args.componentPath;
}


if (args.watch) {
    getComponentInfo(CONFIG.componentPath)
        .then(function(componentInfo) {
            CONFIG.componentName = componentInfo.basename;
            watchFiles();
            watchMenu();
        });
} else {
    fullCopy(true, true);
}
