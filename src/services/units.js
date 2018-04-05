'use strict';
const Bluebird = require('bluebird');
let request = require("request");
let assigments = require("./assigments")
let urls = require("../config/config").urls
const database = require('../database/dbConfig').database;
const mongo = require("../database/mongo")
let unitsCollection = 'units'

let createUnits = function(payload,db) {
    return new Bluebird((resolve, reject) => {
        let dbo = db.db(database);
        dbo.collection(unitsCollection).insertMany(payload, (err) => {
            if (err) {
                return reject(err);
            }
            return resolve(payload);
        });
    });
}

let getUnitsHelper = function (cookies, _id) {
    return new Bluebird((resolve, reject) => {
        var Options = {
            method: 'GET',
            followAllRedirects: true,
            jar: cookies,
            url: urls.unitsURL,
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

let addCreationDate = function(units){
    let creationDate = new Date()
    units = units.map(function(unit){
        unit.creationDate = creationDate;
        if(unit.startDate) unit.startDate = new Date(unit.startDate)
        return unit
    })
    return units

}

let getUnits = Bluebird.coroutine(function* getUnits(cookies, _id) {

    let db;
    try {
        db = yield mongo.connect()
        let units = yield getUnitsHelper(cookies, _id)
        units = addCreationDate(units)
        let _response = yield createUnits(units,db)
        for (let unit of units) {
            let assigment = yield assigments.getAssigments(cookies,unit.id)
        }
        return Bluebird.resolve(_response);
    } catch (err) {
        return Bluebird.reject(err);
    } finally {
		if (db) {
			db.close();
		}
    }


});


module.exports = {
    getUnits
}