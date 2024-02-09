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
        this.selectYearFounded = this.getSelectYearFoundedDomObject();
        this.selectIndustry = this.getSelectIndustryDomObject();
        this.inputIndustry = this.getInputIndustryDomObject();
        this.selectSpecialization = this.getSelectSpecializationDomObject();
        this.inputSpecialization = this.getInputSpecializationDomObject();
        this.inputNumberOfEployees = this.getInputNumberOfEmployeesDomObject();
        this.inputRevenue = this.getInputRevenueDomObject();
        
        return this;
    }

    getSelectCountryDomObject() {
        return document.getElementById("selectCountry");
    }
    
    getSelectYearFoundedDomObject() {
        return document.getElementById("selectYearFounded");
    }

    getCountryCode() {
        return this.selectCountry.value;
    }

    getSelectYearFoundedDomObject() {
        return document.getElementById("selectYearFounded");
    }

    getSelectIndustryDomObject() {
        return document.getElementById("selectIndustry");
    }
    
    getIndustryCode() {
        return this.selectIndustry.value;
    }

    getIndustryDesc() {
        return this.inputIndustry.value;
    }

    getInputIndustryDomObject() {
        return document.getElementById("inputIndustry");
    }

    getSelectSpecializationDomObject() {
        return document.getElementById("selectSpecialization");
    }
    
    getSpecializationCode() {
        return this.selectSpecialization.value;
    }
    
    getInputSpecializationDomObject() {
        return document.getElementById("inputSpecialization");
    }

    getSpecializationDesc() {
        return this.inputSpecialization.value;
    }

    getYearFounded() {
        return parseInt(this.selectYearFounded.value);
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

        while(select.firstChild)
            select.removeChild(select.firstChild);

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

    updateSelectYearFounded() {

        const currYear = 2024;

        const years = [];

        for(let year = currYear; year >= currYear - 20; year--) 
            years.push({"year": year.toString()});
        
        this.updateSelect(this.selectYearFounded, years, "year", "year");

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
            "country_code": this.getCountryCode(),
            "founded_in": this.getYearFounded(),
            "industry_code": this.getIndustryCode(),
            "industry_desc": this.getIndustryDesc(),
            "specialization_code": this.getSpecializationCode(),
            "specialization_desc": this.getSpecializationDesc(),
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
        this.revenuePriceGraph = this.createRevenuePriceGraph();
        //this.emplPerfGraph = this.createEmplPerfGraph();
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

    createRevenuePriceGraph() {
        
        const revenuePriceGraph = new SimGraph(this, "divEmplPerf")
            .setOptions(
                {   
                    "x_col_name": "acquiree_revenue",
                    "y_col_name": "deal_price",
                    "x_axes_type": "natural",
                    "y_axes_type": "natural",
                    "name_col_name": "acquiree_name",
                    "link_col_name": "deal_www",
                    "sim_col_name": "similarity",
                    "x_axes_caption": "Revenue, $M",
                    "y_axes_caption": "Price, $M"
                }
            );

        document.getElementById("divTabGraphs").appendChild(revenuePriceGraph.assembleDomObject());

        return revenuePriceGraph;
    }

    createEmplPerfGraph() {
        
        const emplPerfGraph = new DistGraph(this, "divEmplPerf")
            .setOptions(
                {   
                    "x_col_name": "acquiree_num_employees",
                    "y_col_name": "acquiree_revenue",
                    "name_col_name": "acquiree_name",
                    "link_col_name": "deal_www",
                    "sim_col_name": "similarity",
                    "x_axes_caption": "Number of employees",
                    "y_axes_caption": "Revenue, $M"
                }
            );

        document.getElementById("divTabGraphs").appendChild(emplPerfGraph.assembleDomObject());

        return emplPerfGraph;
    }

    updateSpecializationSelect() {
        const industryCode = this.caseForm.getIndustryCode();
        const allSpecializations = this.directoryViewer.getSpecializations();
        const relevantSpecializations = allSpecializations.filter(s => s.industry_code === industryCode);
        this.getCaseForm().updateSelectSpecialization(relevantSpecializations);
    }

    updatePage(updateData) {

        console.log(updateData);

        if(!!updateData.countries) 
            this.getCaseForm().updateSelectCountry(updateData.countries);
        
        if(!!updateData.countries)
            this.getCaseForm().updateSelectYearFounded();
        
        if(!!updateData.industries)
            this.getCaseForm().updateSelectIndustry(updateData.industries);
        
        if(!!updateData.specializations)
            this.updateSpecializationSelect();
        
        if(!!updateData.valueEstimate)
            this.getCaseReport().updateValueEstimate(updateData.valueEstimate);
        
        if(!!updateData.similarCases) {
            this.getCaseReport().updateSimilarCasesTable(updateData.similarCases);
             
        this.revenuePriceGraph
            .setDataSet(updateData.similarCases)
            .setInstance(updateData.instance)
            .setTrend(updateData.trend)
            .updateCanvas();

        /*this.emplPerfGraph
            .setDataSet(updateData.similarCases)
            .setInstance(updateData.instance)
            .updateCanvas();*/
        }

        stopProgressIndicator("divSimilarCases");
        stopProgressIndicator("divTabBasics");

        return this;
    }

    validateIndustry(caseParams) {

        if(caseParams.industry_code === "null") return false;

        if(caseParams.industry_code === "Misc." 
           && caseParams.industry_desc.length <= 1) return false;

        return true;
    }

    validateSpecialization(caseParams) {

        if(caseParams.industry_code !== "Misc."
           && caseParams.specialization_code === "null") return false;

        if(caseParams.industry_code === "Misc." 
           && caseParams.specialization_desc.length <= 1) return false;

        if(caseParams.specialization_code.includes("Misc")
           && caseParams.specialization_desc.length <= 1) return false;
        
        if(caseParams.industry_code === "null") return false;

        return true;
    }

    validate() {

        const caseParams = this.getCaseForm().getCaseParams();

        const valid = caseParams.country_code != "null" 
                      && !isNaN(caseParams.founded_in) 
                      && this.validateIndustry(caseParams)
                      && this.validateSpecialization(caseParams)
                      && !isNaN(caseParams.num_employees) 
                      && !isNaN(caseParams.revenue)
                      && validateNonNegativeInt("inputNumberOfEmployees")
                      && validateNonNegativeReal('inputRevenue')

        return valid;
    }

    matchCase() {
        
        let companyParams = this.getCaseForm().getCaseParams();
        
        this.getSimilarCasesReporter().fetchSimilarCases(companyParams);
        
        return this;
    }

}
