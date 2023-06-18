// CompCase
// Directory Viewer
// Client library for JS

      
class MatchCaseDirectoryViewer {

    constructor(chief, langCode) {

        this.chief = chief;
        this.langCode = langCode;
        
        this.directoryCodes = ["countries", "industries", "specializations"];
        
        this.directoryFlags = [];
        this.directories = [];
        
        this.fetchAllDirectories();
    }

    getChief() {
        return this.chief;
    }

    getDirectoryCodes() {
        return this.directoryCodes;
    }

    resetDirectoryFlags() {

        for(let directoryCode of this.getDirectoryCodes())
            this.setDirectoryFlag(directoryCode, false);

        return this;
    }

    setDirectoryFlag(directoryCode, flag=true) {

        this.directoryFlags[directoryCode] = flag;

        return this;
    }

    isDirectoryFetched(directoryCode) {
        return this.directoryFlags[directoryCode];
    }

    areAllDirecoresFetched() {

        let total_flag = true;

        for(let directoryCode of this.getDirectoryCodes())
            total_flag &&= this.isDirectoryFetched(directoryCode);

        return total_flag
    }

    resetDirectories() {

        for(let directoryCode of this.getDirectoryCodes())
            this.directories[directoryCode] = [];

        return this;
    }

    updatePage() {

        let directories = {
            "countries": this.getCountries(),
            "industries": this.getIndustries(),
            "specializations": this.getSpecializations()
        };

        this.getChief().updatePage(directories);
        
        return this;
    }

    setDirectory(directoryCode, responseBody) {
        
        this.directories[directoryCode] = responseBody["directory"][directoryCode];
        
        this.setDirectoryFlag(directoryCode);
        
        if(this.areAllDirecoresFetched())
            this.updatePage();

        return this;
    }

    getDirectory(directoryCode) {
        return this.directories[directoryCode];
    }

    assembleDirectoryHttpRequestData(directoryCode) {

        let requestBody = {
            "directory_code": directoryCode,
            "lang_code": this.langCode
        };

        let httpRequestData = {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
            },
            "body": JSON.stringify(requestBody)
        };

        return httpRequestData;
    }

    fetchDirectory(directoryCode) {

        let httpRequestData = this.assembleDirectoryHttpRequestData(directoryCode);

        fetch(this.getChief().getCfg().directoryViewerUrl, httpRequestData).then(
            response => {
                if(response.ok) 
                    response.json().then(responseBody => this.setDirectory(directoryCode, responseBody))
                else 
                    console.log(`Failed to load a directory {directoryCode}.`)
            }
        );

        return this;
    }

    fetchAllDirectories() {              

        this.resetDirectories().resetDirectoryFlags();

        for(let directoryCode of this.getDirectoryCodes())
            this.fetchDirectory(directoryCode);

        return this;
    }

    getCountries() {
        return this.getDirectory("countries");
    }   

    getIndustries() {
        return this.getDirectory("industries");
    } 

    getSpecializations() {
        return this.getDirectory("specializations");
    } 

}

