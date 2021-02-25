const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
router.use(express.static(path.join(__dirname, '/client-views')));


router.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
    }
    res.render('login', { layout: 'login-layout' });
});

router.post('/attempt', (req, res) => {
    MongoClient.connect(process.env.MONGO_URL, { useNewUrlParser: true }, function (err, client) {
        const db = client.db('admin');

        const usrCol = db.collection('users');
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
                        req.session.loggedIn = true;
                        req.session.name = doc._id;
                        req.session.picSrc = doc.profPic;
                        if (doc.admin == true) {
                            res.redirect('/admin/' + doc._id);
                        }
                        else {
                            res.redirect('/client/')
                        }
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
module.exports = router;
