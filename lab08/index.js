const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
// same as 
// const dotenv = require('dotenv');
// dotenv.config();

// require in MongoUtil
const MongoUtil = require('./MongoUtil');

const helpers = require('handlebars-helpers');

async function main() {

    // 1. create the express application
    let app = express();

    // 2. set the view engine
    app.set('view engine', 'hbs');

    // 2b. initialise handlebars-helpers
    // const helpers = require('handlebars-helpers')({
    //     'handlebars': hbs.handlebars
    // })
    helpers({
        'handlebars': hbs.handlebars
    });

    // 3. where to find the public folder
    app.use(express.static('public'));

    // 4. set up wax-on
    wax.on(hbs.handlebars);
    wax.setLayoutPath('./views/layouts');

    // 5. set up forms
    app.use(express.urlencoded({
        extended: false
    }))

    // read in the environment variables
    // console.log(process.env.MONGO_URI)

    // 6. Connect to Mongo
    await MongoUtil.connect(process.env.MONGO_URI, 'food_tracker');

    // 7. Define the routes

    // root route
    app.get('/', (req,res)=> {
        res.send("Hello World")
    })

    app.get('/food/add', (req,res) => {
        res.render('add_food');
    })

    app.post('/food/add', async (req,res) => {
        // let foodName = req.body.foodName;
        // let calories = req.body.calories;
        let {foodName, calories, tags} = req.body;

        // check if tags is undefined.
        // if undefined, set it to be an empty array
        tags = tags || [];

        // if tag is a single value, convert it to be an array consisting of the value as its only element
        tags = Array.isArray(tags) ? tags : [tags];

        let db = MongoUtil.getDB();
        await db.collection('food').insertOne({
            foodName, calories, tags
        })
        res.redirect('/food')
    })

    // display the form list all the food
    app.get('/food', async (req, res) => {
        let db = MongoUtil.getDB();
        // find all the food and return in an array
        let results = await db.collection('food').find().toArray();
        res.render('food', {
            'foodRecords' : results
        })

    })

    // display the form to edit a food item
    app.get('/food/:foodid/edit', async (req, res) => {
        let db = MongoUtil.getDB();
        let foodId = req.params.foodid;
        // findOne will always give you back one object
        let foodRecord = await db.collection('food').findOne({
            '_id' : ObjectId(foodId)
        })

        if (! Array.isArray(foodRecord.tags)) {
            foodRecord.tags = []
        }
        res.render('edit_food', {
            foodRecord
        })
    })

    app.post('/food/:foodid/edit', async (req, res) => {
        let {foodName, calories, tags} = req.body;
        let foodId = req.params.foodid;
        //convert the tags
        tags = tags || [];
        tags = Array.isArray(tags) ? tags : [tags];

        // update the document
        let db = MongoUtil.getDB();
        await db.collection('food').updateOne({
            '_id':ObjectId(foodId)
        }, {
            '$set': {
                foodName, calories, tags
            }
        })
        res.redirect('/food');
    })

    app.get('/food/:foodid/delete', async (req, res) => {
        let db = MongoUtil.getDB();
        let foodRecord = await db.collection('food').findOne({
            '_id' : ObjectId(req.params.foodid)
        })
        res.render('delete_food', {
            foodRecord 
        })
    })

    app.post('/food/:foodid/delete', async (req,res) => {
        let db = MongoUtil.getDB();
        await db.collection('food').removeOne({
            '_id' : ObjectId(req.params.foodid)
        })
        res.redirect('/food');
    })

    // 8. start the server
    app.listen(3000, ()=>{
        console.log("Server has started")
    })
}

main();