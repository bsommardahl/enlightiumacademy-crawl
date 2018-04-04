'use strict';
const Bluebird = require('bluebird');
let request = require("request");
let login = require('./login')
let unit = require("./units")
let urls = require("../config/config").urls



let getCoursesHelper = function (cookies) {
    return new Bluebird((resolve, reject) => {
        var coursesOptions = {
            method: 'GET',
            followAllRedirects: true,
            jar: cookies,
            url: urls.coursesURL,
            headers:
                {
                    'Cache-Control': 'no-cache'
                }
        }
        request(coursesOptions, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            return resolve(JSON.parse(body));
        });
    });
}

let getCourses = Bluebird.coroutine(function* getCourses() {

    let cookies;
    try {
        cookies = yield login.init()
        let courses = yield getCoursesHelper(cookies)
        for (let record of courses.records) {
            let units = yield unit.getUnits(cookies, record.id)
            console.log(units)
        }
        return Bluebird.resolve(courses);
    } catch (err) {
        return Bluebird.reject(err);
    } finally {
		/*if (db) {
			db.close();
		}*/
    }


});


module.exports = {
    getCourses
}