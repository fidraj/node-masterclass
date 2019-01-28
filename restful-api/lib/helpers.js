const crypto = require('crypto');
const config = require('../config');

var helpers = {};

helpers.hash = str => {
    if (typeof(str) === 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

helpers.parseJsonToObject = str => {
    try {
        var obj = JSON.parse(str);
        return obj;
    } catch (e) {
        return {};
    }
};

module.exports = helpers;