
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
            "canvas_xy_extension_koeff": 0.1,
            "dist_col_name": "dist",
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
            "grid_class_name": "distGraphGrid", 
            "canvas_class_name": "distGraphCanvas",
            "frame_class_name": "distGraphFrame"
        }

        this.setOptions(defaultOptions);
    }

    getXColName() {
        return this.options["x_col_name"];
    }

    getYColName() {
        return this.options["y_col_name"];
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

    getGridClassName() {
        return this.options["grid_class_name"];
    }

    getCanvasClassName() {
        return this.options["canvas_class_name"];
    }

    getFrameClassName() {
        return this.options["frame_class_name"];
    }

    // Case records

    getX(caseRecord) {
        return caseRecord[this.getXColName()];
    }

    getY(caseRecord) {
        return caseRecord[this.getYColName()];
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

    assembleRecordDomObject(caseRecord, hslColor) {

        const divCase = document.createElement("div");

        const left = 100*this.getCanvasX(this.getX(caseRecord));
        const leftExpr = `calc(${left}% - ${this.getDotWidth()/2}px)`;

        const top  = 100*this.getCanvasY(this.getY(caseRecord));
        const topExpr = `calc(${top}% - ${this.getDotHeight()/2}px)`;
        
        divCase.setAttribute("style", `left: ${leftExpr}; top: ${topExpr}; background: ${hslColor}`);
        
        divCase.classList.add(this.getRecordClassName());

        return divCase;
    }

    assembleCaseDomObject(caseRecord) {

        const hslColor = this.assembleCaseColor(caseRecord);

        return this.assembleRecordDomObject(caseRecord, hslColor);
    }

    assembleInstanceDomObject(instanceRecord) {

        const hslColor = this.assembleInstanceColor(instanceRecord);

        return this.assembleRecordDomObject(instanceRecord, hslColor);
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
            let divCase = this.assembleCaseDomObject(caseRecord);
            this.divCanvas.appendChild(divCase);
        }

        const divInstance = this.assembleInstanceDomObject(this.instance);
        this.divCanvas.appendChild(divInstance);

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
        {"x": 1.7, "y":  2, "dist": 100},
        {"x": 2.4, "y":  5, "dist": 10},
        {"x": 3.2, "y":  7, "dist": 25},
        {"x": 4.5, "y":  9, "dist": 46},
        {"x": 5,   "y": 11, "dist": 30}
    ]
);

graph.setInstance({"x": 4.5, "y":  4, "dist": 0});

console.log(graph);

console.log(graph.assembleDomObject());

document.getElementById("divTabGraphs").appendChild(graph.assembleDomObject());