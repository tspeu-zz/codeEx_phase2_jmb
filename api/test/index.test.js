const Utils = require('../utils/utils');
var util = new Utils();

let workerList = [];
let shiftList = [ {
    "id": 3,
    "day": ["Wednesday"]
}];

/*TEST FOR CHECK EMPTY ARRAY */
it('should check for WORKERS empty array ', () => {
    let res = util.checkEmptyArrList(workerList);
    let isEmpty = false; 

    if (res !== isEmpty) {

        throw new Error(`Test not pass expected ${isEmpty} but got ${res}`);

    }
}) ;
//
it('should check for SHIFTS empty array ', () => {
    let res = util.checkEmptyArrList(shiftList);
    let isEmpty = false; 

    if (res !== isEmpty) {

        throw new Error(`Value not correct expected ${isEmpty} but got ${res}`);

    }
}) ;

