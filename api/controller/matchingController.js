const _ = require('lodash');
const Match = require('../models/matchingModel');
const Worker = require('../models/worker');
const Shift = require('../models/shift');
const Utils = require('../utils/utils');

        
class MatchingController {
    
    //matchingList = [];
    
    constructor(){ 
        // msmOut = "";
        // msmErr = "";
        this.utils = new Utils();
        this.matchingModel = new Match();
    }
    

    /* @PARAMS INPUT
    ** {workers[] shift []}     
    */
    matchingWorker(req, res) {
    try {

        //input 
        let data = req.body;
        let workersList = req.body.workers;
        let shiftList = req.body.shifts;

        //output
        this.matchingList = [];
        this.msmOut = "";
        this.msmErr ="";
        
        //array validations | expected false
        let checkWorkerList = this.utils.checkEmptyArrList(workersList);
        let checkShiftList = this.utils.checkEmptyArrList(shiftList);
        // let lenghWorker = workersList.length;
        let lenghShift = shiftList.length;
        let shiftsWord = (lenghShift > 1) ? 'shifts' : 'shift';


        //validation flags
        let allShiftsTaken = true;
        let availableWorkerFound = false;
        // let shitAssigned = false;

        /*VALIDATION  Check for empty input */ 

    if(checkWorkerList ) {
    
        this.msmOut = "THERES NO ANY WORKER";
        this.msmErr= "No optimal solution found";
        this.matchingList.push(data);
    } 
    
    else {
        
        //Check for empty input 
        if (checkShiftList) {
        
            this.msmOut +="THERES NO ANY SHIFTS";
            this.msmErr= "No optimal solution found";
            this.matchingList.push(data);
        }
        else {       
            
            //list of workers sorted by amount of days availables
            // let sortedWorkers = _.sortBy(workersList, ['availability.length', 'payrate']);
        // let sortedWorkers = _.sortBy(workersList, ['availability.length']);//, 'payrate'
        let sortedWorkers = workersList.sort((a, b) => a.availability.length > b.availability.length && a.payrate < b.payrate);
    
        let countID = 1; 

        this.addFLagWorker(sortedWorkers);

        for (let shift of shiftList) {

            let day = shift.day;
                                
        //ITERAR TRUE WORKER
            for (let worker of sortedWorkers) {

            //check if exists a worker with a day avaible with the day shift
            let index = worker.availability.findIndex(k => k== day);
            
            if (index !== -1 ) {
                availableWorkerFound = true;
                
                //TODO AGREGAR FLAG DE YA TIENE UN TURNO->
                worker.assignedshift = true;
                worker.hasmoreavailables = (worker.availability.length > 0) ? true: false;

                //eliminated the day for the actual worker
                worker.availability.splice(index, 1);
                this.deleteShiftsTaken(day, sortedWorkers);

                this.setMatchingModel(countID,  shift.id, worker.id, day, worker.payrate);

                this.addMatch(this.matchingModel, this.matchingList);

                this.msmOut ="";
                countID ++;
                
                //SORT LIST AGAIN->
                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'payrate']);
                
                break;
            
            }
            
        }
        
        if (availableWorkerFound === false) {
            this.msmErr = "No optimal solution found";
            this.msmOut = `There are no workers available for the required ${shiftsWord}`;
            allShiftsTaken = false;
            break;
        }
        
        allShiftsTaken = true;    
    }
    
            if (allShiftsTaken === false) {
                this.msmErr = "No optimal solution found";
                this.msmOut =`There are no workers available for the required ${shiftsWord}`;
                console.log("No optimal solution found ", this.msmOut);
                this.matchingList.push(data);
            }
        }
        }
    
    } catch (err) {
        console.log('ERROR', err);
        this.msmErr = err;
    }
}
 /* ADD MATCH TO A LIST OF MATCHING */
    addMatch(model, list) {
    
        list.push({'idMatch':   model.id,
                    'idShift':  model.idShift,
                    'idWorker': model.idWorker,
                    'shift':    model.dayShift,
                    'payrate':  model.workerPayRate });
    }
    
    /*set value to  model */
    setMatchingModel(id, idShift, workerId, dayShift, payRate) {
        this.matchingModel.id = id;
        this.matchingModel.idShift =idShift;
        this.matchingModel.idWorker =workerId
        this.matchingModel.dayShift = dayShift
        this.matchingModel.workerPayRate = payRate;
        
        return this.matchingModel;
    }

    /* delete  day for list of workers*/ 
    deleteShiftsTaken(day,listWorkers) {
        
        for(let i = 0; i < listWorkers.length; i++) { 
            for(let j = 0;j < listWorkers[i].availability.length; j++) {
            
                if(listWorkers[i].availability[j] == day) {
                    // console.log('BORRRA---| '+listWorkers[i].id+' -----|---|--|--| '+ listWorkers[i].availability[j] );
                    listWorkers[i].availability.splice(j, 1);  
                }
            }
        }
    }

    /*ADD Flag  */
    addFLagWorker(workersList) {
        for (let worker of workersList) {
            worker.assignedshift = false;
            worker.canassigned = false;
            worker.hasmoreavailables = false;
            worker.numshift = worker.availability.length;
            worker.sameday = 0;
        }
    }
    
}

module.exports = MatchingController;