/**
 * Exports method that are directly scripting or creating stuff.
 */
"use strict";
const
    GETCONFIG = require('../config.js'),
    CONFIG = GETCONFIG(),
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    zip = new require('node-zip')(),
    log = require('./logSys.js'),
    readDirectory = require('./readDirectory.js'),
    path = require('path'),
    normalizePath = require('../utility/util.js').normalizePath,
    packagesDir = normalizePath(CONFIG.paths.packagesDir),
    _createInZipPath = function (filePath) {
        let basePath = normalizePath(CONFIG.paths.root);
        let inZip = filePath.replace(basePath, '');
        return inZip;
    },
    zipComponent = function () {
        let deferred = q.defer();
        let directoryList = readDirectory(CONFIG.paths.component);
        directoryList.then(
            function (fileList) {
                let listLength = fileList.length;
                _.each(fileList, function (file, i) {
                    log.debug("File " + i + " of " + listLength);
                    zip.file(_createInZipPath(file), fs.readFileSync(file));
                    //log.debug([_createInZipPath(file), file]);
                });
                let data = zip.generate({ base64: false, compression: 'DEFLATE' });
                fs.writeFile(path.join(packagesDir, 'component.zip'), data, 'binary', (err) => {
                    if (err) { deferred.reject(err); }
                    log.warn('Created component.zip');
                    deferred.resolve();
                });
            }
        );
        return deferred.promise;
    },
    zipModule = function () {
        let deferred = q.defer();
        let directoryList = readDirectory(CONFIG.paths.module);
        directoryList.then(
            function (fileList) {
                let listLength = fileList.length;
                _.each(fileList, function (file, i) {
                    log.debug("File " + i + " of " + listLength);
                    zip.file(_createInZipPath(file), fs.readFileSync(file));
                    //log.debug([_createInZipPath(file), file]);
                });
                let data = zip.generate({ base64: false, compression: 'DEFLATE' });
                fs.writeFile(path.join(packagesDir, 'module.zip'), data, 'binary', (err) => {
                    if (err) { deferred.reject(err); }
                    log.warn('Created module.zip');
                    deferred.resolve();
                });
            }
        );
        return deferred.promise;
    },
    zipPlugin = function () {
        let deferred = q.defer();
        let directoryList = readDirectory(CONFIG.paths.plugin);
        directoryList.then(
            function (fileList) {
                let listLength = fileList.length;
                _.each(fileList, function (file, i) {
                    log.debug("File " + i + " of " + listLength);
                    zip.file(_createInZipPath(file), fs.readFileSync(file));
                    //log.debug([_createInZipPath(file), file]);
                });
                let data = zip.generate({ base64: false, compression: 'DEFLATE' });
                fs.writeFile(path.join(packagesDir, 'plugin.zip'), data, 'binary', (err) => {
                    if (err) { deferred.reject(err); }
                    log.warn('Created plugin.zip');
                    deferred.resolve();
                });
            }
        );
        return deferred.promise;
    },
    zipAll = function () {
        log.warn("Zipping up all parts into " + path.join(CONFIG.paths.root, 'packages'));
        let promises = [];
        if (CONFIG.parts.component)
            promises.push(zipComponent());
        if (CONFIG.parts.module)
            promises.push(zipModule());
        if (CONFIG.parts.plugin)
            promises.push(zipPlugin());
        return q.allSettled(promises);
    },
    scriptUtil = {
        zipComponent: zipComponent,
        zipModule: zipModule,
        zipPlugin: zipPlugin,
        zipAll: zipAll
    };

let checkPackagesDir = fs.mkdirsSync(normalizePath(CONFIG.paths.packagesDir));

module.exports = scriptUtil;
