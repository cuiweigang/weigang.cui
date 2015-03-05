var express = require('express');
var http = require("http");
var router = express.Router();
var wuseClient = require("../module/db").wuse();
var async = require("async");

// 用户注册
router.get("/", function (req, res, next) {

    var title = new Array();
    var data = new Array();

    var sql = "select MAX(date_format(in_date,'%m-%d')) as date,COUNT(user_id) as count from seller_user GROUP BY date_format(in_date,'%y-%m-%d') order by in_date DESC  LIMIT 0,15";
    async.waterfall([
        function (cb) { // 按日期获取用户数量
            wuseClient.query(sql, function (error, rows) {
                if (error) {
                    cb(error, null);
                }
                cb(null, rows);
            });
        },
        function (rows, cb) { // 获取用户总数量
            wuseClient.query("select COUNT(*) as count from seller_user", function (error, count_rows) {
                if (error) {
                    cb(error, null);
                }

                for (var i = 0; i < rows.length; i++) {
                    title.push(rows[i].date);
                    data.push(rows[i].count);
                }

                // 总注册用户数
                var count = count_rows[0].count;
                title = title.reverse();
                data = data.reverse();

                res.render("user/user", {
                    "data_title": JSON.stringify(title),
                    "data_value": JSON.stringify(data),
                    "count": count
                });
            });
        }
    ], function (err, result) {
        console.log("error", err, "result", result);
        res.render("user/user", {
            "data_title": JSON.stringify(title),
            "data_value": JSON.stringify(data),
            "count": 0
        });
    });
});

// 用户来源
router.get("/source", function (req, res, next) {
    var sql = "SELECT max(source) as source,COUNT(*) as count FROM `seller_user` group by source;"
    wuseClient.query(sql, function (err, rows, fields) {
        if (err) throw  err;

        var array = new Array();
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var item = new Array();
            item[0] = row.source;
            item[1] = row.count;
            array.push(item);
        }

        res.render("user/source", {data: JSON.stringify(array)})
    });
});

// 先查寻出指定天数的注册数
// 查询指定天数的

// 添加时间
function addDay(date, day) {
    var nowDate = new Date(date);
    var timespan = nowDate.valueOf() + (day * 24 * 60 * 60 * 1000);
    return new Date(timespan);
}

// 用户留存率
router.get("/keep", function (req, res, next) {

    // 登录Sql
    var loginSql = "SELECT MAX(DATE_FORMAT(d.apply_date,'%Y-%m-%d')) as date, count(DISTINCT u.user_id) AS count FROM seller_user AS u INNER JOIN device_info AS d ON u.user_id = d.user_id AND d.apply_date in(@date) WHERE u.in_date>=DATE_ADD('@day',INTERVAL 0 DAY) and u.in_date<DATE_ADD('@day',INTERVAL 1 day) group by d.apply_date;";

    var str = "";
    var today = new Date();

    var daystr = "";
    var endDate = new Date('2015-1-23');
    // 近三十天的注册
    var dateArray = new Array();

    for (var i = 35; i >= 0; i--) {
        var newdate = new Date(today.valueOf() - (i * 24 * 60 * 60 * 1000));
        if (newdate < endDate) {
            continue;
        }
        var date = newdate.getFullYear() + "-" + (newdate.getMonth() + 1) + "-" + newdate.getDate();
        dateArray.push(date);
    }

    async.map(dateArray, function (date, callback) {
            var arraryStr = "";
            var days = [0, 1, 3, 7, 30];
            var selectDateArray = new Array();
            // 组装查询的天数
            for (var i = 0; i < days.length; i++) {
                var item = days[i];
                var dateTime = addDay(date, item);
                if (dateTime > new Date()) {
                    console;
                }

                var newDate = dateTime.getFullYear() + "-" + (dateTime.getMonth() + 1) + "-" + dateTime.getDate();
                selectDateArray.push(newDate);
                arraryStr += "'" + newDate + "',";
            }

            // 组装sql语句
            arraryStr = arraryStr.substring(0, arraryStr.length - 1, 1);
            var querySql = loginSql.replace("@date", arraryStr).replace("@day", date).replace("@day", date);
            wuseClient.query(querySql, function (err, rows) {
                var first = 0;
                var result = new Array();
                for (var i = 0; i < rows.length; i++) {
                    first = rows[0];
                    var item = rows[i];

                    if (i == 0) {
                        result.push(first.date);
                    }
                    result.push(parseFloat((item.count / first.count * 100).toFixed(2)));
                }
                callback(null, result);
            });
        }, function (err, data) {

            var result = {
                "categorys": new Array(),
                "day": new Array(),
                "morrow": new Array(),
                "third": new Array(),
                "seven": new Array(),
                "thirty": new Array()
            };

            console.log(data);

            for (var i = 0; i < data.length; i++) {
                console.log("data");
                var row = data[i];
                console.log(row);
                for (var j = 0; j < row.length; j++) {
                    console.log("categorys" + row[j]);
                    if (j == 0) {
                        // 日期
                        result.categorys.push(row[j]);
                    } else if (j == 1) {
                        // 注册当天
                        result.day.push(row[j]);
                    } else if (j == 2) { // 次日
                        result.morrow.push(row[j]);
                    } else if (j == 3) {  // 三日
                        result.third.push(row[j]);
                    } else if (j == 4) { // 7日
                        result.seven.push(row[j]);
                    }
                    else if (j == 5) {  //30日
                        result.thirty.push(row[j]);
                    }

                }
            }

            res.render("user/keep", {result: result});
        }
    );
});

module.exports = router;
