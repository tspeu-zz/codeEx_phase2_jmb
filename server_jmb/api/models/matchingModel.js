/*POJO Entity
 * MUST MATCH WORK & SHIFT
 */
class MatchingModel {

    constructor( idMatch, idWorker, idShift, dayShift) {
        this._idMatch = idMatch;
        this._idWorker = idWorker;
        this._idShift = idShift;
        this._dayShift = dayShift;

    }
}

module.exports = MatchingModel;