var bcrypt   = require('bcrypt');

exports.home = function(req,res){

  res.render('home',{
    title: 'Home',
    logged_user: req.session.user
  });

};

exports.adduser = function(req,res){

	res.render('add-user',{title: 'Add New User ',logged_user: req.session.user});

};


exports.loginuser = function(req,res){

  if(req.session.user==null){
    res.render('login',{title: 'User Login',logged_user: req.session.user});  
  }else{
    return res.redirect('/user');
  }
  

};

exports.userlisting = function(req,res){

req.getConnection(function(err,conn){

        if (err) return next("Cannot Connect");

        var query = conn.query('SELECT * FROM t_user',function(err,rows){

            if(err){
                console.log(err);
                return next("Mysql error, check your query");
            }else{

                res.render('user',
                {
                title: 'User List',
                data: rows,
                logged_user: req.session.user
                }
                );

            }

         });

    });

};

exports.createuser = function(req,res){

    req.assert('complete_name','Name is required').notEmpty();
    req.assert('email_add','A valid email is required').isEmail();    
    req.assert('email_add','A valid email is required').notEmpty();    

    var validation_errors = '';
    var errors = req.validationErrors();
    if(errors){

        validation_errors+= errors[0]['msg'].length >0 ? errors[0]['msg']+" / " : '';
        validation_errors+= errors[1]['msg'].length >0 ? errors[1]['msg'] : '';
        req.flash('err_messages',  validation_errors);
        return res.redirect('/user/add');
    }else{

  req.getConnection(function(err,conn){

      if(!err){

        var strInsert = "INSERT INTO t_user(`user_id`,`name`,`email`,`password`)"+
        "VALUES (NULL,'"+req.body.complete_name+"','"+req.body.email_add+"','123456')";

        var query = conn.query(strInsert,function(err,rows){

            if(err){
              console.log('Cannot insert');
            }else{
                req.flash('ok_messages',  'New user created!');
                return res.redirect('/user/');
            }
        });

      }

    });
  }

};

exports.updateuser = function(req,res){

    req.assert('complete_name','Name is required').notEmpty();
    req.assert('email_add','A valid email is required').isEmail();    
    req.assert('email_add','A valid email is required').notEmpty();    

    var validation_errors = '';
    var errors = req.validationErrors();
    if(errors){
        
        validation_errors+= errors[0]['msg'].length >0 ? errors[0]['msg']+" / " : '';
        validation_errors+= errors[1]['msg'].length >0 ? errors[1]['msg'] : '';
        req.flash('err_messages',  validation_errors);
        return res.redirect('/user/edit/'+req.body.userid);

    }else{

  req.getConnection(function(err,conn){

      if(!err){

        var strUpdate = "UPDATE t_user SET name = '"+req.body.complete_name+"' , email = '"+req.body.email_add+"' WHERE user_id="+req.body.userid+";";

        var query = conn.query(strUpdate,function(err,rows){

            if(err){
              console.log('Cannot insert');
            }else{
              req.flash('ok_messages',  'User info updated !');
              return res.redirect('/user/');
            }
        });

      }

    });
  }

};




exports.deleteuser = function(req,res){

    req.getConnection(function(err,conn){

      if(!err){

          var deletequery = "DELETE FROM t_user WHERE user_id="+parseInt(req.params.id);
          var query = conn.query(deletequery,function(err,rows){
              if(!err){
                req.flash('ok_messages',  'User deleted!');
                return res.redirect('/user/');
              }
          });
      }

    });
};

exports.edituser = function(req,res){

	req.getConnection(function(err,conn){

		if(!err){

			var editquery = "SELECT * from t_user WHERE user_id = "+req.params.id+" LIMIT 1";

			var query = conn.query(editquery,function(err,rows){

				if(!err){
					res.render('edit-user',{title:'Edit user',data:rows,logged_user: req.session.user});
				}

			});
		}

	});

};

exports.authuser = function(req,res){

    req.assert('username','Username is required').notEmpty();
    req.assert('password','Password is required').notEmpty();    

    var errors = req.validationErrors();
    var validation_errors = '';

    if(errors){

     if(errors[0]['msg']!==null){

        validation_errors+= errors[0]['msg'] !==null ? errors[0]['msg']+" " : '';

      }else if(errors[1]['msg']!==null){

        validation_errors+= errors[1]['msg'] !==null ? errors[1]['msg'] : '';
      }


        req.flash('err_messages',  validation_errors);
        return res.redirect('/user/login');
        
    }else{

    req.getConnection(function(err,conn){

    if(!err){

      var selectuser = "SELECT account_username,account_pass FROM accounts WHERE account_username='"+req.body.username+"'";

      var query = conn.query(selectuser,function(err,rows){

        if(rows.length){

          bcrypt.compare(req.body.password, rows[0].account_pass, function(err, compare_result) {
              if(compare_result==true){

                req.session.user = rows[0].account_username;
                req.session.admin = true;

                return res.redirect('/user/');

              }else{
                req.flash('err_messages', 'Invalid Username or Password');
                return res.redirect('/user/login');
              }
          });
        }else{
          req.flash('err_messages', 'Invalid Username or Password');
          return res.redirect('/user/login');
        }

      });

    }

  });

}

};


exports.logoutuser = function(req,res){
  
  req.session.user = null;
  req.session.admin = null;
  return res.redirect('/user/login');

};