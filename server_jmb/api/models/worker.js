
class Worker {
    constructor(id, availability, payrate ) {
        this.id = id;
        this.availability = availability || [];
        this.payrate = payrate;
    }
}
module.exports = Worker;
//         "id": 2,
// "availability": ["Monday", "Tuesday", "Thursday"],
// "payrate": 9.00
