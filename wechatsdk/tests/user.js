/**
 * Created by cuiweigang on 2/6 0006.
 */

var user = require("../module/user");
var openId = "oGc70juyLdxudgjfb9WJ9eBIM-4k";

///**
// * 获取用户列表测试
// */
//user.getList("", function (data) {
//    console.log(data);
//});
//
///**
// * 获取用户信息测试
// */
//user.info("oGc70juyLdxudgjfb9WJ9eBIM-4k", function (data) {
//    console.log(data);
//});

/**
 * 设置用户备注
 */
//user.remark("oGc70juyLdxudgjfb9WJ9eBIM-4k", "小崔", function (data) {
//    console.log(data);
//});

/**
 * 创建分组
 */
//user.group.create("test", function (data) {
//    console.log(data);
//});

/**
 * 根据用户openId获取组id
 */
//user.group.getByOpenId(openId, function (data) {
//    console.log(data);
//})

//user.group.update(2, "我的分组", function (data) {
//    console.log(data);
//})

/**
 * 移动用户到到指定的组
 */
user.group.moveUser(openId, 100, function (data) {
    console.log(data);
});

/**
 * 批量移动用户到指定的组
 */
user.group.batchMoveUser(new Array()[openId], 100, function (data) {
    console.log(data);
});

/**
 * 获取分组列表
 */
user.group.all(function (data) {
    console.log(data);
});