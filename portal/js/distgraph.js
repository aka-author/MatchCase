
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
            "canvas_width": 500,
            "canvas_height": 200,
            "x_col_name": "x",
            "y_col_name": "y",
            "dist_col_name": "dist",
            "case_hue": 285,
            "case_sat": 100,
            "case_sat": 115,
            "instance_sat": 100,
            "grid_cells_x": 4,
            "grid_cells_y": 4,
            "table_grid_class_name": "distGraphGrid", 
            "record_class_name": "distGraphRecord"
        }

        this.setOptions(defaultOptions);
    }

    getCanvasWidth() {
        return this.options["canvas_width"];
    }

    getCanvasHeight() {
        return this.options["canvas_height"];
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

    getGridCellsX() {
        return this.options["grid_cells_x"];
    }

    getGridCellsY() {
        return this.options["grid_cells_y"];
    }

    getTableGridClassName() {
        return this.options["table_grid_class_name"];
    }

    getRecordClassName() {
        return this.options["record_class_name"];
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
        console.log(this.getY(caseRecord), this.getYSpan());
        return this.getY(caseRecord)/this.getYSpan();
    }

    getNormalDist(caseRecord) {
        return this.getDist(caseRecord)/this.getMaxDist();
    }

    // Formatting

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

        let divCase = document.createElement("div");

        let left = (this.getNormalX(caseRecord)*this.getCanvasWidth()).toString() + "px";
        let top = (this.getCanvasHeight() - this.getNormalY(caseRecord)*this.getCanvasHeight()).toString() + "px";

        divCase.setAttribute("style", `left: ${left}; top: ${top}; background: ${hslColor}`);

        //divCase.style.background = hslColor;
        //divCase.style.left = this.getNormalX(caseRecord)*100 + "px";
        //divCase.style.top = this.getNormalY(caseRecord)*100 + "px";

        //console.log("::", divCase.style.top);
        
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

    assembleGridDomObject() {

        const tableGrid = document.createElement("table");
        tableGrid.classList.add(this.getTableGridClassName());
        
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

    assembleDomObject() {

        const divCanvas = document.createElement("div");
        divCanvas.setAttribute("id", this.id);
        divCanvas.setAttribute("style", `width ${this.getCanvasWidth()}px; height: ${this.getCanvasHeight()}px`)

        const tableGrid = this.assembleGridDomObject();
        divCanvas.appendChild(tableGrid);

        for(const caseRecord of this.dataSet) {
            let divCase = this.assembleCaseDomObject(caseRecord);
            divCanvas.appendChild(divCase);
        }

        const divInstance = this.assembleInstanceDomObject(this.instance);
        divCanvas.appendChild(divInstance);

        return divCanvas;
    }

    

}

console.log("!!!");

const graph = new DistGraph(null, "divTestGraph");

graph.setDataSet(
    [
        {"x": 1, "y":  2, "dist": 100},
        {"x": 2, "y":  5, "dist": 10},
        {"x": 3, "y":  7, "dist": 25},
        {"x": 4, "y":  9, "dist": 46},
        {"x": 5, "y": 11, "dist": 30}
    ]
);

graph.setInstance({"x": 4.5, "y":  4, "dist": 0});

console.log(graph);

console.log(graph.assembleDomObject());

document.getElementById("divTabGraphs").appendChild(graph.assembleDomObject());