/* Load Modules */
const express = require('express');
const router = express.Router();

/* Load controller */
const MatchinController = require('../controller/matchingController');
const matchingCtrl = new MatchinController();


router.post('/match', (req, res) => {
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

router.get('/', (req, res) => { 
    res.send('<div style="color:#616161;text-align:center;padding:10px;"><h3>API Prueba jm_B</h3>'
    +'<p> @params req {worker:[], shifths:[]}</p>'
    +'<p>@out Matching List[]</p></div>');
});

module.exports = router;