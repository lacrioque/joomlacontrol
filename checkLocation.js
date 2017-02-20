/**
 * Module to check the location aparameter of a file
 */
"use strict";
    const
        path = require('path'),
        _ = require('lodash'),
        locations = {
            admin: new RegExp(/\/admin\/(?!language\/)/),
            site: new RegExp(/\/site\/(?!language\/)/),
            media: new RegExp(/\/media\//),
            plugin: new RegExp(/\/plugin\//),
            module: new RegExp(/\/module\//),
            siteLanguage: new RegExp(/\/site\/language\//),
            adminLanguage: new RegExp(/\/admin\/language\//)
        },
        checkMethods = {
            admin: function(filepath) {
                var checkAdminRegex = locations.admin;
                return checkAdminRegex.test(filepath);
            },
            site: function(filepath) {
                var checkSiteRegex = locations.site;
                return checkSiteRegex.test(filepath);
            },
            media: function(filepath) {
                var checkMediaRegex = locations.media;
                return checkMediaRegex.test(filepath);
            },
            plugin: function(filepath) {
                var checkAdminRegex = locations.plugin;
                return checkAdminRegex.test(filepath);
            },
            module: function(filepath) {
                var checkSiteRegex = locations.module;
                return checkSiteRegex.test(filepath);
            },
            siteLanguage: function(filepath) {
                var checkMediaRegex = locations.siteLanguage;
                return checkMediaRegex.test(filepath);
            },
            adminLanguage: function(filepath) {
                var checkMediaRegex = locations.adminLanguage;
                return checkMediaRegex.test(filepath);
            }
        },
        checkLocation = function(filepath) {
            let type = '';
            _.each(checkMethods, function(fn, key) {
              let result = fn(filepath);
                if (result) {
                    type = key;
                }
            });
            return type;
        };
    module.exports = checkLocation;
