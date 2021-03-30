const express = require('express');
const app = express();
const http = require('http');
process.env.MONGO_URL = "mongodb://localhost:27017"
const port = process.env.PORT || 3000;
const server = http.createServer(app);
server.listen(port);
const MongoClient = require('mongodb').MongoClient;
var GeoJSON = require('geojson');

app.get('/atualizar', (req, res) => {
    var carros = [];
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {

        const db = client.db('autoloc');

        const carCol = db.collection('car-pool');
        const catAgg = carCol.aggregate([{ $sort: { featured: -1 } }])
        catAgg.forEach(car => {
            myGeo = GeoJSON.parse(car.geo, { Point: ['latitude', 'longitude'] })
            car.geo = myGeo;
            carros.push(car);
        }, function() {
            carros.forEach(car => {
                const update = { $set: car }
                carCol.updateOne({ url: car.url }, update, { upsert: true }, function() {
                    console.log("Updated: " + car.name);
                })
            })
        })

    })
})


module.exports = app;