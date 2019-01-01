/*POJO Entity
 * MUST MATCH WORK & SHIFT
 */
class MatchingModel {

    constructor( idMatch, idWorker, idShift, dayShift) {
        this.idMatch = idMatch;
        this.idWorker = idWorker;
        this.workerPayRate = 0;
        this.idShift = idShift;
        this.dayShift = dayShift;

    }
}

module.exports = MatchingModel;