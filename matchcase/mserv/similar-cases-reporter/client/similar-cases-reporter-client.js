// System:      Consulting Company Website
// Module:      MatchCase
// Block:       Microservice similar-cases-reporter 
// Components:  Client JS library for a front-end 


class MatchCaseSimilarCasesReporter {

    constructor(chief) {
        this.chief = chief;
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

    assembleSimilarCasesHttpRequestData(caseParams) {

        let httpRequestData = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
            },
            "body": JSON.stringify(caseParams)
        }

        return httpRequestData;
    }

    updatePage(evaluation) {

        let comparation = {
            "valueEstimate": evaluation["company_value"],
            "similarCases": evaluation["similar_cases"],
            "instance": evaluation["instance"]
        };

        this.getChief().updatePage(comparation);

        return this;
    }

    assembleInstance(caseParams) {

        const instance = {};

        for(const key in caseParams) 
            instance["acquiree_" + key] = caseParams[key];

        instance["deal_price"] = 10;
        instance["acquiree_age"] = (new Date().getFullYear()) - instance["acquiree_founded_in"];
        
        return instance;
    }

    fetchSimilarCases(caseParams) {

        let similarCasesReporterUrl = this.getCfg().matchCase.similarCasesReporterUrl;
        let httpRequestData = this.assembleSimilarCasesHttpRequestData(caseParams);

        const instance = this.assembleInstance(caseParams);
        
        fetch(similarCasesReporterUrl, httpRequestData).then( 
            response => {
                if(response.ok) 
                    response.json().then(
                        report => {
                            report["evaluation"]["instance"] = instance;                
                            this.updatePage(report["evaluation"]); 
                        }
                    )
                else 
                    this.handleError({
                        "errorMessage": "Failed to load similar cases",
                        "url": similarCasesReporterUrl,
                        "requestData": httpRequestData,
                        "response": response
                    }); 
            }
        )
    }
}
