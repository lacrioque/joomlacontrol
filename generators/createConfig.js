/**
 * Creates a basic config file for any type of joomla extension
 */
"use strict";
const
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    normalizePath = require('../utility/util.js').normalizePath,
    readDirectory = require('../utility/readDirectory.js'),
    log = require('../utility/logSys.js'),
    hjson = require('hjson'),
    getMasterConf = function () {
        return new Promise(function (res, rej) {
            let masterConfText = fs.readFile('./generators/masterconf.inc.hjson', 'utf8', function (err, text) {
                let masterConfObject = {};
                if (err) {
                    rej(err);
                }
                try {
                    masterConfObject = hjson.parse(text);
                } catch (e) {
                    if (e) {
                        console.log(e, err, text);
                        throw new Error('could not parse hjson!')
                        rej(e);
                    }
                }
                res(masterConfObject);
            })
        });
    },
    unsetUnneeded = function (preConfiguration) {
        _.each(preConfiguration.baseconfig.parts, function (value, key) {
            if (value === false) {
                preConfiguration[key] = null;
            }
        });
        return preConfiguration;
    },
    createConfig = function (configuration) {
        let def = q.defer();
        getMasterConf().then(function (masterConfObject) {
            let preliminaryConfiguration = _.merge(masterConfObject, configuration);
            let preFinalConfiguration = unsetUnneeded(preliminaryConfiguration);
            def.resolve(preFinalConfiguration);
        })
        return def.promise;
    };


module.exports = createConfig;
