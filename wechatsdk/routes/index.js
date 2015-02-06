var express = require('express');
var log = require("../module/log");
var router = express.Router();
var base = require("../module/base");

/* GET home page. */
router.get('/', function (req, res, next) {

    // 获取AssessToken
    base.getIps(function (data) {
        console.log(data);
        res.render('index', {title: 'Express'});
    });

});

module.exports = router;
