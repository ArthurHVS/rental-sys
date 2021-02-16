const express = require('express');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const router = express.Router();

router.get('/:mdb', (req, res) => {
    var filaZero = [];
    var myUsr = [];
    var myTeam = [];
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('admin');
        const mainCol = db.collection('adm-users');
        const filaCol = db.collection('fila-zero');
        const teamCol = db.collection('equipe');
        
        const fila = filaCol.find({}, function (err, doc) {
            doc.forEach(element => {
                filaZero.push(element);
            });
        })

        const equipe = teamCol.find({}, function (err, doc) {
            doc.forEach(element => {
                myTeam.push(element);
            })
        })
        const main = mainCol.findOne({ _id: ObjectID(req.params.mdb) }, function (err, doc) {
            if(doc){
                var context = {
                    user: {
                        name: 'Alexandre',
                        email: 'yudi.umeoka@hotmail.com'
                    },
                    equipe: myTeam,
                    fila: filaZero
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