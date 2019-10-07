var mysql = require('mysql');

var helper = require('./helpers');

var config = require('config');

var dbConfig = config.get('dbConfig');
var db = mysql.createConnection(dbConfig);

if (config.has('optionalFeature.detail')) {
    var detail = config.get('optionalFeature.detail');
    Dlog("config : " + detail);
}

db.connect(function(err) {
    if (err) {
        throw err;
    } else {
        helper.Dlog(' Connect DB' + helper.server_YYYYMMDD_HHmmss());
        console.log("\n\t *** New connection established with the database. ***")
    }
})

function reconnect(connection) {
    helper.Dlog("\n New connection tentative... (" + helper.server_YYYYMMDD_HHmmss() + ")");

    connection = mysql.createConnection(dbConfig);
    connection.connect((err) => {
        if (err) {
            helper.Dlog(err)
            setTimeout(() => {
                helper.Dlog("--------------- DB ReConnecting Error (" + helper.server_YYYYMMDD_HHmmss() + ").................");
                reconnect(connection);
            }, 5 * 1000);
        } else {
            helper.Dlog("\n\t *** New connection established with the database. ***")
            db = connection;
        }
    });
}

module.exports = {
    query: (sql_query, args, callback) => {

        db.query(sql_query, args, (error, result) => {
            return callback(error, result)
        })
    },

    insert: (table, columm_sql, args, callback) => {

        // db.query('INSERT INTO `' + table +'` ('+  +') VALUES ('+ +');', args, (error, result) => {
        //     return callback(error, result)
        // })
    }
}

process.on('uncaughtException', (err) => {
    // handle the error safely
    helper.Dlog("------------------------------ App is Crash DB helper (" + helper.server_YYYYMMDD_HHmmss() + ") ------------------------");
    helper.ThrowHtmlError(err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
        helper.Dlog("/!\\ PROTOCOL_CONNECTION_LOST Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        reconnect(db);
    } else if (err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT") {
        helper.Dlog("/!\\ PROTOCOL_ENQUEUE_AFTER_QUIT Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        reconnect(db);
    } else if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
        helper.Dlog("/!\\ PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        reconnect(db);
    } else if (err.code === "PROTOCOL_ENQUEUE_HANDSHAKE_TWICE") {
        helper.Dlog("/!\\PROTOCOL_ENQUEUE_HANDSHAKE_TWICE  Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        reconnect(db);
    } else if (err.code === "ECONNREFUSED") {
        helper.Dlog("/!\\ECONNREFUSED  Cannot establish a connection with the database. /!\\ (" + err.code + ")");
        reconnect(db);
    }
});