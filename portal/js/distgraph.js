
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
            "x_col_name": "x",
            "y_col_name": "y",
            "name_col_name": "name",
            "link_col_name": "url",
            "dist_col_name": "dist",
            "canvas_xy_extension_koeff": 0.1,
            "case_hue": 285,
            "case_sat": 100,
            "instance_hue": 115,
            "instance_sat": 100,
            "dot_width": 6,
            "dot_height": 6,
            "grid_cells_x": 4,
            "grid_cells_y": 4,
            "x_decimals": 0,
            "y_decimals": 0,
            "record_class_name": "distGraphRecord",
            "hint_class_name": "distGraphHint",
            "grid_class_name": "distGraphGrid", 
            "canvas_class_name": "distGraphCanvas",
            "frame_class_name": "distGraphFrame",
            "instance_hint_wording": "You are here"
        }

        this.setOptions(defaultOptions);
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

    getDotWidth() {
        return this.options["dot_width"];
    }

    getDotHeight() {
        return this.options["dot_height"];
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

    getRecordClassName() {
        return this.options["record_class_name"];
    }

    getHintClassName() {
        return this.options["hint_class_name"];
    }

    getGridClassName() {
        return this.options["grid_class_name"];
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

    assembleInstanceColor(caseRecord) {

        const hue = this.getInstanceHue();
        const sat = this.getInstanceSaturation();
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

        if(!!hint)
            hint.style.display = "none";

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

    assembleRecordDomObject(caseRecord, hslColor, id) {

        const divCase = document.createElement("div");
        divCase.setAttribute("id", id + "dot");

        const left = 100*this.getCanvasX(this.getX(caseRecord));
        const leftExpr = `calc(${left}% - ${this.getDotWidth()/2}px)`;

        const top  = 100*this.getCanvasY(this.getY(caseRecord));
        const topExpr = `calc(${top}% - ${this.getDotHeight()/2}px)`;
        
        divCase.setAttribute("style", `left: ${leftExpr}; top: ${topExpr}; background: ${hslColor}`);
        
        divCase.classList.add(this.getRecordClassName());

        if(!!id) {
            const me = this;

            divCase.addEventListener("mouseover", function(e) {

                const caseDot = document.getElementById(id + "dot");

                me.hideActiveHint();

                const hint = document.getElementById(id + "hint");
                hint.style.display = "";
                hint.style.left = (caseDot.offsetLeft - hint.clientWidth) + "px";
                hint.style.top = (caseDot.offsetTop - hint.clientHeight) + "px";

                me.activeHint = hint;
            });
        }

        return divCase;
    }

    assembleCaseDomObject(caseRecord, id) {

        const hslColor = this.assembleCaseColor(caseRecord);

        return this.assembleRecordDomObject(caseRecord, hslColor, id);
    }

    assembleInstanceDomObject(instanceRecord, id) {

        const hslColor = this.assembleInstanceColor(instanceRecord);

        return this.assembleRecordDomObject(instanceRecord, hslColor, id);
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

    assembleCanvasDomObject() {

        const divCanvas = document.createElement("div");
        divCanvas.classList.add(this.getCanvasClassName());

        this.tableGrid = this.assembleGridDomObject();
        divCanvas.appendChild(this.tableGrid);
        
        const xLabels = this.assembleXLabels();
        for(const xlabel of xLabels)
            divCanvas.appendChild(xlabel);

        const yLabels = this.assembleYLabels();
        for(const yLabel of yLabels)
            divCanvas.appendChild(yLabel);

        const me = this;
        divCanvas.addEventListener("click", function(e) {
            if(e.target.tagName !== "A")
                me.hideActiveHint();
        });

        return divCanvas;
    }

    assembleFrameDomObject() {

        const divFrame = document.createElement("div");
        divFrame.setAttribute("id", this.id);
        divFrame.classList.add(this.getFrameClassName());

        this.divCanvas = this.assembleCanvasDomObject();
        divFrame.appendChild(this.divCanvas);

        return divFrame;
    }

    assembleDomObject() {

        this.divFrame = this.assembleFrameDomObject();

        for(const caseRecord of this.dataSet) {

            let id = createDomId();

            let divCase = this.assembleCaseDomObject(caseRecord, id);
            this.divCanvas.appendChild(divCase);
            
            let domHintContent = this.assembleCaseHintContent(caseRecord);
            let divHint = this.assembleHintDomObject(caseRecord, id, domHintContent);
            this.divCanvas.appendChild(divHint);
        }

        let id = createDomId();

        let divInstance = this.assembleInstanceDomObject(this.instance, id);
        this.divCanvas.appendChild(divInstance);

        let domHintContent = this.assembleInstanceHintContent(this.instance);
        let divHint = this.assembleHintDomObject(this.instance, id, domHintContent);
        this.divCanvas.appendChild(divHint);
        
        return this.divFrame;
    }

}

console.log("!!!");

const graph = new DistGraph(null, "divTestGraph");

graph.setOptions(
    {
        "grid_cells_x": 5,
        "grid_cells_y": 5,
        "x_decimals": 2,
        "y_decimals": 1
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

console.log(graph);

console.log(graph.assembleDomObject());

document.getElementById("divTabGraphs").appendChild(graph.assembleDomObject());