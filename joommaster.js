#!/usr/bin/env node

"use strict";

const
    q = require("q"),
    fs = require('fs'),
    _ = require("lodash"),
    path = require("path"),
    log = require('./utility/logSys.js'),
    Watch = require('./watcher/watchChange.js'),
    copyUtil = require('./utility/copyUtil.js'),
    scriptUtil = require('./utility/scriptUtil.js'),
    root = process.cwd(),
    args = require("yargs")
    .alias('z', 'zip')
    .describe('z', "Zip up all parts and exit immediately")
    .alias('a', 'fullCopy')
    .describe('a', "Copy all defined extensions to the installation folder")
    .alias('c', 'copyComponent')
    .describe('c', "Copy the component defined in the config file")
    .alias('m', 'copyModule')
    .describe('m', "Copy the module defined in the config file")
    .alias('p', 'copyPlugin')
    .describe('p', "Copy the plugin defined in the config file")
    .alias('n', 'createNew')
    .describe('n', "Create new extension")
    .alias('x', 'nowatch')
    .describe('x', "Don't start watching the folders")
    .alias('v', 'verbose')
    .count('verbose')
    .version()
    .help('h')
    .alias('h', 'help')
    .epilog('Copyright under the GPL3.0 by LimeSurvey GmbH 2017')
    .argv,
    glob = {},
    checkConfigFile = function () {
        if (!fs.existsSync('./config.json')) {
            log.warn('No config file found!\nPlease create a config file first.');
            process.exit(1);
        }
    },
    startWatching = function () {
        if (args.nowatch) {
            return true;
        }
        glob.watcher = new Watch();
    },
    copyStuff = function () {
        if (args.copyComponent) {
            copyUtil.copyComponent();
        } else if (args.copyModule) {
            copyUtil.copyModule();
        } else if (args.copyPlugin) {
            copyUtil.copyPlugin();
        } else if (args.fullCopy) {
            copyUtil.fullCopy();
        }
    },
    startCreation = function () {
        if (args.zip) {
            args.nowatch = true;
            scriptUtil.zipAll().then(
                (resolved) => { process.exit(0); }
            );

        }
    },
    createConfig = function () {};

checkConfigFile();
startCreation();
createConfig();
startWatching();
