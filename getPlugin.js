/**
 * get Plugin retrieves information about a plugin and
 * returns a simplified object containing information about it.
 */

const
    fs = require('fs-extra'),
    q = require('q'),
    _ = require('lodash'),
    xml2js = require('xml2js'),

    getPluginInfoFile = function(pluginPath) {
        let files = fs.readdirSync(pluginPath),
            xmlFile = _.find(files, function(file, i) {
                return path.extname(file) == '.xml';
            });
        return path.join(pluginPath, xmlFile);
    },
    parsePluginInfo = function(pluginInfoFile) {
        let def = q.defer(),
            parser = new xml2js.Parser(),
            infoObj = {};

        fs.readFile(pluginInfoFile, function(err, data) {
            parser.parseString(data, function(err, result) {
                let basename = path.basename(pluginInfoFile, '.xml');

                infoObj.basename = _.startsWith(basename, 'plg_') ? basename : 'plg_' + basename;
                infoObj.name = result.extension.name;
                infoObj.version = result.extension.version;
                infoObj.language.site = result.extension.languages;
                infoObj.language.admin = result.extension.administration.languages;

                def.resolve(infoObj);
            });
        });
        return def.promise;
    },

    returnPluginFiles = function(pluginPath){
      let pluginPath = normalizePath(pluginPath);
      return q.Promise(function(resolve, reject) {
          promiseAdminArray = parseEntry(pluginPath).then(
              function(value) {
                  log('warnline',"######################## Collected Plugin Files #########################\n\n");
                  resolve({
                      plugin: value
                  });
              },
              reject
          );
      });
    }
    returnPluginInfo = function(pluginPath){
      return parsePluginInfo(getPluginInfoFile(pluginPath));
    };

  exports.getPluginInfo = returnPluginInfo;
  exports.getPluginFiles = returnPluginFiles;
