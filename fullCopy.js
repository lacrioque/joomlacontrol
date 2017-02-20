"use strict";
const
    path = require('path'),
    log = require('./logSys.js'),
    normalizePath = require('./util.js').normalizePath,
    copyComponent = function (pathObj) {
        let def = q.defer(),
            installationPath = normalizePath(CONFIG.installationPath),
            componentPath = normalizePath(CONFIG.componentPath);
        log('warnline', "\n###################### Copying Component Files    #######################\n");
        log('info', "#### From: ", componentPath);
        log('info', "#### To: ", installationPath);
        log('warnline', "\n\n");
        getComponentInfo(componentPath)
            .then(
                function (componentInfo) {
                    log('warnline', "\n###################### Copying Admin Part    #######################\n");
                    copyAdminPart(pathObj.admin, installationPath, componentInfo.basename, componentPath)
                        .then(function () {
                            log('warnline', "\n###################### Copying Site Part    #######################\n");
                            copySitePart(pathObj.site, installationPath, componentInfo.basename, componentPath)
                                .then(function () {
                                    console.log('media')
                                    log('warnline', "\n###################### Copying Media Part    #######################\n");
                                    copyMediaPart(pathObj.media, installationPath, componentInfo.basename, componentPath)
                                        .then(function () {
                                            log('warnline', "\r\n###################### Copied Everything successfully ###################\n");
                                            def.resolve()
                                        }, function (err) {
                                            def.reject(err);
                                            throw err;
                                        });
                                }, console.log);
                        }, console.log);
                }, console.log
            );
        return def.promise;
    },
    fullCopy = function (checkPermission, closeRL) {
        closeRL = closeRL || false;
        return getComponent()
            .then(
                function (files) {
                    askForPermission(checkPermission)
                        .then(
                            function (answer) {
                                if (answer === true) {
                                    copyComponent(files)
                                        .then(
                                            function () {
                                                log('warnline', "\n###################### Component successfully copied ####################\n");
                                                closeRL && rl.close();
                                            },
                                            function (err) {
                                                log('debug', err);
                                                rl.close();
                                            }
                                        );
                                } else {
                                    log('debug', files);
                                    closeRL && rl.close();
                                }
                            }
                        );

                },
                DEBUG
            );
    };
