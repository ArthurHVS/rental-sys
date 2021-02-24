const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const router = express.Router();
router.use(express.static(path.join(__dirname, '/client-views')));


router.get('/', (req,res) => {
    if(req.session.me){
        MongoClient.connect(process.env.MONGO_URL,{useNewUrlParser:true}, function (err, client) {
            const db = client.db('autoloc');
            const carCollection = db.collection('car-pool');
            const poolAgg = carCollection.aggregate([{$sample: {size: 12}}])
            poolAgg.forEach(car => {
                carros.push(car);
            },function(){
                res.render('index',{pool: carros, title:'Luxury Cars Rental JP', user: null})
            })
    
            client.close();
        })
    }
    else{
        res.render('login', { layout: 'login-layout' });
    }
});

module.exports = router;
