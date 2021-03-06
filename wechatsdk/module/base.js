/**
 * Created by cuiweigang on 2/6 0006.
 */
var request = require("request");
var fs = require("fs");
var config = require("config");
var querystring = require("querystring");
var log = require("../module/log");
var crypto = require('crypto');

var tokenFile = "token.txt";

var wxConfig = config.get("wechat");

// 基础模块
var base = {};

/**
 * 验签操作
 * @param query
 * @param callback
 */
base.checkSignature = function (query, callback) {

    // 获取参数
    var signature = query.signature;
    var timestamp = query.timestamp;
    var nonce = query.nonce;
    var echostr = query.echostr;

    // 数组排序
    var arr = [nonce, timestamp, wxConfig.token].sort();

    var sha1 = crypto.createHash('sha1');
    sha1.update(arr.join(''));
    var sign = sha1.digest("hex");

    log.info("echostr:%s \r\n signatur:%s \r\n timestamp:%s \r\n nonce:%s \r\n echostr:%s \r\n sha1:%s \r\n token:%s", echostr, signature, timestamp, nonce, echostr, sign, wxConfig.token);

    if (sign != signature) {
        echostr = "error";
    }

    return callback(echostr);
};

/**
 * 获取AccessToken
 * @param {String} callback 方法回调
 * @returns {Object}
 */
base.getAccessToken = function (callback) {


    // 从文件中获取,如果没有则调用网络
    getFileToken(function (token) {


        // 当token还未过期，直接返回
        if (token.expires > new Date()) {
            log.info("token还未过期：%s", JSON.stringify(token));
            return callback(token);
        }

        var wechat = config.get("wechat");
        var query = querystring.stringify({appid: wechat.appid, secret: wechat.appsecret});
        var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&" + query;

        request.get(url, function (error, response, body) {
            console.log("body:");
            console.log(body);
            body = JSON.parse(body);
            token.token = body.access_token;
            token.expires = new Date(new Date().setSeconds(body.expires_in - 60));

            log.info("更新Token：%s", JSON.stringify(token));

            fs.writeFile(tokenFile, JSON.stringify(token), function () {
                log.info(token);
                return callback(token);
            });
        });
    });
};

/**
 * 从文件中获取Access_Token
 * @param {String} callback 方法回调
 * @returns {Object}
 */
function getFileToken(callback) {
    var token = {"token": "", expires: new Date("2015-01-01")};


    fs.exists(tokenFile, function (exists) {
        if (exists) {
            // 当文件存在时
            fs.readFile(tokenFile, function (err, data) {
                if (data != null) {
                    token = JSON.parse(data.toString());
                    token.expires = new Date(token.expires);
                }
                return callback(token);
            });
        } else {
            return callback(token);
        }
    });
}

/**
 * 获取Ips地址列表
 * @param callback
 */
base.getIps = function (callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=" + access_token.token;
        console.info(url);
        request.get(url, function (error, response, body) {
            return callback(body);
        });
    });
};

/**
 * 上传文件
 * @param callback
 */
base.update = function (callback) {
    // 暂时未实现
};


module.exports = base;

