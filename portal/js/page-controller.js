// Corporate Portal
// The main page features

class PageController {

    constructor() {
        
        this.cfg = this.loadCfg();
        
        this.matchCaseController = this.createMatchCaseController(this);
    }

    loadCfg() {        
        return GLOBAL_CFG;
    }

    getCfg() {
        return this.cfg;
    }

    handleError(errorInfo) {
        console.log("=== ERROR ===");
        console.log(errorInfo);
    }

    createMatchCaseController() {
        return new MatchCaseController(this);
    }

    getMatchCaseController() {
        return this.matchCaseController;
    }

    matchCase() {

        this.getMatchCaseController().matchCase();
        
        return this;
    }
}