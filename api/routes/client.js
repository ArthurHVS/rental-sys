
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const path = require('path');
const router = express.Router();
var carros = [];

router.get('*/home', (req, res) => {
    console.log("Qual é?");
    res.redirect('/');
});

router.get('/my-profile/:logged', (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('autoloc');
        const usrCol = db.collection('users');
        if (ObjectID.isValid(req.params.logged)) {
            usrCol.find({ _id: ObjectID(req.params.logged) }, function (err, doc) {
                if (err) {
                    throw err;
                }
                res.render('profile', { layout: 'admin-layout', user: null });
            })
        }
        else {
            res.render('profile', { layout: 'admin-layout' });
        }
    })
});

router.get('/:logged/', (req, res) => {
    var sess = req.session;

    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('autoloc');
        const carCollection = db.collection('car-pool');
        const poolAgg = carCollection.aggregate([{ $sample: { size: 12 } }])
        poolAgg.forEach(car => {
            carros.push(car);
        }, function () {
            MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
                const db = client.db('autoloc');
                if (ObjectID.isValid(req.params.logged)){
                    const usrCol = db.collection('users').findOne({ _id: ObjectID(req.params.logged) }, function (err, doc) {
                        if (err) {
                            throw err;
                        }
                        res.render('index', { pool: carros, user: doc })
                    });
                }
                else {
                    res.render('index', { pool: carros, user: null })
                }
            })
        })
    });

});
router.get('/', (req, res) => {
    var sess = req.session;

    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('autoloc');
        const carCollection = db.collection('car-pool');
        const poolAgg = carCollection.aggregate([{ $sample: { size: 12 } }])
        poolAgg.forEach(car => {
            carros.push(car);
        }, function () {
            res.render('index', { pool: carros })
        })

        client.close();
    })
});


router.post('/', (req, res) => { });

module.exports = router;
