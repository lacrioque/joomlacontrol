/**
 * get Component retrieves information about a component and
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
    componentPath = normalizePath(CONFIG.paths.component),

    getComponentInfoFile = function () {
        let files = fs.readdirSync(componentPath),
            xmlFile = _.find(files, function (file, i) {
                return path.extname(file) == '.xml';
            });
        return path.join(componentPath, xmlFile);
    },
    parseComponentInfo = function (componentInfoFile) {
        let def = q.defer(),
            parser = new xml2js.Parser(),
            infoObj = {};

        fs.readFile(componentInfoFile, function (err, data) {
            parser.parseString(data, function (err, result) {
                let basename = path.basename(componentInfoFile, '.xml');
                if (err) def.reject({ err: err, msg: 'Component info file not found' });
                infoObj.basename = _.startsWith(basename, 'com_') ? basename : 'com_' + basename;
                infoObj.name = result.extension.name;
                infoObj.version = result.extension.version;
                infoObj.language = {};
                infoObj.language.site = _.map(result.extension.languages['0'].language, function (item, i) { return item._ });
                infoObj.language.admin = _.map(result.extension.administration[0].languages[0].language, function (item, i) { return item._; });

                def.resolve(infoObj);
            });
        });
        return def.promise;
    },

    returnComponentFiles = function () {
        return q.Promise(function (resolve, reject) {
            let promiseAdminArray = readDirectory(path.join(componentPath, 'admin'), [path.join(componentPath, 'admin', 'language')]),
                promiseSiteArray = readDirectory(path.join(componentPath, 'site'), [path.join(componentPath, 'site', 'language')]),
                promiseMediaArray = readDirectory(path.join(componentPath, 'media')),
                promiseSiteLanguageArray = readDirectory(path.join(componentPath, 'site', 'language')),
                promiseAdminLanguageArray = readDirectory(path.join(componentPath, 'admin', 'language'));
            q.all(
                [
                    promiseAdminArray,
                    promiseSiteArray,
                    promiseMediaArray,
                    promiseSiteLanguageArray,
                    promiseAdminLanguageArray
                ]
            ).then(
                function (values) {
                    log.warnline("###################### Collected Component Files #######################\n\n");
                    resolve({
                        admin: values[0],
                        site: values[1],
                        componentMedia: values[2],
                        siteLanguage: values[3],
                        adminLanguage: values[4]
                    });
                },
                function (errors) {
                    reject({ err: errors, msg: 'Could not get all component files' })
                }
            );
        });
    },
    returnComponentInfo = function () {
        return parseComponentInfo(getComponentInfoFile());
    };

exports.getComponentInfo = returnComponentInfo;
exports.getComponentFiles = returnComponentFiles;
