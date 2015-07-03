var express = require('express');
var router = express.Router();

var url = require('url');

var _collection = null;
var studentCollection = function(db){
    var collectionName = 'studentCollection';
    if(_collection == null)
        _collection = db.get(collectionName);

    return _collection;
};

var Student = function(id, name, last_name, classes){
    var that = this;
    this.id = id;
    this.name = name;
    this.last_name = last_name;
    this.classes = classes;

    this.save = function(callback){
        // Set our collection
        var collection = studentCollection();
        var toBeStored = {
            "name" : that.name,
            "last_name" : that.last_name,
            "classes": that.classes
        };

        if(that.id == null)
            // Submit to the DB
            collection.insert(toBeStored, function (err, student) {
                if (err) {
                    console.error(err);
                }
                else {
                    that.id = student._id;
                    if(callback != null)
                        callback(that.id);
                }
            });
        else{
            collection.update({'_id': that.id}, toBeStored, {safe:true}, function(err, result) {
                if (err) {

                } else {
                    if(callback != null)
                        callback(that.id);
                }
            });
        }
    };

    this.fetchById = function(callback){
        var mongoQuery = {};
        mongoQuery._id = that.id;

        // Set our collection
        var collection = studentCollection();

        collection.find(mongoQuery,{},function(e, result){
            var studentDB = result[0];
            var student = new Student(
                studentDB._id,
                studentDB.name,
                studentDB.last_name,
                studentDB.classes
            );
            if(callback != null)
        	   callback(student);
        });
    };

    this.addClass = function(classId, callback){
        if(that.classses == null)
            that.classes = [];
        that.classes.push(classId);
        that.save(callback);
    }

    this.validateClass = function(classId){
        //Remember we said classId is always valid for now...
        return true;
    };

};

/* GET All Students */
router.get('/', function(req, res) {
    var db = req.db;
    var url_parts = url.parse(req.url, true);
	var queryString = url_parts.query;

    var db = req.db;
    var collection = studentCollection(db); //Ensure we have our database

    var mongoQuery = {};
    if(queryString.pin != null){
    	mongoQuery.pin = queryString.pin;
    }
    collection.find(mongoQuery,{},function(e, result){
    	res.json(result)
    });
});

/* GET Student by ID */
router.get('/:id', function(req, res) {
    var db = req.db;
    var url_parts = url.parse(req.url, true);
	var queryString = url_parts.query;

    var db = req.db;
    var collection = studentCollection(db); //Ensure we have our database

    var student = new Student(req.params.id);
    student.fetchById(function(student){
        res.json({
            id: student.id,
            name: student.name,
            last_name: student.last_name,
            classes: student.classes
        });
    })
});



/* POST to Add Student */
router.post('/', function(req, res) {

    // Set our internal DB variable
    var db = req.db;
    studentCollection(db); //Ensure we have our database

    student = new Student(null, req.body.name, req.body.last_name, req.body.email);

    student.save(function(id){
        res.send(id);
    });
});

/* POST Add Class to a Student */
router.post('/class', function(req, res) {

    //Note we assume the class Id is valid here....

    var db = req.db;
    var db = req.db;
    var collection = studentCollection(db); //Ensure we have our database


    var student = new Student(req.body.student_id);
    student.fetchById(function(student){
        student.addClass(req.body.class_id,
        function(){
            res.send("OK");
        },
        function(){
            res.status(400);
            res.send("An error happened while trying to add the class to the student");
        }
        );
    })
});

module.exports = router;
