const express = require('express');
var request = require('request');
var cheerio = require('cheerio');
const slug = require('slug');
var extend = require('node.extend');

var multer = require('multer');
var upload = multer();

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const router = express.Router();

router.post('/adding', (req, res) => {
    var carro = [];
    request(req.body.url, function (err, response, body) {
        if (response) {
            if (response.statusCode == 200) {
                // Com a resposta em formato DOM tree e auxílio do cheerio, recorta o dado da resposta.
                const $ = cheerio.load(body);
                const raw_res = $('[type="application/ld+json"]').html();
                const list_img = [];
                $("ul.car_detail_hero > li > img").each(function (i, elem) {
                    list_img.push(elem.attribs.src);
                });
                result = JSON.parse(raw_res);
                result.shift();

                var mySlug = slug(result[0]['brand'] + " " + result[0]['model']) + '/' + result[0]['url'].split('/').pop();
                var slugJSON = { slug: mySlug };

                var id_num = result[0]['url'].split('/').pop();
                var idJSON = { id_num: id_num };

                var imgJSON = { auxImg: list_img };

                var dest = extend({}, result[0], result[1], slugJSON, imgJSON, idJSON);
                res.render('car-add', { layout: 'admin-layout', car: dest });
                // console.log(dest.geo);
                // console.log(JSON.stringify(dest.imgJSON + "aqui"));
            }
        }
    })
})
router.post('/added', (req, res) => {
    var mySlug = slug(req.body.brand + " " + req.body.model) + '/' + req.body.url.split('/').pop();
    var bdObj = {
        model: req.body.model,
        name: req.body.name,
        brand: req.body.brand,
        description: req.body.description,
        image: req.body.image,
        "@context": "http://schema.org",
        offers: {
            priceCurrency: "JPY",
            "@context": "http://schema.org",
            price: "3500",
            "@type": "Offer"
        },
        "@id": req.body.url,
        url: req.body.url,
        "@type": "Place",
        geo: JSON.parse(req.body.geo),
        address: req.body.address,
        slug: mySlug,
        auxImg: req.body.auxImg,
        id_num: req.body.id_num,
        disponivel: true,
        our_cat: req.body.bandeira,
        featured: ""
    }

    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('autoloc');
        const mainCol = db.collection('car-pool');
        const update = { $set: bdObj }
        mainCol.updateOne({ url: bdObj.url }, update, { upsert: true }, function () {
            res.redirect('/admin');
        })
    })
})
router.get('/add-car', (req, res) => {
    var context = {
        pageName: 'Modificando o catálago',
        picSrc: req.session.picSrc,
    }
    res.render('admin-cat', { layout: 'admin-layout', title: 'Adicione um anúncio', context: context })
})

router.get('/:mdb/fila', (req, res) => {
    var context = {
        logged: req.session.loggedIn,
        pageName: 'Timeline',
        picSrc: req.session.picSrc,
        carCatalog: [],
        filaZero: [],
        filaAnyca: [],
        filaZero: [],
        myself: []
    }
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('admin');
        const mainCol = db.collection('users');
        const filaZero = db.collection('fila-zero');
        const filaAnyca = db.collection('fila-anyca');
        const handshakes = db.collection('handshakes');
        const filaZ = filaZero.find({}, function (err, doc) {
            doc.forEach(element => {
                context.filaZero.push(element);
            });
        })
        const filaA = filaAnyca.find({}, function (err, doc) {
            doc.forEach(element => {
                context.filaAnyca.push(element);
            })
        })
        const handy = handshakes.find({}, function (err, doc) {
            doc.forEach(element => {
                context.handshakes.push(element);
            })
        })
        const main = mainCol.findOne({ _id: ObjectID(req.params.mdb) }, function (err, doc) {
            if (doc) {
                context.myself = {
                    logged: req.session.loggedIn,
                    myObj: doc._id,
                    name: doc.name,
                    email: doc.email,
                    myProfPic: doc.profPic
                }
                res.render('fila', { layout: 'admin-layout', context: context });
            }
        })
    })
})
router.get('/:mdb', (req, res) => {
    if (ObjectID.isValid(req.params.mdb)) {
        var context = {
            pageName: 'Dashboard',
            carCatalog: [],
            filaZero: [],
            filaAnyca: [],
            handshakes: [],
            myTeam: [],
            myself: []
        }
        MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
            const db = client.db('admin');

            const mainCol = db.collection('users');
            const filaZero = db.collection('fila-zero');
            const filaAnyca = db.collection('fila-anyca');
            const handshakes = db.collection('handshakes');
            const teamCol = db.collection('equipe');

            const dbCars = client.db('autoloc');

            const carCol = dbCars.collection('car-pool');
            const cars = carCol.find({}, function (err, doc) {
                doc.forEach(element => {
                    context.carCatalog.push(element);
                })
            })
            const filaZ = filaZero.find({}, function (err, doc) {
                doc.forEach(element => {
                    context.filaZero.push(element);
                });
            })
            const filaA = filaAnyca.find({}, function (err, doc) {
                doc.forEach(element => {
                    context.filaAnyca.push(element);
                })
            })
            const handy = handshakes.find({}, function (err, doc) {
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
                if (doc) {
                    req.session.name = doc._id;
                    req.session.email = doc.email;
                    req.session.picSrc = doc.profPic;
                    context.myself = {
                        myObj: doc._id,
                        name: doc.name,
                        email: doc.email,
                        myProfPic: doc.profPic
                    }
                    res.render('admin', { layout: 'admin-layout', context: context });
                }
            })
        })
    }
});
router.get('/', (req, res) => {
    res.redirect('/login');
});

module.exports = router;