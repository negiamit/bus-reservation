var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var app= express();
var mysql= require('mysql');
app.use(bodyParser.urlencoded({ extended: false }));



router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/booking/home/search',function(req,res){
	
});


module.exports = router;
