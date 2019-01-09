/* Load Modules */
const express = require('express');
const router = express.Router();

/* Load controller */
const MatchinController = require('../controller/matchingController');
const matchingCtrl = new MatchinController();


router.post('/match', (req, res) => {

    matchingCtrl.matchingWorker(req, res);
    
    res.json({ 
        "msm": matchingCtrl.msmOut,
        "err" : matchingCtrl.msmErr,
        "res": matchingCtrl.matchingList
    });
    
});

router.get('/', (req, res) => { 
    res.send('<div style="font-family:Verdana,sans-serif;color:#616161;padding: 25px 50px;">'+
    '<h3>API Prueba jm_B</h3>'+
    '<ul><li>*** Optimal Match of shifts and workers ***</li>'+
    '<li>* @params req, res</li>'+
    '<li>* @return List[Matching]</li></ul>'+
    '<p>@params req {worker:[], shifths:[]}</p>'+
    '<p>@out  List[Matching]</p>'+
    '<p>URL:api/matching/match/</p>'+
    '<p>METHOD: POST</p></div>');
});

module.exports = router;