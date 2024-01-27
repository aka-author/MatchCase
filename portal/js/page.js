// System:      Consulting Company Website
// Module:      Portal
// Block:       Front-end
// Component:   Class PageController

GLOBAL_CONTROL_PANEL = null;

class PageController {

    constructor() {
        
        this.cfg = this.loadCfg();
        
        this.matchCaseController = this.createMatchCaseController(this);
        this.controlPanel = new ControlPanel(this);
        GLOBAL_CONTROL_PANEL = this.controlPanel;
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

        const industryCode = this.matchCaseController.caseForm.getIndustryCode();
        const divIndustryTellUsMore = document.getElementById("divIndustryTellUsMore");
        const divSpecializationTellUsMore = document.getElementById("divSpecializationTellUsMore");

        if(industryCode === "Misc.") {
            divIndustryTellUsMore.style.display = "";
            divSpecializationTellUsMore.style.display = "";
        } else {
            divIndustryTellUsMore.style.display = "none";
            divSpecializationTellUsMore.style.display = "none";
        }
    }

    checkSpecialization() {
        const specializationCode = this.matchCaseController.caseForm.getSpecializationCode();
        const divTellUsMore = document.getElementById("divSpecializationTellUsMore");
        divTellUsMore.style.display = specializationCode.includes("Misc") ? "" : "none";
    }

    startComparing() {
        selectTab("Basics");
    }

    matchCase() {

        

        this.getMatchCaseController().matchCase();
        selectTab("Cases");
        runProgressIndicator("divSimilarCases");

        return this;
    }
}