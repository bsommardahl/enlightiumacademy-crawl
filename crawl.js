'use strict';
require('dotenv').config()
let login = require('./src/services/login')
let courses = require('./src/services/courses')
let schedule = require('node-schedule');
const co = require('co');
let job = require('./src/config/config').job

//var j = schedule.scheduleJob(job.cron, function(){
console.log('Start The Crawl');
co(function* () {
    var result = yield courses.getCourses()
    return result;
}).then(function (value) {
    console.log('End The Crawl');
}, function (err) {
    console.error(err.stack);
});
  //});






