var express = require('express');
var router = express.Router();

/* GET Teacher listing. */
router.get('/', function(req, res) {
    res.render('student', { title: 'School Students' });
});

module.exports = router;
