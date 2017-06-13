/**
 * Select a template
 */
"use strict";
let global;
const
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    hjson = require('hjson'),
    normalizePath = require('../utility/util.js').normalizePath,
    readDirectory = require('../utility/readDirectory.js'),
    log = require('../utility/logSys.js'),
    readline = require('readline'),
    getTemplates = function () {
        return new Promise(function (res, rej) {
            if (global.config.template === false) {
                res([]);
            }
            fs.readdir('./skeletons/templates/', function (err, files) {
                let hjsonfiles = _.filter(files, function (item, i) { return _.endsWith(item, '.' + global.config.type + '.hjson') });
                let returnFileList = _.map(hjsonfiles, function (file, i) { return path.join('./skeletons/templates/', file) })
                //console.log('returnFileList:', returnFileList);
                res(returnFileList);
            });
        });
    },
    selectTemplateFile = function (possibleTemplates) {
        let selectTemplateMenu = `
################################################################################
### Please select one of the following:                                      ###`;
        _.each(possibleTemplates, function (template, i) {
            let templateRowStart = `### (${i}) - ${template}`;
            let templateRowEnd = '###';
            let space = 80 - templateRowStart.length - 3;
            let templateRow = '\n' + templateRowStart + ((' ').repeat(space)) + templateRowEnd;
            selectTemplateMenu += templateRow;
        });
        selectTemplateMenu += `
################################################################################
JMG#/template>`;
        return new Promise(function (res, rej) {
            if (global.config.template === false) {
                res('../skeletons/skelton.' + global.config.type + '.json');
            }
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(selectTemplateMenu, (answer) => {
                answer = answer || '0';
                rl.close();
                res(possibleTemplates[parseInt(answer)]);
            });
        });
    },
    writeTemplateInfo = function (selectedTemplate) {
        return new Promise(function (res, rej) {
            fs.readFile(selectedTemplate, 'utf8', function (err, text) {
                if (err) throw err;
                text = text.replace(/\{\{example\}\}/g, global[global.config.type].basename);
                let templateObject = hjson.parse(text);
                global.config.templateConf = templateObject;
                res(global);
            })
        });
    },
    selectTemplate = function (config) {
        //console.dir(config, { colors: true, depth: 4 });
        global = config;
        return new Promise(function (res, rej) {
            getTemplates(config).then(selectTemplateFile).then(writeTemplateInfo).then(res);
        });
    };

module.exports = selectTemplate;
