// CompCase
// Similar Cases Reporter
// Client library for JS


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
            "valueEstimate":evaluation["company_value"],
            "similarCases": evaluation["similar_cases"]
        };

        this.getChief().updatePage(comparation);

        return this;
    }

    fetchSimilarCases(caseParams) {

        let bevaluateScriptUrl = this.getCfg().similarCasesReporterUrl;
        let httpRequestData = this.assembleSimilarCasesHttpRequestData(caseParams);
        
        fetch(bevaluateScriptUrl, httpRequestData).then( 
            response => {
                if(response.ok) 
                    response.json().then(
                        report => this.getChief().updatePage(report["evaluation"])
                    )
                else 
                    this.getChief().handleError("Failed to load similar cases"); 
            }
        )
    }
}
