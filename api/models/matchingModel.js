/*POJO Entity
 * MUST MATCH WORK & SHIFT
 */
class MatchingModel {

    constructor( idMatch, idWorker, idShift,dayShift, payrate ) {
        this.idMatch = idMatch;
        this.idShift = idShift;
        this.idWorker = idWorker;
        this.workerPayRate = payrate;
        this.dayShift = dayShift;

    }
}

module.exports = MatchingModel;