'use strict';
const Bluebird = require('bluebird');
let request = require("request");
let urls = require("../config/config").urls
let creds = require("../config/config").creds
let cookies = request.jar()

let loginOptions = {
    method: 'POST',
    followAllRedirects: true,
    jar: cookies,
    url: urls.loginURL,
    qs: { j_username: creds.j_username, j_password: creds.j_password },
    headers:
        {
            'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
        },
    formData: { j_username: creds.j_username, j_password: creds.j_password }
};

let init = function () {
    return new Bluebird((resolve, reject) => {
        request(loginOptions, function (error, response, body) {
            if (error) {
                return reject(error);
            }
            return resolve(cookies);
        });
    });
}

module.exports = {
    init
}