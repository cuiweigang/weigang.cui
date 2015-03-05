var express = require('express');
var http = require("http");
var request = require('request');
var mysql = require('mysql');
var router = express.Router();
var wuseClient = require("../module/db").wuse();
var erpClient = require("../module/db").erp();
var async = require("async");

function Exist(array, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == value) {
            console.log(value);
            return true;
        }
    }
    return false;
}

/* GET home page. */
router.get('/', function (req, res, next) {
    // res.cookie("name", "nihao", {"httpOnly": true, maxAge: 60000});
    res.render('index', {title: '数据统计'});
});

// 统计品牌商品数
router.get("/brands", function (req, res, next) {
    request.post("http://192.168.1.71:1001/products/search/brand", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (typeof(body) == "string") {
                var data = JSON.parse(body);
                var array = new Array();

                for (var i = 0; i < data.data.data.length; i++) {
                    var arr = new Array();
                    var item = data.data.data[i];
                    arr[0] = item.key.toString();
                    arr[1] = item.doc_count;
                    array.push(arr);
                }
            }
        }
        else {
            console.log(error);
            console.log(response.statusCode);
        }
        console.log(JSON.stringify(array));
        res.render("brands", {title: "brands", data: JSON.stringify(array)});
    });

});




module.exports = router;
