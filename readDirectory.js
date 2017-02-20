/**
 * Exports a method to read the contents of a directory fully recursive.
 * @param  {string} directory directory to be searched recursively/or file to be added
 * @return {promise}  contents of the directory recursively searched for
 */
const
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    log = require('./logSys.js'),
    parseEntry = function (directory) {
        log('debug', "Parsing: ", fileOrFolder);
        return q.Promise(function (resolve, reject) {
            let fileStat = fs.statSync(fileOrFolder);
            if (fileStat.isDirectory()) {
                readDirRecursive(fileOrFolder).then(resolve, reject);
            } else {
                resolve(fileOrFolder);
            }
        });
    },
    readDirRecursive = function (directory) {
        let thisdirectory = normalizePath(directory);
        let def = q.defer();
        let promiseArray = [];
        fs.readdir(thisdirectory, function (err, files) {
                if (err) {
                    def.reject(err);
                }
                _.each(files, function (file, i) {
                    let newpromise = parseEntry(path.join(thisdirectory, file));
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
                ).catch(def.reject;
                });
            return def.promise;
        };

        module.exports = parseEntry;
