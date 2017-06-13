/**
 * get Plugin retrieves information about a plugin and
 * returns a simplified object containing information about it.
 */
"use strict";
const
    GETCONFIG = require('../config.js'), 
CONFIG = GETCONFIG(),
    fs = require('fs-extra'),
    q = require('q'),
    _ = require('lodash'),
    path = require("path"),
    log = require('../utility/logSys.js'),
    xml2js = require('xml2js'),
    readDirectory = require('../utility/readDirectory.js'),
    normalizePath = require('../utility/util.js').normalizePath,
    pluginPath = normalizePath(CONFIG.paths.plugin),

    getPluginInfoFile = function () {
        let files = fs.readdirSync(pluginPath),
            xmlFile = _.find(files, function (file, i) {
                return path.extname(file) == '.xml';
            });
        return path.join(pluginPath, xmlFile);
    },
    parsePluginInfo = function (pluginInfoFile) {
        let def = q.defer(),
            parser = new xml2js.Parser(),
            infoObj = {};

        fs.readFile(pluginInfoFile, function (err, data) {
            parser.parseString(data, function (err, result) {
                let basename = path.basename(pluginInfoFile, '.xml');

                infoObj.basename = _.startsWith(basename, 'plg_') ? basename : 'plg_' + basename;
                infoObj.name = result.extension.name;
                infoObj.version = result.extension.version;
                infoObj.language = {};
                try {
                    infoObj.language.site = _.map(result.extension.languages['0'].language, function (item, i) { return item._ });
                    infoObj.language.admin = false;
                } catch (e) { log.debug('No language files'); }
                log.debug(infoObj);
                def.resolve(infoObj);
            });
        });
        return def.promise;
    },

    returnPluginFiles = function () {
        return q.Promise(function (resolve, reject) {
            promiseAdminArray = readDirectory(pluginPath).then(
                function (value) {
                    log.warnline("######################## Collected Plugin Files #########################\n\n");
                    resolve({
                        plugin: value
                    });
                },
                reject
            );
        });
    },
    returnPluginInfo = function (pluginPath) {
        return parsePluginInfo(getPluginInfoFile(pluginPath));
    };

exports.getPluginInfo = returnPluginInfo;
exports.getPluginFiles = returnPluginFiles;
