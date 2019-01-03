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
            let sortedWorkers = _.sortBy(workersList, ['availability.length']);//, 'payrate'

            let countID = 1; 
        //TODO REFACOR
        for (let worker of sortedWorkers) {
            worker.assignedshift = false;
            worker.canassigned = false;
            worker.hasmoreavailables = false;
            worker.numshift = 0;
        }
        
        
    for (let shift of shiftList)  {
            let day = shift.day;
                                console.log('*********************->DAY: ************* ', day);
            
        //ITERAR TRUE WORKER
            for (let worker of sortedWorkers) {
                //TODO AGREGAR FLAG NO TIENE TURNO ASIGNADO AUN
        // worker.assignedshift = false;    
            
// console.log('-----------------> worker: ', worker);
// console.log('--------------------------------------');
            
            //check if exists a worker with a day avaible with the day shift
            let index = worker.availability.findIndex(k => k== day);
            
//SOLO SE ASIGNA A LOS QUE NO TIENEN TURNO AUN
// &&  worker.assignedshift == false
    if (index !== -1 ) {
                availableWorkerFound = true;
        if(worker.assignedshift == false) {

        //TODO AGREGAR FLAG DE YA TIENE UN TURNO->
        worker.assignedshift = true;
        worker.hasmoreavailables = (worker.availability.length > 0) ? true: false;
        worker.numshift +=1;
        
        //TODO not realy necessary eliminated the day for the actual worker
        worker.availability.splice(index, 1);
        //TODO ELIMININATED FOR ALL WORKER
        
        //add matching
        this.matching.idMatch = countID;
                this.matching.idShift = shift.id;
                this.matching.idWorker = worker.id;
                this.matching.dayShift = day;
                this.matching.workerPayRate = worker.payrate;
                
                this.matchingList.push({
                    'idMatch': this.matching.idMatch,
                    'idShift': this.matching.idShift,
                    'idWorker': this.matching.idWorker,
                    'payrate':  this.matching.workerPayRate,
                    'shift': this.matching.dayShift 
                });
                
                countID ++;
                
                //SORT AGAIN->
                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'payrate']);
                console.log('nuevo sortedWorkers-->>>>', sortedWorkers)
                
                break;
            }
            else if(index !== -1 && worker.assignedshift == true) {
                console.log('===== w o r k e r '+ worker.id +' ==== tiene turno ya '+ worker.assignedshift + "=====");   
            }
        }// index !=-1    
    } //loop workers
        
        if (availableWorkerFound === false) {
            //no hay shift disponibles->
            this.msmOut = `There are no workers available for the required ${shiftsWord}`;
            allShiftsTaken = false;
            break;
        }
        
        allShiftsTaken = true;    
    } //loop SHIFT DAYS
    
        if (allShiftsTaken === false) {
            this.msmErr = "No optimal solution found"
            console.log("No optimal solution found");
            this.matchingList.push(data);
        }
    }
  }
 }
// 
    eliminatedEqual(shifts, workers) {

        for(let j=0; j < workers.availability.length; j++){


            worker.availability.splice(index, 1);
        }



        for(let i=0;i < shifts.length; i ++) {
            let index = worker.availability.findIndex(k => k== shift[i].day);
        }
        

        for(let w=0; w < workers.length; w++) {

        }

        return workers;
    }


}

module.exports = MatchingController;