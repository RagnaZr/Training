var express= require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var User = require('../user/User');
var config = require('../config');
var path = require('path');
/*
router.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/index.html'));
  });  

//Express will serve index.html automaticall if u change below codes on app.js

app.use(express.static(__dirname + '/view/html'));

*/

router.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname, '../view/html', 'signin.html'));
    /*
    Or u should try this!!
    
    res.sendFile('signin.html', { root: path.join(__dirname, '../view/html') });
    */
});

router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../view/html', 'index.html'));
});

router.post('/register', function(req, res){
    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    User.create({
        email: req.body.email,
        password: hashedPassword
    },
    function(err, user) {
        if (err) {
            return res.status(500).send('There some thing err when register.');}
        else {
        var token= jwt.sign({id: user._id}, config.secret, {
            expiresIn: 86400
        });
        req.session.userId = user._id;
        res.status(200).send({ auth: true, token: token});
    }
    });
});

router.post('/login/auth',function(req, res){
    User.findOne({email:req.body.email}, function(err, user){
        if(err) return res.status(500).send('Error on sever.');
        if(!user) return res.status(404).send('Not found user');

        var passwordIsValid =bcrypt.compareSync(req.body.password, user.password);
        if(!passwordIsValid) return res.status(401).send({auth:false, token: null});

        var token = jwt.sign({id: user._id}, config.secret,{expiresIn: 86400});
        res.status(200).send({auth:true, token:token});
        req.session.userId = user._id;
    }); 
});
router.get('/logout', function(req, res, next) {
    if (req.session) {
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });
  

module.exports = router;