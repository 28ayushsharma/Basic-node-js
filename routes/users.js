var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/',authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
	User.find({}, function(err, users){
	  	if(err){
			res.statusCode = 500;
			res.setHeader('Content-type', 'application/json');
			res.json({err	:	err})
			return;
	  	}
	  	res.json(users);
	});
});

router.post('/signup', function(req,res,next){
	User.register(new User({username : req.body.username}),
		req.body.password, (err, user) => {
			if(err){
				res.statusCode = 500;
				res.setHeader('Content-type', 'application/json');
				res.json({err	:	err})
			}else{
				if(req.body.firstname){
					user.firstname = req.body.firstname;
				}
				if(req.body.lastname){
					user.lastname = req.body.lastname;
				}
				user.save((err,user)=>{
					if(err){
						res.statusCode = 500;
						res.setHeader('Content-type', 'application/json');
						res.json({err	:	err})
						return;
					}
					passport.authenticate('local')(req,res, () => {
						res.statusCode = 200;
						res.setHeader('Content-type', 'application/json');
						res.json({ success: true , status: 'Registration successful'})
			
					});
				});
			}
		}
	);
});

router.post('/login', passport.authenticate('local'), (req,res) => {
	var token = authenticate.getToken({_id : req.user._id});
	res.statusCode = 200;
	res.setHeader('Content-type', 'application/json');
	res.json({ success: true , token: token, status: 'Login successfull'})
});

router.get('/logout', (req , res)=>{
	if(req.session){
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	}else{
		var err = new Error('You are not loggedin');
		res.statusCode = 403;
		next(err);
	}
});


module.exports = router;
