const _ = require('lodash');
const Match = require('../models/matchingModel');
const Worker = require('../models/worker');
const Shift = require('../models/shift');

class MatchingController {
    
    //matchingList = [];
    
    constructor(){ 
        // msmOut = "";
        // msmErr = "";
        
    }
    

    matchingWorker(req, res) {

        //let data = req.body;
        let workersList = req.body.workers;
        let shiftList = req.body.shifts;
        this.matching = [];
        this.msmErr ="";
        //instanciar models;

        let sortedWorkers = _.sortBy(workersList, ['availability.length', 'payrate']);

        let allShiftsTaken = true;

        for (let shift of shiftList)  {

        let day = shift.day;
        console.log('*********************->DAY: ************* ', day);
        let availableWorkerFound = false;

            for (let worker of sortedWorkers) {
                console.log('---> ID: ', worker.id);
                console.log('worker.availability>>', worker.availability);
            //check if exists a worker with a day avaible with the day shift
            let index = worker.availability.findIndex(k => k== day);
        
            // const index = worker.availability.indexOf(day);
            console.log('---INDEX --------->', index);

                if (index !== -1) {
                availableWorkerFound = true;
                worker.availability.splice(index, 1);

                this.matching.push({'idWorker': worker.id, 'shift': day });
                //vuelves a ordenar->
                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'payrate']);
                console.log('nuevo sortedWorkers-->>>>', sortedWorkers)
                break;
                }
            }
    
        if (availableWorkerFound === false) {
            //no hay shift disponibles->
            this.msmOut = "there not shift availables";
            allShiftsTaken = false;
            break;
        }
      
}

        if (allShiftsTaken === false) {
            this.msmOut = "No optimal solution found"
            console.log("No optimal solution found");
        }

    console.log('---FINAL MATCHING-----------------------');
    console.log( this.matching);
    console.log('--------------------------');

    }
    
    
}

module.exports = MatchingController;