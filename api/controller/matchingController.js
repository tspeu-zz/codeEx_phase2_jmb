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
//TODO REFACTOR
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

        //sort list of workers
        // let sortedWorkers = _.sortBy(workersList, ['availability.length', 'payrate']);
        let sortedWorkers = _.sortBy(workersList, ['availability.length']);//, 'payrate'

        let countID = 1;    
        for (let worker of sortedWorkers){
            worker.assignedshift = false;
            worker.canassigned = false;
        }


        for (let shift of shiftList)  {
            let day = shift.day;
        console.log('*********************->DAY: ************* ', day);

        //ITERAR TRUE WORKER
            for (let worker of sortedWorkers) {
        //TODO AGREGAR FLAG NO TIENE TURNO ASIGNADO AUN
        // worker.assignedshift = false;    
            
                console.log('-----------------> worker: ', worker);
                // console.log('worker.availability<>> ', worker.availability);
                // console.log('worker.assignedshift>> ', worker.assignedshift);
                console.log('--------------------------------------');
            
            //check if exists a worker with a day avaible with the day shift
            let index = worker.availability.findIndex(k => k== day);
        
            //const index = worker.availability.indexOf(day);
            //console.log('---INDEX --------->', index);

                //&&  worker.assignedshift == false
                if (index !== -1 ) {
                availableWorkerFound = true;
            //console.log('------->se encuentra el dia '+day+' de la lista ' + availableWorkerFound);
        
            //TODO AGREGAR FLAG DE YA TIENE UN TURNO->
                worker.assignedshift = true;
            
                //eliminated the day for the actual worker
                worker.availability.splice(index, 1);
                // console.log('------->elimina el dia '+day+' de la lista>'+ worker);

                //

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

                //vuelves a ordenar->
                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'payrate']);
                console.log('nuevo sortedWorkers-->>>>', sortedWorkers)
                break;
                }
            }
    
        if (availableWorkerFound === false) {
            //no hay shift disponibles->
            this.msmOut = `There are no workers available for the required ${shiftsWord}`;
            allShiftsTaken = false;
            break;
        }
        
        allShiftsTaken = true;    
    }

        if (allShiftsTaken === false) {
            this.msmErr = "No optimal solution found"
            console.log("No optimal solution found");
        }

    }
    
    
}

module.exports = MatchingController;