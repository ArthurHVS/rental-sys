const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const alert = require('alert');

router.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
    }
    res.render('login', { layout: 'login-layout', title: 'Login - Luxury Rental Cars JP' });
});

router.post('/attempt', (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('admin');

        const usrCol = db.collection('users');
        usrCol.findOne({ "email.address": req.body.email }, function (err, doc) {
            if (err) {
                throw err;
            }
            if (doc) {
                bcrypt.compare(req.body.password, doc.hash, function (err, result) {
                    if (err) {
                        throw err;
                    }
                    if (result) {
                        req.session.loggedIn = true;
                        req.session.name = doc._id;
                        req.session.picSrc = doc.profPic;
                        if (doc.admin == true) {
                            req.session.adm_flag = true;
                            res.redirect('/admin/' + doc._id);
                        }
                        else {
                            req.session.adm_flag = false;
                            res.redirect('/client/')
                        }
                        return true;
                    }
                    else {
                        alert("Sua senha não está correta...");
                        res.redirect('/');
                        return false;
                    }
                });
            }
            else {
                alert("Seu email não existe no nosso banco de dados...");
                return false;
            }
        });
        client.close();
    })
});
module.exports = router;
