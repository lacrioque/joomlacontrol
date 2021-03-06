#!/usr/bin/env node

"use strict";

const
    q = require("q"),
    fs = require('fs'),
    _ = require("lodash"),
    path = require("path"),
    Watch = require('./watcher/watchChange.js'),
    JMGenerator = require('./generators/generator.js'),
    copyUtil = require('./utility/copyUtil.js'),
    scriptUtil = require('./utility/scriptUtil.js'),
    root = process.cwd(),
    args = require("yargs")
    .alias('z', 'zip')
    .describe('z', "Zip up all parts and exit immediately")
    .alias('g', 'generator')
    .describe('g', 'Start generating basic file and folder structure wizard')
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
    globals = {},
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
       globals.watcher = new Watch();
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
    startGenerationWizard = function () {
        process.env.verbosity = args.verbose;
        const log = require('./utility/logSys.js');
        let def = q.defer();
        if (args.generator) {
            let generator = new JMGenerator();
            generator.run().then(def.resolve);
        } else {
            return false;
        }
        return def.promise
    },
    archiveExtensions = function () {
        if (args.zip) {
            args.nowatch = true;
            scriptUtil.zipAll().then(
                (resolved) => { process.exit(0); }
            );

        }
    };

    //startWatching();

let generationPromise = startGenerationWizard();
if(generationPromise === false){
    checkConfigFile();
    archiveExtensions();
    startWatching();
} else {
    generationPromise.then(() => {
        console.log(result);
        checkConfigFile();
        archiveExtensions();
        createConfig();
        startWatching();
    })
}


