'use strict';
const Bluebird = require('bluebird');
const request = require("request");
const urls = require("../config/config").urls
const database = require('../database/dbConfig').database;
const mongo = require("../database/mongo")
let assigmentsCollection = 'assigments'


let createAssigments = function (payload, db) {
    return new Bluebird((resolve, reject) => {
        let dbo = db.db(database);
        dbo.collection(assigmentsCollection).insertMany(payload, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(payload);
        });
    });
}

let getAssigmentsHelper = function (cookies, _id) {
    return new Bluebird((resolve, reject) => {
        var Options = {
            method: 'GET',
            followAllRedirects: true,
            jar: cookies,
            url: urls.assignmentsURL,
            qs: { id: _id },
            headers:
                {
                    'Cache-Control': 'no-cache'
                },
            formData: { id: _id }
        }
        request(Options, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            return resolve(JSON.parse(body));
        });
    });
}

let addCreationDate = function (assigments) {
    let creationDate = new Date()
    assigments = assigments.map(function (assigment) {
        assigment.creationDate = creationDate;
        assigment.endDate = new Date(assigment.endDate)
        assigment.startDate = new Date(assigment.startDate)
        assigment.attemptStartDate = new Date(assigment.attemptStartDate)
        if (assigment.due) assigment.due = new Date(assigment.due)
        return assigment
    })
    return assigments

}

let getAssigments = Bluebird.coroutine(function* getAssigments(cookies, unitId) {

    let db;
    try {
        db = yield mongo.connect()
        let assignments = yield getAssigmentsHelper(cookies, unitId)
        let filtered = assignments.filter(x => x.status == "Graded")
        filtered.forEach(x => console.log(x.status));
        //console.log("assignments: " + filtered.length)
        if (filtered.length > 0) {
            filtered = addCreationDate(filtered)
            let _response = yield createAssigments(filtered, db)
            return Bluebird.resolve(_response);
        }
        else {
            Bluebird.resolve({});
        }
    } catch (err) {
        return Bluebird.reject(err);
    } finally {
        if (db) {
            db.close();
        }
    }


});


module.exports = {
    getAssigments
}