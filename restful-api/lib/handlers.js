const _data = require('./data');
const helpers = require('./helpers');

var handlers = {};

handlers.ping = (data, callback) => {
    callback(200);
}

handlers.users = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

handlers._users = {};
handlers._users.post = (data, callback) => {
    var firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;
    
    if (firstName && lastName && password && phone && tosAgreement) {
        _data.read('users', phone, (err, data) => {
            if (err) {
                var hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'phone': phone,
                        'hashedPassword': hashedPassword,
                        'tosAgreement': true
                    };
                    _data.create('users', phone, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not create the user'});
                        }
                    });
                } else {
                    callback(500, {'Error': 'Could not hash the password'});
                }
            } else {
                callback(400, {'Error': 'User already exists'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};
handlers._users.get = (data, callback) => {
    var phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};
handlers._users.put = (data, callback) => {
    var phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
    
    var firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    if (phone) {
        if (firstName || lastName || password) {
            _data.read('users', phone, (err, data) => {
                if (!err && data) {
                    if (firstName) {
                        data.firstName = firstName;
                    }
                    if (lastName) {
                        data.lastName = lastName;
                    }
                    if (password) {
                        data.hashedPassword = helpers.hash(password);
                    }
                    _data.update('users', phone, data, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, {'Error': 'Could not update the user'});
                        }
                    });
                } else {
                    callback(404);
                }
            });
        } else {
            callback(400, {'Error': 'Missing required fields'});
        }
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};
handlers._users.delete = (data, callback) => {
    var phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;
    if (phone) {
        _data.read('users', phone, (err, data) => {
            if (!err && data) {
                _data.delete('users', phone, (err) =>{
                    if (!err) {
                        callback(200);
                    } else {
                        callback(400, {'Error': 'Could not delete the user'});
                    }
                });
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};

handlers.notFound = (data, callback) => {
    callback(404);
};

module.exports = handlers;