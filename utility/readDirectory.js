/**
 * Exports a method to read the contents of a directory fully recursive.
 * @param  {string} directory directory to be searched recursively/or file to be added
 * @return {promise}  contents of the directory recursively searched for
 */
"use strict";
const
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    log = require('./logSys.js'),
    path = require('path'),
    normalizePath = require('../utility/util.js').normalizePath,
    parseEntry = function (directory, exclude) {
        exclude = exclude || [];
        log.debug("Parsing: " + directory);
        return q.Promise(function (resolve, reject) {
            let fileStat = fs.statSync(directory);
            if (fileStat.isDirectory() &&
                !(_.some(exclude, function (item) { return (item == directory); }))) {

                readDirRecursive(directory, exclude).then(resolve, reject);
            } else {
                resolve(directory);
            }
        });
    },
    readDirRecursive = function (directory, exclude) {
        exclude = exclude || [];
        let thisdirectory = normalizePath(directory);
        let def = q.defer();
        let promiseArray = [];
        fs.readdir(thisdirectory, function (err, files) {
            if (err) {
                def.reject(err);
            }
            _.each(files, function (file, i) {
                let newpromise = parseEntry(path.join(thisdirectory, file), exclude);
                promiseArray.push(newpromise);
            });
            q.allSettled(promiseArray).then(
                function (resultset) {
                    let resultArray = [];
                    _.each(resultset, function (result, i) {
                        resultArray.push(result.value);
                    });
                    def.resolve(_.flattenDeep(resultArray));
                },
                function (err) {
                    def.reject(err);
                }
            ).catch(def.reject);
        });
        return def.promise;
    };

module.exports = parseEntry;
