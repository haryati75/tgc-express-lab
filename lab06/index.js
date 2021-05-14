// include express, hbs and wax-on
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// 1. create the express app
let app = express();

// 1b. set the view engine
app.set('view engine', 'hbs');

// 1c. set up the wax on
wax.on(hbs.handlebars);

// This is where HBS will look for any file that we are extending from
wax.setLayoutPath('./views/layout');

// enable forms
// ULTRA-IMPORTANT in FORMS
app.use(express.urlencoded({
    extended: false
}))

// *************************************************************************
// 2. ROUTES
app.get('/', function(req,res){
    res.render('index')
})

app.get('/about-us', function(req,res){
    res.render('about-us')
})

app.get('/contact-us', function(req,res){
    res.render('contact-us')
})

app.post('/contact-us', function(req,res){
    console.log("Form has been received");
    res.send("Form received")
    console.log(req.body);

    let firstName = req.body.fname;
    let lastName = req.body.lname;
    let email = req.body.email;
    let enquiry = req.body.enquiry;
    let country = req.body.country;

    console.log(req.body.hearAbout);

    // make sure hearAbout is ALWAYS an array of some sort
    // empty -- if no checkbox is selected, or
    // an array of one or more strings if one or more checkbox is selected
 
    // check if req.body.hearAbout is undefined; if it is, set it to be an
    // empty array
    let hearAbout = req.body.hearAbout || [];

    // check if hearAbout is not an array
    // if it is not an array, set it to be an array with the value
    // of hearAbout as its only element
    hearAbout = Array.isArray(hearAbout) ? hearAbout : [hearAbout];

    /*
    let hearAbout;
    if (req.body.hearAbout==undefined) {
        hearAbout = []
    } else {
        if (Array.isArray(hearAbout)) {
            hearAbout = req.body.hearAbout;
        } else {
            hearAbout = [req.body.hearAbout]
        }
        
    }
    */
    console.log(hearAbout);

})


// Hands on: BMI
app.get('/bmi', function(req, res) {
    res.render('bmi');
})

app.post('/bmi', function(req,res) {
    // test the form is working initially
    // res.send(req.body); 
    let weight = parseFloat(req.body.weight);
    let height = parseFloat(req.body.height);
    let unit = req.body.unit;
    let bmi;
    if (unit=="metric") {
        bmi = weight/height**2;
    } else {
        bmi = (weight/height**2) * 702;
    }
    res.send("<h1>Your BMI is " + bmi);
})


// *************************************************************************
// 3. START SERVER
app.listen(3000, function() {
    console.log("Server has started")
})
