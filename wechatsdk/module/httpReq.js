/**
 * Created by cuiweigang on 2/6 0006.
 */

var request = require("request");

var httpReq = {};

/**
 * get数据
 * @param url
 * @param callback 回调函数  body,response,err
 */
httpReq.get = function (url, callback) {
    request.get(url, function (err, res, body) {
        return callback(body, res, err);
    })
};

/**
 * POST JSON数据
 * @param url url地址
 * @param jsonData JSON数据
 * @param callback 回调
 */
httpReq.postJson = function (url, jsonData, callback) {
    var json = JSON.stringify(jsonData);
    var headers = {
        "Content-type": "application/json"
    };

    // 操作
    var operations = {
        headers: headers,
        body: json
    };

    request.post(url, operations, function (err, res, body) {
        return callback(body, res, err);
    });
};

module.exports = httpReq;