var helper = require('./../helpers/helpers')
var db = require('./../helpers/db_helpers')
var fs = require('fs')
var multiparty = require('multiparty')
var request = require('request')
const image_save_path = "./public/img/"

module.exports.controller = function(app, io, socket_list) {
    //String value
    const msg_success = "successfully"
    const msg_fail = "fail"
    const msg_login_other_device = "Login other device"
    const msg_invalid_user_password = "invalid username or password"
    const msg_user_already_exits = "Already Exist."
    const msg_already_exits = "Email Already Exist."
    const msg_invalid_user = "invalid user"
    const msg_otp_code_fail = "Invalid OTP Code"
    const msg_otp_code = "OTP verify successfully"
    const msg_forgot_password = "forgot password successfully. please check your email inbox"
    const msg_email_send = "Email send Successfully"
    const msg_change_password = "Password change successfully"
    const msg_old_password_wrong = "Old password is wrong"
    const msg_user_success = "new user create successfully"
        // console.log("data");
    app.post('/api/admin/login', (req, res) => {
        helper.Dlog(req.body)
        var reqObj = req.body;
        helper.CheckParameterValid(res, reqObj, ['user_name', 'password', 'socket_id'], () => {

            var auth_token = helper.create_request_token();
            helper.Dlog("auth_token :-----------" + auth_token);
            db.query('UPDATE `user_detail` SET `auth_token`= ?   WHERE `email` = ? AND `password` = ? AND `user_type`= 1', [auth_token, reqObj.user_name, reqObj.password], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }
                if (result['affectedRows'] == 1) {

                    db.query('SELECT `user_id`,`image_name`, `name`, `email`, `mobile`, `auth_token` FROM `user_detail` WHERE `email` = ?', [reqObj.user_name], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }
                        if (result.length == 1) {

                            // Other Deivce inLogin
                            var user_id = result[0].user_id;
                            if (socket_list['us_' + user_id] != null && io.sockets.connected[socket_list['us_' + user_id].socket_id]) {

                                helper.Dlog(' Other login ---------------------------- ' + socket_list['us_' + user_id].socket_id);
                                io.sockets.connected[socket_list['us_' + user_id].socket_id].emit('UpdateSocket', {
                                    "success": "false",
                                    "status": "0",
                                    "message": msg_login_other_device
                                });
                            }

                            socket_list['us_' + user_id] = {
                                'socket_id': reqObj.socket_id
                            };

                            response = {
                                "success": "true",
                                "status": "1",
                                "payload": result[0]
                            }
                        } else {
                            response = {
                                "success": "false",
                                "status": "0",
                                "message": msg_invalid_user_password
                            };
                        }
                        res.json(response)
                    });
                } else {
                    res.json({
                        "success": "false",
                        "status": "0",
                        "message": msg_invalid_user_password
                    })
                }
            })
        })
    })

    app.post('/api/user_image_upload', (req, res) => {
        var form = new multiparty.Form();
        helper.Dlog(req.body);
        form.parse(req, (err, fields, files) => {
            if (err) {
                helper.ThrowHtmlError(err, res);
                return
            }
            helper.CheckParameterValid(res, fields, ['access_token', "user_id"], () => {

                helper.CheckParameterValid(res, files, ["image"], () => {
                    console.log(files);
                    // console.log(res);
                    var image_name = "profile/" + helper.file_name_generate(files.image[0].originalFilename.substring(files.image[0].originalFilename.lastIndexOf(".") + 1));;
                    var new_path = image_save_path + image_name;

                    fs.copyFile(files.image[0].path, new_path, () => {
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }
                        db.query("UPDATE `user_detail` SET `image_name` = ? WHERE `user_id` = ?", [image_name, fields.user_id[0]], (err, result) => {
                            if (err) {
                                helper.ThrowHtmlError(err, res)
                                return
                            }
                            if (result.affectedRows > 0) {

                                res.json({
                                    "success": "true",
                                    "status": "1",
                                    "payload": [{ 'image': image_name }]
                                });

                            } else {
                                res.json({
                                    "success": "false",
                                    "status": "0",
                                    "message": msg_fail
                                });
                            }
                        })
                    })
                })
            })
        })
    })


    app.post('/api/admin/user_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;

        helper.CheckParameterValid(res, reqObj, ['user_id', 'access_token'], () => {
            db.query('SELECT * FROM `user_detail` ', [], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if (result.length > 0) {
                    console.log(result);
                    res.json({
                        'success': 'true',
                        'status': '1',
                        'payload': result
                    })
                } else {
                    res.json({
                        'success': 'false',
                        'status': '0',
                        'payload': []
                    })
                }
            })
        })
    })

}