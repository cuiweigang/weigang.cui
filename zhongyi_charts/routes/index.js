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
    res.render('index', {title: 'Express'});
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

// 用户注册
router.get("/user", function (req, res, next) {
    var sql = "select MAX(date_format(in_date,'%y-%m-%d')) as date,COUNT(user_id) as count from seller_user GROUP BY date_format(in_date,'%y-%m-%d') order by in_date DESC  LIMIT 0,31";
    wuseClient.query(sql, function (err, rows, fields) {
        if (err) throw  err;
        wuseClient.query("select COUNT(*) as count from seller_user", function (error, count_rows, fields) {
            var title = new Array();
            var data = new Array();
            for (var i = 0; i < rows.length; i++) {
                title.push(rows[i].date);
                data.push(rows[i].count);
            }

            title = title.reverse();
            data = data.reverse();

            var count = count_rows[0].count;

            res.render("user/user", {
                "data_title": JSON.stringify(title),
                "data_value": JSON.stringify(data),
                "count": count
            });
        });


    });
});

// 用户来源
router.get("/user/source", function (req, res, next) {
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
router.get("/user/keep", function (req, res, next) {

    // 登录Sql
    var loginSql = "SELECT MAX(DATE_FORMAT(d.apply_date,'%Y-%m-%d')) as date, count(DISTINCT u.user_id) AS count FROM seller_user AS u INNER JOIN device_info AS d ON u.user_id = d.user_id AND d.apply_date in(@date) WHERE u.in_date>=DATE_ADD('@day',INTERVAL 0 DAY) and u.in_date<DATE_ADD('@day',INTERVAL 1 day) group by d.apply_date;";

    var str = "";
    var today = new Date();

    var daystr = "";
    var endDate = new Date('2015-1-23');
    // 近三十天的商品信息
    var dateArray = new Array();

    for (var i = 30; i >= 0; i--) {
        var newdate = new Date(today.valueOf() - (i * 24 * 60 * 60 * 1000));
        if (newdate < endDate) {
            continue;
        }
        var date = newdate.getFullYear() + "-" + (newdate.getMonth() + 1) + "-" + newdate.getDate();
        dateArray.push(date);
    }

    async.mapSeries(dateArray, function (date, callback) {
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
    )
    ;


})
;

// 近30日订单
router.get("/order", function (req, res, next) {
    // 所有订单
    var allorder = "SELECT max(DATE_FORMAT(order_date,'%y-%m-%d')) as date, COUNT(*) as count FROM order_orderinfo GROUP BY DATE_FORMAT(order_date,'%y-%m-%d') order by order_date DESC ";

    // 取消订单
    var cancelOrderSql = "SELECT max(DATE_FORMAT(order_date,'%y-%m-%d')) as date, COUNT(*) as count FROM order_orderinfo where STATUS=35 GROUP BY DATE_FORMAT(order_date,'%y-%m-%d') order by order_date DESC ";

    // 有效订单
    var validOrderSql = "SELECT max(DATE_FORMAT(order_date,'%y-%m-%d')) as date, COUNT(*) as count FROM order_orderinfo where STATUS not in(5,35,60,55) GROUP BY DATE_FORMAT(order_date,'%y-%m-%d') order by order_date DESC";

    // 全部订单
    erpClient.query(allorder, function (err, rows, fields) {
        var categorys = new Array();
        var allOrder = new Array(); //所有订单
        if (err) throw  err;
        for (var i = rows.length - 1; i >= 0; i--) {
            var row = rows[i];
            categorys.push(row.date);
            allOrder.push(row.count);
        }

        // 取消订单
        var cancelOrder = new Array();
        erpClient.query(cancelOrderSql, function (err, cancelrows, fields) {
            for (var i = 0; i < categorys.length; i++) {
                var isadd = false;
                for (var j = 0; j < cancelrows.length; j++) {
                    if (cancelrows[j].date == categorys[i]) {
                        cancelOrder.push(cancelrows[j].count);
                        isadd = true;
                        break;
                    }
                }

                if (!isadd) {
                    cancelOrder.push(0);
                }
            }

            // 有效订单
            erpClient.query(validOrderSql, function (err, validrows, fields) {

                var validArray = new Array();

                for (var i = 0; i < categorys.length; i++) {
                    var isadd = false;
                    for (var j = 0; j < validrows.length; j++) {
                        if (validrows[j].date == categorys[i]) {
                            validArray.push(validrows[j].count);
                            isadd = true;
                            break;
                        }
                    }

                    if (!isadd) {
                        validArray.push(0);
                    }
                }


                res.render("order/order", {
                    "categorys": JSON.stringify(categorys),
                    "allorder": JSON.stringify(allOrder),
                    "cancelOrder": JSON.stringify(cancelOrder),
                    "validOrder": JSON.stringify(validArray)
                });
            })

        })
    })
})

router.get("/order/deal", function (req, res, next) {
    var sql = "select max(DATE_FORMAT(order_date,'%y-%m-%d')) as date, count(order_id) as count,SUM(price) as amount from order_orderInfo where STATUS not in(5,35,60,55) and order_date>= DATE_ADD(CURDATE(),INTERVAL -30 day) group by DATE_FORMAT(order_date,'%y-%m-%d');";

    var result = {"categorys": new Array(), "count": new Array(), "amount": new Array()}

    erpClient.query(sql, function (err, rows) {

        var sumAmount = 0;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            result.categorys.push(row.date);
            result.count.push(row.count);
            result.amount.push(row.amount);
            sumAmount += row.amount;
        }

        res.render("order/deal", {result: result, sumAmount: sumAmount});
    });

});

// 订单列表
router.get("/order/orderinfo", function (req, res, next) {

    //  var sql = "SELECT order_date, order_id,user_id,delivery_name,delivery_address,delivery_phone,price ,`status`,shop_id,income FROM `order_orderinfo` where `status` not in (5,35,60,55) and order_date>DATE_ADD(CURDATE(),INTERVAL -30 DAY)  order by order_date DESC";
    var sql = "SELECT o.order_date, o.order_id,o.user_id,o.delivery_name,o.delivery_address,o.delivery_phone,o.price ,o.`status`,o.shop_id,income ," +
        " d.product_name,d.product_count,d.product_id,d.sku_id,d.product_price,s.id,s.`name`" +
        " FROM `order_orderinfo` as o inner join order_orderdetail as d on o.order_id=d.order_id inner join product_product p on p.id=d.product_id" +
        " inner join base_supplier s on s.id=p.supplier_id where o.`status` not in (5,35,60,55) and o.order_date>DATE_ADD(CURDATE(),INTERVAL -30 DAY) order by   o.order_date desc";

    erpClient.query(sql, function (err, rows) {
        res.render("order/orderinfo", {"data": rows});
    });
});


module.exports = router;
