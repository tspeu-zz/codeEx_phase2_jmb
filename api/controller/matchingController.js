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
        this.matching = new Match();
    }
    

    matchingWorker(req, res) {

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
        let lenghWorker = workersList.length;
        let lenghShift = shiftList.length;
        let shiftsWord = (lenghShift > 1) ? 'shifts' : 'shift';


        //validation flags
        let allShiftsTaken = true;
        let availableWorkerFound = false;
        let shitAssigned = false;

        //VALIDATION

    if(checkWorkerList ) {
        console.log('CHECKEA WORKER', checkWorkerList);
        this.msmOut = "THERES NO ANY WORKER";
        this.msmErr= "No optimal solution found";
        this.matchingList.push(data);
    } 
    
    else {
        
        if (checkShiftList) {
            console.log('CHECKEA SHIFTS', checkShiftList);
            this.msmOut +="THERES NO ANY SHIFTS";
            this.msmErr= "No optimal solution found";
            this.matchingList.push(data);
        }
        else {       
            
            //list of workers sorted by amount of days availables
            // let sortedWorkers = _.sortBy(workersList, ['availability.length', 'payrate']);
        // let sortedWorkers = _.sortBy(workersList, ['availability.length']);//, 'payrate'
        let sortedWorkers = workersList.sort((a, b) => a.availability.length > b.availability.length);
    
        let countID = 1; 

        this.addFLagWorker(sortedWorkers);

        for (let shift of shiftList)  {
            let day = shift.day;
                                console.log('*********************->DAY: ************* ', day);
            
        //ITERAR TRUE WORKER
            for (let worker of sortedWorkers) {
                //TODO AGREGAR FLAG NO TIENE TURNO ASIGNADO AUN
        // worker.assignedshift = false;    
            
                                console.log('-----------------> worker: ', worker);
                                console.log('--------------------------------------');
            
            //check if exists a worker with a day avaible with the day shift
            let index = worker.availability.findIndex(k => k== day);
            
            //&&  worker.assignedshift == false
            if (index !== -1 ) {
                availableWorkerFound = true;
                
                //TODO AGREGAR FLAG DE YA TIENE UN TURNO->
                worker.assignedshift = true;
                worker.hasmoreavailables = (worker.availability.length > 0) ? true: false;

                //TODO not realy necessary eliminated the day for the actual worker
                worker.availability.splice(index, 1);
                this.deleteShiftsTaken(day, sortedWorkers);

                this.addMatch(countID, shift.id, worker.id, day, worker.payrate, this.matchingList);

                this.msmOut ="";
                countID ++;
                
                //SORT AGAIN->
                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'payrate']);
                console.log('nuevo sortedWorkers-->>>>', sortedWorkers)
                
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
 }
 
 //* ADD MATCH*/
    addMatch(id, idShift, workerId, dayShift, payRate, list) {
        list.push({'idMatch': id,
                    'idShift': idShift,
                    'idWorker': workerId,
                    'shift': dayShift,
                    'payrate': payRate });
    }
    
    /*delete */ 
    deleteShiftsTaken(day,listWorkers) {
        //console.log('#####deleteShiftsTaken#######  DAY-> '+ day);
        for(let i = 0; i < listWorkers.length; i++) { 
            for(let j = 0;j < listWorkers[i].availability.length; j++) {
                console.log('#####*/*/*/*/*/*/*/*/'+ listWorkers[i].availability[j] );
                if(listWorkers[i].availability[j] == day) {
                    console.log('BORRRA---| '+listWorkers[i].id+' -----|---|--|--| '+ listWorkers[i].availability[j] );
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