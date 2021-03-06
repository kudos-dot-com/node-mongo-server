var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport=require('passport');
var authenticate=require('./auth');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishrouter');
var uploadrouter=require('./routes/upload');
var session=require('express-session');
var fileStore=require('session-file-store')(session);
const mongoose=require('mongoose');
const Dishes=require('./models/dishes');
const config=require('./config');

const url=config.mongoUrl;//'mongodb://localhost:27017/mailingList';
 const connect=mongoose.connect(url);
 
 connect.then((db)=>{
     console.log("connected to the database");
 },((err)=>{console.log(err)}));

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());

// used  in case  of sessions
app.use(session({
  name:'session_id',
  secret:'12345-33323-11112-33039',
  saveUninitialized:false,
  resave:false,
  store:new fileStore()
}));




app.use(passport.initialize());
app.use(passport.session());//used in case of sessions

app.use('/', indexRouter);
app.use('/users', usersRouter);
//used with local authentication
function auth(req,res,next){
if(!req.user)
{
  var err=new Error("either password or username is incorrect");
  err.status=403;
  return next(err);
}
else{
 next();

}
}

/*function auth (req, res, next) {
  console.log(req.session);

if(!req.session.user) {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    return next(err);
}
else {
  if (req.session.user === 'authenticated') {
    next();
  }
  else {
    var err = new Error('You are not authenticated!');
    err.status = 403;
    return next(err);
  }
}
}

*/
app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes',dishRouter);
app.use('/imageUpload',uploadrouter);
// catch 404 and forward to error handler

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
