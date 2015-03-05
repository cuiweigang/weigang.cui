var express = require('express');
var router = express.Router();

router.get("/", function (req, res) {
    res.render('passport/login');
});

router.post("/", function (req, res) {
    var name = req.body.username;
    var pass = req.body.password;
    var returnUrl = req.returnUrl;

    if (!returnUrl) {
        returnUrl = "/";
    }

    if (name == "cui" && pass == "1") {
        res.cookie("name", name, {maxAge: 36000000});
        res.redirect(returnUrl);
    }
    else {
        res.redirect("passport");
    }
});

module.exports = router;