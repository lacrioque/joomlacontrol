"use strict";
const
    createLog = function (verbosity = 0) {
        let CONFIG = { verbosity: null };
        try {
            CONFIG = require('../config.json');
        } catch (e) {}
        verbosity = process.env.verbosity || CONFIG.verbosity || 0;
        process.env.verbosity = verbosity;
        process.on('changeVerbosity', function () {
            verbosity++;
            verbosity = verbosity > 2 ? 0 : verbosity;
            process.env.verbosity = verbosity;
        })
        const
            methods = {
                //define used methods
                warn: function () {
                    verbosity >= 0 && console.log.apply(console, arguments);
                },
                info: function () {
                    verbosity >= 1 && console.log.apply(console, arguments);
                },
                debug: function () {
                    verbosity >= 2 && console.dir.apply(console, arguments);
                },
                debugObj: function () {
                    verbosity >= 2 && console.dir.apply(console, [arguments, { depth: null, colors: true }]);
                },
                warnline: function (text) {
                    verbosity >= 0 && process.stdout.write(text);
                },
                infoline: function (text) {
                    verbosity >= 1 && process.stdout.write(text);
                },
                debugline: function (text) {
                    verbosity >= 2 && process.stdout.write(text);
                }
            };
        return methods;
    };
module.exports = createLog();
