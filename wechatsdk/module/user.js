/**
 * Created by cuiweigang on 2/6 0006.
 */
var config = require("config");
var base = require("./base");
var request = require("request");
var httpReq = require("./httpReq");
var wxConfig = config.get("wechat");

/***
 * 用户模块
 */
var user = {};

/**
 * 获取用户列表
 * @param next_openId 下个openId 没有则传空
 * @param callback 回调
 */
user.getList = function (next_openId, callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/user/get?access_token=" + access_token.token + "&next_openid=" + next_openId;
        console.log(url);
        request.get(url, function (err, res, body) {
            return callback(body);
        });
    });
};

/**
 * 获取用户信息
 * @param openid 用户的Openid
 * @param callback 回调函数
 */
user.info = function (openid, callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/user/info?&lang=zh_CN&access_token=" + access_token.token + "&openid=" + openid;
        request.get(url, function (err, res, body) {
            return callback(body);
        });
    });
};

/**
 * 设置用户别名
 * @param openid 用户openid
 * @param remark 别名
 * @param callback 回调函数
 */
user.remark = function (openid, remark, callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/user/info/updateremark?access_token=" + access_token.token;
        var data = {
            "openid": openid,
            "remark": remark
        };

        httpReq.postJson(url, data, function (body) {
            return callback(body);
        });
    });
};

user.group = {};
/**
 * 获取所有分组信息
 * @param callback 回调函数 参数：body
 */
user.group.all = function (callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/groups/get?access_token=" + access_token.token;
        httpReq.get(url, function (body) {
            return callback(body);
        });
    });
};

/**
 * 创建用户组
 * @param groupName 组名
 * @param callback 回调函数
 */
user.group.create = function (groupName, callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/groups/create?access_token=" + access_token.token;
        var jsonData = {
            "group": {"name": groupName}
        };
        httpReq.postJson(url, jsonData, function (body) {
            return callback(body);
        });
    });
};

/**
 * 查询指定用户所在组id
 * @param openid 用户openId
 * @param callback 回调
 */
user.group.getByOpenId = function (openid, callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/groups/getid?access_token=" + access_token.token;
        var jsonData = {"openid": openid};

        httpReq.postJson(url, jsonData, function (body) {
            return callback(body);
        });
    });
};

/**
 * 修改名称
 * @param groupId 组ID
 * @param newGroupName  新组名
 * @param callback
 */
user.group.update = function (groupId, newGroupName, callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/groups/update?access_token=" + access_token.token;
        var jsonData = {"group": {"id": groupId, "name": newGroupName}};

        httpReq.postJson(url, jsonData, function (body) {
            return callback(body);
        });
    });
};

/**
 * 移动组用户到指定的组
 * @param openid 用户openId
 * @param groupId 移动到的组ID
 * @param callback 回调
 */
user.group.moveUser = function (openid, groupId, callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/groups/members/update?access_token=" + access_token.token;
        var jsonData = {"openid": openid, "to_groupid": groupId};

        httpReq.postJson(url, jsonData, function (body) {
            return callback(body);
        });
    });
}


/**
 * 批量移动用户到指定的组
 * @param openids 用户openId列表
 * @param groupId 移动到的组ID
 * @param callback 回调
 */
user.group.batchMoveUser = function (openids, groupId, callback) {
    base.getAccessToken(function (access_token) {
        var url = "https://api.weixin.qq.com/cgi-bin/groups/members/batchupdate?access_token=" + access_token.token;
        var jsonData = {"openid": openids, "to_groupid": groupId};

        httpReq.postJson(url, jsonData, function (body) {
            return callback(body);
        });
    });
};

user.auth = function (req, res, callback) {
    var code = req.query.code;
    var state = req.query.state;

    if (!code) {
        return callback(null);
    }

    var getaccess_tokenUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + wxConfig.appid + "&secret=" + wxConfig.appsecret + "&code=" + code + "&grant_type=authorization_code";

    // 获取access_token
    httpReq.get(getaccess_tokenUrl, function (error, res, body) {
        return callback(body);
    });
};

module.exports = user;