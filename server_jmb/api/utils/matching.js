const _ = require('lodash');


class matchCommonController {

    

    matchAll (data) {

        let matching = [];      
            // let workersList = _.map(data,'workers');
        let workersList = data.workers;
        let shiftList = data.shifts;
    
        let sortedWorkers = _.sortBy(workersList, ['availability.length', 'payrate']);
        
        let allShiftsTaken = true;
        
        for (let shift of shiftList)  {
        
        day = shift.day;
            console.log('*********************->DAY: ************* ', day);
        availableWorkerFound = false;

            for (let worker of sortedWorkers) {
                console.log('---> ID: ', worker.id);
                console.log('worker.availability>>', worker.availability);
            
            //let dias = worker.availability;
            //console.log('DIAS-->', dias);
            
            let index = worker.availability.findIndex(k => k== day);
            
            // const index = worker.availability.indexOf(day);
            // const index =_.indexOf( worker.availability,day);
            console.log('---INDEX --------->', index);

                if (index !== -1) {
                    availableWorkerFound = true;
                    worker.availability.splice(index, 1);
                    
                    matching.push(
                        {'idWorker': worker.id, 'shift': day });
                //vuelves a ordenar->
                sortedWorkers = _.sortBy(sortedWorkers, ['availability.length', 'payrate']);
                console.log('nuevo sortedWorkers-->>>>', sortedWorkers)
                break;
                }
            }

            if (availableWorkerFound === false) {
                //no hay shift disponibles->
                allShiftsTaken = false;
                break;
            }

        }

        if (allShiftsTaken === false) {
            console.log("No optimal solution found");
        }

        console.log('---FINAL MATCHING-----------------------');
        console.log( matching);
        console.log('--------------------------');

        return matching;
    }

}
module.exports = matchCommonController;