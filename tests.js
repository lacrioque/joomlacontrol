"use strict";
console.log(process.env.verbosity);
process.env.verbosity = 2;
console.log(process.env.verbosity);

const
    log = require('./utility/logSys.js'),
    scriptUtil = require('./utility/scriptUtil.js'),
    _ = require('lodash'),
    q = require("q");

q.longStackSupport = true;
scriptUtil.zipComponent().then(console.log, console.log);
