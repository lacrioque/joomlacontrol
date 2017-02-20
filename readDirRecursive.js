/**
 * Exports a method to read the contents of a directory fully recursive.
 * @param  {string} directory directory to be searched recursively
 * @return {array}  contents of the directory
 */

module.exports = function(directory) {
    const _ = require('lodash'),
          q = require('q');
          
    let thisdirectory = normalizePath(directory);
    let def = q.defer();
    let promiseArray = [];
    fs.readdir(thisdirectory, function(err, files) {
        if (err) {
            def.reject(err);
        }
        _.each(files, function(file, i) {
            let newpromise = parseEntry(path.join(thisdirectory, file));
            promiseArray.push(newpromise);
        });
        q.allSettled(promiseArray).then(
            function(resultset) {
                let resultArray = [];
                _.each(resultset, function(result, i) {
                    resultArray.push(result.value);
                });
                def.resolve(_.flattenDeep(resultArray));
            },
            function(err) {
                def.reject(err);
            }
        ).catch(def.reject;
    });
    return def.promise;
};
