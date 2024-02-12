function correctHintPosition(divHint, divCanvas, divDot) {

    const hintRect = divHint.getBoundingClientRect();
    const canvasRect = divCanvas.getBoundingClientRect();

    const dotRect = divDot.getBoundingClientRect();
    dotTop = dotRect.y;
    
    if(hintRect.x < 0) {
        divHint.style.left = (-canvasRect.x) + "px"; 
        divHint.style.top = (parseInt(divHint.style.top) - 5) + "px"; 
    }    
}   


function clipChildToParent(domParent, domKid) {

    const parentRect = domParent.getBoundingClientRect();
    const kidRect = domKid.getBoundingClientRect();
  
    const top = Math.max(0, kidRect.top - parentRect.top);
    const right = Math.min(kidRect.right - parentRect.left, parentRect.width);
    const bottom = Math.min(kidRect.bottom - parentRect.top, parentRect.height);
    const left = Math.max(0, kidRect.left - parentRect.left);
  
    domKid.style.clip = `rect(${top}px, ${right}px, ${bottom}px, ${left}px)`;
}


function similarityGrade(similarity, nGrades) {

    let otherness = 1 - similarity;

    let gradeBound = 0.5;
    let grade = nGrades - 1;

    while(0 < grade && otherness <= gradeBound) {         
        gradeBound /= 2;
        grade--;
    }
    
    return grade;
}


function fallback(explicitValue, defaultValue) {
    return !!explicitValue ? explicitValue : defaultValue;
}


function areAllNonNegative(array) {
    return array.every(element => element >= 0);
}


function areAllNaturals(array) {
    return array.every(element => Number.isInteger(element) && element >= 0);
}


function suggestBestRealScale(values, nIntervals, extKoeff) {

    const vMin = Math.min(...values);
    const vMax = Math.max(...values);
    const span = vMax - vMin;

    const sMin = vMin - span*extKoeff;
    const sMax = vMax + span*extKoeff;
    const step = (sMax - sMin)/nIntervals;

    return {"sMin": sMin, "sMax": sMax, "step": step, "nIntervals": nIntervals};
}


function suggestBestNonNegativeScale(values, nIntervals, extKoeff) {

    const vMin = Math.min(...values);
    const vMax = Math.max(...values);
    const span = vMax - vMin;

    const sMinTmp = vMin - span*extKoeff;

    const sMin = sMinTmp >=0 ? sMinTmp : 0;
    const sMax = vMax + span*extKoeff;
    const step = (sMax - sMin)/nIntervals;

    return {"sMin": sMin, "sMax": sMax, "step": step, "nIntervals": nIntervals};
}


function isMultiple(v1, v2) {
    const r = v1/v2;
    return Math.floor(r) === r;
}


function isNice(v) {
    const order = Math.ceil(Math.log(v)/Math.log(10)) - 1;
    return isMultiple(v, 10**order);
}


function suggestBestNaturalScale(values, nIntervalsMax, extKoeff) {

    let bestScale = null;

    const vMin = Math.min(...values);
    const vMax = Math.max(...values);

    const extent = Math.round((vMax - vMin)*extKoeff);
    const sMinTmp = Math.floor(vMin) - extent;
    const sMin = sMinTmp >= 0 ? sMinTmp : 0;

    let bestRemain = 100*(vMax - vMin);
    for(let nIntervals = 3; nIntervals <= nIntervalsMax; nIntervals++) {
        
        let sMax = Math.ceil(vMax) + extent;
        while(!(isMultiple(sMax - sMin, nIntervals) && isNice(sMax)) && sMax < vMax*2) sMax++;

        let remain = sMax - vMax;
        if(bestRemain > remain) {
            let step = (sMax - sMin)/nIntervals;
            bestScale = {"sMin": sMin, "sMax": sMax, "step": step, "nIntervals": nIntervals};
            bestRemain = remain;
        }
    }

    return bestScale;
}


function detectActualScaleType(values, scaleType) {

    let actualScaleType = scaleType;

    if(scaleType == "auto") {
        if(areAllNaturals(values)) 
            actualScaleType = "natural"
        else if(areAllNonNegative(values))
            actualScaleType = "nonNegative"
        else 
            actualScaleType = "real"
    }

    return actualScaleType;
}


function suggestBestScale(values, nIntervals=8, extKoeff=0.1, scaleType="auto") {

    let scale = null;

    const actualScaleType = detectActualScaleType(values, scaleType);

    switch(actualScaleType) {
        case "natural": 
            scale = suggestBestNaturalScale(values, nIntervals, extKoeff);
            break;
        case "nonNegative":
            scale = suggestBestNonNegativeScale(values, nIntervals, extKoeff);
            break;
        default: 
            scale = suggestBestRealScale(values, nIntervals, extKoeff);
    }

    return scale;
}


class SimGraph extends Worker {

    constructor(chief, id) {

        super(chief);

        this.id = id;

        this.dataSet = null;
        this.instance = null;
        this.trend = null;

        this.minX = undefined;
        this.maxX = undefined;
        this.minY = undefined;
        this.maxY = undefined;

        this.maxSim = undefined;

        this.options = {};
        this.setDefaultOptions();

        this.activeHint = null;

        this.xScale = null;
        this.yScale = null;
    }

    // Options

    setOptions(options) {

        for(const optionKey in options) 
            this.options[optionKey] = options[optionKey];

        return this;
    }

    setDefaultOptions() {

        const defaultOptions = {
            "dummy_graph_image": "img/soldout01-2.png",
            "x_col_name": "x",
            "y_col_name": "y",
            "name_col_name": "name",
            "country_code_col_name": "country_code",
            "link_col_name": "url",
            "sim_col_name": "dist",
            "canvas_xy_extension_koeff": 0.1,
            "case_hue": 285,
            "case_sat": 100,
            "similarity_grades": 5,
            "similarity_colors": ["#000000", "#888888", "#cccccc"],
            "grid_cells_x": 8,
            "grid_cells_y": 8,
            "x_axes_type": "auto",
            "y_axes_type": "auto",
            "x_decimals": 0,
            "y_decimals": 0,
            "hint_offset": 2,
            "hint_show_timeout": 500,
            "record_class_name": "distGraphRecord",
            "outlier_record_class_name": "distGraphOutlierRecord",
            "instance_class_name": "distGraphInstance",
            "downtrend_line_class_name": "distDowntrendLine",
            "constant_line_class_name": "distConstantLine",
            "uptrend_line_class_name": "distUptrendLine",
            "hint_class_name": "distGraphHint",
            "grid_class_name": "distGraphGrid", 
            "clip_canvas_class_name": "distGraphClipCanvas",
            "canvas_class_name": "distGraphCanvas",
            "x_axes_caption_class_name": "distGraphXAxesCaption",
            "y_axes_caption_class_name": "distGraphYAxesCaption",
            "frame_class_name": "distGraphFrame",
            "instance_hint_wording": "You are here",
            "x_axes_caption": undefined,
            "y_axes_caption": undefined
        }

        this.setOptions(defaultOptions);
    }

    getDummyGraphImage() {
        return this.options["dummy_graph_image"];
    }

    getXColName() {
        return this.options["x_col_name"];
    }

    getYColName() {
        return this.options["y_col_name"];
    }

    getNameColName() {
        return this.options["name_col_name"];
    }

    getLinkColName() {
        return this.options["link_col_name"];
    }

    getSimColName() {
        return this.options["sim_col_name"];
    }

    getCaseHue() {
        return this.options["case_hue"];
    }

    getCaseSaturation() {
        return this.options["case_sat"];
    }

    getInstanceHue() {
        return this.options["instance_hue"];
    }

    getInstanceSaturation() {
        return this.options["instance_sat"];
    }

    getSimilarityGrades() {
        return this.options["similarity_grades"];
    }

    getSimilarityColor(grade) {
        const colors = this.options["similarity_colors"];
        const lastColorIdx = colors.length - 1;
        return grade <= lastColorIdx ? colors[grade] : colors[lastColorIdx];
    }

    getGridCellsX() {
        return !!this.xScale ? this.xScale.nIntervals : this.options["grid_cells_x"];
    }

    getGridCellsY() {
        return !!this.yScale ? this.yScale.nIntervals : this.options["grid_cells_y"];
    }

    getXAxesType() {
        return this.options["x_axes_type"];
    }

    getYAxesType() {
        return this.options["y_axes_type"];
    }

    getCanvasXYExtensionKoeff() {
        return this.options["canvas_xy_extension_koeff"];
    }

    getXDecimals() {
        return this.options["x_decimals"];
    }

    getYDecimals() {
        return this.options["y_decimals"];
    }

    getHintOffset() {
        return this.options["hint_offset"];
    }

    getHintShowTimeout() {
        return this.options["hint_show_timeout"];
    }

    getRecordClassName() {
        return this.options["record_class_name"];
    }

    getOutlierRecordClassName() {
        return this.options["outlier_record_class_name"];
    }

    getInstanceClassName() {
        return this.options["instance_class_name"];
    }

    getHintClassName() {
        return this.options["hint_class_name"];
    }

    getGridClassName() {
        return this.options["grid_class_name"];
    }

    getXAxesCaptionClassName() {
        return this.options["x_axes_caption_class_name"];
    }

    getYAxesCaptionClassName() {
        return this.options["y_axes_caption_class_name"];
    }

    getDowntrendLineClassName() {
        return this.options["downtrend_line_class_name"];
    }

    getConstantLineClassName() {
        return this.options["constant_line_class_name"];
    }

    getUptrendLineClassName() {
        return this.options["uptrend_line_class_name"];
    }
    
    getClipCanvasClassName() {
        return this.options["clip_canvas_class_name"];
    }

    getCanvasClassName() {
        return this.options["canvas_class_name"];
    }

    getFrameClassName() {
        return this.options["frame_class_name"];
    }

    getInstanceHintWording() {
        return this.options["instance_hint_wording"]
    }

    getXAxesCaption() {
        return this.options["x_axes_caption"];
    }

    getYAxesCaption() {
        return this.options["y_axes_caption"];
    }

    // Case records

    getX(caseRecord) {
        return caseRecord[this.getXColName()];
    }

    getY(caseRecord) {
        return caseRecord[this.getYColName()];
    }

    getName(caseRecord) {
        return caseRecord[this.getNameColName()];
    }

    getLink(caseRecord) {
        return caseRecord[this.getLinkColName()];
    }

    getSim(caseRecord) {
        return caseRecord[this.getSimColName()];
    }

    // Data set

    getColValues(colName) {
        return this.dataSet.map(dr => dr[colName]);
    }

    getExtendedColValues(colName) {
        
        const values = this.getColValues(colName);
        
        if(!!this.instance)
            values.push(this.instance[colName]);

        return values;
    }

    getMinCol(colName) {
        return Math.min(...this.getExtendedColValues(colName));
    }

    getMaxCol(colName) {
        return Math.max(...this.getExtendedColValues(colName));
    }

    detectMinX() {
        return this.getMinCol(this.getXColName());
    }

    detectMaxX() {
        return this.getMaxCol(this.getXColName());
    }

    detectMinY() {
        return this.getMinCol(this.getYColName());
    }

    detectMaxY() {
        return this.getMaxCol(this.getYColName());
    }

    detectMaxSim() {
        return this.getMaxCol(this.getSimColName());
    }

    detectMinMax() {

        this.minX = this.detectMinX();
        this.maxX = this.detectMaxX();
        this.minY = this.detectMinY();
        this.maxY = this.detectMaxY();
        
        this.maxSim = this.detectMaxSim();

        return this;
    }

    getMinX() {
        return this.minX;
    }

    getMaxX() {
        return this.maxX;
    }

    getMinY() {
        return this.minY;
    }

    getMaxY() {
        return this.maxY;
    }

    getMaxSim() {
        return this.maxSim;
    }

    setDataSet(dataSet) {
        this.dataSet = dataSet;
        this.detectMinMax();
        return this;
    }

    // Instance

    setInstance(instance) {
        this.instance = instance;
        this.detectMinMax();
        return this;
    }

    // Trend

    setTrend(trend) {
        this.trend = trend;
        console.log("Trend: ", trend);
        return this;
    }

    // Calculations
    
    getXSpan() {
        return this.getMaxX() - this.getMinX();
    }

    getYSpan() {
        return this.getMaxY() - this.getMinY();
    }

    getNormalSim(caseRecord) {
        return this.getSim(caseRecord);
    }

    // Formatting

    getCanvasXExtension() {
        return this.getXSpan()*this.getCanvasXYExtensionKoeff();
    }

    getCanvasYExtension() {
        return this.getYSpan()*this.getCanvasXYExtensionKoeff();
    }

    getCanvasMinX() {
        return this.xScale.sMin;
    }

    getCanvasMaxX() {
        return this.xScale.sMax;
    }

    getCanvasMinY() {
        return this.yScale.sMin;
    }

    getCanvasMaxY() {
        return this.yScale.sMax;
    }

    getCanvasXSpan() {
        return this.getCanvasMaxX() - this.getCanvasMinX();
    }

    getCanvasYSpan() {
        return this.getCanvasMaxY() - this.getCanvasMinY();
    }

    getCanvasX(x) {
        return 100*(x - this.getCanvasMinX())/this.getCanvasXSpan();
    }

    getCanvasY(y) {
        return 100*(1 - (y - this.getCanvasMinY())/this.getCanvasYSpan());
    }

    assembleHslColor(hue, sat, lum) {
        return `hsl(${hue}, ${sat}%, ${lum}%)`;
    }

    assembleCaseColor(caseRecord) {

        const similarity = this.getNormalSim(caseRecord);
        const nGrades = this.getSimilarityGrades();
        
        const grade = similarityGrade(similarity, nGrades);

        return this.getSimilarityColor(grade);
    }

    assembleCaseHintContent(caseRecord) {

        const divHintContent = document.createElement("div");

        const divName = document.createElement("div");
        const aName = document.createElement("a");
        aName.setAttribute("href", this.getLink(caseRecord));
        aName.setAttribute("target", "_new");
        aName.textContent = this.getName(caseRecord);
        divName.appendChild(aName);

        divHintContent.appendChild(divName);

        return divHintContent;
    }

    assembleInstanceHintContent(caseRecord) {

        const divName = document.createElement("div");    
        divName.textContent = this.getInstanceHintWording();

        return divName;
    }

    getActiveHint() {
        return this.activeHint; 
    }

    putHintToNicePosition(hint, caseDot) {

        const ofs = this.getHintOffset();

        const hintWidth = caseDot.clientWidth;
        const hintHeight = caseDot.clientHeight;
        const hintLeft = caseDot.offsetLeft;
        const hintTop = caseDot.offsetTop;
        const hintRight = hintLeft + hintWidth;
        const hintBottom = hintTop + hintHeight;

        hint.style.left = (caseDot.offsetLeft - caseDot.clientWidth/2 - hint.clientWidth - ofs) + "px";
        hint.style.top  = (caseDot.offsetTop - caseDot.clientHeight/2 - hint.clientHeight - ofs) + "px";

        return this;
    }

    showHint(id) {

        this.hideActiveHint();

        const caseDot = document.getElementById(id + "dot");

        const hint = document.getElementById(id + "hint");
        hint.style.display = "";
        hint.style.zIndex = 100000;

        this.putHintToNicePosition(hint, caseDot);
        correctHintPosition(hint, this.divCanvas, caseDot);
        
        this.activeDot = caseDot;
        this.activeHint = hint;

        this.divHighlit = document.createElement("div");
        this.divHighlit.classList.add("distGraphHighlite");
        
        this.divHighlit.style.width = (caseDot.clientWidth + 6) + "px";
        this.divHighlit.style.height = (caseDot.clientHeight + 6) + "px";
        
        caseDot.appendChild(this.divHighlit);
    }

    hideActiveHint() {

        const hint = this.getActiveHint();

        if(!!hint) {
            hint.style.display = "none";
            hint.style.zIndex = 0;
            this.activeDot.style.border = "";
            this.activeDot.style.borderRadius = this.preverveBorderRadius;
            this.divHighlit.remove();
        }

        return this;
    }

    assembleHintDomObject(caseRecord, baseId, domContent) {

        const divHint = document.createElement("div");
        divHint.setAttribute("id", baseId + "hint");
        divHint.setAttribute("style", "display: none");
        divHint.classList.add(this.getHintClassName());

        divHint.appendChild(domContent);

        return divHint;
    }

    setWaitingForHintFlag(flag=true) {
        this.waitingForHintFlag = flag;
        return this;
    }

    isWaitingForHint() {
        return this.waitingForHintFlag;
    }

    assembleRecordDomObject(caseRecord, id, hslColor=undefined) {

        const divCase = document.createElement("div");
        divCase.setAttribute("id", id + "dot");

        const left = this.getCanvasX(this.getX(caseRecord));
        const top  = this.getCanvasY(this.getY(caseRecord));
        let strStyle = `left: ${left}%; top: ${top}%;`;
        strStyle += !!hslColor ? ` background: ${hslColor};` : "";
        divCase.setAttribute("style", strStyle);
        
        const className = !caseRecord["outlier_flag"] ? 
            this.getRecordClassName() : this.getOutlierRecordClassName() ;

        divCase.classList.add(className);

        if(!!id) {

            const me = this;

            divCase.addEventListener("mouseout", function(e) {
                me.setWaitingForHintFlag(false);
            });

            divCase.addEventListener("mouseover", function(e) {

                me.setWaitingForHintFlag();

                setTimeout(
                    function() {
                        if(me.isWaitingForHint()) me.showHint(id);
                    }, me.getHintShowTimeout()
                )
            });
        }

        return divCase;
    }

    assembleCaseDomObject(caseRecord, id) {
        const hslColor = this.assembleCaseColor(caseRecord);
        return this.assembleRecordDomObject(caseRecord, id, hslColor);
    }

    assembleInstanceDomObject(instanceRecord, id) {
        
        const divInstance = this.assembleRecordDomObject(instanceRecord, id);
        
        divInstance.classList.add(this.getInstanceClassName());

        return divInstance;
    }

    assembleScales() {

        this.xScale = suggestBestScale(
            this.getExtendedColValues(this.getXColName()),
            this.getGridCellsX(),
            this.getCanvasXYExtensionKoeff(),
            this.getXAxesType()
        );

        this.yScale = suggestBestScale(
            this.getExtendedColValues(this.getYColName()),
            this.getGridCellsY(),
            this.getCanvasXYExtensionKoeff(),
            this.getYAxesType()
        );
    }

    assembleXLabels() {

        const xLabels = [];

        const span = 100/this.getGridCellsX();
        const xSpan = this.xScale.step; 
        let promo = this.getCanvasMinX();

        for(let i = 0; i < this.getGridCellsX(); i++) {
            let divLabel = document.createElement("div");
            divLabel.setAttribute("style", `left: ${i*span}%`);
            divLabel.textContent = promo.toFixed(this.getXDecimals());
            promo += xSpan;
            divLabel.classList.add("distGraphXLabel");
            xLabels.push(divLabel);
        }

        return xLabels;
    }

    assembleYLabels() {

        const yLabels = [];

        const span = 100/this.getGridCellsY();
        let ySpan = this.yScale.step; //this.getCanvasYSpan()/this.getGridCellsY();
        let promo = this.getCanvasMinY();

        for(let i = 1; i <= this.getGridCellsY(); i++) {
            let divLabel = document.createElement("div");
            divLabel.setAttribute("style", `bottom : ${(i-1)*span}%`);
            
            divLabel.textContent = promo.toFixed(this.getYDecimals());
            promo += ySpan;
            divLabel.classList.add("distGraphYLabel");
            yLabels.push(divLabel);
        }

        return yLabels;
    }

    assembleGridDomObject() {

        const tableGrid = document.createElement("table");
        tableGrid.classList.add(this.getGridClassName());
        
        for(let ny = 0; ny < this.getGridCellsY(); ny++) {
            let tr = document.createElement("tr");
            for(let nx = 0; nx < this.getGridCellsX(); nx++) {
                let td = document.createElement("td");
                tr.appendChild(td);
            }
            tableGrid.appendChild(tr);
        }

        return tableGrid;
    }

    assembleXAxesCaptionDomObject() {

        const xAxesCaption = this.getXAxesCaption();

        if(!xAxesCaption) return null;

        const divXCaption = document.createElement("div");
        divXCaption.classList.add(this.getXAxesCaptionClassName());
        divXCaption.textContent = xAxesCaption;

        return divXCaption;
    }

    assembleYAxesCaptionDomObject() {

        const yAxesCaption = this.getYAxesCaption();

        if(!yAxesCaption) return null;

        const divYCaption = document.createElement("div");
        divYCaption.classList.add(this.getYAxesCaptionClassName());
        divYCaption.textContent = yAxesCaption;

        return divYCaption;
    }

    getTrendLineClassname(a) {

        switch(Math.sign(a)) {
            case -1: return this.getDowntrendLineClassName();
            case  0: return this.getConstantLineClassName();
            case  1: return this.getUptrendLineClassName();
        }
    }

    assembleTrendLineDomObject() {

        const divTrend = document.createElement("div");

        divTrend.classList.add(this.getTrendLineClassname(this.trend.a));
        
        return divTrend;
    }

    assembleClipCanvasDomObject() {

        const divClipCanvas = document.createElement("div");

        divClipCanvas.setAttribute("style", "");
        divClipCanvas.classList.add(this.getClipCanvasClassName());

        return divClipCanvas;
    }

    assembleCanvasDomObject() {

        const divCanvas = document.createElement("div");

        divCanvas.setAttribute("style", "");
        divCanvas.classList.add(this.getCanvasClassName());

        const divDummy = document.createElement("img");
        divDummy.setAttribute("src", this.getDummyGraphImage());
        divDummy.setAttribute("style", "position: absolute; left: 50%; top: 50%; width: 50%; height: 50%; transform: translateX(-50%) translateY(-50%)");

        divCanvas.appendChild(divDummy);

        const me = this;
        divCanvas.addEventListener("click", function(e) {
            if(e.target.tagName !== "A")
                me.hideActiveHint();
        });

        return divCanvas;
    }

    cleanCanvas() {

        while(this.divClipCanvas.firstChild)
            this.divClipCanvas.firstChild.remove();

        while(this.divCanvas.firstChild)
            this.divCanvas.firstChild.remove();

        return this;
    }

    addGrid() {
        this.tableGrid = this.assembleGridDomObject();
        this.divCanvas.appendChild(this.tableGrid);
        return this;
    }

    addLabels() {

        this.xLabels = this.assembleXLabels();
        for(const xlabel of this.xLabels)
            this.divCanvas.appendChild(xlabel);

        this.yLabels = this.assembleYLabels();
        for(const yLabel of this.yLabels)
            this.divCanvas.appendChild(yLabel);

        return this;
    }

    addAxesCaptions() {

        const divXCaption = this.assembleXAxesCaptionDomObject();
        if(!!divXCaption)
            this.divCanvas.appendChild(divXCaption);

        const divYCaption = this.assembleYAxesCaptionDomObject();
        if(!!divYCaption)
            this.divCanvas.appendChild(divYCaption);

        return this;
    }

    addCaseDots() {

        for(let idx = this.dataSet.length - 1; idx >=0; idx--) {

            let caseRecord = this.dataSet[idx];

            let id = createDomId();

            let divCase = this.assembleCaseDomObject(caseRecord, id);
            this.divCanvas.appendChild(divCase);
            
            let domHintContent = this.assembleCaseHintContent(caseRecord);
            let divHint = this.assembleHintDomObject(caseRecord, id, domHintContent);
            this.divCanvas.appendChild(divHint);
        }

        return this;
    }

    addInstanceDot() {

        let id = createDomId();

        let divInstance = this.assembleInstanceDomObject(this.instance, id);
        
        this.divCanvas.appendChild(divInstance);

        let domHintContent = this.assembleInstanceHintContent(this.instance);
        let divHint = this.assembleHintDomObject(this.instance, id, domHintContent);
        this.divCanvas.appendChild(divHint);

        return this;
    }

    updateTrend() {

        const a = this.trend.a;
        const b = this.trend.b;

        const xP1 = this.getMinX();
        const yP1 = a*xP1 + b;
        const xP2 = this.getMaxX();
        const yP2 = a*xP2 + b;

        const xP1C = this.getCanvasX(xP1);
        const yP1C = this.getCanvasY(yP1);

        const xP2C = this.getCanvasX(xP2);
        const yP2C = this.getCanvasY(yP2);
        
        this.divTrend.style.left = xP1C + "%";
        this.divTrend.style.top = Math.min(yP1C, yP2C) + "%";
        this.divTrend.style.width = (xP2C - xP1C) + "%";
        this.divTrend.style.height = Math.abs(yP2C - yP1C) + "%";

        return this;
    }

    addTrend() {

        this.divTrend = this.assembleTrendLineDomObject();
        
        this.divClipCanvas.appendChild(this.divTrend);
        this.updateTrend();
        
        return this;
    }
    
    updateCanvas() {

        this.assembleScales();

        this.cleanCanvas();

        this.addGrid()
            .addLabels()
            .addAxesCaptions()
            .addTrend()
            .addCaseDots()
            .addInstanceDot();

        return this;
    }

    assembleFrameDomObject() {

        const divFrame = document.createElement("div");

        divFrame.setAttribute("id", this.id);
        divFrame.classList.add(this.getFrameClassName());

        return divFrame;
    }

    handle__resize(e) {
        console.log("resize");
    }

    assembleDomObject() {

        this.divFrame = this.assembleFrameDomObject();
        
        this.divClipCanvas = this.assembleClipCanvasDomObject();
        this.divFrame.appendChild(this.divClipCanvas);

        this.divCanvas = this.assembleCanvasDomObject();
        this.divFrame.appendChild(this.divCanvas);

        const me = this;
        window.addEventListener("resize", e => {me.handle__resize()});
        
        return this.divFrame;
    }
}


class CompanyPriceGraph extends SimGraph {

    getCountryCodeColName() {
        return this.options["country_code_col_name"];
    }

    getCountryCode(caseRecord) {
        return caseRecord[this.getCountryCodeColName()];
    }

    getCountries() {
        return this.options["directory_viewer"].getDirectory("countries");
    }

    getCountryName(caseRecord) {
        const countryCode = this.getCountryCode(caseRecord);
        const countries = this.getCountries();
        return countries.find(c => c["country_code2"] === countryCode)["country_name"];
    }

    getIndustryCodeColName() {
        return this.options["industry_code_col_name"];
    }

    getIndustryCode(caseRecord) {
        return caseRecord[this.getIndustryCodeColName()];
    }

    getIndustries() {
        return this.options["directory_viewer"].getDirectory("industries");
    }

    getIndustryName(caseRecord) {
        const industryCode = this.getIndustryCode(caseRecord);
        const industries = this.getIndustries()
        return industries.find(i => i["industry_code"] === industryCode)["industry_name"];
    }

    getSpecializationCodeColName() {
        return this.options["specialization_code_col_name"];
    }

    getSpecializationCode(caseRecord) {
        return caseRecord[this.getSpecializationCodeColName()];
    }

    getSpecializations() {
        return this.options["directory_viewer"].getDirectory("specializations");
    }

    getSpecializationName(caseRecord) {
        const specCode = this.getSpecializationCode(caseRecord);
        const specs = this.getSpecializations();

        const spec = specs.find(s => s["specialization_code"] === specCode);

        return !!spec ? spec["specialization_name"] : "Misc.";
    }

    getProfile(caseRecord) {

        const industryName = this.getIndustryName(caseRecord);
        const specName = this.getSpecializationName(caseRecord);

        return `${industryName}/${specName}`;
    }

    getRevenueColName() {
        return this.options["x_col_name"];
    }

    getRevenue(caseRecord) {
        return caseRecord[this.getRevenueColName()];
    }

    getAcquirierName(caseRecord) {
        return caseRecord["acquirer_name"];
    }

    getPriceColName() {
        return this.options["y_col_name"];
    }

    getPrice(caseRecord) {
        return caseRecord[this.getPriceColName()];
    }

    getDealYear(caseRecord) {
        return caseRecord["acquired_in"];
    }

    getDeal(caseRecord) {

        const acquirier = this.getAcquirierName(caseRecord);
        const price = this.getPrice(caseRecord);
        const dealYear = this.getDealYear(caseRecord);

        return `Acquired by ${acquirier} for $M ${price} in ${dealYear}`; 
    }

    getFoundedIn(caseRecord) {
        return caseRecord["acquirer_founded_in"];
    }

    assembleCaseHintContent(caseRecord) {

        const divHintContent = document.createElement("div");

        const divName = document.createElement("div");

        const aName = document.createElement("a");
        aName.setAttribute("href", this.getLink(caseRecord));
        aName.setAttribute("target", "_new");
        aName.textContent = this.getName(caseRecord);
        divName.appendChild(aName);
        divName.appendChild(document.createTextNode(", " + this.getCountryName(caseRecord)));
        divName.appendChild(document.createTextNode(", " + this.getFoundedIn(caseRecord)));

        //const divCountry = document.createElement("div");
        //divCountry.textContent = this.getCountryName(caseRecord);

        const divProfile = document.createElement("div");
        divProfile.textContent = this.getProfile(caseRecord);

        const divRevenue = document.createElement("div");
        divRevenue.textContent = `Revenue, $M: ${this.getRevenue(caseRecord)}`;

        const divDeal = document.createElement("div");
        divDeal.textContent = this.getDeal(caseRecord);

        divHintContent.appendChild(divName);
        //divHintContent.appendChild(divCountry);
        divHintContent.appendChild(divProfile);
        divHintContent.appendChild(divRevenue);
        divHintContent.appendChild(divDeal);

        return divHintContent;
    }

}


/*
console.log("Debugging graphs");

const graph = new SimGraph(null, "divTestGraph");
console.log(graph.assembleDomObject());
document.getElementById("divTabGraphs").appendChild(graph.assembleDomObject());

graph.setOptions(
    {
        "grid_cells_x": 5,
        "grid_cells_y": 5,
        "x_decimals": 2,
        "y_decimals": 1,
        "x_caption": "Indetity, Gb",
        "y_caption": "Temperature, K"
    }
)

graph.setDataSet(
    [
        {"name": "Microsoft", "url": "http://www.microsoft.com", "x": 1.7, "y":  2, "dist": 100},
        {"name": "Oracle", "url": "http://www.oracle.com", "x": 2.4, "y":  5, "dist": 10},
        {"name": "SAP", "url": "http://www.sap.com", "x": 3.2, "y":  7, "dist": 25},
        {"name": "IBM", "url": "http://www.ibm.com", "x": 4.5, "y":  9, "dist": 46},
        {"name": "HP", "url": "http://www.hp.com", "x": 5,   "y": 11, "dist": 30}
    ]
);

graph.setInstance({"x": 4.5, "y":  4, "dist": 0});

graph.updateCanvas();
console.log(graph);
*/