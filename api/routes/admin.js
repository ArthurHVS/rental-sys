const express = require('express');

const MongoClient = require('mongodb').MongoClient;
const router = express.Router();

router.get('/', (req, res) => {
    res.render('admin', { layout: 'admin-layout' });
});

module.exports = router;