var express = require('express');
var log = require("../module/log");
var router = express.Router();
var base = require("../module/base");


var message = require("../module/message");

/* GET home page. */
router.get('/', function (req, res, next) {

    return res.send("hello world");

    // 验证
    //base.checkSignature(req.query, function (result) {
    //    res.send(result);
    //})
});


//router.get("/wx", function (req, res, next) {
//    // 验证
//    base.checkSignature(req.query, function (result) {
//        res.send(result);
//    })
//})


router.post("/wx", function (req, res, next) {

    req.rawBody = '';

    req.setEncoding('utf8');

    req.on('data', function (chunk) {
        req.rawBody += chunk;
    });

    req.on('end', function () {
        // json=xml2json.toJson(req.rawBody);
        log.info(req.rawBody);

        message.reply(req.rawBody, function (result) {
            log.info("回复信息-index：%", result);
            res.send(result);
        });
        // res.send(JSON.stringify(req.rawBody));
    });

    //base.checkSignature(req.query, function (result) {
    //    res.send(result);
    //});


})


module.exports = router;
