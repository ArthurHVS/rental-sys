// Requires das dependências
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');
const hbs = require('express-handlebars');
const path = require('path');

// var session = require('cookie-session');

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

// app.use(session({
//     secret: 'shhh',
//     email: 'shh@shh.shh.sh',
//     saveUninitialized: true,
//     resave: true,
//     me: null,
//     cookie: {}
// }))


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

app.get('*/home', (req, res) => {
    res.redirect('/client');
});

app.post('/handshake', (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('admin');
        const rel = db.collection('fila-zero').insertOne({data: req.body.value, born: new Date(), responsavel: '', checked: false});
        res.sendStatus(200);
    })
})
app.get('/', (req, res) => {
    res.redirect('/client');
});
app.get('/car/:slug/:id', (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('autoloc');
        const rel = db.collection('car-pool').findOne({ id_num: req.params.id }, function (err, doc) {
            res.render('car-detail', { carro: doc, layout: 'detail-layout' })
        });
    });
});

app.post('/attempt', (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('admin');

        const usrCol = db.collection('adm-users');
        var logged = usrCol.findOne({ "email.address": req.body.email }, function (err, doc) {
            if (err) {
                throw err;
            }
            if (doc) {
                bcrypt.compare(req.body.password, doc.hash, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    if (result) {
                        var logged = true;
                        res.redirect('/admin/' + doc._id);
                        return true;
                    }
                    else {
                        console.log('Sem chance irmão...');
                        res.redirect('/');
                        return false;
                    }
                });
            }
            else {
                console.log("Alerta, seu email nao existe...");
                return false;
            }
        });
        client.close();
    })
});

// Renders do Erro
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
})

module.exports = app;