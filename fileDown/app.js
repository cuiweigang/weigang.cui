/**
 * Created by cuiweigang on 2/9 0009.
 */
var fs = require("fs");
var request = require("request");
var upyun = require("upyun");
var nodeupyun = require("node-upyun-sdk");
var imagesize = require("image-size");
var instance = nodeupyun("rss01", "wuseapi", "zhongyi@123");
var mysql = require("mysql");

var sqlClient = mysql.createConnection({
    host: 'zhongyidb01.mysql.rds.aliyuncs.com',
    user: 'zhongyi_ec',
    password: 'admin123',
    "port": 3399,
    "database": "zhongyi_wuse"
});

sqlClient.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    }.bind(this));
};


/**
 * 下载图片
 * @param httpFileName
 * @param localFileName
 * @param callback
 * @returns {*}
 */
var downImg2 = function (httpFileName, localFileName, callback) {

    //try {
    var err;
    if (!httpFileName) {
        err = "文件名称为空";
    } else if (httpFileName.indexOf("http") != 0) {
        err = "地址不是从http开始";
    }

    if (err) {
        resetImg(localFileName);
        return callback(err);
    }

    request.get(httpFileName)
        .on('error', function (err) {
            if (err) {
                console.log(err);
                return callback(err);
            }
        })
        .pipe(fs.createWriteStream(localFileName));

    return callback(err);
    //} catch (e) {
    //    console.log("执行异常");
    //    console.log(e);
    //}
};

/**
 * 下载图片
 */
var batchDownImg = function () {
    sqlClient.connect(); //打开链接
    sqlClient.query(sql, function (err, rows) { //查询
        if (err) {
            console.log(err);
        }
        console.log(rows);
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var localFileName = "img\\" + row.open_id + ".jpg";

            downImg2(row.head_img_url, localFileName, function (err) {
                if (!err) {
                    console.log("success %s", localFileName);
                }
                else {
                    console.log("field %s", localFileName);
                }
            });
        }

        console.log("程序执行完毕");
    });
    sqlClient.end();
};

// 批量上传图片
var batchUpImg = function () {
    instance.upload("/buyuser/", process.cwd() + "\\img\\");
};

// 检测图片信息
var checkImg = function () {
    var localimg = process.cwd() + "\\img\\";
    fs.readdir(localimg, function (err, list) {
        list.forEach(function (file) {
            var fileName = localimg + file;
            console.log("文件");
            console.log(fileName);
            try {
                imagesize(fileName, function (err, info) {

                    if (err) {
                        resetImg(fileName);
                        return;
                    }

                    if (info.width == 120 && info.height == 120) {
                        // 重置头像
                        resetImg(fileName);
                    }
                });
            }
            catch (ex) {
                console.log(ex);
                resetImg("error file %s", fileName);
            }
        });
    });
};

// 重置图片
function resetImg(file) {

    console.log("重置图片:%s",file);
    var defaultImg = process.cwd() + "\\smr.jpg";

    readable = fs.createReadStream(defaultImg);
    // 创建写入流
    writable = fs.createWriteStream(file);
    // 通过管道来传输流
    readable.pipe(writable);
}

/**
 * 更新数据库
 */
function upDatabase() {

    sqlClient.query(sql, function (err, rows) {
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var img = "http://rss01.wuseapp.com/buyuser/" + row.open_id + ".jpg";
            console.log(img);
            sqlClient.query("update buyer_user set head_img_url=:img where  id=:id;", {
                img: img,
                id: row.id,
                timg: img,
                tid: row.id
            }, function (err, result) {
                if (err) {
                    console.log("更新失败 id：%i", row.id);
                    console.log(err);
                } else {
                    console.log("更新成功");
                    console.log(result);
                }
            });
        }
    });
}

var sql = "SELECT id,open_id,head_img_url FROM `buyer_user` where type=1 and id=200031869 limit 0,100";

// 批量下载图片
// batchDownImg();
// 检测图片
// checkImg();
// 批量上传图片
// batchUpImg();
// 更新数据库
  upDatabase();