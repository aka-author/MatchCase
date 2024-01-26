function createUuid() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}


class Worker {
        
    constructor(chief=null, workerTypeName="worker") {

        this.id = this.assembleId();

        this.chief = chief;

        this.validFlag = true;

        this.setWorkerTypeName(workerTypeName);

        this.resetIndices();    
    }

    resetIndices() {
        this.workers = [];
        this.workersByIds = {};
        this.workerIndicesByIds = {};
        return this;
    }

    assembleId() {
        return "i" + createUuid().replace(/\-/g, "");
    }

    getId() {
        return this.id;
    }

    getIndex() {
        return this.getChief().workerIndicesByIds[this.getId()];
    }

    hasChief() {
        return !!this.getChief();
    }

    setChief(chief) {
        this.chief = chief;
        return this;
    }

    getChief() {
        return this.chief;
    }

    isValid() {
        return this.validFlag;
    }

    isInvalid() {
        return !this.isValid();
    }

    setInvalid() {
        this.validFlag = false;
        return this;
    }

    setWorkerTypeName(workerTypeName) {
        this.workerTypeName = workerTypeName; 
        return this;
    }

    getWorkerTypeName() {
        return this.workerTypeName;
    }

    getProp(propName) {
        return (!!this[propName] ? this[propName] : 
                (this.hasChief() ? this.getChief().getProp(propName) : null));
    }

    countWorkers() {
        return this.workers.length;
    }

    getWorkerIds() {
        return Object.keys(this.workersByIds);
    }

    getWorkerByIndex(index) {
        return this.workers[index];
    }

    getWorkerById(id) {
        return this.workersByIds[id];
    }

    hasWorker(id) {
        return !!this.workersByIds[id];
    }

    rebuildWorkerIndices() {
        
        this.workersByIds = {};
        this.workerIndicesByIds = {};
        
        for(let i = 0; i < this.workers.length; i++) {
            let id = this.workers[i].getId();
            this.workersByIds[id] = this.workers[i];
            this.workerIndicesByIds[id] = i; 
        }
    }

    addWorker(worker) {

        worker.setChief(this);
        
        let id = worker.getId();
        this.workerIndicesByIds[id] = this.workers.length;
        this.workersByIds[id] = worker;
        this.workers.push(worker);
        
        return this;
    }

    goAway() {
        this.getChief().removeWorker(this);
        return this;
    }

    removeWorker(worker) {
        this.workers.splice(this.workerIndicesByIds[worker.getId()], 1);
        this.rebuildWorkerIndices();
        return this;
    }

    removeAllWorkers() {

        for(let worker of this.workers) 
            worker.setInvalid();
            
        this.resetIndices();

        return this;
    }

}