
function fallback(explicitValue, defaultValue) {
    return !!explicitValue ? explicitValue : defaultValue;
}

class DistGraph extends Worker {

    constructor(chief, id) {

        super(chief);

        this.id = id;

        this.minX = undefined;
        this.maxX = undefined;
        this.minY = undefined;
        this.maxY = undefined;

        this.maxDist = undefined;

        this.options = {};
        this.setDefaultOptions();

        this.activeHint = null;
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
            "link_col_name": "url",
            "dist_col_name": "dist",
            "canvas_xy_extension_koeff": 0.1,
            "case_hue": 285,
            "case_sat": 100,
            "grid_cells_x": 4,
            "grid_cells_y": 4,
            "x_decimals": 0,
            "y_decimals": 0,
            "hint_offset": 2,
            "hint_show_timeout": 500,
            "record_class_name": "distGraphRecord",
            "instance_class_name": "distGraphInstance",
            "hint_class_name": "distGraphHint",
            "grid_class_name": "distGraphGrid", 
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

    getDistColName() {
        return this.options["dist_col_name"];
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

    getGridCellsX() {
        return this.options["grid_cells_x"];
    }

    getGridCellsY() {
        return this.options["grid_cells_y"];
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

    getDist(caseRecord) {
        return caseRecord[this.getDistColName()];
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

    detectMaxDist() {
        return this.getMaxCol(this.getDistColName());
    }

    detectMinMax() {

        this.minX = this.detectMinX();
        this.maxX = this.detectMaxX();
        this.minY = this.detectMinY();
        this.maxY = this.detectMaxY();
        
        this.maxDist = this.detectMaxDist();

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

    getMaxDist() {
        return this.maxDist;
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

    // Calculations
    
    getXSpan() {
        return this.getMaxX() - this.getMinX();
    }

    getYSpan() {
        return this.getMaxY() - this.getMinY();
    }

    getNormalX(caseRecord) {
        
        return this.getX(caseRecord)/this.getXSpan();
    }

    getNormalY(caseRecord) {
        return this.getY(caseRecord)/this.getYSpan();
    }

    getNormalDist(caseRecord) {
        return this.getDist(caseRecord)/this.getMaxDist();
    }

    // Formatting

    getCanvasXExtension() {
        return this.getXSpan()*this.getCanvasXYExtensionKoeff();
    }

    getCanvasYExtension() {
        return this.getYSpan()*this.getCanvasXYExtensionKoeff();
    }

    getCanvasMinX() {
        return Math.floor(this.getMinX() - this.getCanvasXExtension());
    }

    getCanvasMaxX() {
        return Math.ceil(this.getMaxX() + this.getCanvasXExtension());
    }

    getCanvasMinY() {
        return Math.floor(this.getMinY() - this.getCanvasYExtension());
    }

    getCanvasMaxY() {
        return Math.ceil(this.getMaxY() + this.getCanvasYExtension());
    }

    getCanvasXSpan() {
        return this.getCanvasMaxX() - this.getCanvasMinX();
    }

    getCanvasYSpan() {
        return this.getCanvasMaxY() - this.getCanvasMinY();
    }

    getCanvasX(x) {
        return (x - this.getCanvasMinX())/this.getCanvasXSpan();
    }

    getCanvasY(y) {
        return 1 - (y - this.getCanvasMinY())/this.getCanvasYSpan();
    }

    calcLum(normalDist) {
        return 25 + normalDist*50;
    }

    assembleHslColor(hue, sat, lum) {
        return `hsl(${hue}, ${sat}%, ${lum}%)`;
    }

    assembleCaseColor(caseRecord) {

        const hue = this.getCaseHue();
        const sat = this.getCaseSaturation();
        const lum = this.calcLum(this.getNormalDist(caseRecord));

        return this.assembleHslColor(hue, sat, lum);
    }

    assembleCaseHintContent(caseRecord) {

        const divName = document.createElement("div");

        const aName = document.createElement("a");
        aName.setAttribute("href", this.getLink(caseRecord));
        aName.setAttribute("target", "_new");
        aName.textContent = this.getName(caseRecord);
        divName.appendChild(aName);

        return divName;
    }

    assembleInstanceHintContent(caseRecord) {

        const divName = document.createElement("div");    
        divName.textContent = this.getInstanceHintWording();

        return divName;
    }

    getActiveHint() {
        return this.activeHint; 
    }

    hideActiveHint() {

        const hint = this.getActiveHint();

        if(!!hint) {
            hint.style.display = "none";
            hint.style.zIndex = 0;
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

        const left = 100*this.getCanvasX(this.getX(caseRecord));
        const top  = 100*this.getCanvasY(this.getY(caseRecord));
        let strStyle = `left: ${left}%; top: ${top}%;`;
        strStyle += !!hslColor ? ` background: ${hslColor};` : "";
        divCase.setAttribute("style", strStyle);
        
        divCase.classList.add(this.getRecordClassName());

        if(!!id) {

            const me = this;

            divCase.addEventListener("mouseout", function(e) {
                me.setWaitingForHintFlag(false);
            });

            divCase.addEventListener("mouseover", function(e) {

                me.setWaitingForHintFlag();

                setTimeout(

                    function() {

                        if(me.isWaitingForHint()) {

                            const caseDot = document.getElementById(id + "dot");

                            me.hideActiveHint();

                            const hint = document.getElementById(id + "hint");
                            hint.style.display = "";
                            hint.style.zIndex = 100000;

                            const ofs = me.getHintOffset();
                            hint.style.left = (caseDot.offsetLeft - caseDot.clientWidth/2 - hint.clientWidth - ofs) + "px";
                            hint.style.top  = (caseDot.offsetTop - caseDot.clientHeight/2 - hint.clientHeight - ofs) + "px";

                            me.activeHint = hint;
                        } 
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

    assembleXLabels() {

        const xLabels = [];

        const span = 100/this.getGridCellsX();
        const xSpan = this.getCanvasXSpan()/this.getGridCellsX(); 
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
        let ySpan = this.getCanvasYSpan()/this.getGridCellsY();
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

    assembleCanvasDomObject() {

        const divCanvas = document.createElement("div");
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

        for(const caseRecord of this.dataSet) {

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

    updateCanvas() {

        this.cleanCanvas();

        this.addGrid()
            .addLabels()
            .addAxesCaptions()
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

    assembleDomObject() {

        this.divFrame = this.assembleFrameDomObject();
        
        this.divCanvas = this.assembleCanvasDomObject();
        this.divFrame.appendChild(this.divCanvas);
        
        return this.divFrame;
    }
}

/*
console.log("Debugging graphs");

const graph = new DistGraph(null, "divTestGraph");
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