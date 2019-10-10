var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
server.listen(3000);
const cors = require('cors')
var fs = require('fs');
var mysql = require('mysql');
var helper = require('./helpers/helpers');
var db = require('./helpers/db_helpers');
const corsOptions = {
    origin: '*',
    // origin: 'http://67.207.82.224',
};
app.use(cors(corsOptions));

var user_socket_connect_list = [];
fs.readdirSync('./controllers').forEach(function(file) {
    if (file.substr(-3) == '.js') {
        route = require('./controllers/' + file);
        route.controller(app, io, user_socket_connect_list);
    }
});

Array.prototype.swap = function(x, y) {
    var b = this[x];
    this[x] = this[y];
    this[y] = b;
    return this;
};

Array.prototype.insert = function(index, item) {
    this.splice(index, 0, item);
};

Array.prototype.replace_null = function(replace = '""') {
    return JSON.parse(JSON.stringify(this).replace(/null/g, replace));
}

String.prototype.toFixed = function(length = 2) {
    return parseFloat(this).toFixed(length);
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};