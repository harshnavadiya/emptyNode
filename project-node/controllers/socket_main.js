var helper = require('../helpers/helpers');
var db = require('../helpers/db_helpers');
var fs = require('fs');

module.exports.controller = function(app, io, socket_list) {
    var response = '';

    const msg_success = "successfully"
    const msg_user_block = "user is blocked !!! Please contact Admin"
    const msg_login_other_device = "Login other device"
    const msg_fail = "fail"

    const ut_user = 0
    const ut_agent = 1
    const ut_admin = 3

    const near_by_location_in_km = 10;

    io.on('connection', function(client) {

        client.on('UpdateSocket', function(data, socketId) {
            helper.Dlog('UpdateSocket Data :- ' + data);
            var jsonObj = JSON.parse(data);

            helper.CheckParameterValid_Socket(client, 'UpdateSocket', jsonObj, ['user_id'], () => {
                // db.query('Select COUNT(*) as `counter_auth` , `status` FROM `user` WHERE `user_id` = ? ', [jsonObj.user_id], (err, result) => {
                //     if (err) {
                //         helper.ThrowSocketError(err, client, "UpdateSocket")
                //         return
                //     }
                //     if (result[0].counter_auth == 1) {
                //         socket_list['us_' + jsonObj.user_id] = { 'socket_id': client.id }
                //         response = { "success": "true", "status": "1", "message": msg_success }
                //     } else if (result[0].status == '2') {
                //         response = { "success": "false", "status": "2", "message": msg_user_block }
                //     } else {
                //         response = { "success": "false", "status": "0", "message": msg_login_other_device }
                //     }
                //     client.emit('UpdateSocket', response)
                // });
            })
        })
    })

}