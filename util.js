exports.normalizePath = function (thisPath) {
    thisPath = path.normalize(thisPath);
    if (path.isAbsolute(thisPath)) {
        return thisPath
    } else {
        return path.join(root, thisPath);
    }
};
