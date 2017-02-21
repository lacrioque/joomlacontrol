/**
 * get Module retrieves information about a module and
 * returns a simplified object containing information about it.
 */
"use strict";
const
    CONFIG = require('../config.json'),
    fs = require('fs-extra'),
    q = require('q'),
    _ = require('lodash'),
    path = require("path"),
    log = require('../utility/logSys.js'),
    xml2js = require('xml2js'),
    readDirectory = require('../utility/readDirectory.js'),
    normalizePath = require('../utility/util.js').normalizePath,
    modulePath = normalizePath(CONFIG.paths.module),
    getModuleInfoFile = function () {
        let files = fs.readdirSync(modulePath),
            xmlFile = _.find(files, function (file, i) {
                return path.extname(file) == '.xml';
            });
        return path.join(modulePath, xmlFile);
    },
    parseModuleInfo = function (moduleInfoFile) {
        let def = q.defer(),
            parser = new xml2js.Parser(),
            infoObj = {};

        fs.readFile(moduleInfoFile, function (err, data) {
            parser.parseString(data, function (err, result) {
                let basename = path.basename(moduleInfoFile, '.xml');
                if (err) def.reject(err);
                infoObj.basename = _.startsWith(basename, 'mod_') ? basename : 'mod_' + basename;
                infoObj.name = result.extension.name;
                infoObj.version = result.extension.version;
                infoObj.language = {};
                infoObj.language.site = _.map(result.extension.languages['0'].language, function (item, i) { return item._ });
                infoObj.language.admin = false;
                def.resolve(infoObj);
            });
        });
        return def.promise;
    },

    returnModuleFiles = function () {
        return q.Promise(function (resolve, reject) {
            q.all([
                readDirectory(modulePath, [path.join(modulePath, 'media'), path.join(modulePath, 'language')]),
                readDirectory(path.join(modulePath, 'media')),
                readDirectory(path.join(modulePath, 'language'))
            ]).then(
                function (value) {
                    log.warnline("######################## Collected Module Files #########################\n\n");
                    resolve({
                        module: value[0],
                        moduleMedia: value[1],
                        siteLanguage: value[2]
                    });
                },
                reject
            );
        });
    },
    returnModuleInfo = function () {
        return parseModuleInfo(getModuleInfoFile());
    };

exports.getModuleInfo = returnModuleInfo;
exports.getModuleFiles = returnModuleFiles;
