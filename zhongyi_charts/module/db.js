var mysql = require('mysql');

var host = "loclahost";
var prot = "3309";
var user = "test";
var password = "test";


var db = {
    wuse: function () {
        var connection = mysql.createConnection({
            host: host,
            user: user,
            password: password,
            port: prot,
            database: "zhongyi_wuse"
        });
        return connection;
    },
    erp: function () {
        var connection = mysql.createConnection({
            host: host,
            user: user,
            password: password,
            port: prot,
            database: "zhongyi_erp"
        });
        return connection;
    }
}
module.exports = db;