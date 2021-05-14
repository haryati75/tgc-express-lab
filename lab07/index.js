// include express, hbs and wax-on
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const axios = require('axios');

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

const baseURL = 'https://petstore.swagger.io/v2';

// *************************************************************************
// 2. ROUTES
app.get('/pets', async function(req,res){
    let response = await axios.get(baseURL + '/pet/findByStatus', {
        params: {
            'status':'available'
        }
    });
    res.render('pets', {
        'allPets': response.data
    })
    // console.log(response.data)
})


// display Form - Create a new Pet
app.get('/pet/create', function(req,res) {
    res.render('create_pets')
})

app.post('/pet/create', async function(req,res) {
    let petName = req.body.petName;
    let petCategory = req.body.petCategory;

    let newPet = {
        'id': Math.floor(Math.random() * 100000 + 10000),
        'category': {
            'id': Math.floor(Math.random() * 1000000 + 100000),
            'name': petCategory 
        },
        'name': petName,
        'photoURLs': ['n/a'],
        'tags': [],
        'status': 'available'
    }

    // save the newPet object to the Petstore API database
    let response = await axios.post(baseURL + "/pet", newPet);
    res.send(response.data);
})

// display Form - Update an existing Pet and use Redirect
app.get('/pet/:petID/update', async function(req, res) {

    // 1. Fetch existing pet information from Petstore API database
    let petID = req.params.petID;
    let response = await axios.get(baseURL + "/pet/" + petID);

    // 2. Populate the form with the existing information
    res.render('edit_pets', {
        'pet': response.data
    });

})

// update the Pet information
app.post('/pet/:petID/update', async function(req,res) {
    // fetch the existing data
    let response = await axios.get(baseURL + "/pet/" + req.params.petID);
    let oldPet = response.data;

    // 
    let newPetName = req.body.petName;
    let newPetCategory = req.body.petCategory;

    let newPet = {
        'id': req.params.petID,
        'category': {
            'id': oldPet.category.id,
            'name': newPetCategory 
        },
        'name': newPetName,
        'photoURLs': ['n/a'],
        'tags': [],
        'status': 'available'
    }
    response = await axios.put(baseURL + "/pet", newPet);
    // go to the pets URL
    res.redirect('/pets');
})


// Delete Pet - display confirmation form
app.get('/pet/:petID/delete', async function(req, res) {
    let response = await axios.get(baseURL + '/pet/' + req.params.petID);
    let pet = response.data;
    res.render('delete_pet', {
        'pet': pet
    })
})

app.post('/pet/:petID/delete', async function(req, res) {
    let response = await axios.delete(baseURL + '/pet/' + req.params.petID);
    res.redirect('/pets');
})


// *************************************************************************
// 3. START SERVER
app.listen(3000, function() {
    console.log("Server has started")
})
