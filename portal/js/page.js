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

        runProgressIndicator("divTabBasics", 120, 50);

        return new MatchCaseController(this);
    }

    getMatchCaseController() {
        return this.matchCaseController;
    }

    validateBusinessForm() {
        const inputCompareButton = document.getElementById("inputCompareButton");
        inputCompareButton.disabled = !this.matchCaseController.validate();
    }

    updateSpecializationSelect() {

        this.matchCaseController.updateSpecializationSelect();

        const industryCode = this.matchCaseController.caseForm.getIndustryCode();

        const divIndustryTellUsMore = document.getElementById("divIndustryTellUsMore");
        const divSpecializationTellUsMore = document.getElementById("divSpecializationTellUsMore");

        const selectSpecialization = document.getElementById("selectSpecialization");
        
        if(industryCode == "null") {
            selectSpecialization.disabled = true;
            divSpecializationTellUsMore.style.display = "none";
        } else if(industryCode === "Misc.") {
            divIndustryTellUsMore.style.display = "";
            divSpecializationTellUsMore.style.display = "";
            selectSpecialization.disabled = true;
        } else {
            divIndustryTellUsMore.style.display = "none";
            divSpecializationTellUsMore.style.display = "none";
            selectSpecialization.disabled = false;
        }
    }

    checkSpecialization() {

        const industryCode = this.matchCaseController.caseForm.getIndustryCode();
        const specializationCode = this.matchCaseController.caseForm.getSpecializationCode();
        
        const divTellUsMore = document.getElementById("divSpecializationTellUsMore");
        
        if(industryCode === "null") {
            divTellUsMore.style.display = "none";
        }
        
        divTellUsMore.style.display = 
        specializationCode === "null" || specializationCode.includes("Misc") ? "" : "none";
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