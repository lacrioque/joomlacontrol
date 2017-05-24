/**
 * Module to check the location aparameter of a file
 */
"use strict";
const
    CONFIG = require('../config.json'),
    path = require('path'),
    _ = require('lodash'),
    log = require('./logSys.js'),
    singulateLastPath = function (pathpart) {
        return pathpart.split('/').pop();
    },
    locations = {
        admin: new RegExp(/\/admin\/(?!language\/)/),
        site: new RegExp(/\/site\/(?!language\/)/),
        adminLanguage: new RegExp(/\/admin\/language\//),
        siteLanguage: new RegExp(/\/language\//),
        componentMedia: new RegExp(/\/media\//),
        plugin: new RegExp("/" + singulateLastPath(CONFIG.paths.plugin) + "/"),
        module: new RegExp("/" + singulateLastPath(CONFIG.paths.module) + "/"),
        moduleMedia: new RegExp("/" + singulateLastPath(CONFIG.paths.module) + "/media/")
    },
    checkMethods = {
        admin: function (filepath) {
            var checkAdminRegex = locations.admin;
            return checkAdminRegex.test(filepath);
        },
        site: function (filepath) {
            var checkSiteRegex = locations.site;
            return checkSiteRegex.test(filepath);
        },
        adminLanguage: function (filepath) {
            var checkLanguageRegex = locations.adminLanguage;
            return checkLanguageRegex.test(filepath);
        },
        siteLanguage: function (filepath) {
            var checkLanguageRegex = locations.siteLanguage;
            return checkLanguageRegex.test(filepath);
        },
        plugin: function (filepath) {
            var checkAdminRegex = locations.plugin;
            return checkAdminRegex.test(filepath);
        },
        module: function (filepath) {
            var checkSiteRegex = locations.module;
            return checkSiteRegex.test(filepath);
        },
        moduleMedia: function (filepath) {
            var checkMediaRegex = locations.moduleMedia;
            return checkMediaRegex.test(filepath);
        },
        componentMedia: function (filepath) {
            var checkMediaRegex = locations.componentMedia;
            return checkMediaRegex.test(filepath);
        },
        notSupported: function () {
            return true;
        }
    },
    checkLocation = function (filepath) {
        return _.findKey(checkMethods, function (fn) {
            return fn(filepath);
        });

    };
module.exports = checkLocation;
