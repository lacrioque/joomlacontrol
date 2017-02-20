/**
 * get Component retrieves information about a component and
 * returns a simplified object containing information about it.
 */
"use strict";
const
    fs = require('fs-extra'),
    q = require('q'),
    _ = require('lodash'),
    log = require('./logSys.js'),
    xml2js = require('xml2js'),

    getComponentInfoFile = function (componentPath) {
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

                infoObj.basename = _.startsWith(basename, 'com_') ? basename : 'com_' + basename;
                infoObj.name = result.extension.name;
                infoObj.version = result.extension.version;
                infoObj.language.site = result.extension.languages;
                infoObj.language.admin = result.extension.administration.languages;

                def.resolve(infoObj);
            });
        });
        return def.promise;
    },

    returnComponentFiles = function (componentPath) {
        let componentPath = normalizePath(componentPath);
        return q.Promise(function (resolve, reject) {
            let promiseAdminArray = parseEntry(path.join(componentPath, 'admin')),
                promiseSiteArray = parseEntry(path.join(componentPath, 'site')),
                promiseMediaArray = parseEntry(path.join(componentPath, 'media'));
            q.allSettled([promiseAdminArray, promiseSiteArray, promiseMediaArray]).then(
                function (values) {
                    log('warnline', "###################### Collected Component Files #######################\n\n");
                    resolve({
                        admin: values[0].value,
                        site: values[1].value,
                        media: values[2].value
                    });
                },
                reject
            );
        });
    },
    returnComponentInfo = function (componentPath) {
        return parseComponentInfo(getComponentInfoFile(componentPath));
    };

exports.getComponentInfo = returnComponentInfo;
exports.getComponentFiles = returnComponentFiles;
