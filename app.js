// Requires das dependências
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cron = require('node-cron');
var request = require('request');
var cheerio = require('cheerio');

const hbs = require('express-handlebars');
const path = require('path');

var session = require('cookie-session');

const app = express();

app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());

app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Requires das rotas
const clientRoutes = require('./api/routes/client');
const adminRoutes = require('./api/routes/admin')
const loginRoutes = require('./api/routes/login');
const registerRoutes = require('./api/routes/register');

cron.schedule("0 0 * * 3", function() {
    console.log("Quarta-feira é dia de atualizar...");
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        var carros = [];
        const db = client.db('autoloc');
        const catCol = db.collection('car-pool');
        const catAgg = catCol.aggregate([{ $sort: { featured: -1 } }])
        catAgg.forEach(car => {
            request(car.url, function(err, response, body) {
                client.close();
                if (err) { throw err; }
                if (response) {
                    if (response.statusCode == 200) {
                        // Com a resposta em formato DOM tree e auxílio do cheerio, recorta o dado da resposta.
                        const $ = cheerio.load(body);
                        const raw_res = $('[type="application/ld+json"]').html();
                        result = JSON.parse(raw_res);
                        result.shift();
                        car.offers = {
                            priceCurrency: "JPY",
                            '@context': "http://schema.org",
                            price: result[0].offers.price,
                            '@type': "Offer"
                        };
                        carros.push(car);
                        MongoClient.connect(process.env.MONGO_URL, function(err, client) {
                                const db = client.db('autoloc');
                                const collection = db.collection('car-pool');
                                collection.findOneAndUpdate({ url: car.url }, { $set: car }, function(err, doc) {
                                    console.log("Atualizou: " + doc.value.brand + " " + doc.value.model);
                                    console.log("Preço Atualizado: " + doc.value.offers.price);
                                })
                            })
                            // console.log(car.name + ", " + car.offers.price)
                    }
                }
            })
        })
    })
})

app.use(session({
    secret: 'shhh',
    name: 'uniqueSessionID',
    email: 'shh@shh.shh.sh',
    saveUninitialized: true,
    geo: {},
    cookie: { secure: true }
}))

// Handlebars Engine
app.engine('hbs', hbs({ extname: 'hbs', helpers: require('./config/handlebars-helpers'), defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts' }));
app.set('views', path.join(__dirname, 'views/'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '/views/')));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// Uses para mascarar as urls
app.use('/client', clientRoutes);
app.use('*/admin', adminRoutes);
app.use('*/login', loginRoutes);
app.use('*/register', registerRoutes)

app.get('*/home', (req, res) => {
    res.redirect('/client');
});

app.get('/', (req, res) => {
    res.redirect('/client');
});
app.get('/locate/*', (req, res) => {
    console.log("Aiai")
    myGeo = GeoJSON.parse({
        latitude: req.params.lat,
        longitude: req.params.lng,
    }, { Point: ['latitude', 'longitude'] })
    req.session.geo = myGeo;
    res.sendStatus(200);
});
app.get('/car/:slug/:id', (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function(err, client) {
        const db = client.db('autoloc');
        const rel = db.collection('car-pool').findOne({ id_num: req.params.id }, function(err, doc) {
            res.render('car-detail', { carro: doc, title: 'Luxury Rental - ' + doc.model, myself: req.session })
        });
    });
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/');
})

app.use((req, res, next) => {
    error = new Error('Essa página não existe...');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;