/**
 * get Module retrieves information about a module and
 * returns a simplified object containing information about it.
 */

const
    fs = require('fs-extra'),
    q = require('q'),
    _ = require('lodash'),
    xml2js = require('xml2js'),

    getModuleInfoFile = function(modulePath) {
        let files = fs.readdirSync(modulePath),
            xmlFile = _.find(files, function(file, i) {
                return path.extname(file) == '.xml';
            });
        return path.join(modulePath, xmlFile);
    },
    parseModuleInfo = function(moduleInfoFile) {
        let def = q.defer(),
            parser = new xml2js.Parser(),
            infoObj = {};

        fs.readFile(moduleInfoFile, function(err, data) {
            parser.parseString(data, function(err, result) {
                let basename = path.basename(moduleInfoFile, '.xml');

                infoObj.basename = _.startsWith(basename, 'mod_') ? basename : 'mod_' + basename;
                infoObj.name = result.extension.name;
                infoObj.version = result.extension.version;
                infoObj.language.site = result.extension.languages;
                infoObj.language.admin = result.extension.administration.languages;

                def.resolve(infoObj);
            });
        });
        return def.promise;
    },
    returnModuleInfo = function(modulePath){
      return parseModuleInfo(getModuleInfoFile(modulePath));
    };

  exports.getModule = returnModuleInfo;
