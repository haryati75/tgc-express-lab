// SETUP EXPRESS
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId
const MongoUtil = require('./MongoUtil')

let app = express();

// enable JSON as the transfer data format
app.use(express.json());

// enable CORS
app.use(cors());

async function main() {
    let db = await MongoUtil.connect(process.env.MONGO_URI, "food_sightings");
    // console.log("ready to go")

    // ENDPOINT: Add a new free food sighting to the database
    app.post("/free_food_sighting", async (req,res) => {
        try {
            let location = req.body.location;
            let food = req.body.food;
            let date = req.body.date;
            let db = MongoUtil.getDB();
            let result = await db.collection('food').insertOne({
                'food': food,
                'location': location,
                'date': new Date(date) // to create an ISO Date Object from a string
            })
            res.send(result);

            // send back the status (HTTP code)
            res.status(200);
        } catch (e) {
            res.send("Unexpected internal server error");
            res.status(500);
            console.log(e);
        }
    })

    app.get('/free_food_sighting', async (req,res) => {

        let food = req.query.search;
        let criteria = {};

        // null => false
        // undefined => false
        // "" ==> false
        if (food) {
            // if food is not null and not undefined and not empty string
            // add it to the criteria
            criteria['food'] = {
                '$regex': food,
                '$options': 'i'
            }
        }

        // fetch all the food sightings and send back
        let db = MongoUtil.getDB();
        let results = await db.collection('food').find(criteria).toArray();
        // let say req.query.food is "chicken", then it is equivalent to writing:
        // db.collection('food').find(
        // "food": {
        //     "$regex": "chicken", "$options":"i"
        // }
        // )
        res.send(results);
        res.status(200);
    })

    app.put('/free_food_sighting/:id', async (req, res) => {
        // retrieve the client's data
        let food = req.body.food;
        let location = req.body.location;
        let date = new Date(req.body.date);

        let db = MongoUtil.getDB();
        let results = await db.collection('food').updateOne({
            "_id": ObjectId(req.params.id)
        }, {
            "$set": {
                "food": food,
                "location": location,
                "date": date
            }
        })
        res.status(200);
        res.send(results);
    })
}

main();

app.listen(3000, () => {
    console.log("server started")
})