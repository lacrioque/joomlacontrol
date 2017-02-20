"use strict";

const
    CONFIG = require('./config.json'),
    fs = require("fs-extra"),
    q = require("q"),
    path = require("path"),
    normalizePath = require('./util.js').normalizePath,
    log = require('./logSys.js'),
    copyFiles = require('copyFiles.js'),
