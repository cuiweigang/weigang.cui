/**
 * Created by cuiweigang on 15/2/7.
 */
var xml2js = require("xml2js");

var ejs = require("ejs");

var textxml = "<xml>" +
    "<ToUserName><![CDATA[toUser]]></ToUserName><FromUserName><![CDATA[fromUser]]></FromUserName>" +
    "<CreateTime>1348831860</CreateTime>" +
    "<MsgType><![CDATA[image]]></MsgType>" +
    "<PicUrl><![CDATA[this is a url]]></PicUrl>" +
    "<MediaId><![CDATA[media_id]]></MediaId>" +
    "<MsgId>1234567890123456</MsgId>" +
    "</xml>";


/**
 *  明确数组转换{explicitArray: false, IgnoreAttrs: true}
 */
xml2js.parseString(textxml, {explicitArray: false, IgnoreAttrs: true}, function (err, result) {
    console.log(result);
});

var builder = new xml2js.Builder();
var result = builder.buildObject({"name": "cuiweigang"});
console.log(result);


var template = "<xml>" +
    "<ToUserName><![CDATA[<%-touser%>]]></ToUserName>" +
    "<FromUserName><![CDATA[fromUser]]></FromUserName>" +
    "<CreateTime>1348831860</CreateTime>" +
    "<MsgType><![CDATA[image]]></MsgType>" +
    "<PicUrl><![CDATA[this is a url]]></PicUrl>" +
    "<MediaId><![CDATA[media_id]]></MediaId>" +
    "<MsgId>1234567890123456</MsgId>" +
    "</xml>";

compile = ejs.compile(template);


console.log(compile({"touser": "cuiweigang"}));
