const _ = require('lodash');
const Match = require('../models/matchingModel');
const Worker = require('../models/worker');
const Shift = require('../models/shift');
const Utils = require('../utils/utils');

        
class MatchingController {
    
    
    constructor(){ 
        this.utils = new Utils();
        this.matching = new Match();
    }
    

    matchingWorker(req, res) {

        //input
        let data = req.body;
        let workersList = req.body.workers;
        let shiftList = req.body.shifts;

        //temp
        this.matchingListTemp = [];

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
        let existe = false;

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
                //let sortedWorkers = _.sortBy(workersList, ['availability.length','payrate']);//
                let sortedWorkers = workersList.sort((a, b) => a.availability.length > b.availability.length);
                let countID = 1; 
        
                this.addFLagWorker(sortedWorkers);
                
                for (let shift of shiftList)  {    //DAYS
                    let day = shift.day;
                    console.log('*********************->DAY: ************* ', day);
                
                    //WORKER
                    for (let worker of sortedWorkers) {
                        console.log();
                        //check if exists a worker with a day avaible with the day shift
                        let index = worker.availability.findIndex(k => k== day);
                        console.log();
                        //SOLO SE ASIGNA A LOS QUE NO TIENEN TURNO AUN // &&  worker.assignedshift == false
                        if (index !== -1 ) {
                            availableWorkerFound = true;
                            console.log();
                        //this.rankingShiftsByWorker(worker, sortedWorkers, worker.availability.length, day);
                        
                        //TODO not realy necessary eliminated the day for the actual worker
                        
                        //ONLY WHEN DONT HAVE ANY SHIFT ASSIGNED - FIRST TIME SHIFT ASSIGNED
                        if(worker.assignedshift == false) {

                            worker.availability.splice(index, 1);
                            console.log();
                            
                            //TODO AGREGAR FLAG DE YA TIENE UN TURNO->
                            worker.assignedshift = true;
                            worker.hasmoreavailables = (worker.availability.length > 0) ? true: false;
                            worker.numshift = worker.availability.length ;
                            
                            //TODO ELIMININATED FOR ALL WORKER
                            this.deleteShiftsTaken(day, sortedWorkers);
                            console.log();
                            //add matching
                            this.addMatch(countID, shift.id, worker.id, day, worker.payrate, this.matchingList);
                            countID ++;
                            console.log();
                            //SORT AGAIN->
                            sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'numshift']);
                            //console.log('>>>>>>>>>>nuevo sortedWorkers-->>>>', sortedWorkers)
                            console.log();
                            break;
                        }
//YA TIENE TURNO COMPROBAR EN LO QUE NO TIENEN TURNO AUN
                        else if( worker.assignedshift == true) {
    
//TODO->  CHECKEAR DUPLICADO--------------------------->  
                                        
                            existe = this.searchNewWorker(countID, shift.id, worker.id, day, worker.payrate, sortedWorkers);

                            if(existe == false) { 
                                worker.availability.splice(index, 1);
                                console.log();
                            //TODO AGREGAR FLAG DE YA TIENE UN TURNO->
                                worker.hasmoreavailables = (worker.availability.length > 0) ? true: false;
                                worker.numshift = worker.availability.length ;
                                console.log();
                                //this.deleteShiftsTaken(day, sortedWorkers);
                            //ADD TO MATCH    
                                this.addMatch(countID, shift.id, worker.id, day, worker.payrate, this.matchingList);
                                console.log();
                            //SORT AGAIN->
                                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'numshift']);
                            //console.log('>>>>>>>>>>nuevo sortedWorkers-->>>>', sortedWorkers)
                                console.log();
                                break;   
                
                            }
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

    /** */
    searchNewWorker(countID, shiftId, workerId, day, payrate, sortedWorkers){
        let existe = false;
        for (let workerTemp of sortedWorkers ) {
            
            let indexTemp = workerTemp.availability.findIndex(k => k== day);
            console.log();
            if(indexTemp !==-1 && workerTemp.assignedshift == false) {
                console.log();
                this.addMatch(countID, shiftId, workerId, day, payrate, this.matchingListTemp);
                this.foundDuplicade = true;
                existe = true;

                console.log();
                break;
            } else {
                existe = false;
                //break;
            }
        }
        return existe;
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
        // console.log('-------------TRATAR WORKER ---------->', workersList);
        // console.log('-------------TRATAR WORKER -------------------------->');
    }

    //* ADD MATCH*/ TODO refactor in OBJECT MODEL
    addMatch(idMatch, idShift, workerId, dayShift, payRate, list) {
        
        list.push({
            'idMatch':  idMatch,
            'idShift':  idShift,
            'idWorker': workerId,
            'shift':    dayShift,
            'payrate':  payRate
        });
        // console.log('###### this.matchingList###',  this.matchingList);
    }



    deleteShiftsTaken(day,listWorkers) {
        console.log('#####deleteShiftsTaken#######  DAY-> '+ day);

    
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

    rankingShiftsByWorker(worker, listOfWorkers, n, day) {
    
        let idWorkerActual = worker.id;
        
        console.log('-+++++++++++++++++++++++++++++++++++++>+++>++>');
        let listWorkersTemp = listOfWorkers.filter(b => b.id!== worker.id);
        console.log('idWorkerActual--------------------->',worker.id);
    
        for (let i =0; i < n; i++) { //itera obre avaiability del order
            let dayActualWork  = worker.availability[i];
            console.log('dayActualWork----------------------| ', dayActualWork);

            for (let j =0; j < listWorkersTemp.length; j++) {
                let indexA = listWorkersTemp[j].availability.length;
                if (n == indexA ) {
                    // console.log('------------------++++++++>+++>++>',indexA );
                    
                        for (let k =0; k < indexA; k++) {
                            if (dayActualWork === listWorkersTemp[j].availability[k] ) {
                                worker.day = day.toString().substring(0, 4);
                                listWorkersTemp[j].day = day.toString().substring(0, 4);

                                // console.log('--->listWorkersTemp[j] ',listWorkersTemp[j] );
                                // console.log('--->worker-> ',worker );
                            }
                            if (worker.day  === listWorkersTemp[j].day) {
                                worker.sameday += 1;
                                listWorkersTemp[j].sameday += 1;
                                console.log('--->listWorkersTemp[j] ',listWorkersTemp[j] );
                            }
                        }
                        console.log('--->worker-> ',worker );
                    }
                }
        }
        console.log('====================================' );
    }

}  
module.exports = MatchingController;


















// switch (listWorkers.length) {cd
    //     case 1: console.log('tiene un 1 turno');
            
    //         break;
        
    //     case 2: console.log('tiene un 2 turno');
        
    //     break;

    //     case 3: console.log('tiene un 3 turno');
        
    //     break;

        

    //     default:
    //         break;
    // }
 // for(let j = 0;j < listWorkers[i].numshift; j++) {

            // console.log('#####NUM SHIFTH-> '+ listWorkers[i]);
            //     let workNow = listWorkers[i];
            //     let tempWork = null;

            //     if(listWorkers[i].availability[j] == day) {
            //         console.log('RANKING'+ listWorkers[i].availability[j] );
            //         listWorkers[i].num = -1;
            //     }
            // }

        // }
        // let values = (o) => Object.keys(o).sort().map(k => o[k]).join('|');
    
        //let mapped1 = listWorkers.map(o => o).filter()
        
        // let mapped2 = listWorkers.map(o => values(o.availability));
        // let res = mapped1.every(v => mapped2.includes(v));

        // for(let i = 0; i < listWorkers.length; i++) { 
            
            
        //     w["arr_"+i] = listWorkers[i];
        //     console.log('w["arr_"+i]-->', i);
        //     console.log('w["arr_"+i]-->', w["arr_"+i]);
        //     console.log('w[----------------------');
        // }




/*
//     if (listWorkers[i] === day){
//         listWorkers.splice(i, 1);}
        // _.remove(listWorkers, function (e) {
        //     let x = e.availability;
        //     console.log('_LODAHS-> DAY   -->' + day + '------------');
        //     console.log('_LODAHS-> xxxxx    -->' + x);
        //     return e.availability == day;
        // });


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