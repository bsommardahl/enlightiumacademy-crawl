'use strict';
const Bluebird = require('bluebird');
let request = require("request");
let assigments = require("./assigments")
let urls = require("../config/config").urls



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

let getUnits = Bluebird.coroutine(function* getUnits(cookies, _id) {


    try {
        let units = yield getUnitsHelper(cookies, _id)
        for (let unit of units) {
            let assigment = yield assigments.getAssigments(cookies,unit.id)
            console.log(assigment)
        }
        return Bluebird.resolve(units);
    } catch (err) {
        return Bluebird.reject(err);
    } finally {
		/*if (db) {
			db.close();
		}*/
    }


});


module.exports = {
    getUnits
}