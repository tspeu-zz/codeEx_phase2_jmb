/* Load Modules */
const express = require('express');
const router = express.Router();

/* Load controller */
const MatchinController = require('../controller/matchingController');
const matchingCtrl = new MatchinController();


router.post('/match',  (  req, res) => {
    // if(err){
    //     next(err); // Pass errors to Express.
    //     console.log('ERR> ', err);
    //     res.json({ 
    //         "msm": err,
    //         "err" :err
    //     });
    // }
    // else {

        matchingCtrl.matchingWorker(req, res);
        
        res.json({ 
            "msm": matchingCtrl.msmOut,
            "err" : matchingCtrl.msmErr,
            "res": matchingCtrl.matchingList
        });
    // }
});



router.get('/all', (req, res) => {
    
    console.log('from here');
    //
    res.send('hello from matching router tu');
});




module.exports = router;