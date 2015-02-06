/**
 * Created by cuiweigang on 2/6 0006.
 */
var base = require("../module/base");

/**
 * 获取AccessToken
 * */
base.getAccessToken(function(token){
    console.log("access_token:");
    console.log(accesstoken);
});

/**
 * 获取ips列表
 * */
base.getIps(function (ips) {
    console.log("ip列表");
    console.log(ips);
})