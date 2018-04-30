"use strict";

const
    GETCONFIG = require('../config.js'),
    CONFIG = GETCONFIG(),
    fs = require("fs-extra"),
    q = require("q"),
    path = require("path"),
    _ = require('lodash'),
    normalizePath = require('./util.js').normalizePath,
    getExtensionType = require('./util.js').getExtensionType,
    log = require('./logSys.js'),
    readDirectory = require('./readDirectory.js'),
    CopyFiles = require('./copyFiles.js'),
    getModule = require('../watcher/getModule.js'),
    getComponent = require('../watcher/getComponent.js'),
    getPlugin = require('../watcher/getPlugin.js'),
    glob = {},

    collectComplete = function (extensionType) {
        switch (extensionType) {
        case 'component':
            let componentInfo = getComponent.getComponentInfo(),
                componentFiles = getComponent.getComponentFiles();
            return q.allSettled([componentInfo, componentFiles]);
        case 'module':
            let moduleInfo = getModule.getModuleInfo(),
                moduleFiles = getModule.getModuleFiles();
            return q.allSettled([moduleInfo, moduleFiles]);
        case 'plugin':
            let pluginInfo = getPlugin.getPluginInfo(),
                pluginFiles = getPlugin.getPluginFiles();
            return q.allSettled([pluginInfo, pluginFiles]);
        }
    },
    collectInfo = function () {
        if (glob.infoObject != null) {
            return q.resolve(glob.infoObject);
        }
        let infoCollection = [];
        if (CONFIG.parts.component) infoCollection.push(getComponent.getComponentInfo());
        else infoCollection.push({ basename: 'none' });
        if (CONFIG.parts.module) infoCollection.push(getModule.getModuleInfo());
        else infoCollection.push({ basename: 'none' });
        if (CONFIG.parts.plugin) infoCollection.push(getPlugin.getPluginInfo());
        else infoCollection.push({ basename: 'none' });
        return q.all(infoCollection);

    },
    copyComponent = function () {
        return collectComplete('component').then(
            function (componentData) {
                let
                    componentInfoObject = componentData[0].value,
                    componentFilesObject = componentData[1].value,
                    pathObject = {
                        componentName: componentInfoObject.basename,
                        siteLanguagePath: path.join(normalizePath(CONFIG.paths.component), 'site', 'language'),
                        adminLanguagePath: path.join(normalizePath(CONFIG.paths.component), 'admin', 'language')
                    },
                    copyFilesObject = new CopyFiles(pathObject);

                let promiseArray = _.map(componentFilesObject, function (files, type) {
                    return copyFilesObject.copyFileArray(type, files);
                });
                return q.all(promiseArray);

            },
            console.trace
        );
    },
    copyModule = function () {
        return collectComplete('module').then(
            function (moduleData) {
                let
                    moduleInfoObject = moduleData[0].value,
                    moduleFilesObject = moduleData[1].value,
                    pathObject = {
                        moduleName: moduleInfoObject.basename,
                        siteLanguagePath: path.join(normalizePath(CONFIG.paths.module), 'language')
                    },
                    copyFilesObject = new CopyFiles(pathObject);
                
                let promiseArray = _.map(moduleFilesObject, function (files, type) {
                    return copyFilesObject.copyFileArray(type, files);
                });
                return q.all(promiseArray);

            },
            console.trace
        );
    },
    copyPlugin = function () {
        return collectComplete('plugin').then(
            function (pluginData) {
                let
                    pluginInfoObject = pluginData[0].value,
                    pluginFilesObject = pluginData[1].value,
                    pathObject = {
                        pluginName: pluginInfoObject.basename,
                        siteLanguagePath: path.join(normalizePath(CONFIG.paths.plugin), 'language')
                    },
                    copyFilesObject = new CopyFiles(pathObject);
                
                let promiseArray = _.map(moduleFilesObject, function (files, type) {
                    return copyFilesObject.copyFileArray(type, files);
                });
                return q.all(promiseArray);

            },
            console.trace
        );
    },
    fullCopy = function () {
        let promises = [];
        if (CONFIG.parts.plugin) { promises.push(copyPlugin()); }
        if (CONFIG.parts.component) { promises.push(copyComponent()); }
        if (CONFIG.parts.module) { promises.push(copyModule()); }
        return q.all(promises);
    },
    copyFile = function (type, filepath) {
        let extensionType = getExtensionType(filepath);
        let info = collectInfo();
        log.debug(extensionType);
        return info.then(function (infoObj) {
            glob.infoObject = infoObj;
            let pathObject = {
                    componentName: infoObj[0].basename,
                    moduleName: infoObj[1].basename,
                    pluginName: infoObj[2].basename,
                    siteLanguagePath: path.join(normalizePath(CONFIG.paths[extensionType]), 'language')
                },
                copyFilesObject = new CopyFiles(pathObject);
            return copyFilesObject.copyFile(type, filepath);
        });
    };

exports.copyComponent = copyComponent;
exports.copyModule = copyModule;
exports.copyPlugin = copyPlugin;
exports.fullCopy = fullCopy;
exports.copyFile = copyFile;
