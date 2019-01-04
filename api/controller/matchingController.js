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
            let sortedWorkers = _.sortBy(workersList, ['availability.length','payrate']);//

            let countID = 1; 
        //TODO REFACOR
        for (let worker of sortedWorkers) {
            worker.assignedshift = false;
            worker.canassigned = false;
            worker.hasmoreavailables = false;
            worker.numshift = 0;
        }
        
        for (let shift of shiftList) {
            
            let day = shift.day;
console.log('*********************->DAY: ************* ', day);
        //ITERAR TRUE WORKER
            for (let worker of sortedWorkers) {

            //check if exists a worker with a day avaible with the day shift
            let index = worker.availability.findIndex(k => k== day);
            
//SOLO SE ASIGNA A LOS QUE NO TIENEN TURNO AUN
// &&  worker.assignedshift == false
            if (index !== -1 ) {
            availableWorkerFound = true;
        // if(worker.assignedshift == false) {

            //TODO AGREGAR FLAG DE YA TIENE UN TURNO->
            worker.assignedshift = true;
            worker.hasmoreavailables = (worker.availability.length > 0) ? true: false;
            worker.numshift +=1;
            
            //TODO not realy necessary eliminated the day for the actual worker
            worker.availability.splice(index, 1);
            //TODO ELIMININATED FOR ALL WORKER
            this.deleteShiftsTaken(day,sortedWorkers);
        //add matching
                this.addMatch(countID,shift.id,worker.id,day,worker.payrate);
                countID ++;
                
                //SORT AGAIN->
                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'numshift']);
                console.log('>>>>>>>>>>nuevo sortedWorkers-->>>>', sortedWorkers)
                
                break;
            // 
            // else if(index !== -1 && worker.assignedshift == true) {
            //     console.log('===== w o r k e r === '+ worker.id +' ==== tiene turno ya '+ worker.assignedshift + "=====");   
            //     let idw =  worker.id;
            //     let avaiW = worker.availability;
            //     console.log('id es->'+ idw +" avaible > " + avaiW +'####');
            //     this.addMatch(countID,shift.id,worker.id,day,worker.payrate);

            //     worker.availability.splice(index, 1);
            //     //BORRARLO DE TODOS
            
            // }
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

    //ADD 
    addMatch(id, idShift,workerId,dayShift,payRate) {
        this.matching.idMatch       = id;
        this.matching.idShift       = idShift;
        this.matching.idWorker      = workerId;
        this.matching.dayShift      = dayShift;
        this.matching.workerPayRate = payRate;
        
        this.matchingList.push({
            'idMatch': this.matching.idMatch,
            'idShift': this.matching.idShift,
            'idWorker': this.matching.idWorker,
            'payrate':  this.matching.workerPayRate,
            'shift': this.matching.dayShift 
        });
        // console.log('###### this.matchingList###',  this.matchingList);
    }

    deleteShiftsTaken(day,workers) {
        console.log('#####deleteShiftsTaken#######  DAY-> ' , day);
        console.log('#####deleteShiftsTaken#######  list-> ', workers);

        console.log('****************', workers);

        for(let j=0; j < workers.length; j++) {
            //console.log(workers[j]);
            for(let k= 0;k < workers[j].availability.length; k++) {
                console.log(workers[j].availability[k] + ' ID: ' + workers[j].id );
                if(workers[j].availability[k] == day) {
                    console.log('|********B O R R A***************'+ workers[j].availability[k] + ' ID: ' + workers[j].id);
                    let index = workers[j].availability.findIndex(k => k== day);
                    console.log('index----->', index);
                    workers[j].availability.splice(index, 1);
                    console.log('BORRADO----->',workers[j] );
                }
            }
        }

    console.log('***************************   ',  workers );
    }

    rankingShifts(day,workers) {
        console.log('##### rankingShifts#######  DAY-> ' , day);
        console.log('##### rankingShifts#######  list-> ', workers);

        for(let j=0; j < workers.length; j++) {
            //console.log(workers[j]);
            for(let k= 0;k < workers[j].availability.length; k++) {
                console.log(workers[j].availability[k] + ' ID: ' + workers[j].id );
                let numSh = 0;
                if(workers[j].availability[k] == day) {
                    console.log('|********B O R R A***************'+ workers[j].availability[k] + ' ID: ' + workers[j].id);
                    let index = workers[j].availability.findIndex(k => k== day);
                    console.log('index----->', index);
                    numSh +=1;
                    workers[j].numshift = numSh;
                    // /workers[j].availability.splice(index, 1);
                    console.log('SUMAR----->',workers[j] );
                }
            }
        }

    console.log('***************************   ',  workers );
    }
}

module.exports = MatchingController;
/*

//         for(let i = 0; i < listWorkers.length-1; i++) { 

//             for(let j = 0;j < listWorkers[i].availability.length-1; j++) {

//                 console.log('#####*'+ listWorkers[i].availability[j] );
//                 if(listWorkers[i].availability[j] == day) {
//                     listWorkers.splice(j, 1); 
//                     console.log('BORRRA---|-----|---|--|--| '+ listWorkers[i].availability[j] );
//                 }
//             }
//         }
// //     if (listWorkers[i] === day){
// //         listWorkers.splice(i, 1);}
//         // _.remove(listWorkers, function (e) {
//         //     let x = e.availability;
//         //     console.log('_LODAHS-> DAY   -->' + day + '------------');
//         //     console.log('_LODAHS-> xxxxx    -->' + x);
//         //     return e.availability == day;
//         // });

//     }




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
*/