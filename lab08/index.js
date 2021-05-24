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

// call DB to retrieve a food document by its Id
async function getFoodById(id) {
    let db = MongoUtil.getDB();
    // find one will always return ONE object
    return await db.collection('food').findOne({
        '_id' : ObjectId(id)
    })
}

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

    // *********************************************************************************
    // 7. Define the routes

    // root route
    app.get('/', (req,res)=> {
        res.send("Hello World")
    })

    // render the form to allow user to add a new Food document
    app.get('/food/add', (req,res) => {
        res.render('add_food');
    })

    app.post('/food/add', async (req,res) => {
        // let foodName = req.body.foodName;
        // let calories = req.body.calories;
        // let tags = req.body.tags;
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
        let foodRecord = await getFoodById(req.params.foodid);
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

    // render the form that allows the user to delete a food document
    app.get('/food/:foodid/delete', async (req, res) => {
        let foodRecord = await getFoodById(req.params.foodid);
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

    // render the form that allows the user to add note
    app.get('/food/:foodid/notes/add', async (req,res) => {
        let foodRecord = await getFoodById(req.params.foodid);
        res.render('add_note', {
            foodRecord
        })
    })

    app.post('/food/:foodid/notes/add', async (req,res) => {
        let db = MongoUtil.getDB();
        let noteContent = req.body.content;
        await db.collection('food').updateOne({
            '_id' : ObjectId(req.params.foodid)
        }, {
            '$push' : {
                'notes'  : {
                    '_id' : ObjectId(),
                    'content' : noteContent
                }
            }
        })
        res.redirect('/food')
    })

    // see the notes and details of the food document
    app.get('/food/:foodid', async (req,res) => {
        let foodRecord = await getFoodById(req.params.foodid);
        res.render('food_details', {
            foodRecord
        })
    })

    // display a form to allow user to update a note (sub-doc) for a Food Document
    app.get('/food/notes/:noteid/edit', async (req,res) => {
        let db = MongoUtil.getDB();
        let noteId = req.params.noteid;
        let foodRecord = await db.collection('food').findOne({
            'notes._id' : ObjectId(noteId)
        }, {
            'projection' : {
                'notes': {
                    '$elemMatch' : {
                        '_id' : ObjectId(noteId)
                    }
                }
            }
        })
        let noteToEdit = foodRecord.notes[0];
        res.render('edit_note', {
            'note': noteToEdit
        })
    })

    app.post('/food/notes/:noteid/edit', async (req,res) => {
        let db = MongoUtil.getDB();
        let noteId = req.params.noteid;
        let foodRecord = await db.collection('food').findOne({
            'notes._id' : ObjectId(noteId)
        })
        await db.collection('food').updateOne({
            'notes._id': ObjectId(noteId)
        }, {
            '$set' : {
                'notes.$.content' : req.body.content
            }
        })
        res.redirect('/food/'+foodRecord._id)
    })

    // display a form to allow user to delete a note (sub-doc) for a Food Document
    app.get('/food/notes/:noteid/delete', async (req,res) => {
        let db = MongoUtil.getDB();
        let noteId = req.params.noteid;
        let foodRecord = await db.collection('food').findOne({
            'notes._id' : ObjectId(noteId)
        })
        let noteToEdit = foodRecord.notes[0];
        res.render('delete_note', {
            'foodName': foodRecord.foodName,
            'note': noteToEdit
        })
    })

    app.post('/food/notes/:noteid/delete', async (req,res) => {
        let db = MongoUtil.getDB();
        let noteId = req.params.noteid;
        let foodRecord = await db.collection('food').updateOne({
            'notes._id' : ObjectId(noteId)
        }, {
            '$pull': {
                'notes': {
                    '_id': ObjectId(noteId)
                }
            }
        })
        res.redirect('/food/'+foodRecord._id);
    })

    // *********************************************************************************
    // 8. start the server
    app.listen(3000, ()=>{
        console.log("Server has started")
    })
}

main();