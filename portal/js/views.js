
function hex2(c) {
    let hex = Math.round(c).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}


function rgbToCssColor(r, g, b) {
    return "#" + hex2(r) + hex2(g) + hex2(b);
}


function concScale(concentration) {
    return concentration;
}


function concentration2color(concentration) {
    return 255*(1 - concScale(concentration))
}


class View extends Worker {

    constructor(chief, workerTypeName="view") {

        super(chief, workerTypeName);

        this.outerHtmlElementName = "div";
        this.outerCssClassName = null;

        this.left = 0;
        this.top = 0;
        this.width = 0;
        this.height = 0;

        this.outerDomObject = null;
        this.innerDomObject = null;
    }

    addChildView(view) {

        this.addWorker(view);

        let outerDomObject = this.getOuterDomObject();
        if(!!outerDomObject)
            outerDomObject.appendChild(view.getOuterDomObject());
        
        return this;
    }

    setOuterHtmlElementName(htmlElementName) {
        this.outerHtmlElementName = htmlElementName;
        return this;
    }

    getOuterHtmlElementName() {
        return this.outerHtmlElementName;
    }

    setOuterCssClassName(cssClassName) {
        this.outerCssClassName = cssClassName;
        return this;
    }

    getOuterCssClassName() {
        return this.outerCssClassName;
    }

    getOuterDomObject() {
        return this.outerDomObject;
    }

    getInnerDomObject() {
        return this.innerDomObject;
    }

    assembleOuterDomObject() {
        
        let outerDomObject = document.createElement(this.getOuterHtmlElementName());
        
        outerDomObject.id = this.getId();
        
        let outerCssClassName = this.getOuterCssClassName();
        if(!!outerCssClassName)
            outerDomObject.className = outerCssClassName;
        
        return outerDomObject;
    }

    assembleInnerDomObject() {
        return null;
    }

    startBuildDom() {}

    finishBuildDom() {}

    buildChildViews() {}

    buildDom() {

        this.outerDomObject = this.assembleOuterDomObject();

        let innerDomObject = this.assembleInnerDomObject();

        if(!!innerDomObject) {
            this.innerDomObject = innerDomObject;
            this.outerDomObject.appendChild(innerDomObject);
        } else 
            this.innerDomObject = this.outerDomObject;

        this.startBuildDom();

        for(let childViewId of this.getWorkerIds()) {
            let childView = this.getWorkerById(childViewId);
            childView.buildDom();
            let childOuterDomObject = childView.getOuterDomObject();
            this.innerDomObject.appendChild(childOuterDomObject);
        }

        this.buildChildViews();
        
        this.finishBuildDom();
        
        return this;
    }

    setLeft(left) {
        this.left = left;
        this.getOuterDomObject().style.left = left + "px";
        return this;
    }

    setTop(top) {
        this.top = top;
        this.getOuterDomObject().style.top = top + "px";
        return this;
    }

    setHeight(height) {
        this.height = height;
        this.getOuterDomObject().style.height = height + "px";
        return this;
    }

    setWidth(width) {
        this.width = width;
        this.getOuterDomObject().style.width = width + "px";
        return this;
    }

    setHeight(height) {
        this.height = height;
        this.getOuterDomObject().style.height = height + "px";
        return this;
    }

    setBackgroundColor(cssColor) {
        this.getOuterDomObject().style.backgroundColor = cssColor;
        return this;
    }

    startUpdateDom() {}

    updateChildViews() {}

    finishUpdateDom() {}

    updateDom() {
        /*if(this.workers.length > 10)
            console.log(this.workers.length);
        if(this.getModel().isInvalid())
            console.log("Dead");*/

        this.startUpdateDom();

        this.updateChildViews();

        for(let childViewId of this.getWorkerIds())
            this.getWorkerById(childViewId).updateDom();

        this.finishUpdateDom();

        return this;
    }

    deleteDomObject() {
       this.getOuterDomObject().remove(); 
       return this;
    }

}


class ModelView extends View {

    constructor(chief, workerTypeName="modelView") {

        super(chief, workerTypeName);

        this.model = null;
        this.viewsByModelIds = {};
    }

    hasChildViewForModel(id) {
        return !!this.viewsByModelIds[id];
    }

    addChildView(view) {
        super.addChildView(view);
        this.viewsByModelIds[view.getModel().getId()] = view;
    }

    createChildModelView(childModel) {
        return null;
    }

    addChildModelView(childModel) {
        let childModelView = this.createChildModelView(childModel);
        if(!!childModelView)
            this.addChildView(childModelView.buildDom());
    }

    setModel(model) {

        this.model = model;
        for(let childModelId of model.getChildModelIds()) 
            this.addChildModelView(model.getWorkerById(childModelId));

        return this;
    }

    getModel() {
        return this.model;
    }

    updateChildViews() {

        let model = this.getModel();

        for(let childViewId of this.getWorkerIds()) {
            let view = this.getWorkerById(childViewId);
            let model = this.getWorkerById(childViewId).getModel();
            if(!model) {
                view.deleteDomObject();
                this.removeWorker(view);
            } else {
                if(model.isInvalid()) {
                    view.deleteDomObject();
                    this.removeWorker(view);
                }
            }
        }

        for(let childModelId of model.getChildModelIds()) 
            if(!this.hasChildViewForModel(childModelId))
                this.addChildModelView(model.getWorkerById(childModelId));
    }

}


class MushroomView extends ModelView {

    constructor(chief, workerTypeName="mushroomView") {
        super(chief, workerTypeName);
        this.setOuterCssClassName("mushroom");
    }

    getMushroom() {
        return this.getModel();
    }

    startBuildDom() {

        let mushroom = this.getMushroom();

        this.setLeft(mushroom.getX())
            .setTop(mushroom.getY());
    }

    startUpdateDom() {

        let mushroom = this.getMushroom();

        if(mushroom.getAge() <= 1) {
            this.setBackgroundColor(mushroom.isEgoist() ? "#ff007f" : "#00ff7f");
        } else {
            if(mushroom.getAge() == 10) {
                if(this.getIndex() < 3000)
                    this.setBackgroundColor(mushroom.isEgoist() ? "#950204" : "#177245");
                else 
                    this.deleteDomObject().goAway();
            } else 
                if(!!this.getOuterDomObject())
                    this.setLeft(mushroom.getX()).setTop(mushroom.getY());
        }
    }
}


class WaterView extends ModelView {

    constructor(chief, workerTypeName="waterView") {
        super(chief, workerTypeName);
        this.setOuterCssClassName("water");
    }

    getWater() {
        return this.getModel();
    }

    createChildModelView(childModel) {

        let childModelView = null;
        switch(childModel.getWorkerTypeName()) {
            case "mushroom": 
                childModelView = new MushroomView(this).setModel(childModel);
        }

        return childModelView;
    }

    getWaterColor() {

        let water = this.getWater();

        let b = concentration2color(water.getSucroseConcentration());
        let r = concentration2color(water.getGlucoseConcentration());
        let g = concentration2color(water.getFructoseConcentration());
        
        return rgbToCssColor(r, g, b);
    }

    startBuildDom() {

        let flask = this.getWater().getFlask();

        this.setWidth(flask.getWidth())
            .setHeight(flask.getHeight())
            .setBackgroundColor(this.getWaterColor());
    }

    startUpdateDom() {        
        this.setBackgroundColor(this.getWaterColor());
    }    

}


class FlaskView extends ModelView {
        
    constructor(chief, workerTypeName="flaskView") {
        super(chief, workerTypeName);
        this.setOuterCssClassName("flask");
     }

    getFlask() {
        return this.getModel();
    }

    xPx(x) {
        return x;
    }

    yPx(y) {
        return y;
    }

    createChildModelView(childModel) {  
        return new WaterView(this).setModel(childModel);
    }

    startBuildDom() {

        let flask = this.getFlask();

        //this.setWidth(this.xPx(flask.getWidth()))
        //    .setHeight(this.yPx(flask.getHeight()));
    }
    
    copyMeasurements() {
        navigator.clipboard.writeText(this.getFlask().getTsvMeasurements());       
    }

    copyTotals() {
        navigator.clipboard.writeText(this.getFlask().getTsvTotals());       
    }
}