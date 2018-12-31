
const MatchModel = require('../models/matchingModel');
// const matching = require('../common/matching');

class MatchingController {
    
    //matchingList = [];

    constructor(){ }
    

    matchingWorker(req) {
        let list = req.body;
        console.log('from matchinController' +  list);

        return list;
    }
    
}

module.exports = MatchingController;