"use strict";
const
    checkLocation = require('./utility/checkLocation.js'),
    _ = require('lodash'),
    q = require("q");

q.longStackSupport = true;
let files = [
    '/opt/web/limesurveyserverstate/module/media/custom/css/custom.less',
    '/opt/web/limesurveyserverstate/component/media/custom/css/custom.less',
    '/opt/web/limesurveyserverstate/plugin/index.html',
    '/opt/web/limesurveyserverstate/module/language/en-GB/en-GB.blabla.ini',
];
_.each(files, (file) => {
    console.log(file);
    console.log(checkLocation(file));
});
