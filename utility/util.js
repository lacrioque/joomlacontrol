"use strict";
exports.normalizePath = function (thisPath) {
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
    const _ = require("lodash");
    let splits = filepath.split('/');

    if (_.some(splits, (item) => { return item == 'component' })) {
        return 'component';
    } else if (_.some(splits, (item) => { return item == 'module' })) {
        return 'module';
    } else if (_.some(splits, (item) => { return item == 'plugin' })) {
        return 'plugin';
    } else {
        return false;
    }

};
