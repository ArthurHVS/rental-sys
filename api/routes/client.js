const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const path = require('path');
const router = express.Router();
var GeoJSON = require('geojson');

router.get('*/home', (req, res) => {
    res.redirect('/');
});

router.get('/locate/:lat/:lng', (req, res) => {
    myGeo = GeoJSON.parse({
        latitude: req.params.lat,
        longitude: req.params.lng,
    }, { Point: ['latitude', 'longitude'] })
    req.session.geo = myGeo;
    res.sendStatus(200);
});

router.get('/filters', (req, res) => {
    res.render('filters', { catalog: {}, title: 'Luxury Cars Rental - Busca Avançada' })
});

router.get('/filtering', (req, res) => {
    var carros = [];
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        const db = client.db('autoloc');
        const filterCol = db.collection('car-pool');
        const filterAgg = filterCol.aggregate([{}])
        filterAgg.forEach
    })
    res.render('filters', { catalog: carros, title: 'Luxury Cars Rental - Busca Avançada' })
})

router.get('/catalogo', (req, res) => {
    var carros = [];
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        const db = client.db('autoloc');
        const catCol = db.collection('car-pool');
        const catAgg = catCol.aggregate([{ $sort: { featured: -1 } }])
        catAgg.forEach(car => {
            carros.push(car);
        }, function() {
            res.render('catalog', { catalog: carros, call: 'Catálogo Completo', title: 'Luxury Cars Rental - Catálogo Completo' })
        })
        client.close();
    })
});
router.get('/categoria/:categoria', (req, res) => {
    var carros = [];
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        const db = client.db('autoloc');
        const catCol = db.collection('car-pool');
        catCol.find({ our_cat: { $eq: req.params.categoria } }, function(err, doc) {
            doc.forEach(car => {
                carros.push(car);
            }, function() {
                res.render('catalog', { catalog: carros, call: req.params.categoria.toUpperCase(), title: 'Luxury Cars Rental - Carros ' + req.params.categoria })
            })
        })
        client.close();
    })
})
router.get('/my-profile/', (req, res) => {
    var sess = req.session;
    if (!sess.loggedIn) {
        res.redirect('/');
    } else {
        MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
            const db = client.db('autoloc');
            const usrCol = db.collection('users');
            if (ObjectID.isValid(req.params.logged)) {
                usrCol.find({ _id: ObjectID(req.params.logged) }, function(err, doc) {
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    res.render('profile', { layout: 'admin-layout', user: doc });
                })
            } else {
                res.render('profile', { layout: 'admin-layout' });
            }
        })
    }
});

router.get('/', (req, res) => {
    var sess = req.session;
    var carros = [];
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        const db = client.db('autoloc');
        const carCollection = db.collection('car-pool');
        const poolAgg = carCollection.aggregate([
            { $sort: { featured: -1 } },
            { $limit: 9 }
        ])
        poolAgg.forEach(car => {
            carros.push(car);
        }, function() {
            res.render('index', { pool: carros, title: 'Luxury Cars Rental JP', context: sess })
        })

        client.close();
    })
});

router.post('/handshake', (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        const db = client.db('admin');
        if (req.body.value) {
            const rel = db.collection('fila-zero').insertOne({ data: req.body.value, born: new Date(), responsavel: '', checked: false });
            res.sendStatus(200);
        } else {
            res.sendStatus(304);
        }
    })
})

router.get('/near-me/', (req, res) => {
    var carros = [];
    if (req.session.geo) {
        MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true },
            function(err, client) {
                const db = client.db('autoloc');
                const nearCol = db.collection('car-pool');
                const nearAgg = nearCol.find({
                    "geo.geometry": {
                        $nearSphere: {
                            $geometry: req.session.geo.geometry,
                            $minDistance: 0,
                            $maxDistance: 80000
                        }
                    }
                })
                nearAgg.forEach(car => {
                    carros.push(car)
                }, function() {
                    res.render('catalog', { catalog: carros, call: 'Carros Próximos', title: 'Luxury Cars Rental - Catálogo Completo' })
                })
            })
    } else {
        MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true },
            function(err, client) {
                const db = client.db('autoloc');
                const nearCol = db.collection('car-pool');
                const nearAgg = nearCol.find({
                    "geo.geometry": {
                        $nearSphere: {
                            $geometry: {
                                type: "Point",
                                coordinates: [139.6007812, 35.6684415] //lng,lat Tokyo
                            },
                            $minDistance: 0,
                            $maxDistance: 160000
                        }
                    }
                })
                nearAgg.forEach(car => {
                    carros.push(car)
                }, function() {
                    res.render('catalog', { catalog: carros, call: 'Catálogo Completo', title: 'Luxury Cars Rental - Catálogo Completo' })
                })
            })
    }
});

router.post('/search', (req, res) => {
    var carros = [];
    const termo = req.body.termo.toUpperCase();
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        const db = client.db('autoloc');
        const catCol = db.collection('car-pool');
        catCol.find({
            $or: [
                { "brand": { "$in": [req.body.params, termo] } },
                { "model": { "$in": [req.body.params, termo] } }
            ]
        }, function(err, doc) {
            doc.forEach(car => {
                carros.push(car);
            }, function() {
                res.render('catalog', { catalog: carros, call: "Busca:" + " '" + req.body.termo.toUpperCase() + "'", title: 'Luxury Cars Rental - Busca' })
            })
        })
    })

});

router.post('/filter', (req, res) => {
    var carros = [];
    const brand = req.body.brand;
    const city = req.body.city;
    const our_cat = req.body.our_cat;
    console.log(brand + ", " + city + ", " + our_cat + "...")
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        const db = client.db('autoloc');
        const catCol = db.collection('car-pool');
        catCol.find({ $and: [{ "city": city }, { "brand": brand }, { "our_cat": our_cat }] }, function(err, doc) {
            doc.forEach(car => {
                // console.log("Carro: " + doc.model)
                carros.push(car);
            }, function() {
                res.render('catalog', { catalog: carros, call: "Busca Avançada", title: 'Luxury Cars Rental - Busca Avançada' })
            })
        })
    })

});

router.post('/', (req, res) => {});

module.exports = router;