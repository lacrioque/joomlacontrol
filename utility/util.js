"use strict";
exports.normalizePath = function (thisPath) {
    if (thisPath == undefined) {
        throw new Error('ENOPATH: No path defined');
    }

    const path = require("path"),
        root = process.cwd();
    thisPath = path.normalize(thisPath);
    if (path.isAbsolute(thisPath)) {
        return thisPath
    } else {
        return path.join(root, thisPath);
    }
};
exports.getExtensionType = function (filepath) {
    const
        _ = require("lodash"),
        GETCONFIG = require('../config.js'),
        CONFIG = GETCONFIG();
    let splits = filepath.split('/'),
        componentPath = CONFIG.paths.component.split('/').pop(),
        modulePath = CONFIG.paths.module.split('/').pop(),
        pluginPath = CONFIG.paths.plugin.split('/').pop();

    if (_.some(splits, (item) => { return (item == componentPath || item == 'component') })) {
        return 'component';
    } else if (_.some(splits, (item) => { return (item == modulePath || item == 'module') })) {
        return 'module';
    } else if (_.some(splits, (item) => { return (item == pluginPath || item == 'plugin') })) {
        return 'plugin';
    } else {
        return false;
    }

};
