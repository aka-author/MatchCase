// System:      Consulting Company Website
// Module:      MatchCase
// Block:       Module front-end
// Components:  MatchCaseController and auxiliary classes


class MatchCaseForm {

    constructor(chief)  {
        
        this.chief = chief;

        this.getFieldsDomObjects();
    }

    getFieldsDomObjects() {

        this.selectCountry = this.getSelectCountryDomObject();
        this.selectIndustry = this.getSelectIndustryDomObject();
        this.selectSpecialization = this.getSelectSpecializationDomObject();
        this.inputFoundedInYear = this.getInputFoundedInYearDomObject();
        this.inputNumberOfEployees = this.getInputNumberOfEmployeesDomObject();
        this.inputRevenue = this.getInputRevenueDomObject();

        return this;
    }

    getSelectCountryDomObject() {
        return document.getElementById("selectCountry");
    }
    
    getCountryCode() {
        return this.selectCountry.value;
    }

    getSelectIndustryDomObject() {
        return document.getElementById("selectIndustry");
    }
    
    getIndustryCode() {
        return this.selectIndustry.value;
    }

    getSelectSpecializationDomObject() {
        return document.getElementById("selectSpecialization");
    }
    
    getSpecializationCode() {
        return this.selectSpecialization.value;
    }

    getInputFoundedInYearDomObject() {
        return document.getElementById("inputFoundedInYear");
    }
    
    getFoundedInYear() {
        return parseInt(this.inputFoundedInYear.value);
    }

    getInputNumberOfEmployeesDomObject() {
        return document.getElementById("inputNumberOfEmployees");
    }
    
    getNumberOfEmployees() {
        return parseFloat(this.inputNumberOfEployees.value);
    }

    getInputRevenueDomObject() {
        return document.getElementById("inputRevenue");
    }

    getRevenue() {
        return parseFloat(this.inputRevenue.value);
    }

    createOptionDomObject(value, wording) {

        let option = document.createElement("option");

        option.setAttribute("value", value);
        option.appendChild(document.createTextNode(wording))

        return option;
    }

    updateSelect(select, values, valuePropName="code", wordingPropName="wording") {
        select.appendChild(this.createOptionDomObject(null, "-- Select --"));
        for(let value of values) {
            let option = this.createOptionDomObject(value[valuePropName], value[wordingPropName]);
            select.appendChild(option);
        }

        return this;
    }

    updateSelectCountry(countries) {

        this.updateSelect(this.selectCountry, countries, "country_code2", "country_name");

        return this;
    }

    updateSelectIndustry(industries) {

        this.updateSelect(this.selectIndustry, industries, "industry_code", "industry_name");

        return this;
    }

    updateSelectSpecialization(specializations) {

        this.updateSelect(this.selectSpecialization, specializations, "specialization_code", "specialization_name");

        return this;
    }

    getCaseParams() {

        let caseParams = {
            "industry_code": this.getIndustryCode(),
            "country_code": this.getCountryCode(),
            "founded_in": this.getFoundedInYear(),
            "specialization_code": this.getSpecializationCode(),
            "num_employees": this.getNumberOfEmployees(),
            "revenue": this.getRevenue()
        };

        return caseParams;
    }
}


class MatchCaseReport {

    constructor(chief) {
        this.chief = chief;
    }

    updateValueEstimate(estimate) {
        let spanValuation = document.getElementById("spanValuation");
        spanValuation.innerHTML = estimate.toFixed(2);
    }

    formatField(caze, fieldName) {

        let formattedValue = "";

        let fieldValue = caze[fieldName];

        switch(fieldName) {
            case "acquiree_revenue":
                formattedValue = caze["acquiree_revenue"].toFixed(2);
                break;
            case "deal_price":
                formattedValue = caze["deal_price"].toFixed(2);
                break;
            case "acquirer_name":
                let acquirerWww = caze["acquirer_www"];
                formattedValue =`<a href="${acquirerWww}" target="_blank">${fieldValue}</a>`;
                break;
            case "acquiree_name":
                let acquireeWwwWebarch = caze["acquiree_www_webarch"];
                formattedValue =`<a href="${acquireeWwwWebarch}" target="_blank">${fieldValue}</a>`;
                break;
            case "deal_www":
                formattedValue = `<a href="${fieldValue}" target="_blank">&#9432;</a>`;
                break;
            default:
                formattedValue = String(fieldValue);
        }

        return formattedValue;
    }

    displayCase(caze, index) {

        let field_names = [
            "acquirer_name", "acquirer_country", 
            "acquiree_name", "acquiree_country", "acquiree_specialization", "acquiree_founded_in", "acquiree_revenue", 
            "acquired_in", "deal_price", "deal_www"];

        for(let field_name of field_names) {
            let id = "tdCase" + index + "_" + field_name;
            let td = document.getElementById(id);
            if(!!td)
                td.innerHTML = this.formatField(caze, field_name);
        }

    }

    updateSimilarCasesTable(similarCases) {
        this.displayCase(similarCases[0], 1);
        this.displayCase(similarCases[1], 2);
        this.displayCase(similarCases[2], 3);
    }
}


class MatchCaseController {

    constructor(chief) {

        this.chief = chief;

        this.caseForm = this.createCaseForm();
        this.caseReport = this.createCaseReport();
        this.directoryViewer = this.createDirectoryViewer();
        this.similarCasesReporter = this.createSimilarCasesReporter();
    }

    getChief() {
        return this.chief;
    }

    getCfg() {
        return this.getChief().getCfg();
    }

    handleError(errorInfo) {
        
        this.getChief().handleError(errorInfo);
        
        return this;
    }

    createCaseForm() {
        return new MatchCaseForm(this);
    }

    getCaseForm() {
        return this.caseForm;
    }

    createCaseReport() {
        return new MatchCaseReport(this);
    }

    getCaseReport() {
        return this.caseReport;
    }

    createDirectoryViewer() {
        return new MatchCaseDirectoryViewer(this, "en");
    } 
    
    getDirectoryViewer() {
        return this.directoryViewer;
    }

    createSimilarCasesReporter() {
        return new MatchCaseSimilarCasesReporter(this);
    }              

    getSimilarCasesReporter() {
        return this.similarCasesReporter;
    }

    updatePage(updateData) {

        if(!!updateData.countries) 
            this.getCaseForm().updateSelectCountry(updateData.countries);
        if(!!updateData.industries)
            this.getCaseForm().updateSelectIndustry(updateData.industries);
        if(!!updateData.specializations)
            this.getCaseForm().updateSelectSpecialization(updateData.specializations);
        if(!!updateData.valueEstimate)
            this.getCaseReport().updateValueEstimate(updateData.valueEstimate);
        if(!!updateData.similarCases)
            this.getCaseReport().updateSimilarCasesTable(updateData.similarCases);
        
        return this;
    }

    matchCase() {
        
        let companyParams = this.getCaseForm().getCaseParams();
        
        this.getSimilarCasesReporter().fetchSimilarCases(companyParams);
        
        return this;
    }

}
