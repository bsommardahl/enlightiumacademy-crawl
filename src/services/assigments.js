'use strict';
const Bluebird = require('bluebird');
let request = require("request");
let urls = require("../config/config").urls



let getAssigmentsHelper = function (cookies,_id) {
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

let getAssigments = Bluebird.coroutine(function* getAssigments(cookies,_id) {

 
    try {
        let assigments = yield getAssigmentsHelper(cookies,_id)
        return Bluebird.resolve(assigments);
    } catch (err) {
        return Bluebird.reject(err);
    } finally {
		/*if (db) {
			db.close();
		}*/
	}

    
});


module.exports = {
    getAssigments
}