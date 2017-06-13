/**
 * Generate a component from either a template or
 */
"use strict";
const
    GETCONFIG = require('../config.js'),
    CONFIG = GETCONFIG\(\),
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    hjson = require('hjson'),
    normalizePath = require('../utility/util.js').normalizePath,
    readDirectory = require('../utility/readDirectory.js'),
    log = require('../utility/logSys.js'),
    createConfig = require('./createConfig.js'),
    createFolderStructure = require('./createFolderStructure.js'),
    runWizard = require('./configurationwizard.js'),
    globals = {},
    askForTemplate = function () {
        const readline = require('readline'),
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
        let def = q.defer();
        rl.question("Please put in path to template \nJMG#> ", (answer) => { def.resolve(answer); });
        return def.promise;
    },
    readTemplate(pathToTemplate = '.. / skeletons / skelton.component.hjson ') {
        let templatePath = normalizePath(pathToTemplate);
        let templateString = fs.readFileSync(templatePath, { encoding: 'utf8' });
        let templateObject = hjson.parse(templateString);
        return templateObject;
    },
    createScaffoldFolders = function () {
        let baseFolder = normalizePath(globals.basePath)
    },
    createScaffoldFiles = function () {

    },
    runGeneration = function (externalGlobals) {
        _.merge(globals, externalGlobals);
    };

module.exports = runGeneration;
