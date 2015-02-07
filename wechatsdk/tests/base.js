/**
 * Created by cuiweigang on 2/6 0006.
 */
var base = require("../module/base");

var sing = {
    "signature": "signaturevalue",
    "timestamp": "timestampvalue",
    "nonce": "noncevalue",
    "echostr": "echostrvalue"
};


base.checkSignature(sing, function (result) {
    console.log(result);
})

/**
 * 获取AccessToken
 * */
//base.getAccessToken(function (token) {
//    console.log("access_token:");
//    console.log(token);
//});

/**
 * 获取ips列表
 * */
//base.getIps(function (ips) {
//    console.log("ip列表");
//    console.log(ips);
//})