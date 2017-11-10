/*import needed libraries */

var express             = require('express');
var app                 = express();
var bodyParser          = require('body-parser');
var path                = require('path');
var connection          = require('express-myconnection');
var mysql               = require('mysql');
var router              = express.Router();
var expressValidator    = require('express-validator');
var controller          = require('./controllers/home'); 
var session             = require('express-session');
var cookieParser        = require('cookie-parser');
var flash               = require('connect-flash');



/*initialize view folder and template engine*/
app.set('views','ui');
app.set('view engine','ejs');

/*initialize components to be used*/

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(session({
    secret: '19591ad0ce3089d22670d868c10d808ab3e9e590b98cf8498a7ab80acd01a7b0e9c339758368426c9a418f7ecfde1e10d3a3',
    resave: true,
    saveUninitialized: true,
    cookie:{maxAge:60000}
}))
app.use(cookieParser('ed2bed04399b4b674b40277570c2fa3a8dd1a8e94615b7cc6953a1010b1f7a368a7104682771f40a9e384a971af0c271b2f9'));
app.use(flash());


/*initialize database connection*/
app.use(
  connection(mysql,{
       host:'127.0.0.1',
       user:'root',
       password:'',
       port:3306,
       database:'nodejs_crud'
   },'single')
);

app.use(function(req, res, next){

    res.locals.success_messages = req.flash('ok_messages');
    res.locals.error_messages = req.flash('err_messages');
    next();
});

var auth = function(req, res, next) {
  if (req.session.user !== null && req.session.admin==true)
    return next();
  else
    req.flash('err_messages',  'You need to be login first!');
    return res.redirect('/user/login');
};

/*app routes*/

app.get('/',controller.home);
app.get('/user/add/',auth,controller.adduser);
app.get('/user/',auth,controller.userlisting);
app.get('/user/delete/:id',auth,controller.deleteuser);
app.get('/user/edit/:id',auth,controller.edituser);
app.get('/user/login/',controller.loginuser);
app.get('/user/logoutuser/',controller.logoutuser);

app.post('/user/create/',auth,controller.createuser);
app.post('/user/update/',auth,controller.updateuser);
app.post('/user/auth/',controller.authuser);

/* start the server */
app.listen(3000, function () {
  console.log('Server Started.');
});
