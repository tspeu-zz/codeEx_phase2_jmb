const _ = require('lodash');
const Match = require('../models/matchingModel');
const Worker = require('../models/worker');
const Shift = require('../models/shift');
const Utils = require('../utils/utils');

        
class MatchingController {
    
    //matchingList = [];
    
    constructor(){ 

        this.utils = new Utils();
        this.matchingModel = new Match();
    }
    

    /**
     * Tries to match  workers with shifts 
     * @params req, res
     * @return LisT<Match> entity
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

        let lenghShift = shiftList.length;
        let shiftsWord = (lenghShift > 1) ? 'shifts' : 'shift';


        //validation flags
        let allShiftsTaken = true;
        let availableWorkerFound = false;
        // let shitAssigned = false;

        /*VALIDATION  Check for empty input */ 

    if(checkWorkerList ) {
    
        this.msmOut = "THERE ARE NO AVAILABLE WORKERS";
        this.msmErr= "No optimal solution found !";
        this.matchingList.push(data);
    } 
    
    //Check for empty input 
    else if (checkShiftList) {
        
            this.msmOut +="THERES NO ANY SHIFTS";
            this.msmErr= "No optimal solution found !";
            this.matchingList.push(data);
    }
    else {       
            
        //list of workers sorted by amount of days availables
        // let sortedWorkers = _.sortBy(workersList, ['availability.length', 'payrate']);
        let sortedWorkers = workersList.sort((a, b) => a.availability.length > b.availability.length && a.payrate < b.payrate);
        this.unEmployedList  = []; 
        this.employedList  = [];

        
        let countID = 1; 
        
        /*           **/
        this.addFLagWorker(sortedWorkers);
        
        //INICIALIZA LA PRIMERA VEZ
        this.addUnEmployeList(sortedWorkers,this.unEmployedList);
        console.log('this.unEmployedList------->', this.unEmployedList);
        console.log('this.employedList------->', this.employedList);
        /*         */
        for (let shift of shiftList) {

            let day = shift.day;
                                
        // Since we have to provide work to as many workers as possible,
        // the first thing to check is that we assign a shift to workers that don't have any yet.
        //
        // Among these 'unemployed' workers, those that have fewer days available are put first.
        // (that explains the 'sortedList') -> that way, workers with fewer available days will
        // be served first.
        //
    
            for (let worker of this.unEmployedList) {

                //check if exists a worker with a day avaible with the day shift
                let index = worker.availability.findIndex(k => k== day);
            
                if (index !== -1 ) {
                availableWorkerFound = true;
                
                // Once a shift has been taken, remove it for every worker that lists it as available
                // in both lists: employed and unemployed workers.
                //
                // That's the only we can really compare two workers: it's not important how many
                // available days they have in absolute terms, but how many days among the remaining
                // shifts. Those have fewer days amoong the remaining shifts but be served first.
                //
                // Finally, elminating a shift can change the order or workers, one worker that had
                // as many availble days as another one, might now have fewer. Therefore, we must
                // resort both lists: unemployed and employed workers
                //
                worker.assignedshift = true;
                worker.hasmoreavailables = (worker.availability.length > 0) ? true: false;

                //delete the day for the actual worker
                worker.availability.splice(index, 1);
                this.deleteShiftsTaken(day, sortedWorkers);

                this.setMatchingModel(countID,  shift.id, worker.id, day, worker.payrate);

                this.addMatch(this.matchingModel, this.matchingList);

                this.msmOut ="";
                countID ++;
                
                //SORT LIST AGAIN->
                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'payrate']);
                        /*           **/
                // this.addEmployedList(sortedWorkers,this.unEmployedList  ,this.employedList );
                this.addEmployedList(sortedWorkers, this.unEmployedList, this.employedList);
                console.log('this.unEmployedList------->', this.unEmployedList);
                console.log('this.employedList------->', this.employedList);
                
                break;
            }
            
        }

            for (let worker of this.employedList) {

                //check if exists a worker with a day avaible with the day shift
                let index = worker.availability.findIndex(k => k== day);
                
                if (index !== -1 ) {
                availableWorkerFound = true;
                
                //TODO FIX FLAGS
                //worker.assignedshift = true;
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
                            /*           **/
                    this.addEmployedList(sortedWorkers,this.unEmployedList  ,this.employedList );
                    console.log('this.unEmployedList------->', this.unEmployedList);
                    console.log('this.employedList------->', this.employedList);
    
                    
                    break;
                }   
            }
        
            // If we have not found any unemployed worker that can work on that shift, we resort
            // to employed workers (those that already have at least one shift)

            if (availableWorkerFound === false) {
                this.msmErr = "No optimal solution found";
                this.msmOut = `There are no workers available for the required ${shiftsWord}`;
                allShiftsTaken = false;
                //break;
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
        
        catch (err) {
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

    // TODO REFACTOR
    /* delete  day for list of workers*/ 
    deleteShiftsTaken(day,listWorkers) {
        // Remove the day from the availability of every  worker
        for(let i = 0; i < listWorkers.length; i++) { 
            for(let j = 0;j < listWorkers[i].availability.length; j++) {
            // Since splice uses indices, we rather iterate with the classical for loop
            // instead of for .. in
                if(listWorkers[i].availability[j] == day) {
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
    //TODO REFACTOR
    //DIVIDE FIRST TIME ALL ARE UNEMPLOYED
    addUnEmployeList(inputlist, unemployedList) {
        for (let unemployed of inputlist) {
            if (unemployed.assignedshift === false) {
                unemployedList.push(unemployed);
            }
        }
    }

    addEmployedList(inputList, unemployedList, employedList) {
    //PULL DE  UNEMPLOYED y PUSH EN EMPLOYED
        for (let employed of inputList) {

            if(employed.assignedshift === true) {

                let index = unemployedList.findIndex(k => k.id === employed.id);
                if(index !== -1){
                    unemployedList.splice(index,1);
                    employedList.push(employed);
                }
            }
            // (employed.assignedshift === true)? employedList.push(employed) : unemployedList.push(employed);
        }
    }
    
    checkUnemployed(inputlist, item, day) {
        let index = item.id.findIndex(k => k== day);
        // worker.availability.splice(index, 1);
        if(index !== -1){
            inputlist.splice(index,1);
        }
    }
    
}

module.exports = MatchingController;