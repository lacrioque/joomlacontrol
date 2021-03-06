/**
 * Returns a constructable collection of copy methods
 *
 * Needs a pathObject formed as following:
 * componentName :
 * moduleName :
 * pluginName :
 * siteLanguagePath :
 */
"use strict";
const copyFilesConstructor = function (pathObject) {
    const
        GETCONFIG = require('../config.js'),
        CONFIG = GETCONFIG(),
        q = require('q'),
        _ = require('lodash'),
        fs = require('fs-extra'),
        path = require('path'),
        normalizePath = require('../utility/util.js').normalizePath,
        log = require('../utility/logSys.js'),
        glob = pathObject,
        _copyFile = function (filename, from, to, i, count) {
            let def = q.defer();
            if (CONFIG.debug == true) {
                def.resolve(true);
                log.debug({ action: '_copyFile', filename: filename, from: from, to: to, i: i, count: count });
            } else {
                fs.copy(path.join(from, filename), path.join(to, filename), function (err) {
                    if (err) {
                        console.trace(err);
                        def.reject({
                            'error': err,
                            'debug': {
                                action: '_copyFile',
                                filename: filename,
                                from: from,
                                to: to,
                                i: i,
                                count: count
                            }
                        });
                        throw err;
                    }
                    log.debug("" + i + "/" + count + " >>> Copied " + filename + "\n");
                    def.resolve(true);
                });
            }
            return def.promise;
        },
        _copyArrayofFiles = function (fileList, fromPath, correctPath) {
            log.infoline("\n\nCopying: " + fileList.length + " files to " + correctPath + "\n");

            let promises = _.map(fileList, function (f, i) {
                let from = path.dirname(f),
                    filename = path.basename(f),
                    to = from.replace(fromPath, correctPath);
                log.debug({
                    from: from,
                    filename: filename,
                    to: to,
                    fromPath: fromPath,
                    correctPath: correctPath
                });
                return _copyFile(filename, from, to, i, fileList.length);
            });
            return q.allSettled(promises);
        },
        _createCorrectComponentPath = function (prefix, installationPath, componentName) {
            installationPath = installationPath || normalizePath(CONFIG.paths.installation);
            componentName = componentName || glob.componentName;
            prefix = prefix || '';
            let correctPath = path.join(installationPath, prefix, 'components', componentName);
            return correctPath;
        },
        _createCorrectModulePath = function (prefix, installationPath, moduleName) {
            installationPath = installationPath || normalizePath(CONFIG.paths.installation);
            moduleName = moduleName || glob.moduleName;
            prefix = prefix || '';
            let correctPath = path.join(installationPath, prefix, 'modules', moduleName);
            return correctPath;
        },
        _createCorrectComponentMediaPath = function (installationPath, componentName) {
            installationPath = installationPath || normalizePath(CONFIG.paths.installation);
            componentName = componentName || glob.componentName;
            let correctPath = path.join(installationPath, 'media', componentName);
            return correctPath;
        },
        _createCorrectModuleMediaPath = function (installationPath, moduleName) {
            installationPath = installationPath || normalizePath(CONFIG.paths.installation);
            moduleName = moduleName || glob.moduleName;
            let correctPath = path.join(installationPath, 'media', moduleName);
            return correctPath;
        },
        _createCorrectPluginPath = function (prefix, installationPath, pluginName) {
            installationPath = installationPath || normalizePath(CONFIG.paths.installation);
            pluginName = pluginName || glob.pluginName;
            let correctPath = path.join(installationPath, 'plugins', pluginName);
            return correctPath;
        },
        _createCorrectAdminLanguagePath = function (installationPath) {
            installationPath = installationPath || normalizePath(CONFIG.paths.installation);
            let correctPath = path.join(installationPath, 'administrator', 'language');
            return correctPath;
        },
        _createCorrectSiteLanguagePath = function (installationPath) {
            installationPath = installationPath || normalizePath(CONFIG.paths.installation);
            let correctPath = path.join(installationPath, 'language');
            return correctPath;
        },
        copyAdminPart = function (adminFiles, componentPath) {
            componentPath = componentPath || normalizePath(CONFIG.paths.component);
            let correctPath = _createCorrectComponentPath('administrator'),
                fromPath = path.join(componentPath, 'admin');
            return _copyArrayofFiles(adminFiles, fromPath, correctPath);
        },
        copySitePart = function (siteFiles, componentPath) {
            componentPath = componentPath || normalizePath(CONFIG.paths.component);
            let correctPath = _createCorrectComponentPath(),
                fromPath = path.join(componentPath, 'site');
            return _copyArrayofFiles(siteFiles, fromPath, correctPath);
        },
        copyComponentMediaPart = function (mediaFiles, componentPath) {
            componentPath = componentPath || normalizePath(CONFIG.paths.component);
            let correctPath = _createCorrectComponentMediaPath(),
                fromPath = path.join(componentPath, 'media');
            return _copyArrayofFiles(mediaFiles, fromPath, correctPath);
        },
        copyModuleMediaPart = function (mediaFiles, modulePath) {
            modulePath = modulePath || normalizePath(CONFIG.paths.module);
            let correctPath = _createCorrectModuleMediaPath(),
                fromPath = path.join(modulePath, 'media');
            return _copyArrayofFiles(mediaFiles, fromPath, correctPath);
        },
        copyModulePart = function (moduleFiles, modulePath) {
            modulePath = modulePath || normalizePath(CONFIG.paths.module);
            let correctPath = _createCorrectModulePath(),
            fromPath = modulePath;
            
            log.debug([correctPath,fromPath,modulePath, moduleFiles]);
            return _copyArrayofFiles(moduleFiles, fromPath, correctPath);
        },
        copyPluginPart = function (pluginFiles, pluginPath) {
            pluginPath = pluginPath || normalizePath(CONFIG.paths.plugin);
            let correctPath = _createCorrectPluginPath(),
                fromPath = pluginPath;
            return _copyArrayofFiles(pluginFiles, fromPath, correctPath);
        },
        copyAdminLanguagePart = function (languageFiles, adminLanguagePath) {
            adminLanguagePath = adminLanguagePath || normalizePath(CONFIG.paths.component);
            let correctPath = _createCorrectAdminLanguagePath(),
                fromPath = adminLanguagePath;
            return _copyArrayofFiles(languageFiles, fromPath, correctPath);
        },
        copySiteLanguagePart = function (languageFiles, siteLanguagePath) {
            siteLanguagePath = siteLanguagePath || glob.siteLanguagePath;
            let correctPath = _createCorrectSiteLanguagePath(),
                fromPath = siteLanguagePath;
            return _copyArrayofFiles(languageFiles, fromPath, correctPath);
        },
        copyTargetAdminFile = function (file, componentPath) {
            componentPath = componentPath || normalizePath(CONFIG.paths.component);
            let correctPath = _createCorrectComponentPath('administrator'),
                from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(componentPath, 'admin'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetSiteFile = function (file, componentPath) {
            componentPath = componentPath || normalizePath(CONFIG.paths.component);
            let correctPath = _createCorrectComponentPath(),
                from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(componentPath, 'site'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetComponentMediaFile = function (file, componentPath) {
            componentPath = componentPath || normalizePath(CONFIG.paths.component);
            let correctPath = _createCorrectComponentMediaPath(),
                from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(componentPath, 'media'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetModuleMediaFile = function (file, modulePath) {
            modulePath = modulePath || normalizePath(CONFIG.paths.module);
            let correctPath = _createCorrectModuleMediaPath(),
                from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(modulePath, 'media'), correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetModuleFile = function (file, modulePath) {
            modulePath = modulePath || normalizePath(CONFIG.paths.module);
            let correctPath = _createCorrectModulePath(),
                from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(modulePath, correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetPluginFile = function (file, pluginPath) {
            pluginPath = pluginPath || normalizePath(CONFIG.paths.plugin);
            let correctPath = _createCorrectPluginPath(),
                from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(pluginPath, correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetAdminLanguageFile = function (file, adminLanguagePath) {
            adminLanguagePath = adminLanguagePath || normalizePath(CONFIG.paths.component);
            if (adminLanguagePath == null) { return q.resolve('not supported'); }

            let correctPath = _createCorrectAdminLanguagePath(),
                from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(path.join(adminLanguagePath, 'admin', 'language'), correctPath);
            log.debug([adminLanguagePath, correctPath, to]);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyTargetSiteLanguageFile = function (file, siteLanguagePath) {
            siteLanguagePath = siteLanguagePath || glob.siteLanguagePath;
            if (siteLanguagePath == null) { return q.resolve('not supported'); }
            let correctPath = _createCorrectSiteLanguagePath(),
                from = path.dirname(file),
                filename = path.basename(file),
                to = from.replace(siteLanguagePath, correctPath);
            return _copyFile(filename, from, to, 1, 1);
        },
        copyFile = function (type, file, thispath) {
            thispath = thispath || null;
            log.debug([type, file, thispath]);
            switch (type) {
            case "admin":
                return copyTargetAdminFile(file, thispath);
                break;
            case "site":
                return copyTargetSiteFile(file, thispath);
                break;
            case "module":
                return copyTargetModuleFile(file, thispath);
                break;
            case "componentMedia":
                return copyTargetComponentMediaFile(file, thispath);
                break;
            case "moduleMedia":
                return copyTargetModuleMediaFile(file, thispath);
                break;
            case "plugin":
                return copyTargetPluginFile(file, thispath);
                break;
            case "siteLanguage":
                return copyTargetSiteLanguageFile(file, thispath);
                break;
            case "adminLanguage":
                return copyTargetAdminLanguageFile(file, thispath);
                break;
            }
        },
        copyFileArray = function (type, fileArray, thispath) {
            thispath = thispath || null;
        switch (type) {
            case "admin":
                return copyAdminPart(fileArray, thispath);
                break;
            case "site":
                return copySitePart(fileArray, thispath);
                break;
            case "module":
                return copyModulePart(fileArray, thispath);
                break;
            case "componentMedia":
                return copyComponentMediaPart(fileArray, thispath);
                break;
            case "moduleMedia":
                return copyModuleMediaPart(fileArray, thispath);
                break;
            case "plugin":
                return copyPluginPart(fileArray, thispath);
                break;
            case "siteLanguage":
                return copySiteLanguagePart(fileArray, thispath);
                break;
            case "adminLanguage":
                return copyAdminLanguagePart(fileArray, thispath);
                break;
            default:
                log.debug([type, fileArray, thispath]);
            }
        };
    return {
        copyFile: copyFile,
        copyFileArray: copyFileArray
    };
};
module.exports = copyFilesConstructor;
