const express = require('express');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const router = express.Router();

router.get('/:mdb/fila', (req,res) =>{
    var context = {
        pageName: 'Timeline',
        carCatalog: [],
        filaZero: [],
        filaAnyca: [],
        filaZero: [],
        myself: []
    }
    MongoClient.connect(process.env.MONGO_URL, {useNewUrlParser: true}, function (err, client) {
        const db = client.db('admin');
        const mainCol = db.collection('adm-users');
        const filaZero = db.collection('fila-zero');
        const filaAnyca = db.collection('fila-anyca');
        const handshakes = db.collection('handshakes');
        const filaZ = filaZero.find({}, function (err, doc) {
            doc.forEach(element => {
                context.filaZero.push(element);
            });
        })
        const filaA = filaAnyca.find({},function (err,doc) {
            doc.forEach(element => {
                context.filaAnyca.push(element);
            })            
        })
        const handy = handshakes.find({},function (err,doc) {
            doc.forEach(element => {
                context.handshakes.push(element);
            })
        })
        const main = mainCol.findOne({ _id: ObjectID(req.params.mdb) }, function (err, doc) {
            if(doc){
                context.myself = {
                    myObj: doc._id,
                    name: doc.name,
                    email: doc.email,
                    picSrc: doc.imgSrc
                }
                res.render('fila', { layout: 'admin-layout', context: context });
            }
        })
    })
        
})

router.get('/:mdb', (req, res) => {
    var context = {
        pageName: 'Dashboard',
        carCatalog: [],
        filaZero: [],
        filaAnyca: [],
        handshakes:[],
        myTeam: [],
        myself: []
    }
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('admin');

        const mainCol = db.collection('adm-users');
        const filaZero = db.collection('fila-zero');
        const filaAnyca = db.collection('fila-anyca');
        const handshakes = db.collection('handshakes');
        const teamCol = db.collection('equipe');
        
        const dbCars = client.db('autoloc');

        const carCol = dbCars.collection('car-pool');
        const cars = carCol.find({},function (err, doc) {
            doc.forEach(element=>{
                context.carCatalog.push(element);
            })
        })
        const filaZ = filaZero.find({}, function (err, doc) {
            doc.forEach(element => {
                context.filaZero.push(element);
            });
        })
        const filaA = filaAnyca.find({},function (err,doc) {
            doc.forEach(element => {
                context.filaAnyca.push(element);
            })            
        })
        const handy = handshakes.find({},function (err,doc) {
            doc.forEach(element => {
                context.handshakes.push(element);
            })
        })
        const equipe = teamCol.find({}, function (err, doc) {
            doc.forEach(element => {
                context.myTeam.push(element);
            })
        })
        const main = mainCol.findOne({ _id: ObjectID(req.params.mdb) }, function (err, doc) {
            if(doc){
                context.myself = {
                    myObj: doc._id,
                    name: doc.name,
                    email: doc.email,
                    picSrc: doc.imgSrc
                }
                res.render('admin', { layout: 'admin-layout', context: context });
            }
        })
    })

});

router.get('/', (req, res) => {
    res.redirect('/login');
});

module.exports = router;