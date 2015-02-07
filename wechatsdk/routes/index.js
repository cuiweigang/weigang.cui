var express = require('express');
var log = require("../module/log");
var router = express.Router();
var base = require("../module/base");

/* GET home page. */
router.get('/', function (req, res, next) {
    base.checkSignature(req.query, function (result) {
        res.send(result);
    })
});

module.exports = router;
