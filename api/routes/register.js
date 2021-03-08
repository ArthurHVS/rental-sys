const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const alert = require('alert');

// router.use(express.static(path.join(__dirname, '/client-views')));

router.get('/', (req, res) => {
    // req.session = {};
    res.render('register', { layout: 'login-layout' });
})

router.post('/complete', (req, res) => {
    var myMail = req.body.email;
    req.session.loggedIn = true;
    var user = 'naoresponda@luxury.online'
    var from = 'naoresponda@luxury.online'
    var to = myMail;

    var remetente = nodemailer.createTransport({
        host: '',
        service: '',
        port: 587,
        secure: false,
        auth: {
            user: user,
            pass: ''
        }
    })

    var email = {
        from: from,
        to: to,
        subject: 'Link de Confirmação - Luxury Rental Cars JP',
        text: form,
    }
    remetente.sendMail(email, function (err) {
        alert("Ocorreu um erro em seu cadastro...");
        if (err) throw err
        else
            console.log("Email de confirmação enviado...")
    })
    res.redirect('/client');
    alert("O email " + myMail + "foi cadastrado com sucesso!")
    // alert("Confirme o seu email com o link enviado para " + myMail);
});

router.post('/added', (req, res) => {
    var mybool = (req.body.newsletter === true || req.body.newsletter === "true");
    var myBody = {
        hash: "",
        name: "",
        email: {
            address: "",
            verified: false,
            newsletter: false
        },
        admin: false,
        profPic: "",
        menko: "",
        zairyu: ""
    }

    myBody.name = req.body.completeName;
    myBody.email.address = req.body.email
    myBody.email.verified = false;
    myBody.email.newsletter = mybool;
    bcrypt.hash(req.body.pass, 12, function (err, hash) {
        myBody.hash = hash;
        MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
            const db = client.db('admin');
            const userCol = db.collection('users');
            userCol.insertOne(myBody, function (err, doc) {
                // console.log(doc.insertedId);
                req.session.name = doc.insertedId;
                res.redirect(307, '/register/complete');
            });
        })
    })
})

router.post('/add', (req, res) => {
    if (!req.body.completeName || !req.body.whatsapp || !req.body.email || !req.body.pass || !req.body.pass_conf || !req.body.age) {
        alert("Por favor, complete todos os campos...");
    }
    else {
        MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
            const db = client.db('admin');
            const userCol = db.collection('users');
            userCol.findOne({ "email.address": req.body.email }, function (err, doc) {
                if (err) {
                    throw err;
                }
                if (doc) {
                    alert("Esse email já está cadastrado!");
                    res.redirect('/login');
                }
                else {
                    res.redirect(307, '/register/added')
                }
            })
            client.close();
        })
    }
})

module.exports = router;