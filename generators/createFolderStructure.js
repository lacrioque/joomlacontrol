//'mkdir controllers helpers language language/en-GB language/de-DE models models/fields models/forms sql sql/updates sql/updates/mysql tables views'
/**
 * Creates folders and simple empty files for any type of joomla extension
 */

"use strict";
const
    _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    log = require('../utility/logSys.js'),
    parseFolder = function (folderStructure, key) {
        let folderList = [];
        folderList.push(key);
        _.each(folderStructure, function (value, key) {
            if (key == 'files') { return true; }
            folderList = _.concat(folderList, parseFolder(folderStructure[key], key));
        });
        return _.map(folderList, function (item, i) {
            return path.join(key, item);
        });
    },
    parseFolderList = function (folderStructure) {
        let folderList = [];
        _.each(folderStructure, function (value, key) {
            folderList = _.concat(folderList, parseFolder(folderStructure[key], key));
        });
        console.log('folderList=>');
        console.dir(folderList, { color: true, depth: 5 });
        return folderList;
    },
    createFolderStructure = function (globals) {
        const folderTarget = "../" + globals.config.type,
            folderList = parseFolderList(globals.config.templateConf.base);
        log.warn('Generating folder structure.');
        _.each(folderList, function (folder, iterator) {
            let folderPath = path.join(folderTarget, folder);
            fs.mkdirp(folderPath);
            log.debug("generated folder" + folderPath);
        })
    };

module.exports = createFolderStructure;
