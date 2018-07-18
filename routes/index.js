var express = require('express');
var router = express.Router();
var bodyParser= require('body-parser');
var app= express();
var mysql= require('mysql');
var random = require('random-number');
var current_date = require('current-date');


app.use(bodyParser.urlencoded({ extended: false }));

/*
var hbs = require('hbs');
hbs.registerHelper('for', function(from, to, incr, block) {
    var accum = '';
    for(var i = from; i < to; i += incr)
        accum += block.fn(i);
    return accum;
});
*/

var gen = random.generator({
  	min:  1,
 	max:  200,
 	integer: true
});


var con = mysql.createConnection({
  host:'localhost',
  user: 'negi',
  password: 'negiamit97',
  database: 'Bus'
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{title:"Welcome"});
});


// Login
var name;
router.post('/check',function(req, res, next) {
	//res.send(JSON.stringify(req.body));
	name = req.body.username;
	var password = req.body.password;
	var i;
	var val=false;
	con.query({
		sql : 'select username,password from user',
		values :[name,password]
	}, function(err,result){
		if (err) throw err;
		else {
			//console.log(JSON.stringify(result));
			console.log(result);
			for(i=0;i<result.length;i++){
					if(result[i].username==name && result[i].password==password) {
						console.log('Login succesful with username: '+ name);
						res.redirect('/home');
						val=true;	
					}	
				}

			if(val==false){	
					res.render('index',{Status: 'Wrong username or password',title :"Homepage"});
				}
		}
	});
});

//Redirect to home

router.get('/home',function(req,res){
	res.render('userhome',{Name : name,title : "User Home"});
})

// Load Signup pages
router.get('/Signup',function(req,res){
	res.render('Signup',{title:"Signup"});
});


// Read details to signup
router.post('/Sign',function(req,res){
	var name = req.body.username;
	var password= req.body.password;

	con.query({
		sql : 'insert into user (username,password,name,gender,phone_no,email_id) values (?,?,?,?,?,?)',
		values : [name,password,req.body.name,req.body.gender,req.body.phone,req.body.email]
	}, function (err, result) {
    	if (err) {
    			throw err;
    	}	
    	else{
   				console.log("1 record inserted");
				console.log("here1");
				res.redirect('/');
				console.log("here2");
			}
		
	});
	
});

//Booking phase
var seats;
var source;
var destination;
var tdate;
var booking_id;
var dayName;
var type;
router.post('/home/search',function(req,res){
	//console.log(name);
	seats=req.body.seats;
	source=req.body.city;
	destination=req.body.city2;
	tdate=req.body.tdate;
	booking_id=gen(5);
	type=req.body.bustype;
	dayName= req.body.day;
	console.log(dayName);	

	console.log("First booking_id : " + booking_id);
/*	console.log(booking_id);
		con.query({
			sql : 'select booking_id from booking where booking_id==?',
			values : [booking_id]
		},function(err,res,next){
			if (err) {
				res.redirect('/home');
				//throw err;
			}
			else {
					console.log("here "+res.length);
					if(res.length==0)
						k=false;

				}
		});


	}
*/


	con.query({
		sql : 'insert into booking(username,seats,date_travel,type_of_bus,source,destination,booking_id) values (?,?,?,?,?,?,?)', 
		values : [name,seats,tdate,req.body.bustype,source,destination,booking_id]
	},function(err,result,next){
		if (err) throw err;
		else {
			console.log("Booking inserted opening homeuser1");
			res.redirect('/home/buses');
		}
	});
});

//Bus list to select from
router.get('/home/buses',function(req,res){
	con.query({
		sql :'select b.bus_no,bco.bc_name,b.source,b.destination,seats_left,bd.time,price from bus_info b,bus_company bco,bus_days bd where b.bc_id=bco.bc_id and b.bus_no=bd.bus_no and b.source=? and b.destination=? and bd.day=? and b.type = ?',
		values : [source,destination,dayName,type]
	},function(err,result,next){
			if (err) throw err;
			else {
					console.log(JSON.stringify(result));
					res.render('search',{Name:name, data :result, date: tdate,title : "Bus Info" });

			}
	});

});

// go to passenger info page 
var bus_selected;
var price;
var totalprice;
router.post('/home/info',function(req,res){
	bus_selected=req.body.busoption;
	console.log(seats);
	console.log("Bus no bus_selected : "+ bus_selected);
	con.query({
					sql :'select price from bus_info where bus_no=?',
					values : [bus_selected]
				},function(err,result,next){
					if(err) throw err;
					else{
						console.log(result[0].price);
						price=result[0].price;
						totalprice=price*seats;
						console.log("tot price"+ totalprice);

					}
	});
				
		
	

		res.render('pginfo', {Name:name,title:"Passenger Info",passenger :seats});
	//res.redirect('/home/pginfo');
	
});
		
		


//Confirm details and go to pay
router.post('/home/pay',function(req,res){
	var i;
	for(i=0;i<seats;i++) {
		console.log("in loop");
		
		var Pname =req.body["Pname"+i];
		var Pgender=req.body["Pgender"+i];
		var Page=req.body["Page"+i];
		console.log("name is " + Pname);
		console.log(Pgender);
		console.log(Page);
		console.log("SEcond booking id : "+booking_id);
		con.query({
		
			sql : 'insert into pg_info(username,booking_id,pg_name,pg_gender,pg_age) values (?,?,?,?,?)',
			values : [name,booking_id,Pname,Pgender,Page]
		
		},function(err,result,next){
			if(err) throw err;
			else{
				
				res.render('payment',{title : "Payment", Name : name,Source : source,Destination : destination,Seats : seats,Price : totalprice });
			}
		});
	}
});

router.post('/home/ticket',function(req,res){
/*	con.query({
		sql :'CALL RemoveBooking()'
	},function(err,result,next){

			console.log(result);
	});
*/	

	con.query({
		sql :'CALL RemoveSeats(?,?)',
		values :[seats,bus_selected]
	},function(err,result,next){
		if (err) throw err;
		else
			console.log(result);
	});
	





	var loc;
	con.query({
		sql : 'select Ploc from bus_info where bus_no =?',
		values : [bus_selected]
	},function(err,result,next){
		if (err) throw err;
		else {
				console.log("Problem is Ploc");
				loc =result[0].Ploc;
		}
	});
	
	console.log("Ploc"+ loc)
	con.query({
		sql : 'insert into reservation(bus_no,r_no,seats_booked,username,booking_id) values (?,?,?,?,?)',
		values : [bus_selected,gen(5),seats,name,booking_id]
	},function(err,result,next) {
		if (err) throw err;
		else {
				con.query({
					sql : 'select pg_name,pg_gender,pg_age from pg_info where booking_id=? and username =?',
					values : [booking_id,name]				
				},function(err,result,next){
					if (err) throw err;
					else{
						console.log(JSON.stringify(result));
						res.render('ticket',{title : "Ticket", data : result, Name : name,Source : source,Destination : destination,Seats : seats,Price : totalprice ,Ploc : loc});

				};
			});
				
		}
	});
});



router.get('/history',function(req,res){
	con.query({
		sql : 'select distinct r.booking_id,b.source,b.destination,b.date_travel,b.seats,time,r.bus_no,bc.bc_name from booking b,reservation r,bus_days bd,bus_company bc,bus_info bi where r.booking_id=b.booking_id and r.username= ? and bd.bus_no=r.bus_no and r.bus_no=bi.bus_no and bi.bc_id=bc.bc_id and date_travel < ? group by r.booking_id order by date_travel',
		values : [name,current_date('date')]
		},function(err,result,next){
			if (err) throw err;
			else {
				console.log("History : "+ JSON.stringify(result));
				res.render('history',{title : "User History",data : result,Name : name});
			}
		});
})

router.get('/current',function(req,res){
	con.query({
		sql : 'select distinct r.booking_id,b.source,b.destination,b.date_travel,b.seats,time,r.bus_no,bc.bc_name from booking b,reservation r,bus_days bd,bus_company bc,bus_info bi where r.booking_id=b.booking_id and r.username= ? and bd.bus_no=r.bus_no and r.bus_no=bi.bus_no and bi.bc_id=bc.bc_id and date_travel > ? group by r.booking_id order by date_travel',
		values : [name,current_date('date')]
		},function(err,result,next){
			if (err) throw err;
			else {
				console.log("History : "+ JSON.stringify(result));
				res.render('currentbooking',{title : "Current Bookings",data : result,Name : name});
			}
		});
})


router.post('/cancel',function(req,res){
	var x;
	var bus;
	console.log("Cancelled bus no : "+ req.body.cancel)
	con.query({
		sql : 'select bus_no from reservation where booking_id=?',
		values : [req.body.cancel]	
	},function(err,result,next){
		if (err) throw err;
		else {
			console.log(result[0].bus_no);
			bus = result[0].bus_no;


	console.log("Booking cancelled is : " +req.body.cancel)
	con.query({
		sql : 'delete from reservation where booking_id = ?',
		values : [req.body.cancel]
	},function(err,result,next){
		if (err) throw err;
		else {
			console.log(result.affectedRows);
			x= result.affectedRows;
			if(x>0){
					con.query({
						sql :'CALL AddSeats(?,?)',
						values :[x,bus]
					},function(err,result,next){
						if (err) throw err;
						else
							console.log(result);
				});
	

			}
			res.redirect('/current');
		}
	});
	}
});		
	
});


module.exports = router;
