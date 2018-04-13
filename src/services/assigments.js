'use strict';
const Bluebird = require('bluebird');
const request = require("request");
const urls = require("../config/config").urls
const database = require('../database/dbConfig').database;
const mongo = require("../database/mongo")
let assigmentsCollection = 'assigments'


let createAssigments = function (payload, dbo) {
    return new Bluebird((resolve, reject) => {
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

let getExistingAssignments = (dbo) => {
    return new Bluebird((resolve, reject) => {
        dbo
            .collection(assigmentsCollection)
            .find({})
            .toArray(function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    console.log(result);
                    resolve(JSON.stringify(result));
                }
            })

    });
};

let uniqueId = (a) => `${a.course}|${a.unit}|${a.title}`;

let getNewlyGraded = (gradedAssignments, allAssignments) => {
    return gradedAssignments.reduce((arr, assignment) => {
        const existing = allAssignments.find(x => uniqueId(x) === uniqueId(assignment));
        if (!existing) arr.push(assignment);
    }, []);
};

let getAssigments = Bluebird.coroutine(function* getAssigments(cookies, unitId) {

    let db;
    try {
        db = yield mongo.connect()
        let dbo = db.db(database);
        let assignments = yield getAssigmentsHelper(cookies, unitId)
        let gradedAssignments = assignments.filter(x => x.status == "Graded")
        let existingAssignments = yield getExistingAssignments(dbo);
        let newlyGradedAssignments = getNewlyGraded(gradedAssignments, existingAssignments);
        if (newlyGradedAssignments.length > 0) {
            newlyGradedAssignments = addCreationDate(newlyGradedAssignments)
            let _response = yield createAssigments(newlyGradedAssignments, dbo)
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