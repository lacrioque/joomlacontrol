"use strict";
const
    GETCONFIG = require('../config.js'),
    CONFIG = GETCONFIG(),
    q = require('q'),
    _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    normalizePath = require('../utility/util.js').normalizePath,
    readDirectory = require('./readDirectory.js'),
    log = require('../utility/logSys.js'),
