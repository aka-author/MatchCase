// System:      Consulting Company Website
// Module:      Portal
// Block:       Front-end
// Component:   Class PageController

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

    updateSpecializationSelect() {
        this.matchCaseController.updateSpecializationSelect();
    }

    matchCase() {

        this.getMatchCaseController().matchCase();
        
        return this;
    }
}