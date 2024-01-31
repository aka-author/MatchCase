

function centerX(parent, child, x=undefined) {
    child.style.left = (!!x ? x : (parent.clientWidth - child.clientWidth)/2) + "px";
}

function centerY(parent, child, y=undefined) {
    child.style.top = (!!y ? y : (parent.clientHeight - child.clientHeight)/2) + "px";
}


function cycleRotate(imageId, stopCallback) {
    const img = document.getElementById(imageId);
  
    if (!img) {
      console.error(`Element with ID '${imageId}' not found.`);
      return;
    }

    let rotation = 0;
  
    const rotateInterval = setInterval(() => {
      rotation += 10; 
      img.style.transform = `rotate(${rotation}deg)`;
      if (stopCallback()) {
        clearInterval(rotateInterval);
      }
    }, 100); 
}
  
function createProgressIndicator(progressIndicatorId) {

    const img = document.createElement("img");
    
    img.setAttribute("id", progressIndicatorId);
    img.setAttribute("src", "img/lemon01-02.png");
    img.setAttribute("style", "display: block");
    img.classList.add("progressIndicator");
    
    return img;
}

function assembleProgressIndicatorId(baseId) {
    return baseId + "progress";
}

function runProgressIndicator(progrElementId, x=undefined, y=undefined) {

    const progressIndicatorId = assembleProgressIndicatorId(progrElementId);

    const imgProgressIndicator = createProgressIndicator(progressIndicatorId);

    const progrElement = document.getElementById(progrElementId);
    progrElement.appendChild(imgProgressIndicator);

    centerX(progrElement, imgProgressIndicator, x);
    centerY(progrElement, imgProgressIndicator, y);

    cycleRotate(progressIndicatorId, () => false);
   
}

function stopProgressIndicator(progrElementId) {

    const progressIndicatorId = assembleProgressIndicatorId(progrElementId);
    const imgProgressIndicator = document.getElementById(progressIndicatorId);

    if(!!imgProgressIndicator)
        imgProgressIndicator.remove();
}


function enableSimulation(flag) {
    
    document.getElementById("buttonSimulate").disabled = !flag;

}

function validatePositiveInt(id) {
    let input = document.getElementById(id);
    let valid = input.value.match(/^[1-9]\d*$/);
    input.style.background = valid ? "#ffffff" : "#faa0a0";
}


function validateNonNegativeInt(id) {
    let input = document.getElementById(id);
    valid = input.value.match(/^\d+$/);
    input.style.background = valid ? "#ffffff" : "#faa0a0";
    return valid;
}


function validateNonNegativeReal(id) {
    let input = document.getElementById(id);
    let valid = input.value.match(/^\d*\.?\d+$/);
    input.style.background = valid ? "#ffffff" : "#faa0a0";
    return valid;
}

function assembleOption(value, label, isSelected=false) {

    let selectedAttr = isSelected ? "selected" : "";

    let optionHtml = `<option value="${value}" ${selectedAttr}>${label}</option>`;

    return optionHtml;
}


function assembleSelect(id, options, selectedValue=undefined) {

    let optionsHtml = "";
    for(let option of options)
        optionsHtml += assembleOption(option.value, option.label, option.value === selectedValue);

    selectHtml = `<select id="${id}">${optionsHtml}</select>`;

    return selectHtml;
}


function assemblePercentage10Select(id, selectedValue=undefined) {
    
    let options = [
        {"value": 0.0, "label":   "0%"},
        {"value": 0.1, "label":  "10%"},
        {"value": 0.2, "label":  "20%"},
        {"value": 0.3, "label":  "30%"},
        {"value": 0.4, "label":  "40%"},
        {"value": 0.5, "label":  "50%"},
        {"value": 0.6, "label":  "60%"},
        {"value": 0.7, "label":  "70%"},
        {"value": 0.8, "label":  "80%"},
        {"value": 0.9, "label":  "90%"},
        {"value": 1.0, "label": "100%"}
    ];

    return assembleSelect(id, options, selectedValue);
}


function assemblePercentage11Select(id, selectedValue=undefined) {

    let options = [
        {"value": 0.00, "label":   "0%"},
        {"value": 0.01, "label":   "1%"},
        {"value": 0.02, "label":   "2%"},
        {"value": 0.03, "label":   "3%"},
        {"value": 0.04, "label":   "4%"},
        {"value": 0.05, "label":   "5%"},
        {"value": 0.06, "label":   "6%"},
        {"value": 0.07, "label":   "7%"},
        {"value": 0.08, "label":   "8%"},
        {"value": 0.09, "label":   "9%"},
        {"value": 0.10, "label":  "10%"},
        {"value": 0.20, "label":  "20%"},
        {"value": 0.30, "label":  "30%"},
        {"value": 0.40, "label":  "40%"},
        {"value": 0.50, "label":  "50%"},
        {"value": 0.60, "label":  "60%"},
        {"value": 0.70, "label":  "70%"},
        {"value": 0.80, "label":  "80%"},
        {"value": 0.90, "label":  "90%"},
        {"value": 1.00, "label": "100%"}
    ];

    return assembleSelect(id, options, selectedValue);
}


function selectTab(tabName) {
    let shortcuts = ["Intro", "Basics", "Cases", "Graphs"];
    let tab = document.getElementById("divTab" + tabName);
    tab.style.display = "";
    let shortcut = document.getElementById("spanTabShortcut" + tabName);
    shortcut.style.textDecoration = "none";
    shortcut.style.cursor = "default";
    for(let shortcut of shortcuts) 
        if(shortcut != tabName) 
            unselectTab(shortcut)
}


function unselectTab(tabName) {
    let tab = document.getElementById("divTab" + tabName);
    tab.style.display = "none";
    let shortcut = document.getElementById("spanTabShortcut" + tabName);
    shortcut.style.textDecoration = "underline";
    shortcut.style.cursor = "pointer";
}


class ControlPanel extends Worker {

    constructor(chief, workerTypeName="controlPanel") {
        super(chief, workerTypeName);
        this.resetTerminatedFlag();
        this.headingsOn = true;
    }

    getBoolValue(id) {
        return document.getElementById(id).checked;
    }

    getStrValue(id) {
        return document.getElementById(id).value;
    }

    getIntValue(id) {
        return parseInt(document.getElementById(id).value);
    }

    getFloatValue(id) {
        return parseFloat(document.getElementById(id).value);
    }

    getSimulationTaskProps() {

        let stp = {}; 
        
        stp.surcoseInitialConcentration = this.getFloatValue("inputSurcoseInitialConcentration");
        stp.altruistsInitialShare = this.getFloatValue("inputAltruistsInitialShare");
        
        stp.altruisticTimeShare = this.getFloatValue("inputAltruisticTimeShare");
        stp.altruisticInterestShare = this.getFloatValue("inputAltruisticInterestShare");
        stp.altruistGlucoseValue = this.getFloatValue("inputAltruistGlucoseValue");
        stp.altruisticGlucoseUsage1 = this.getFloatValue("selectAltruisticGlucoseUsage1");
        stp.altruisticGlucoseUsage10 = this.getFloatValue("selectAltruisticGlucoseUsage10");
        stp.altruisticGlucoseUsage100 = this.getFloatValue("selectAltruisticGlucoseUsage100");
        
        stp.egoisticTimeShare = this.getFloatValue("inputEgoisticTimeShare");
        stp.egoisticInterestShare = this.getFloatValue("inputEgoisticInterestShare");
        stp.egoistGlucoseValue = this.getFloatValue("inputEgoistGlucoseValue");
        stp.egoisticGlucoseUsage1 = this.getFloatValue("selectEgoisticGlucoseUsage1");
        stp.egoisticGlucoseUsage10 = this.getFloatValue("selectEgoisticGlucoseUsage10");
        stp.egoisticGlucoseUsage100 = this.getFloatValue("selectEgoisticGlucoseUsage100");
        
        stp.visibleCellsNumber = this.getIntValue("inputVisibleCellsNumber");
        stp.simulationStepsNumber = this.getIntValue("inputSimulationStepsNumber");
        stp.autostop = this.getBoolValue("inputAutostop");
        
        stp.reportRowsNumber = this.getIntValue("inputReportRowsNumber");
        stp.reportDecimalPoint = this.getStrValue("inputDecimalPoint");
        stp.includeHeadings = this.headingsOn;

        return stp;
    }

    getFlaskView() {
        return GLOBAL_FLASK_VIEW;
    }

    getFlask() {
        return this.getFlaskView().getFlask();
    }

    setTerminatedFlag() {
        this.terminatedFlag = true;
    }

    resetTerminatedFlag() {
        this.terminatedFlag = false;
    }

    isTerminated() {
        return this.terminatedFlag;
    }

    getLockIds() {

        let locIds = [
            "inputSurcoseInitialConcentration", 
            "inputAltruistsInitialShare", 
                
            "inputAltruisticTimeShare", 
            "inputAltruisticInterestShare", 
            "inputAltruistGlucoseValue", 
            "selectAltruisticGlucoseUsage1", 
            "selectAltruisticGlucoseUsage10", 
            "selectAltruisticGlucoseUsage100", 
                
            "inputEgoisticTimeShare", 
            "inputEgoisticInterestShare",
            "inputEgoistGlucoseValue", 
            "selectEgoisticGlucoseUsage1", 
            "selectEgoisticGlucoseUsage10", 
            "selectEgoisticGlucoseUsage100", 
                
            "inputVisibleCellsNumber", 
            "inputSimulationStepsNumber",

            "inputReportRowsNumber",
            "inputDecimalPoint",
        
            "buttonSimulate"];

        return locIds;
    }

    lock() {

        if(!this.lockFlag) {
            for(let lockid of this.getLockIds()) 
            document.getElementById(lockid).disabled = true;
            document.getElementById("buttonStop").disabled = false;
        }

        this.lockFlag = true;
    }

    unlock() {

        for(let lockid of this.getLockIds()) 
            document.getElementById(lockid).disabled = false;
            document.getElementById("buttonStop").disabled = true;
        
            this.lockFlag = false;
    }

    displayCleaning() {
        document.getElementById("spanStepNumber").innerHTML = " Cleaning... Please wait...";
    }

    formatSaturation(saturation) {
        return (100*saturation).toFixed(3) + "%";
    }

    displaySaturation(id, saturation) {
        document.getElementById(id).innerHTML = this.formatSaturation(saturation);
    }

    displayCellsShare(id, share) {
        document.getElementById(id).innerHTML = (100*share).toFixed(0) + "%";
    }

    displayColonyGrows(colonyGrowth, step) {
        document.getElementById("spanColonyGrowth").innerHTML = colonyGrowth.toFixed(1);
        document.getElementById("spanColonyGrowthTemp").innerHTML = (colonyGrowth/step).toFixed(4);
    }

    displayCurrentStep(step) {

        document.getElementById("spanStepNumber").innerHTML = " Step: " + step;

        let water = this.getFlaskView().getFlask().getWater();
        
        this.displaySaturation("spanSucrose", water.getSucroseSaturation());
        this.displaySaturation("spanGlucose", water.getGlucoseSaturation());
        this.displaySaturation("spanFructose", water.getFructoseSaturation());

        this.displayCellsShare("spanCooperators", water.getAltruistsShare());
        this.displayCellsShare("spanFreeriders", water.getEgoistsShare());

        this.initialMushroomsWeight = step == 1 ? water.getMushroomsWeight() :  this.initialMushroomsWeight;
        this.displayColonyGrows(water.getMushroomsWeight()/this.initialMushroomsWeight, step);
    }

    finalGag() {

        if(Math.random() > .9) {
            let rabbit = document.getElementById("rabbit");
            setTimeout(
                () => { 
                        rabbit.style.display = ""; 
                        setTimeout(
                            () => {
                                rabbit.style.display = "none"
                            }, 3500)
                }, 
            1);
        }
        
        let playPromise = document.getElementById("audioTada").play();
        if (playPromise !== undefined) 
            playPromise.then(_ => {}).catch(error => {alert("The simulation is complete.");});

    }

    autoTerminate() {
        let water = this.getFlaskView().getFlask().getWater();
        if(water.getSucroseSaturation() < 0.000005 && water.getGlucoseSaturation() < 0.000005) {
            this.terminateSimulationTask();
            this.finalGag();
        }
    }

    startSimulationTask() {

        this.resetTerminatedFlag();

        let flaskView = this.getFlaskView();

        let flask = this.getFlask();

        let stp = this.getSimulationTaskProps();
        flask.setSimulationTaskProps(stp).openSimulation(null);

        flaskView.updateDom();

        selectTab("Report");

        let countSteps = 0;
        let hook = window.setInterval(  
            () => {
                    this.lock();

                    flask.simulateCycle(); 
                    flaskView.updateDom();
                    
                    countSteps++;
                    this.displayCurrentStep(countSteps);
                    
                    if(this.getSimulationTaskProps().autostop) 
                        this.autoTerminate();

                    if(countSteps > stp.simulationStepsNumber)
                        this.setTerminatedFlag();

                    if(this.isTerminated()) { 
                        window.clearInterval(hook);
                        this.unlock();
                        if(countSteps > stp.simulationStepsNumber) 
                            this.finalGag();
                    }
                  }, 3);
    }

    terminateSimulationTask() {
        this.setTerminatedFlag();
    }

    toggleHeadins() {
        this.headingsOn = !this.headingsOn;
        let spanHeadings = document.getElementById("imgHeadings");
        spanHeadings.style.background = this.headingsOn ? "rgb(188, 225, 188)" : "#ffffff"; 

    }
}
