var express = require('express');
var http = require("http");
var request = require('request');
var mysql = require('mysql');
var router = express.Router();
var wuseClient = require("../module/db").wuse();
var erpClient = require("../module/db").erp();
var async = require("async");


// 近30日订单
router.get("/", function (req, res, next) {
    // 所有订单
    var allorder = "SELECT max(DATE_FORMAT(order_date,'%m-%d')) as date, COUNT(*) as count FROM order_orderinfo GROUP BY DATE_FORMAT(order_date,'%y-%m-%d') order by order_date DESC  LIMIT 15 ";

    // 取消订单
    var cancelOrderSql = "SELECT max(DATE_FORMAT(order_date,'%m-%d')) as date, COUNT(*) as count FROM order_orderinfo where STATUS=35 GROUP BY DATE_FORMAT(order_date,'%y-%m-%d') order by order_date DESC  LIMIT 15 ";

    // 有效订单
    var validOrderSql = "SELECT max(DATE_FORMAT(order_date,'%m-%d')) as date, COUNT(*) as count FROM order_orderinfo where STATUS not in(5,35,60,55) GROUP BY DATE_FORMAT(order_date,'%y-%m-%d') order by order_date DESC LIMIT 15 ";

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

router.get("/deal", function (req, res, next) {
    var sql = "select max(DATE_FORMAT(order_date,'%m-%d')) as date, count(order_id) as count,SUM(price) as amount from order_orderInfo where STATUS not in(5,35,60,55) and order_date>= DATE_ADD(CURDATE(),INTERVAL -15 day) group by DATE_FORMAT(order_date,'%y-%m-%d');";

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
router.get("/orderinfo", function (req, res, next) {

    var sql = "SELECT DATE_FORMAT(o.order_date,'%y-%m-%d %T') as order_date, o.order_id,o.user_id,o.delivery_name,o.delivery_address,o.delivery_phone,o.price ,o.`status`,o.shop_id,income ," +
        " d.product_name,d.product_count,d.product_id,d.sku_id,d.product_price,s.id,s.`name`" +
        " FROM `order_orderinfo` as o inner join order_orderdetail as d on o.order_id=d.order_id inner join product_product p on p.id=d.product_id" +
        " inner join base_supplier s on s.id=p.supplier_id where o.`status` not in (5,35,60,55) and o.order_date>DATE_ADD(CURDATE(),INTERVAL -10 DAY) order by   o.order_date desc";

    console.log(sql);
    erpClient.query(sql, function (err, rows) {
        res.render("order/orderinfo", {"data": rows});
    });
});

module.exports = router;