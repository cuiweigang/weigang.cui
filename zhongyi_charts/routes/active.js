/**
 * Created by cuiweigang on 2/3 0003.
 */

var express = require('express');
var wuseClient = require("../module/db").wuse();
var erpClient = require("../module/db").erp();
var async = require("async");
var request = require("request");
var cheerio = require("cheerio");
var encoding = require("encoding");
var iconv = require('iconv-lite');
var needle = require("needle");
var urlencode = require('urlencode2');
var urlsdk = require('url');

var router = express.Router();

router.get("/", function (req, res) {
    var sql = "SELECT" +
        " result.shop_id," +
        " result.product_id," + "  result.count," +
        "    shop_info.nick_name ," +
        "    seller_user.cellphone," +
        "    seller_user.show_name" +
        " FROM" +
        " (" +
        "    SELECT" +
        " min(info.shop_id) AS shop_id," +
        "   max(info.count) AS count," +
        "    max(info.product_id) AS product_id" +
        " FROM" +
        " (" +
        "    SELECT" +
        " min(product.shop_id) AS shop_id," +
        "    min(product.product_id) AS product_id," +
        "    COUNT(product.product_id) AS count" +
        " FROM" +
        " (" +
        "    SELECT DISTINCT" +
        " a.ip," +
        "   a.shop_id," +
        "   a.parameter AS product_id," +
        "   a.buyer_user_id," +
        "   pp.brand_id," +
        "   DATE_FORMAT(a.in_date, '%y-%m-%d') AS date" +
        " FROM" +
        " access_record AS a" +
        " INNER JOIN zhongyi_erp.product_sku AS p ON a.parameter = p.id" +
        " INNER JOIN zhongyi_erp.product_product AS pp ON pp.id = p.product_id" +
        " WHERE" +
        " a.type = 2" +
        " AND a.in_date >= '2015-02-01 10:00'" +
        " AND a.in_date <= '2015-02-03'" +
        " AND pp.supplier_id = 16" +
        " AND a.vistor_type=1" +
        " UNION ALL" +
        " SELECT DISTINCT" +
        " a.ip," +
        "     a.shop_id," +
        "     a.parameter AS product_id," +
        "     a.buyer_user_id," +
        "    pp.brand_id," +
        "     DATE_FORMAT(a.in_date, '%y-%m-%d') AS date" +
        " FROM" +
        " access_record AS a" +
        " INNER JOIN zhongyi_erp.product_sku AS p ON a.parameter = p.id" +
        " INNER JOIN zhongyi_erp.product_product AS pp ON pp.id = p.product_id" +
        " WHERE" +
        " a.type = 2" +
        " AND a.in_date >= '2015-02-01 10:00'" +
        " AND a.in_date <= '2015-02-03'" +
        " AND pp.supplier_id = 16" +
        " And  a.vistor_type=2" +
        " group by a.ip" +
        " ) AS product" +
        " GROUP BY" +
        " product.shop_id," +
        "   product.product_id" +
        " ) AS info" +
        " GROUP BY" +
        " info.shop_id" +
        " ) AS result" +
        " INNER JOIN shop_info ON result.shop_id = shop_info.shop_id" +
        " INNER JOIN seller_user ON seller_user.user_id = shop_info.seller_user_id" +
        " ORDER BY result.count DESC LIMIT 0,30;"

    wuseClient.query(sql, function (err, rows) {
        res.render("active/ranking", {items: rows});
    });
});


router.get("/test", function (req, res) {
    var $ = cheerio.load('<h2 class="title">Hello world</h2>');
    var text = $("h2.title").html();
    console.log($("h2").attr("class", "name"));
    console.log($.html());
    // console.log($);
    console.log(text);
    res.send(text);
});

router.get("/req", function (req, res) {

    var options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.93 Safari/537.36',
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "http://cts.388g.com/",
            "Accept-Language": "zh-CN,zh;q=0.8"
        }
    };

    var url = "http://cts.388g.com/ss.php?w=";
    var par = escape("这个不知道");
    url += par + "&num=5&type=1&yayuntype=1";

    needle.get(url, function (err, response) {

        console.log(response.headers);
        if (!err && response.statusCode == 200)
            console.log(response.body);
        res.render("active/req", {data: response.body});
    });


    //request.get(url, options, function (err, response, body) {
    //    //  var b = encoding.convert(body, "UFT8");
    //    // console.log(b.toString());
    //
    //    //var buf = iconv.encode(body, "gbk");//return gbk encoded bytes from unicode string
    //    //var str = iconv.decode(buf, 'utf8'); //return unicode string from gbk encoded bytes
    //    //console.log(str);
    //    //  console.log(buf.toString());
    //    // console.log(body);
    //    // console.log(response.headers);
    //    //var res = new iconv('GBK', 'UTF-8').convert(new Buffer(body, 'binary')).toString();
    //    //console.log(res);
    //    //var biz_content = "欢迎关注！";
    //    //var gbkBytes = iconv.encode(biz_content, 'gbk');
    //    var gbk_buf = iconv.encode(body, "GBK");
    //    var utf = iconv.decode(gbk_buf, "UTF-8");
    //    res.setHeader('Content-Type', 'text/html; charset=gbk')
    //    res.render("active/req", {data: utf});
    //
    //})
});


module.exports = router;
