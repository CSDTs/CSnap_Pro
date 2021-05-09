// Tutorial CSDT
StageMorph.prototype.tutorial = false;
StageMorph.prototype.hideCostumesTab = false;
StageMorph.prototype.hideSoundsTab = false;
StageMorph.prototype.decategorize = false;
StageMorph.prototype.changeBlocks = false;
StageMorph.prototype.enableGlide = false;
StageMorph.prototype.basicLayout = false;

IDE_Morph.prototype.testTutorialLayout = function () {
    // StageMorph.prototype.tutorial = !StageMorph.prototype.tutorial;
    this.createControlBar();
    this.createCategories();
    this.createPalette();
    // this.createStage();
    this.createSpriteBar();
    this.createSpriteEditor();
    this.createCorralBar();
    this.createCorral();

    this.fixLayout();

    return this.stage.tutorial;
}


IDE_Morph.prototype.setCostumeTabVisibility = function(bool) {
    StageMorph.prototype.showCostumesTab = bool;
}

IDE_Morph.prototype.setCategoriesVisibility = function(bool){
    StageMorph.prototype.decategorize = bool;
}

IDE_Morph.prototype.setBasicWorkbookLayout = function(bool){
    StageMorph.prototype.basicLayout = bool;
}

IDE_Morph.prototype.renderTutorialLayout = function(){
    this.createControlBar();
    this.createCategories();
    this.createPalette();
    // this.createStage();
    this.createSpriteBar();
    this.createSpriteEditor();
    this.createCorralBar();
    this.createCorral();

    this.fixLayout();

   if(StageMorph.prototype.basicLayout || StageMorph.prototype.decategorize)this.toggleStageSize();

}

IDE_Morph.prototype.getCurrentScript = function(){

}

IDE_Morph.prototype.loadTutorial = function (xml, changeBlocks) {
    this.disableBackup = changeBlocks;
    this.initialScaleSize = 0.7;
    this.droppedText(xml);
};

IDE_Morph.prototype.loadWorkbookFile = function(xml){
    this.setBasicWorkbookLayout(true);
    this.initialScaleSize = 0.6;
    IDE_Morph.prototype.isSmallStage = true;
    // this.renderBlocks = false;
    ScriptsMorph.prototype.enableKeyboard = false;

    this.droppedText(xml);
    // this.toggleStageSize();
    // this.renderTutorialLayout();
}

IDE_Morph.prototype.hideBlocks= function(tutBlocks){

    let currentBlocks = this.palette.contents.children;

    let hiddenBlocks = currentBlocks.filter(block => tutBlocks.includes(block.selector));
    hiddenBlocks.map(block => block.hidePrimitive());
    setTimeout(function(){ hiddenBlocks.map(block => block.showPrimitive()); console.log(StageMorph.prototype.hiddenPrimitives);}, 3000);

}


IDE_Morph.prototype.backup = function (callback) {
    // in case of unsaved changes let the user confirm whether to
    // abort the operation or go ahead with it.
    // Save the current project for the currently logged in user
    // to localstorage, then perform the given callback, e.g.
    // load a new project.


    if (this.hasUnsavedEdits && this.disableBackup) {
        this.confirm(
            'Replace the current project with a new one?',
            'Unsaved Changes!',
            () => this.backupAndDo(callback)
        );
    } else {
        callback();
    }
};