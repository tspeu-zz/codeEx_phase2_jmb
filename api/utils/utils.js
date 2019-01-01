const _ = require('lodash');

class utilsController {

    // shiftsModeL = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
        
    checkList( isArray, isEmpty, arr) {

        return (isArray === true && isEmpty === false) ? true : false;
    }
    
    checkEmptyArrList(arr) {

        return (_.isArray(arr) && _.isEmpty(arr))? true : false; 
    }


    //TODO refactorizar FIX
    checkLength(listShifts, listWorkers ) {
        let length = 0;
    
        if (listShifts.length == listWorkers.length) {
            length = 1;
        }
        else if (listShifts > listWorkers) {
            length = 2;
        }
        else if (listShifts < listWorkers) {
            length = 3;
        }
        else {
            length = 0;
        }
    
        return length;
    }


}
module.exports = utilsController;