
const _ = require('lodash');
const Match = require('../models/matchingModel');
const Worker = require('../models/worker');
const Shift = require('../models/shift');
const Utils = require('../utils/utils');


class MatchingController {


    constructor(){
        
        this.utils = new Utils();
        this.matchingModel = new Match();
    }


    /**
     * Tries to match  workers with shifts
     * @params req, res
     * @return List<Match> entity
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



            /*VALIDATION  checks if the input array is empty */
            if(checkWorkerList ) {

                this.msmOut = "THERE ARE NO AVAILABLE WORKERS";
                this.msmErr= "No optimal solution found !";
                this.matchingList.push(data);

            }
            else  if (checkShiftList) {

                this.msmOut +="THERE ARE NO SHIFTS";
                this.msmErr= "No optimal solution found !";
                this.matchingList.push(data);

            }
            else {

                //THE FIRST TIME IS INITIALIZED AS LIST OF UNEMPLOYED
                this.unemployedWorkerSortedList  = _.sortBy(workersList, ['availability.length', 'payrate']);
                this.employedWorkerSortedList  = [];
                
                let countID = 1;


                let allShiftsTaken = true;

                for (let shift of shiftList) {

                    let availableWorkerFound = false;

                    let day = shift.day;

                    // Since we have to provide work to as many workers as possible,
                    // the first thing to check is that we assign a shift to workers that don't have any yet.
                    //
                    // Among these 'unemployed' workers, those that have fewer days available are put first.
                    // (that explains the 'sortedList') -> that way, workers with fewer available days will
                    // be served first.
                    //
                    for (let worker of this.unemployedWorkerSortedList) {

                    //check if exists a worker with a day avaible with the day shift
                        let index = worker.availability.findIndex(k => k== day);

                        if (index !== -1 ) {

                            availableWorkerFound = true;


                            // That's the only we can really compare two workers: it's not important how many
                            // available days they have in absolute terms, but how many days among the remaining
                            // shifts. Those have fewer days amoong the remaining shifts but be served first.
                            //
                            // Finally, elminating a shift can change the order or workers, one worker that had
                            // as many availble days as another one, might now have fewer. Therefore, we must
                            // sort again both lists: unemployed and employed workers
                            //
                            // this.unemployedWorkerSortedList, this.employedWorkerSortedList = 
                            
                            this.deleteTakenShift(day, this.unemployedWorkerSortedList, this.employedWorkerSortedList);


                            this.setMatchingModel(countID,  shift.id, worker.id, day, worker.payrate);
                            this.addMatch(this.matchingModel, this.matchingList);
                            this.msmOut ="";
                            countID ++;


                            break;
                        }
                    }


                    // If we have not found any unemployed worker that can work on that shift, we resort
                    // to employed workers (those that already have at least one shift)

                    if (availableWorkerFound === false) {

                        for (let worker of this.employedWorkerSortedList) {

                        //check if exists a worker with a day avaible with the day shift
                            let index = worker.availability.findIndex(k => k== day);

                            if (index !== -1 ) {

                                availableWorkerFound = true;

                                unemployedWorkerSortedList, employedWorkerSortedList = this.deleteTakenShift(day, unemployedWorkerSortedList, employedWorkerSortedList)


                                this.setMatchingModel(countID,  shift.id, worker.id, day, worker.payrate);
                                this.addMatch(this.matchingModel, this.matchingList);
                                this.msmOut ="";
                                countID ++;


                                break;
                            }
                        }

                    }

                    if (availableWorkerFound === false) {
                        this.msmErr = "No optimal solution found";
                        this.msmOut = `There are no workers available for the required ${shiftsWord}`;
                        allShiftsTaken = false;
                        break;
                    }

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
    //TODO refactor 
    /* delete  day for list of workers*/         
    deleteTakenShift(day, unemployedWorkerSortedList, employedWorkerSortedList) {

        // Remove the day from the availability of every unemployed worker
        for (let u in unemployedWorkerSortedList) {
            // Since splice uses indices, we rather iterate with the classical for loop
            // instead of for .. in
            for(let j = 0; j < unemployedWorkerSortedList[u].availability.length; j++) {
                if(unemployedWorkerSortedList[u].availability[j] == day) {
                    unemployedWorkerSortedList[u].availability.splice(j, 1);
                    employedWorkerSortedList.push(unemployedWorkerSortedList[u]);
                }
            }
        }

            // If we have not found any unemployed worker that can work on that shift,
            // we search on the list of employed (those workers that already have at least one shift)
        // same for employed workers
        // for (let e in employedWorkerSortedList) {
        //     // Since splice uses indices, we rather iterate with the classical for loop
        //     // instead of for .. in
        //     for(let j = 0; j < employedWorkerSortedList[e].availability.length; j++) {
        //         if(employedWorkerSortedList[e].availability[j] == day) {
        //             employedWorkerSortedList[e].availability.splice(j, 1);
        //         }
        //     }
        // }

        // Re sort both lists:
        unemployedWorkerSortedList = _.sortBy(unemployedWorkerSortedList, ['availability.length', 'payrate']);
        employedWorkerSortedList = _.sortBy(employedWorkerSortedList, ['availability.length', 'payrate']);

        return [unemployedWorkerSortedList, employedWorkerSortedList];

    }

}

module.exports = MatchingController;
