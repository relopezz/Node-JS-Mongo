var express = require('express');
var router = express.Router();

var getAllTeachers = function(req, callback){
    var db = req.db;

    var db = req.db;
    var collection = db.get('teacherCollection'); //Ensure we have our database

    var mongoQuery = {};
    collection.find(mongoQuery,{},function(e, result){
    	callback(result)
    });
}

var fetchById = function(id, req, callback){
    var db = req.db;
    var collection = db.get('teacherCollection'); //Ensure we have our database

    var mongoQuery = {};
    mongoQuery._id = id;

    collection.find(mongoQuery,{},function(e, result){
        result = result[0];
        console.log(result);
        if(callback != null)
           callback({
               id: result._id,
               name: result.name,
               last_name: result.last_name,
               email: result.email,
               classes: result.classes
           });
    });
}

/* GET Teacher listing. */
router.get('/', function(req, res) {

    getAllTeachers(req, function(result){
        console.log(result);
        res.render('teachers', {
            title: 'School Teachers',
            teachers: result,
            host_url: req.protocol + '://' + req.get('host')
        });
    });

});


router.get('/:id', function(req, res) {
    fetchById(req.params.id, req, function(result){
        res.render('teacher', {
            title: 'Teacher Schedule',
            teacher: result,
            host_url: req.protocol + '://' + req.get('host')
        });
    });
});

module.exports = router;
