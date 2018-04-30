"use strict";
exports.normalizePath = function (thisPath) {
    if (thisPath == undefined) {
        throw new Error('ENOPATH: No path defined');
    }

    const path = require("path"),
        root = process.cwd();
        if (path.isAbsolute(thisPath)) {
            return thisPath
        } else {
        thisPath = path.join(root, thisPath);
        return path.normalize(thisPath);
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
