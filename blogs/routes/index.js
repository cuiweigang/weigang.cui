var express = require('express');
var redis = require("redis");
var client = redis.createClient("6379", "182.92.242.54");
var router = express.Router();
var async = require("async");

/* GET home page. */
router.get('/', function (req, res, next) {

    // 瀑布流模型
    //async.waterfall([
    //    function (cb) {
    //        console.log(1);
    //        cb(null, {"name": "1"});
    //    },
    //    function (result, cb) {
    //        console.log(result);
    //        cb(null, 2);
    //    },
    //    function (result, cb) {
    //        console.log(result);
    //    }
    //], function (err, result) {
    //});

    var arr = [{name: '1', delay: 200},
        {name: '2', delay: 100},
        {name: '3', delay: 300}];
    // 集合都执行统一操作；
    //async.each(arr, function (item, callback) {
    //    console.log(item);
    //});

    // 异步执行，每个方法都可以异步执行
    async.parallel([
        function (cb) {
            //  console.log(arr[0]);
            cb(null, 1);
        },
        function (cb) {
            //  console.log(arr[1]);
            cb(null, 2);
        },
        function (cb) {
            //  console.log(arr[2]);
            cb(null, 3);
        }
    ], function (err, results) {
        console.log("result");
        console.log(err);
        console.log(results);
        res.render('index', {title: 'Express'});
    });

    //console.log("online:%s", req.onLine);
    //// 设置cookie
    //res.cookie('tobi', '1', {expires: new Date(Date.now() + 900000), httpOnly: true});
    //res.cookie('na', 'cui', {secure: false, httpOnly: false});


});

router.get("/c", function (req, res, next) {
    var value = req.cookies.name;
    req.cookie;
    console.log(req.cookies);
    res.send(value);
});

module.exports = router;

