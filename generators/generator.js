"use strict";
let globals = { watch: false };
const
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    hjson = require('hjson'),
    readline = require('readline'),
    normalizePath = require('../utility/util.js').normalizePath,
    readDirectory = require('../utility/readDirectory.js'),
    log = require('../utility/logSys.js'),
    createConfig = require('./createConfig.js'),
    createFolderStructure = require('./createFolderStructure.js'),
    configurationWizard = require('./configurationwizard.js'),
    selectTemplate = require('./selectTemplate.js'),
    getCurrentEditor = function () {
        return new Promise(function (res, rej) {
            const exec = require('child_process').exec;
            exec('which vim', (err, stdout, stderr) => {
                if (err) {
                    res(null);
                }
                res('vim' + (('').repeat('33')));
            })
        });
    },
    askForWatcher = function () {
        let askForWatcherText = `
################################################################################
###  Run Watcher after generation? (y/N)                                     ###
################################################################################
JMG#/watcher>`;
        return new Promise(function (res, rej) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(askForWatcherText, (answer) => {
                answer = answer || 'N';
                globals.watcher = (answer == 'y' || answer == 'Y') ? true : false;
                rl.close();
                res(true);
            });
        });
    },
    askForRunEditor = function () {
        const os = require('os');
        if (os.platform() !== 'linux') {
            console.log("Editor is not supported for non-Linux Systems right now.");
            return new Promise(function (res, rej) { res(true); });
        }

        return new Promise(function (res, rej) {
            getCurrentEditor().then(function (currentEditor) {
                if (currentEditor === null) res(false);
                let askForRunEditorText = `
################################################################################
###  Run Editor after generation? (y/N)                                      ###
###  Current Editor: ${currentEditor}                                        ###
################################################################################
JMG#/editor>`;
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                rl.question(askForRunEditorText, (answer) => {
                    answer = answer || 'N';
                    globals.editor = (answer == 'y' || answer == 'Y') ? true : false;
                    rl.close();
                    res(true);
                });
            });
        });
    },
    generationMenu = function (step, cb) {
        step = step || 1;
        //generation steps
        switch (step) {
            //case 1: run question wizard
        case 1:
            let confPrimary = require('../config.json');
            globals.baseconfig = confPrimary;
            let runWizard = configurationWizard(globals);
            runWizard.runConfig().then(function () {
                globals = runWizard.getGlobals();
                generationMenu(++step, cb);
            });
            break;
            //create master configuration and select templates
        case 2:
            createConfig(globals).then(selectTemplate).then(function (configuration) {
                fs.writeFile('./masterconf.hjson', hjson.stringify(configuration), { encoding: 'utf8' }, function (err) {
                    if (err) { def.reject(err); return; }
                    globals = configuration;
                    generationMenu(++step, cb);
                });
            }).catch(function (e) {
                console.dir(e, { color: true, depth: 4 });
            });
            break;
            //create scaffolding and ask if it should be watched and if an editor should be called
        case 3:
            createFolderStructure(globals);
            askForWatcher().then(askForRunEditor).then(function () {
                cb(globals);
            });
        }
    },
    run = function () {
        return new Promise(function (res, rej) {
            generationMenu(1, res);
        });
    };

module.exports = function () {
    return {
        run: run,
        getGlobal: function () { return globals; }
    }
}
