/* Load Modules */
const express = require('express');
const router = express.Router();

/* Load controller */
const MatchinController = require('../controller/matchingController');
const matchingCtrl = new MatchinController();


router.post('/match',  (req, res) => {

    matchingCtrl.matchingWorker(req);

    res.send('POST  from matching router tu'+ JSON.stringify(req.body));
});



router.get('/all', (req, res) => {
    
    console.log('from here');
    //
    res.send('hello from matching router tu');
});




module.exports = router;