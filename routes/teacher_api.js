var express = require('express');
var router = express.Router();

var url = require('url');

var _collection = null;
var teacherCollection = function(db){
    var collectionName = 'teacherCollection';
    if(_collection == null)
        _collection = db.get(collectionName);

    return _collection;
};

function guid(){
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var TeacherClass = function(name, start, end){
    this.id = guid();
    this.name = name;
    this.start = start;
    this.end = end;
};

var Teacher = function(id, name, last_name, email, classes){
    this.id = id;
    this.name = name;
    this.last_name = last_name;
    this.email = email;
    this.classes = classes;

    var that = this;

    this.addClass = function(teacherClass, callback, errorCallback){
        if(!that.validateClass(teacherClass)){
            if(errorCallback != null)
                errorCallback("Class is invalid, according to the current Teacher Schedule");
            return;
        }
        if(that.classes == null)
            that.classes = [];

        that.classes.push({
            id: teacherClass.id,
            name: teacherClass.name,
            start: teacherClass.start,
            end: teacherClass.end
        });
        that.save(callback);
    };

    this.validateClass = function(teacherClass){
        var result = true;
        if(teacherClass.start >= teacherClass.end)
            return false;

        if(that.classes == null)
            return true;

        that.classes.forEach(function(loopClass){
            console.log(loopClass);
            if(!result)
                return;
            if(teacherClass.start <= loopClass.start && teacherClass.end <= loopClass.start) {
                result = true;
            } else if(teacherClass.start >= loopClass.end ){
                result = true;
            }
            else{
                result = false
            }
        });

        return result;
    };

    this.save = function(callback){
        // Set our collection
        var collection = teacherCollection();
        var toBeStored = {
            "name" : that.name,
            "last_name" : that.last_name,
            "email" : that.email,
            "classes": that.classes
        };

        if(that.id == null)
            // Submit to the DB
            collection.insert(toBeStored, function (err, teacher) {
                if (err) {
                    console.error(err);
                }
                else {
                    that.id = teacher._id;
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
    }

    this.fetchById = function(callback){
        var mongoQuery = {};
        mongoQuery._id = that.id;

        // Set our collection
        var collection = teacherCollection();

        collection.find(mongoQuery,{},function(e, result){
            var teacherDB = result[0];
            console.log(teacherDB);
            var teacher = new Teacher(
                teacherDB._id,
                teacherDB.name,
                teacherDB.last_name,
                teacherDB.email,
                teacherDB.classes
            );
            if(callback != null)
        	   callback(teacher);
        });
    }
};

/* GET All Teachers */
router.get('/', function(req, res) {
    var db = req.db;
    var url_parts = url.parse(req.url, true);
	var queryString = url_parts.query;

    var db = req.db;
    var collection = teacherCollection(db); //Ensure we have our database

    var mongoQuery = {};
    if(queryString.pin != null){
    	mongoQuery.pin = queryString.pin;
    }
    collection.find(mongoQuery,{},function(e, result){
    	res.json(result)
    });
});

/* GET Teacher by ID */
router.get('/:id', function(req, res) {
    var db = req.db;
    var url_parts = url.parse(req.url, true);
	var queryString = url_parts.query;

    var db = req.db;
    var collection = teacherCollection(db); //Ensure we have our database

    var teacher = new Teacher(req.params.id);
    teacher.fetchById(function(teacher){
        res.json({
            id: teacher.id,
            name: teacher.name,
            last_name: teacher.last_name,
            email: teacher.email,
            classes: teacher.classes
        });
    })
});



/* POST to Add Teacher */
router.post('/', function(req, res) {

    // Set our internal DB variable
    var db = req.db;
    teacherCollection(db); //Ensure we have our database

    console.log(req);


    teacher = new Teacher(null, req.body.name, req.body.last_name, req.body.email);

    teacher.save(function(id){
        res.send(id);
    });
});

/* POST Add Class to a Teacher */
router.post('/class', function(req, res) {
    var db = req.db;
    var url_parts = url.parse(req.url, true);
	var queryString = url_parts.query;

    var db = req.db;
    var collection = teacherCollection(db); //Ensure we have our database

    var newClass = new TeacherClass(
        req.body.name,
        new Date(Date.parse(req.body.start)),
        new Date(Date.parse(req.body.end))
    );

    var teacher = new Teacher(req.body.teacher_id);
    teacher.fetchById(function(teacher){
        teacher.addClass(newClass,
        function(){
            res.send(newClass.id);
        },
        function(){
            res.status(400);
            res.send("Invalid Class Start or End Time");
        }
        );
    })
});

module.exports = router;
