var express = require('express');
var mongoose = require('./config/mongoose');
var path = require('path');
var favicon = require('serve-favicon');
var gravatar = require('gravatar');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session); //存储session 防止重启服务器 session丢失
var csrf = require('csurf');
var config = require('./config/config');
var core = require('./libs/core');
var db = mongoose();
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(passport.initialize());
app.use(passport.session());

//全局字段 在页面引用<%=locals.title%>
//res.locals.title || render('xxx',{title:'xxx'}) 会把这个值给重置了
//req.session.xxx  session的属性的值只能在回话过程中共享 不能在页面取到session的值 要挂到res.locals.xxx 上
app.locals = {
  title: 'INF',
  config: config,
  adminDir: config.admin.dir ? ('/' + config.admin.dir) : '',
  gravatar: gravatar,
  Menu:''
};

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'bwp'
}));

//app.use(csrf());
app.use(function(req,res,next){
  res.header('X-Powered-By','bwpInterfaceManager');
  res.locals.token = req.session.token;// req.csrfToken && req.csrfToken();
  if(req.session.user){
      res.locals.User = req.session.user;
      var roles = core.getRoles(req.session.user);
      var actions = core.getActions(req.session.user);
      req.Roles = roles;
      req.Actions = actions;
      res.locals.Roles = roles;
      res.locals.Actions = actions;
  }else{
     res.locals.User = null;
     req.Roles = null;
     req.Actions = null;
     res.locals.Roles = null;
     res.locals.Actions = null;
  }
  next();
});

var appPath = process.cwd();
core.walk(appPath + '/routes', 'maddlewares', function(path){
  require(path)(app);
});

//配置静态资源
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'views')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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
