/**
 * Creates a basic config file for any type of joomla extension
 */
let globals;
"use strict";
const
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    normalizePath = require('../utility/util.js').normalizePath,
    readDirectory = require('../utility/readDirectory.js'),
    log = require('../utility/logSys.js'),
    readline = require('readline'),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }),
    configurationwizard = function (globalObject) {
        globals = _.merge(globalObject, { config: { type: '' } });
        let type = '',
            basicMenu = `
################################################################################
####          Hello! Welcome to the joommaster generation wizard            ####
################################################################################
# Please choose one of the following:                                          #
# (1) Create a new component                                                   #
# (2) Create a new module                                                      #
# (3) Create a new plugin                                                      #
# (4) Run language-string collection                                           #
################################################################################
`,
            componentMenu = `
################################################################################
####                        Generate component menu                         ####
################################################################################
# Please choose one of the following:                                          #
# (1) Generate Component from template                                         #
# (2) Generate only skeleton                                                   #
# (3) Generate only folders                                                    #
# (q) Go back to mainmenu                                                      #
################################################################################
`,
            moduleMenu = `
################################################################################
####                      Generate module menu                              ####
################################################################################
# Please choose one of the following:                                          #
# (1) Generate Module from template                                            #
# (2) Generate only skeleton                                                   #
# (3) Generate only folders                                                    #
# (q) Go back to mainmenu                                                      #
################################################################################
`,
            pluginMenu = `
################################################################################
####                         Generate plugin menu                           ####
################################################################################
# Please choose one of the following:                                          #
# (1) Generate plugin from template                                            #
# (2) Generate only skeleton                                                   #
# (3) Generate only folders                                                    #
# (q) Go back to mainmenu                                                      #
################################################################################
`,
            askBasicMenu = function (cb) {
                console.log(basicMenu);
                rl.setPrompt("JMG#/config.type>");
                rl.prompt();
            },
            askDetailMenu = function (type) {
                switch (type) {
                case '1':
                    console.log(componentMenu);
                    break;
                case '2':
                    console.log(moduleMenu);
                    break;
                case '3':
                    console.log(pluginMenu);
                    break;
                }
                rl.setPrompt("JMG#/config.template>");
                rl.prompt();
            },
            askForbaseName = function () {
                let putInBaseName = `
________________________________________________________________________________
## The basename can only consist of 6-14 lowercase letters
## Please put in the basename of the new ${globals.config.type}
`;
                console.log(putInBaseName);
                rl.setPrompt("JMG#/config.basename>");
                rl.prompt();
            },
            askForName = function () {
                let putInName = `
________________________________________________________________________________
## Please put in the name of the new ${globals.config.type}
              `;
                console.log(putInName);
                rl.setPrompt("JMG#/config.name>");
                rl.prompt();
            },
            runConfig = function () {
                let def = q.defer();
                let selection = "";
                askBasicMenu();
                rl.on('line', function (answer) {
                    if (answer === 'q') {
                        selection = "";
                        askBasicMenu();
                        return;
                    }
                    if (/^[0-9]$/.test(answer)) {
                        selection = String(selection) + String(answer);
                        switch (selection) {
                        case '1':
                            globals.config.type = 'component';
                            globals.baseconfig.parts.component = true;
                            break;
                        case '2':
                            globals.config.type = 'module';
                            globals.baseconfig.parts.module = true;
                            break;
                        case '3':
                            globals.config.type = 'plugin';
                            globals.baseconfig.parts.plugin = true;
                            break;
                        case '11':
                        case '21':
                        case '31':
                            globals.config.template = true;
                            globals.config.onlyFolders = false;
                            break;
                        case '12':
                        case '22':
                        case '32':
                            globals.config.template = false;
                            globals.config.onlyFolders = false;
                            break;
                        case '13':
                        case '23':
                        case '33':
                            globals.config.template = false;
                            globals.config.onlyFolders = true;
                            break;
                        case '4':
                        default:
                            console.log('No valid input exiting.');
                            def.reject('ERROR!');
                        }
                        if (selection.length === 1) {
                            askDetailMenu(selection);
                        } else if (selection.length === 2) {
                            askForbaseName();
                        }
                    } else if (selection.length == 1) {
                        askDetailMenu(selection);
                    } else if (selection.length == 2) {
                        answer = answer.replace(/[\n\r]/, '');
                        if ((/^[a-z]{4,14}$/.test(answer))) {
                            globals[globals.config.type] = {};
                            globals[globals.config.type].basename = answer;
                            selection = String(selection) + String('b');
                            askForName();
                        } else {
                            askForbaseName()
                        }
                    } else if (selection.length == 3) {
                        globals[globals.config.type].name = answer;
                        rl.close();
                        def.resolve();
                    }
                });
                return def.promise;
            }
        return {
            getGlobals: function () { return globals; },
            runConfig: runConfig
        }
    };

module.exports = configurationwizard;
