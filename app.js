var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//Handlebars
var exphbs  = require('express-handlebars');

// MongoDb will be using Heroku
var mongo = require('mongodb');
var monk = require('monk');
//var db = monk('mongodb://localhost:27017/school');
var db = monk('mongodb://school:12345678@kahana.mongohq.com:10009/app27698397');

var routes = require('./routes/index');
var teacher = require('./routes/teacher');
var teacher_api = require('./routes/teacher_api');

var student = require('./routes/student');
var student_api = require('./routes/student_api');

var app = express();

//Handlebars Setup
var hbs = exphbs.create({ /* config */ });

// Register `hbs.engine` with the Express app.
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/teacher', teacher);
app.use('/api/teacher', teacher_api);

app.use('/student', student);
app.use('/api/student', student_api);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
