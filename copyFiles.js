/**
 * Returns a constructable collection of copy methods
 */
"use strict";
const copyFilesConstructor = function(pathObject) {
    const
        q = require('q'),
        _ = require('lodash'),
        fs = require('fs-extra'),
        path = require('path'),
        glob = pathObject,
        _copyFile = function(filename, from, to, i, count) {
            let def = q.defer();
            fs.copy(path.join(from, filename), path.join(to, filename), function(err) {
                if (err) {
                    def.reject(err);
                    throw err;
                }
                def.notify({
                    debug: "" + i + "/" + count + " >>> Copied " + filename + "\n"
                });
                def.resolve(true);
            });
            return def.promise;
        },
        _createCorrectComponentPath = function(prefix, installationPath, componentName) {
            installationPath = installationPath || glob.installationPath;
            componentName = componentName || glob.componentName;
            prefix = prefix || '';
            return correctComponentPath = path.join(installationPath, prefix, 'components', componentName);
        },
        _createCorrectModulePath = function(prefix, installationPath, moduleName) {
            installationPath = installationPath || glob.installationPath;
            moduleName = moduleName || glob.moduleName;
            prefix = prefix || '';
            return correctComponentPath = path.join(installationPath, prefix, 'modules', moduleName);
        },
        _createCorrectMediaPath = function(installationPath, componentName) {
            installationPath = installationPath || glob.installationPath;
            componentName = componentName || glob.componentName;
            return correctComponentPath = path.join(installationPath, 'media', componentName);
        },
        _createCorrectPluginPath = function(prefix, installationPath, pluginName) {
            installationPath = installationPath || glob.installationPath;
            pluginName = pluginName || glob.pluginName;
            return correctComponentPath = path.join(installationPath, 'plugins', pluginName);
        },
        _createCorrectLanguagePath = function(installationPath) {
            installationPath = installationPath || glob.installationPath;
            pluginName = pluginName || glob.pluginName;
            let prefix = (/\/admin\/language\//).test(installationPath) ? 'administrator' : '';
            return correctComponentPath = path.join(installationPath, prefix, 'language');
        },
        _copyArrayofFiles = function(fileList, fromPath, correctPath) {
            def.notify({
                infoline: "\n\nCopying: " + fileList.length + " files to " + correctPath + "\n"
            });
            let promises = _.map(adminFiles, function(f, i) {
                let from = path.dirname(f),
                    filename = path.basename(f),
                    to = from.replace(fromPath, correctComponentPath);
                def.notify({
                    debug: {
                        from: from,
                        filename: filename,
                        to: to
                    }
                });
                return _copyFile(filename, from, to, i, fileList.length);
            });
            return q.allSettled(promises);
        },
        switchLanguageGlobal = function(newLanguageGlobal) {
            glob.languagePath = newLanguageGlobal;
        },
        toggleLanguageGlobal = function(newLanguageGlobal) {
            glob.languagePath = _.endsWith(glob.languagePath, '/admin/') ? glob.languagePath.replace(/admin\//, '') : glob.languagePath + "admin/";
        },
        copyAdminPart = function(adminFiles, componentPath) {
            componentPath = componentPath || glob.componentPath;
            let correctPath = _createCorrectComponentPath('administrator'),
                fromPath = path.join(componentPath, 'admin');
            return _copyArrayofFiles(adminFiles, fromPath, correctPath);
        },
        copySitePart = function(siteFiles, componentPath) {
            componentPath = componentPath || glob.componentPath;
            let correctPath = _createCorrectComponentPath(),
                fromPath = path.join(componentPath, 'site');
            return _copyArrayofFiles(siteFiles, fromPath, correctPath);
        },
        copyMediaPart = function(mediaFiles, componentPath) {
            componentPath = componentPath || glob.componentPath;
            let correctPath = _createCorrectMediaPath(),
                fromPath = path.join(componentPath, 'media');
            return _copyArrayofFiles(siteFiles, fromPath, correctPath);
        },
        copyModulePart = function(moduleFiles, modulePath) {
            modulePath = modulePath || glob.modulePath;
            let correctPath = _createCorrectModulePath(),
                fromPath = path.join(modulePath, 'media');
            return _copyArrayofFiles(siteFiles, fromPath, correctPath);
        },
        copyPluginPart = function(pluginFiles, pluginPath) {
            pluginPath = pluginPath || glob.pluginPath;
            let correctPath = _createCorrectPluginPath(),
                fromPath = path.join(pluginPath, 'media');
            return _copyArrayofFiles(siteFiles, fromPath, correctPath);
        },
        copyLanguagePart = function(pluginFiles, languagePath) {
            let correctPath = _createCorrectLanguagePath(),
                fromPath = path.join(languagePath, 'language');
            return _copyArrayofFiles(siteFiles, fromPath, correctPath);
        },
        copyTargetAdminFile = function(file, componentPath) {
            componentPath = componentPath || glob.componentPath;
            let correctPath = _createCorrectComponentPath('administrator'),
                let from = path.dirname(file),
                    filename = path.basename(file),
                    to = from.replace(path.join(componentPath, 'admin'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetSiteFile = function(file, componentPath) {
            componentPath = componentPath || glob.componentPath;
            let correctPath = _createCorrectComponentPath(),
                let from = path.dirname(file),
                    filename = path.basename(file),
                    to = from.replace(path.join(componentPath, 'site'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetMediaFile = function(file, componentPath) {
            componentPath = componentPath || glob.componentPath;
            let correctPath = _createCorrectMediaPath();
            let from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(componentPath, 'media'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetModuleFile = function(file, modulePath) {
            modulePath = modulePath || glob.modulePath;
            let correctPath = _createCorrectModulePath();
            let from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(modulePath, 'media'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetPluginFile = function(file, pluginPath) {
            pluginPath = pluginPath || glob.pluginPath;
            let correctPath = _createCorrectPluginPath();
            let from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(pluginPath, 'media'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetLanguageFile = function(file, languagePath) {
            languagePath = languagePath || glob.languagePath;
            let correctPath = _createCorrectLanguagePath();
            let from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(languagePath, 'language'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyFile = function(type, file, path) {
            path = path || null;
            switch (type) {
                case "admin":
                    return copyTargetAdminFile(file, path) break;
                case "site":
                    return copyTargetSiteFile(file, path) break;
                case "media":
                    return copyTargetMediaFile(file, path) break;
                case "module":
                    return copyTargetModuleFile(file, path) break;
                case "plugin":
                    return copyTargetPluginFile(file, path) break;
                case "language":
                    return copyTargetLanguageFile(file, path) break;
            }
        },
        copyFileArray = function(type, fileArray, path) {
            path = path || null;
            switch (type) {
                case "admin":
                    return copyAdminPart(fileArray, path) break;
                case "site":
                    return copySitePart(fileArray, path) break;
                case "media":
                    return copyMediaPart(fileArray, path) break;
                case "module":
                    return copyModulePart(fileArray, path) break;
                case "plugin":
                    return copyPluginPart(fileArray, path) break;
                case "language":
                    return copyLanguagePart(fileArray, path) break;
            }
        };
    return {
        copyFile: copyFile,
        copyFileArray: copyFileArray,
        switchLanguageGlobal = switchLanguageGlobal,
        toggleLanguageGlobal = toggleLanguageGlobal
    };
};
module.exports = copyFilesConstructor;
