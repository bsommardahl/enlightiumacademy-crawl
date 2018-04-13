'use strict';
const Bluebird = require('bluebird');
let request = require("request");
let login = require('./login')
let unit = require("./units")
let urls = require("../config/config").urls
const database = require('../database/dbConfig').database;
const mongo = require("../database/mongo")
let coursesCollection = 'courses'

let createCourses = function (payload, db) {
    return new Bluebird((resolve, reject) => {
        let dbo = db.db(database);
        dbo.collection(coursesCollection).insertMany(payload, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(payload);
        });
    });
}

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

let addCreationDate = function (courses) {
    let creationDate = new Date()
    courses = courses.map(function (course) {
        course.creationDate = creationDate;
        if (course.startDate) course.startDate = new Date(course.startDate)
        if (course.attemptStartDate) course.attemptStartDate = new Date(course.attemptStartDate)
        return course
    })
    return courses

}

let getCourses = Bluebird.coroutine(function* getCourses() {

    let cookies;
    let db;
    try {
        cookies = yield login.init()
        db = yield mongo.connect()
        let courses = yield getCoursesHelper(cookies)
        courses.records = addCreationDate(courses.records)
        let _response = yield createCourses(courses.records, db)
        for (let record of courses.records) {
            console.log("UNIT: " + record.title)
            let units = yield unit.getUnits(cookies, record.id)
        }
        return Bluebird.resolve(courses);
    } catch (err) {
        return Bluebird.reject(err);
    } finally {
        if (db) {
            db.close();
        }
    }


});


module.exports = {
    getCourses
}