/**
 * 消息处理模块
 * Created by cuiweigang on 15/2/7.
 */

var base = require("./base");
var httpReq = require("./httpReq");
var xml2js = require("xml2js");
var ejs = require("ejs");
var log = require("./log")

// 文本消息模板
var textTemplate = "<xml>" +
    "<ToUserName><![CDATA[<%- ToUserName %>]]></ToUserName>" +
    "<FromUserName><![CDATA[gh_33453d6f60fa]]></FromUserName>" +
    "<CreateTime>12345678</CreateTime>" +
    "<MsgType><![CDATA[text]]></MsgType>" +
    "<Content><![CDATA[<%- Content%>]]></Content>" +
    "</xml> ";


// 图片消息模板
var imageTemplate = "<xml>" +
    " <ToUserName><![CDATA[toUser]]></ToUserName>" +
    "<FromUserName><![CDATA[fromUser]]></FromUserName>" +
    "<CreateTime>1348831860</CreateTime>" +
    "<MsgType><![CDATA[image]]></MsgType>" +
    "<PicUrl><![CDATA[this is a url]]></PicUrl>" +
    "<MediaId><![CDATA[media_id]]></MediaId>" +
    "<MsgId>1234567890123456</MsgId>" +
    "</xml>";

// 语音消息模板
var voiceTemplate = "<xml>" +
    "<ToUserName><![CDATA[toUser]]></ToUserName>" +
    "<FromUserName><![CDATA[fromUser]]></FromUserName>" +
    "<CreateTime>1357290913</CreateTime>" +
    "<MsgType><![CDATA[voice]]></MsgType>" +
    "<MediaId><![CDATA[media_id]]></MediaId>" +
    "<Format><![CDATA[Format]]></Format>" +
    "<MsgId>1234567890123456</MsgId>" +
    "</xml>";

// 链接消息模板
var linkTemplate = "<xml>" +
    "<ToUserName><![CDATA[toUser]]></ToUserName>" +
    "<FromUserName><![CDATA[fromUser]]></FromUserName>" +
    "<CreateTime>1351776360</CreateTime>" +
    "<MsgType><![CDATA[link]]></MsgType>" +
    "<Title><![CDATA[公众平台官网链接]]></Title>" +
    "<Description><![CDATA[公众平台官网链接]]></Description>" +
    "<Url><![CDATA[url]]></Url>" +
    "<MsgId>1234567890123456</MsgId>" +
    "</xml> ";

// 编译后的模板
var textCompileTemplate = ejs.compile(textTemplate);
var imageCompileTemplate = ejs.compile(imageTemplate);
var voiceCompileTemplate = ejs.compile(voiceTemplate);
var linkCompileTemplate = ejs.compile(linkTemplate);


var message = {};

/**
 * 接收消息
 * @param xml
 * @param callback
 */
message.reply = function (xml, callback) {

    xml2js.parseString(xml, {explicitArray: false, IgnoreAttrs: true}, function (err, result) {

        var replyContent = textCompileTemplate(
            {
                "ToUserName": result.xml.FromUserName,
                "Content": result.xml.Content
            }
        );

        console.log(replyContent);
        log.info("回复信息：%", replyContent);
        return callback(replyContent);
    });


};

module.exports = message;
