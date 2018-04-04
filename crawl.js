'use strict';
let login = require('./src/services/login')
let courses = require('./src/services/courses')
const co = require('co');

co(function* () {
    var result = yield courses.getCourses()
    return result;
}).then(function (value) {
    //console.log(value);
}, function (err) {
    console.error(err.stack);
});



