var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var redis = require("redis");
var db = redis.createClient("6379", "182.92.242.54");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

// 设置访问统计
app.use(function (req, res, next) {
    var us = req.headers["user-agent"];
    db.zadd("online", Date.now(), us);
    next();
});

// 获取统计
app.use(function (req, res, next) {
    var min = 60 * 1000;
    var ago = Date.now() - min;
    db.zcount('online', '-inf', '+inf', function (err, count) {
        if (err) return next(err);
        req.onLine = count;
        next();
    });
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// 404错误处理
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.send("Not Found");
});

// error handlers

// 开发环境错误处理
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// 正式环境错误处理
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send("出错了");
});

app.listen(3001, function () {
    console.log("http://localhost:3001");
});


module.exports = app;
