/*
    csdt.js

    override functions based on gui.js, objects.js, and store.js

    Author: Andrew Hunn (ahunn@umich.edu)

    This file overrides Snap functions, applying our changes to the software.

    Current list of major changes (4/13/21): 

*/

// Adds indicator for projects that they are the new 'csnap pro' projects.
SnapSerializer.prototype.app = 'CSnap! Pro, http://csdt.org';

// Appending asset path for resources (pictures, music, etc..)
IDE_Morph.prototype.resourceURL = function () {
    // Take in variadic inputs that represent an a nested folder structure.
    // Method can be easily overridden if running in a custom location.
    // Default Snap! simply returns a path (relative to snap.html)
    var args = Array.prototype.slice.call(arguments, 0);
    return this.asset_path + args.join('/');
};

// Override for environment
IDE_Morph.prototype.init = function (isAutoFill) {
    // global font setting
    MorphicPreferences.globalFontFamily = 'Helvetica, Arial';

    // restore saved user preferences
    this.userLanguage = null; // user language preference for startup
    this.projectsInURLs = false;
    this.applySavedSettings();

    //Overriding cloud with ours.
    this.cloud = new CSDTCloud();
    this.initializeCloud();
    this.cloudMsg = null;
    this.source = null;
    this.serializer = new SnapSerializer();

    // Applying correct asset path for projects
    this.asset_path = '/';

    this.globalVariables = new VariableFrame();
    this.currentSprite = new SpriteMorph(this.globalVariables);
    this.sprites = new List([this.currentSprite]);
    this.currentCategory = 'motion';
    this.currentTab = 'scripts';
    this.projectName = '';
    this.projectNotes = '';

    this.trash = []; // deleted sprites

    // logoURL is disabled because the image data is hard-copied
    // to avoid tainting the world canvas
    // this.logoURL = this.resourceURL('src', 'snap_logo_sm.png');

    this.logo = null;
    this.controlBar = null;
    this.categories = null;
    this.palette = null;
    this.paletteHandle = null;
    this.spriteBar = null;
    this.spriteEditor = null;
    this.stage = null;
    this.stageHandle = null;
    this.corralBar = null;
    this.corral = null;

    this.embedPlayButton = null;
    this.embedOverlay = null;
    this.isEmbedMode = false;

    this.isAutoFill = isAutoFill === undefined ? true : isAutoFill;
    this.isAppMode = false;
    this.isSmallStage = false;
    this.filePicker = null;

    // incrementally saving projects to the cloud is currently unused
    this.hasChangedMedia = false;

    this.hasUnsavedEdits = false; // keeping track of when to internally backup

    this.isAnimating = true;
    this.paletteWidth = 200; // initially same as logo width
    this.stageRatio = 1; // for IDE animations, e.g. when zooming

    this.wasSingleStepping = false; // for toggling to and from app mode

    this.loadNewProject = false; // flag when starting up translated
    this.shield = null;

    this.savingPreferences = true; // for bh's infamous "Eisenbergification"

    // initialize inherited properties:
    IDE_Morph.uber.init.call(this);

    // override inherited properites:
    this.color = this.backgroundColor;

    //CSDT Set Stage Scale (for tutorials and such)
    this.initialScaleSize = 1;

    //CSDT Manuplicate Components for Tutorials and Workbooks
    this.hideCorralBar = false;
    this.hideCloudBtn = false;
    this.hideFileBtn = false;
    this.hideControlBtns = false;
    this.hideSpriteBar = false;
    this.hideCamera = true;
    this.renderBlocks = true;
    this.renderKeyboardButton = true;


};

// Override for sprites
SpriteMorph.prototype.init = function (globals) {
    this.name = localize('Sprite');
    this.variables = new VariableFrame(globals || null, this);
    this.scripts = new ScriptsMorph();
    this.customBlocks = [];
    this.costumes = new List();
    this.costumes.type = 'costume';
    this.costume = null;
    this.sounds = new List();
    this.sounds.type = 'sound';
    this.normalExtent = new Point(60, 60); // only for costume-less situation
    this.scale = 1;
    this.rotationStyle = 1; // 1 = full, 2 = left/right, 0 = off
    this.instrument = null;
    this.version = Date.now(); // for observer optimization
    this.isTemporary = false; // indicate a temporary Scratch-style clone
    this.isCorpse = false; // indicate whether a sprite/clone has been deleted
    this.cloneOriginName = '';

    // volume and stereo-pan support, experimental:
    this.volume = 100;
    this.gainNode = null; // must be lazily initialized in Chrome, sigh...
    this.pan = 0;
    this.pannerNode = null; // must be lazily initialized in Chrome, sigh...

    // frequency player, experimental
    this.freqPlayer = null; // Note, to be lazily initialized

    // pen hsv color support
    this.cachedHSV = [0, 0, 0]; // not serialized

    // only temporarily for serialization
    this.inheritedMethodsCache = [];

    // sprite nesting properties
    this.parts = []; // not serialized, only anchor (name)
    this.anchor = null;
    this.nestingScale = 1;
    this.rotatesWithAnchor = true;
    this.layers = null; // cache for dragging nested sprites, don't serialize

    this.blocksCache = {}; // not to be serialized (!)
    this.paletteCache = {}; // not to be serialized (!)
    this.rotationOffset = ZERO; // not to be serialized (!)
    this.idx = 0; // not to be serialized (!) - used for de-serialization

    this.graphicsValues = {
        'color': 0,
        'fisheye': 0,
        'whirl': 0,
        'pixelate': 0,
        'mosaic': 0,
        'duplicate': 0,
        'negative': 0,
        'comic': 0,
        'confetti': 0,
        'saturation': 0,
        'brightness': 0
    };

    // sprite inheritance
    this.exemplar = null;
    this.instances = [];
    this.cachedPropagation = false; // not to be persisted
    this.inheritedAttributes = []; // 'x position', 'direction', 'size' etc...

    // video- and rendering state
    this.imageExtent = ZERO;
    this.imageOffset = ZERO;
    this.imageData = {}; // version: date, pixels: Uint32Array
    this.motionAmount = 0;
    this.motionDirection = 0;
    this.frameNumber = 0;

    SpriteMorph.uber.init.call(this);

    this.isCachingImage = true;
    this.isFreeForm = true;
    this.cachedHSV = this.color.hsv();
    this.isDraggable = true;
    this.isDown = false;
    this.heading = 90;
    this.fixLayout();
    this.rerender();

    // CSDT
    this.originalPixels = null;
    this.hasSaturation = false;
    this.hasBrightness = false;
    // this.flippedX = false;
    // this.flippedY = false;
    // this.isNotFlipBack = true;

    this.borderColor = new Color(255, 0, 0);
    this.borderSize = 0;
    this.normalExtent = new Point(60, 60); // only for costume-less situation
    this.lineList = []; //For borders
};







/** Tutorials
 * 
 * Everything that is tutorial related can be found here..
 */



StageMorph.prototype.tutorial = false;
StageMorph.prototype.hideCostumesTab = false;
StageMorph.prototype.hideSoundsTab = false;
StageMorph.prototype.decategorize = false;
StageMorph.prototype.changeBlocks = false;
StageMorph.prototype.enableGlide = false;

IDE_Morph.prototype.setCategoriesVisibility = function (bool) {
    StageMorph.prototype.decategorize = bool;
};

IDE_Morph.prototype.setCostumeTabVisibility = function (bool) {
    StageMorph.prototype.showCostumesTab = bool;
};

IDE_Morph.prototype.loadTutorial = function (xml) {
    this.initialScaleSize = 0.7;
    this.droppedText(xml);
};

IDE_Morph.prototype.loadWorkbookFile = function (xml) {
    this.initialScaleSize = 0.7;
    this.renderBlocks = false;
    ScriptsMorph.prototype.enableKeyboard = false;
    this.droppedText(xml);
};

IDE_Morph.prototype.hideBlocks = function (tutBlocks) {

    let currentBlocks = this.palette.contents.children;

    let hiddenBlocks = currentBlocks.filter(block => tutBlocks.includes(block.selector));
    hiddenBlocks.map(block => block.hidePrimitive());

    setTimeout(function () {
        hiddenBlocks.map(block => block.showPrimitive());
    }, 3000);

};

IDE_Morph.prototype.renderTutorialLayout = function () {
    this.createControlBar();
    this.createCategories();
    this.createPalette();
    this.createSpriteBar();
    this.createSpriteEditor();
    this.createCorralBar();
    this.createCorral();
    this.fixLayout();
};

// Overrides palette with tutorial functionaliity (objects.js)
SpriteMorph.prototype.freshPalette = function (category) {

    // Quick fix for tutorials (showing custom pen blocks by default)
    if (StageMorph.prototype.decategorize) {
        category = 'pen';
    }

    var palette = new ScrollFrameMorph(null, null, this.sliderColor),
        unit = SyntaxElementMorph.prototype.fontSize,
        x = 0,
        y = 5,
        ry = 0,
        blocks,
        hideNextSpace = false,
        stage = this.parentThatIsA(StageMorph),
        shade = new Color(140, 140, 140),
        searchButton,
        makeButton;

    palette.owner = this;
    palette.padding = unit / 2;
    palette.color = this.paletteColor;
    palette.growth = new Point(0, MorphicPreferences.scrollBarSize);

    // toolbar:

    palette.toolBar = new AlignmentMorph('column');

    searchButton = new PushButtonMorph(
        this,
        "searchBlocks",
        new SymbolMorph("magnifierOutline", 16)
    );
    searchButton.alpha = 0.2;
    searchButton.padding = 1;
    searchButton.hint = localize('find blocks') + '...';
    searchButton.labelShadowColor = shade;
    searchButton.edge = 0;
    searchButton.padding = 3;
    searchButton.fixLayout();
    palette.toolBar.add(searchButton);

    makeButton = new PushButtonMorph(
        this,
        "makeBlock",
        new SymbolMorph("cross", 16)
    );
    makeButton.alpha = 0.2;
    makeButton.padding = 1;
    makeButton.hint = localize('Make a block') + '...';
    makeButton.labelShadowColor = shade;
    makeButton.edge = 0;
    makeButton.padding = 3;
    makeButton.fixLayout();
    palette.toolBar.add(makeButton);

    palette.toolBar.fixLayout();
    palette.add(palette.toolBar);

    // menu:
    palette.userMenu = function () {
        var menu = new MenuMorph(),
            ide = this.parentThatIsA(IDE_Morph),
            more = {
                operators: ['reifyScript', 'reifyReporter', 'reifyPredicate'],
                control: ['doWarp'],
                variables: [
                    'doDeclareVariables',
                    'reportNewList',
                    'reportNumbers',
                    'reportCONS',
                    'reportListItem',
                    'reportCDR',
                    'reportListAttribute',
                    'reportListIndex',
                    'reportConcatenatedLists',
                    'reportReshape',
                    'reportListContainsItem',
                    'reportListIsEmpty',
                    'doForEach',
                    'reportMap',
                    'reportKeep',
                    'reportFindFirst',
                    'reportCombine',
                    'doAddToList',
                    'doDeleteFromList',
                    'doInsertInList',
                    'doReplaceInList'
                ]
            };

        function hasHiddenPrimitives() {
            var defs = SpriteMorph.prototype.blocks,
                hiddens = StageMorph.prototype.hiddenPrimitives;
            return Object.keys(hiddens).some(any =>
                !isNil(defs[any]) &&
                (defs[any].category === category ||
                    contains((more[category] || []), any))
            );
        }

        function canHidePrimitives() {
            return palette.contents.children.some(any =>
                contains(
                    Object.keys(SpriteMorph.prototype.blocks),
                    any.selector
                )
            );
        }

        menu.addPair(
            [
                new SymbolMorph(
                    'magnifyingGlass',
                    MorphicPreferences.menuFontSize
                ),
                localize('find blocks') + '...'
            ],
            () => this.searchBlocks(),
            '^F'
        );
        if (canHidePrimitives()) {
            menu.addItem(
                'hide primitives',
                function () {
                    var defs = SpriteMorph.prototype.blocks;
                    Object.keys(defs).forEach(sel => {
                        if (defs[sel].category === category) {
                            StageMorph.prototype.hiddenPrimitives[sel] = true;
                        }
                    });
                    (more[category] || []).forEach(sel =>
                        StageMorph.prototype.hiddenPrimitives[sel] = true
                    );
                    ide.flushBlocksCache(category);
                    ide.refreshPalette();
                }
            );
        }
        if (hasHiddenPrimitives()) {
            menu.addItem(
                'show primitives',
                function () {
                    var hiddens = StageMorph.prototype.hiddenPrimitives,
                        defs = SpriteMorph.prototype.blocks;
                    Object.keys(hiddens).forEach(sel => {
                        if (defs[sel] && (defs[sel].category === category)) {
                            delete StageMorph.prototype.hiddenPrimitives[sel];
                        }
                    });
                    (more[category] || []).forEach(sel =>
                        delete StageMorph.prototype.hiddenPrimitives[sel]
                    );
                    ide.flushBlocksCache(category);
                    ide.refreshPalette();
                }
            );
        }
        return menu;
    };

    // primitives:

    blocks = this.blocksCache[category];
    if (!blocks) {
        blocks = this.blockTemplates(category);
        if (this.isCachingPrimitives) {
            this.blocksCache[category] = blocks;
        }
    }

    blocks.forEach(block => {
        if (block === null) {
            return;
        }
        if (block === '-') {
            if (hideNextSpace) {
                return;
            }
            y += unit * 0.8;
            hideNextSpace = true;
        } else if (block === '=') {
            if (hideNextSpace) {
                return;
            }
            y += unit * 1.6;
            hideNextSpace = true;
        } else if (block === '#') {
            x = 0;
            y = ry;
        } else {
            hideNextSpace = false;
            if (x === 0) {
                y += unit * 0.3;
            }
            block.setPosition(new Point(x, y));
            palette.addContents(block);
            if (block instanceof ToggleMorph ||
                (block instanceof RingMorph)) {
                x = block.right() + unit / 2;
                ry = block.bottom();
            } else {
                x = 0;
                y += block.height();
            }
        }
    });

    // global custom blocks:

    if (stage) {
        y += unit * 1.6;

        stage.globalBlocks.forEach(definition => {
            var block;
            if (definition.category === category || (StageMorph.prototype.decategorize ? definition.category === 'looks' : '') ||
                (category === 'variables' &&
                    contains(
                        ['lists', 'other'],
                        definition.category
                    ))) {
                block = definition.templateInstance();
                y += unit * 0.3;
                block.setPosition(new Point(x, y));

                // Render blocks based on parent (tutorial)
                if (stage.parent.renderBlocks) {
                    palette.addContents(block);
                }
                x = 0;
                y += block.height();
            }
        });
    }

    // local custom blocks:

    y += unit * 1.6;
    this.customBlocks.forEach(definition => {
        var block;
        if (definition.category === category ||
            (category === 'variables' &&
                contains(
                    ['lists', 'other'],
                    definition.category
                ))) {
            block = definition.templateInstance();
            y += unit * 0.3;
            block.setPosition(new Point(x, y));
            palette.addContents(block);
            x = 0;
            y += block.height();
        }
    });

    // inherited custom blocks:

    // y += unit * 1.6;
    if (this.exemplar) {
        this.inheritedBlocks(true).forEach(definition => {
            var block;
            if (definition.category === category ||
                (category === 'variables' &&
                    contains(
                        ['lists', 'other'],
                        definition.category
                    ))) {
                block = definition.templateInstance();
                y += unit * 0.3;
                block.setPosition(new Point(x, y));
                palette.addContents(block);
                block.ghost();
                x = 0;
                y += block.height();
            }
        });
    }

    //layout

    palette.scrollX(palette.padding);
    palette.scrollY(palette.padding);
    return palette;
};

// Overrides the corral (the area below the stage and bar)
IDE_Morph.prototype.createCorral = function () {
    // assumes the corral bar has already been created
    var frame, padding = 5,
        myself = this;

    this.createStageHandle();
    this.createPaletteHandle();

    if (this.corral) {
        this.corral.destroy();
    }

    this.corral = new Morph();
    this.corral.color = this.groupColor;
    this.corral.getRenderColor = ScriptsMorph.prototype.getRenderColor;

    this.add(this.corral);

    this.corral.stageIcon = new SpriteIconMorph(this.stage);
    this.corral.stageIcon.isDraggable = false;

    // Hide stage icon for tutorials
    if (!IDE_Morph.prototype.hideCorralBar) {
        this.corral.add(this.corral.stageIcon);
    }

    frame = new ScrollFrameMorph(null, null, this.sliderColor);
    frame.acceptsDrops = false;
    frame.contents.acceptsDrops = false;

    frame.contents.wantsDropOf = (morph) => morph instanceof SpriteIconMorph;

    frame.contents.reactToDropOf = (spriteIcon) =>
        this.corral.reactToDropOf(spriteIcon);

    frame.alpha = 0;

    this.sprites.asArray().forEach(morph => {
        if (!morph.isTemporary) {
            frame.contents.add(new SpriteIconMorph(morph));
        }
    });

    this.corral.frame = frame;

    // Hide frame icon for tutorials
    if (!IDE_Morph.prototype.hideCorralBar) {
        this.corral.add(frame);
    }

    this.corral.fixLayout = function () {
        this.stageIcon.setCenter(this.center());
        this.stageIcon.setLeft(this.left() + padding);
        this.frame.setLeft(this.stageIcon.right() + padding);
        this.frame.setExtent(new Point(
            this.right() - this.frame.left(),
            this.height()
        ));
        this.arrangeIcons();
        this.refresh();
    };

    this.corral.arrangeIcons = function () {
        var x = this.frame.left(),
            y = this.frame.top(),
            max = this.frame.right(),
            start = this.frame.left();

        this.frame.contents.children.forEach(icon => {
            var w = icon.width();

            if (x + w > max) {
                x = start;
                y += icon.height(); // they're all the same
            }
            icon.setPosition(new Point(x, y));
            x += w;
        });
        this.frame.contents.adjustBounds();
    };

    this.corral.addSprite = function (sprite) {
        this.frame.contents.add(new SpriteIconMorph(sprite));
        this.fixLayout();
        myself.recordUnsavedChanges();
    };

    this.corral.refresh = function () {
        this.stageIcon.refresh();
        this.frame.contents.children.forEach(icon =>
            icon.refresh()
        );
    };

    this.corral.wantsDropOf = (morph) => morph instanceof SpriteIconMorph;

    this.corral.reactToDropOf = function (spriteIcon) {
        var idx = 1,
            pos = spriteIcon.position();
        spriteIcon.destroy();
        this.frame.contents.children.forEach(icon => {
            if (pos.gt(icon.position()) || pos.y > icon.bottom()) {
                idx += 1;
            }
        });
        myself.sprites.add(spriteIcon.object, idx);
        myself.createCorral();
        myself.fixLayout();
    };
};

// Overrides the corral bar(the area below the stage and above the corral)
IDE_Morph.prototype.createCorralBar = function () {
    // assumes the stage has already been created
    var padding = 5,
        newbutton,
        paintbutton,
        cambutton,
        trashbutton,
        myself = this,
        colors = MorphicPreferences.isFlat ? this.tabColors : [
            this.groupColor,
            this.frameColor.darker(50),
            this.frameColor.darker(50)
        ];

    if (this.corralBar) {
        this.corralBar.destroy();
    }

    this.corralBar = new Morph();
    this.corralBar.color = this.frameColor;
    this.corralBar.setHeight(this.logo.height()); // height is fixed
    this.corralBar.setWidth(this.stage.width());
    this.add(this.corralBar);

    // new sprite button
    newbutton = new PushButtonMorph(
        this,
        "addNewSprite",
        new SymbolMorph("turtle", 14)
    );
    newbutton.corner = 12;
    newbutton.color = colors[0];
    newbutton.highlightColor = colors[1];
    newbutton.pressColor = colors[2];
    newbutton.labelMinExtent = new Point(36, 18);
    newbutton.padding = 0;
    newbutton.labelShadowOffset = new Point(-1, -1);
    newbutton.labelShadowColor = colors[1];
    newbutton.labelColor = this.buttonLabelColor;
    newbutton.contrast = this.buttonContrast;
    newbutton.hint = "add a new Turtle sprite";
    newbutton.fixLayout();
    newbutton.setCenter(this.corralBar.center());
    newbutton.setLeft(this.corralBar.left() + padding);
    newbutton.setLeft(this.corralBar.left() + padding);

    // Hides the turtle from the corral bar (for tutorials)
    if (!IDE_Morph.prototype.hideCorralBar) {
        this.corralBar.add(newbutton);
    }

    paintbutton = new PushButtonMorph(
        this,
        "paintNewSprite",
        new SymbolMorph("brush", 15)
    );
    paintbutton.corner = 12;
    paintbutton.color = colors[0];
    paintbutton.highlightColor = colors[1];
    paintbutton.pressColor = colors[2];
    paintbutton.labelMinExtent = new Point(36, 18);
    paintbutton.padding = 0;
    paintbutton.labelShadowOffset = new Point(-1, -1);
    paintbutton.labelShadowColor = colors[1];
    paintbutton.labelColor = this.buttonLabelColor;
    paintbutton.contrast = this.buttonContrast;
    paintbutton.hint = "paint a new sprite";
    paintbutton.fixLayout();
    paintbutton.setCenter(this.corralBar.center());
    paintbutton.setLeft(
        this.corralBar.left() + padding + newbutton.width() + padding
    );

    // Hides the paintbrush from the corral bar (for tutorials)
    if (!IDE_Morph.prototype.hideCorralBar) {
        this.corralBar.add(paintbutton);
    }

    // Added conditional to hide camera from view
    if (CamSnapshotDialogMorph.prototype.enableCamera && !myself.hideCamera) {
        cambutton = new PushButtonMorph(
            this,
            "newCamSprite",
            new SymbolMorph("camera", 15)
        );
        cambutton.corner = 12;
        cambutton.color = colors[0];
        cambutton.highlightColor = colors[1];
        cambutton.pressColor = colors[2];
        cambutton.labelMinExtent = new Point(36, 18);
        cambutton.padding = 0;
        cambutton.labelShadowOffset = new Point(-1, -1);
        cambutton.labelShadowColor = colors[1];
        cambutton.labelColor = this.buttonLabelColor;
        cambutton.contrast = this.buttonContrast;
        cambutton.hint = "take a camera snapshot and\n" +
            "import it as a new sprite";
        cambutton.fixLayout();
        cambutton.setCenter(this.corralBar.center());
        cambutton.setLeft(
            this.corralBar.left() +
            padding +
            newbutton.width() +
            padding +
            paintbutton.width() +
            padding
        );
        this.corralBar.add(cambutton);
        document.addEventListener(
            'cameraDisabled',
            event => {
                cambutton.disable();
                cambutton.hint =
                    CamSnapshotDialogMorph.prototype.notSupportedMessage;
            }
        );
    }


    // trash button
    trashbutton = new PushButtonMorph(
        this,
        "undeleteSprites",
        new SymbolMorph("trash", 18)
    );
    trashbutton.corner = 12;
    trashbutton.color = colors[0];
    trashbutton.highlightColor = colors[1];
    trashbutton.pressColor = colors[2];
    trashbutton.labelMinExtent = new Point(36, 18);
    trashbutton.padding = 0;
    trashbutton.labelShadowOffset = new Point(-1, -1);
    trashbutton.labelShadowColor = colors[1];
    trashbutton.labelColor = this.buttonLabelColor;
    trashbutton.contrast = this.buttonContrast;
    // trashbutton.hint = "bring back deleted sprites";
    trashbutton.fixLayout();
    trashbutton.setCenter(this.corralBar.center());
    trashbutton.setRight(this.corralBar.right() - padding);

    // Hides trash can (for tutorials)
    if (!IDE_Morph.prototype.hideCorralBar) {
        this.corralBar.add(trashbutton);
    }
    trashbutton.wantsDropOf = (morph) =>
        morph instanceof SpriteMorph || morph instanceof SpriteIconMorph;

    trashbutton.reactToDropOf = (droppedMorph) => {
        if (droppedMorph instanceof SpriteMorph) {
            this.removeSprite(droppedMorph);
        } else if (droppedMorph instanceof SpriteIconMorph) {
            droppedMorph.destroy();
            this.removeSprite(droppedMorph.object);
        }
    };


    // CSDT X Y Labels in corral
    xlabel = new StringMorph("X:        0", 18, 'sans-serif', true, false, false, MorphicPreferences.isFlat ? null : new Point(2, 1), this.frameColor.darker(this.buttonContrast));
    ylabel = new StringMorph("Y:        0", 18, 'sans-serif', true, false, false, MorphicPreferences.isFlat ? null : new Point(2, 1), this.frameColor.darker(this.buttonContrast));

    xlabel.color = this.buttonLabelColor;
    ylabel.color = this.buttonLabelColor;

    xlabel.rerender();
    xlabel.setLeft(
        this.corralBar.left() + padding + (newbutton.width() + padding) * 2
    );
    this.corralBar.add(xlabel)

    ylabel.rerender();
    ylabel.setLeft(
        this.corralBar.left() + padding + (newbutton.width() + padding) * 2 + 100
    );
    this.corralBar.add(ylabel)


    this.corralBar.fixLayout = function () {
        function updateDisplayOf(button) {
            if (button && button.right() > trashbutton.left() - padding) {
                button.hide();
            } else {
                button.show();
            }
        }
        this.setWidth(myself.stage.width());
        trashbutton.setRight(this.right() - padding);
        updateDisplayOf(cambutton);
        updateDisplayOf(paintbutton);
    };


    // Calls xy label update when user hovers over stage
    this.corralBar.step = function () {
        this.parent.updateXYCorral();
    }


};

// Updates the x y coordinates in the corral bar
IDE_Morph.prototype.updateXYCorral = function () {

    var MouseX = this.stage.reportMouseX();
    var MouseY = this.stage.reportMouseY();

    Morph.prototype.trackChanges = false;
    if (
        MouseX > StageMorph.prototype.dimensions.x / 2 ||
        MouseY > StageMorph.prototype.dimensions.y / 2 ||
        MouseX < StageMorph.prototype.dimensions.x / -2 ||
        MouseY < StageMorph.prototype.dimensions.y / -2) {
        if (!IDE_Morph.prototype.hideCorralBar) {
            this.corralBar.children[3].text = "";
            this.corralBar.children[4].text = "";
        } else {
            this.corralBar.children[0].text = "";
            this.corralBar.children[1].text = "";
        }
    } else {
        if (!IDE_Morph.prototype.hideCorralBar) {
            this.corralBar.children[3].text = "X: " + Math.round(this.stage.reportMouseX());
            this.corralBar.children[4].text = "Y: " + Math.round(this.stage.reportMouseY());
        } else {
            this.corralBar.children[0].text = "X: " + Math.round(this.stage.reportMouseX());
            this.corralBar.children[1].text = "Y: " + Math.round(this.stage.reportMouseY());
        }
    }
    Morph.prototype.trackChanges = true;

    //update only if the coordinates have changed to save CPU
    if (!IDE_Morph.prototype.hideCorralBar) {
        if (this.corralBarOldX != this.corralBar.children[3].text || this.corralBarOldY != this.corralBar.children[4].text) {
            this.corralBarOldX = this.corralBar.children[3].text;
            this.corralBarOldY = this.corralBar.children[4].text;
            this.corralBar.children[3].rerender();
            this.corralBar.children[4].rerender();

            this.corralBar.changed();
        }
    } else {
        if (this.corralBarOldX != this.corralBar.children[0].text || this.corralBarOldY != this.corralBar.children[1].text) {
            this.corralBarOldX = this.corralBar.children[0].text;
            this.corralBarOldY = this.corralBar.children[1].text;
            this.corralBar.children[0].rerender();
            this.corralBar.children[1].rerender();

            this.corralBar.changed();
        }
    }
};

// Overrides the categories (the area where the user selects Motion, Pen, Looks, etc..)
IDE_Morph.prototype.createCategories = function () {
    var myself = this;

    if (this.categories) {
        this.categories.destroy();
    }
    this.categories = new Morph();
    this.categories.color = this.groupColor;
    this.categories.bounds.setWidth(this.paletteWidth);
    // this.categories.getRenderColor = ScriptsMorph.prototype.getRenderColor;

    function addCategoryButton(category) {
        var labelWidth = 75,
            colors = [
                myself.frameColor,
                myself.frameColor.darker(MorphicPreferences.isFlat ? 5 : 50),
                SpriteMorph.prototype.blockColor[category]
            ],
            button;

        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            () => {
                myself.currentCategory = category;
                myself.categories.children.forEach(each =>
                    each.refresh()
                );
                myself.refreshPalette(true);
            },
            category[0].toUpperCase().concat(category.slice(1)), // label
            () => myself.currentCategory === category, // query
            null, // env
            null, // hint
            labelWidth, // minWidth
            true // has preview
        );

        button.corner = 8;
        button.padding = 0;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = myself.buttonLabelColor;
        if (MorphicPreferences.isFlat) {
            button.labelPressColor = WHITE;
        }
        button.fixLayout();
        button.refresh();
        myself.categories.add(button);
        return button;
    }

    // Modified to allow for decatorization (for tutorials)
    function fixCategoriesLayout() {
        if (!StageMorph.prototype.decategorize) {
            var buttonWidth = myself.categories.children[0].width(),
                buttonHeight = myself.categories.children[0].height(),
                border = 3,
                rows = Math.ceil((myself.categories.children.length) / 2),
                xPadding = (200 // myself.logo.width()
                    -
                    border -
                    buttonWidth * 2) / 3,
                yPadding = 2,
                l = myself.categories.left(),
                t = myself.categories.top(),
                i = 0,
                row,
                col;

            myself.categories.children.forEach(button => {
                i += 1;
                row = Math.ceil(i / 2);
                col = 2 - (i % 2);
                button.setPosition(new Point(
                    l + (col * xPadding + ((col - 1) * buttonWidth)),
                    t + (row * yPadding + ((row - 1) * buttonHeight) + border)
                ));
            });

            myself.categories.setHeight(
                (rows + 1) * yPadding +
                rows * buttonHeight +
                2 * border
            );
        } else {
            myself.categories.setHeight(84);
        }
    }
    if (!StageMorph.prototype.decategorize) {
        SpriteMorph.prototype.categories.forEach(cat => {
            if (!contains(['lists', 'other'], cat)) {
                addCategoryButton(cat);
            }
        });
    }

    fixCategoriesLayout();
    this.add(this.categories);
};

// Overrides the sprite bar (the area above the scripting area)
IDE_Morph.prototype.createSpriteBar = function () {
    // assumes that the categories pane has already been created
    var rotationStyleButtons = [],
        thumbSize = new Point(45, 45),
        nameField,
        padlock,
        thumbnail,
        tabCorner = 15,
        tabColors = this.tabColors,
        tabBar = new AlignmentMorph('row', -tabCorner * 2),
        tab,
        symbols = [
            new SymbolMorph('arrowRightThin', 10),
            new SymbolMorph('turnAround', 10),
            new SymbolMorph('arrowLeftRightThin', 10),
        ],
        labels = ['don\'t rotate', 'can rotate', 'only face left/right'],
        myself = this;

    if (this.spriteBar) {
        this.spriteBar.destroy();
    }

    this.spriteBar = new Morph();
    this.spriteBar.color = this.frameColor;
    this.add(this.spriteBar);

    function addRotationStyleButton(rotationStyle) {
        var colors = myself.rotationStyleColors,
            button;

        button = new ToggleButtonMorph(
            colors,
            myself, // the IDE is the target
            () => {
                if (myself.currentSprite instanceof SpriteMorph) {
                    myself.currentSprite.rotationStyle = rotationStyle;
                    myself.currentSprite.changed();
                    myself.currentSprite.fixLayout();
                    myself.currentSprite.rerender();
                    myself.recordUnsavedChanges();
                }
                rotationStyleButtons.forEach(each =>
                    each.refresh()
                );
            },
            symbols[rotationStyle], // label
            () => myself.currentSprite instanceof SpriteMorph // query
            &&
            myself.currentSprite.rotationStyle === rotationStyle,
            null, // environment
            localize(labels[rotationStyle])
        );

        button.corner = 8;
        button.labelMinExtent = new Point(11, 11);
        button.padding = 0;
        button.labelShadowOffset = new Point(-1, -1);
        button.labelShadowColor = colors[1];
        button.labelColor = myself.buttonLabelColor;
        button.fixLayout();
        button.refresh();
        rotationStyleButtons.push(button);
        button.setPosition(myself.spriteBar.position().add(new Point(2, 4)));
        button.setTop(button.top() +
            ((rotationStyleButtons.length - 1) * (button.height() + 2))
        );
        myself.spriteBar.add(button);
        if (myself.currentSprite instanceof StageMorph) {
            button.hide();
        }
        return button;
    }

    addRotationStyleButton(1);
    addRotationStyleButton(2);
    addRotationStyleButton(0);
    this.rotationStyleButtons = rotationStyleButtons;

    thumbnail = new Morph();
    thumbnail.isCachingImage = true;
    thumbnail.bounds.setExtent(thumbSize);
    thumbnail.cachedImage = this.currentSprite.thumbnail(thumbSize);
    thumbnail.setPosition(
        rotationStyleButtons[0].topRight().add(new Point(5, 3))
    );

    // Hides thumbnail from sprite bar (for tutorial)
    if (!IDE_Morph.prototype.hideSpriteBar) {
        this.spriteBar.add(thumbnail);
    }

    thumbnail.fps = 3;

    thumbnail.step = function () {
        if (thumbnail.version !== myself.currentSprite.version) {
            thumbnail.cachedImage = myself.currentSprite.thumbnail(
                thumbSize,
                thumbnail.cachedImage
            );
            thumbnail.changed();
            thumbnail.version = myself.currentSprite.version;
        }
    };

    nameField = new InputFieldMorph(this.currentSprite.name);
    nameField.setWidth(100); // fixed dimensions
    nameField.contrast = 90;
    nameField.setPosition(thumbnail.topRight().add(new Point(10, 3)));

    // Hides name field from sprite bar (for tutorial)
    if (!IDE_Morph.prototype.hideSpriteBar) {
        this.spriteBar.add(nameField);
    }

    this.spriteBar.nameField = nameField;
    nameField.fixLayout();
    nameField.accept = function () {
        var newName = nameField.getValue();
        myself.currentSprite.setName(
            myself.newSpriteName(newName, myself.currentSprite)
        );
        nameField.setContents(myself.currentSprite.name);
        myself.recordUnsavedChanges();
    };
    this.spriteBar.reactToEdit = nameField.accept;

    // padlock
    padlock = new ToggleMorph(
        'checkbox',
        null,
        () => {
            this.currentSprite.isDraggable = !this.currentSprite.isDraggable;
            this.recordUnsavedChanges();
        },
        localize('draggable'),
        () => this.currentSprite.isDraggable
    );
    padlock.label.isBold = false;
    padlock.label.setColor(this.buttonLabelColor);
    padlock.color = tabColors[2];
    padlock.highlightColor = tabColors[0];
    padlock.pressColor = tabColors[1];

    padlock.tick.shadowOffset = MorphicPreferences.isFlat ?
        ZERO : new Point(-1, -1);
    padlock.tick.shadowColor = BLACK;
    padlock.tick.color = this.buttonLabelColor;
    padlock.tick.isBold = false;
    padlock.tick.fixLayout();

    padlock.setPosition(nameField.bottomLeft().add(2));
    padlock.fixLayout();
    this.spriteBar.add(padlock);
    if (this.currentSprite instanceof StageMorph) {
        padlock.hide();
    }

    // tab bar
    tabBar.tabTo = function (tabString) {
        var active;
        myself.currentTab = tabString;
        this.children.forEach(each => {
            each.refresh();
            if (each.state) {
                active = each;
            }
        });
        active.refresh(); // needed when programmatically tabbing
        myself.createSpriteEditor();
        myself.fixLayout('tabEditor');
    };

    tab = new TabMorph(
        tabColors,
        null, // target
        () => tabBar.tabTo('scripts'),
        localize('Scripts'), // label
        () => this.currentTab === 'scripts' // query
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = this.buttonLabelColor;

    tab.getPressRenderColor = function () {
        if (MorphicPreferences.isFlat ||
            SyntaxElementMorph.prototype.alpha > 0.85) {
            return this.pressColor;
        }
        return this.pressColor.mixed(
            Math.max(SyntaxElementMorph.prototype.alpha - 0.15, 0),
            SpriteMorph.prototype.paletteColor
        );
    };

    tab.fixLayout();
    tabBar.add(tab);

    tab = new TabMorph(
        tabColors,
        null, // target
        () => tabBar.tabTo('costumes'),
        localize(this.currentSprite instanceof SpriteMorph ?
            'Costumes' : 'Backgrounds'
        ),
        () => this.currentTab === 'costumes' // query
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = this.buttonLabelColor;


    // Hides costume tab (for tutorial)
    if (!StageMorph.prototype.hideCostumesTab) {
        tab.fixLayout();
        tabBar.add(tab);
    }

    tab = new TabMorph(
        tabColors,
        null, // target
        () => tabBar.tabTo('sounds'),
        localize('Sounds'), // label
        () => this.currentTab === 'sounds' // query
    );
    tab.padding = 3;
    tab.corner = tabCorner;
    tab.edge = 1;
    tab.labelShadowOffset = new Point(-1, -1);
    tab.labelShadowColor = tabColors[1];
    tab.labelColor = this.buttonLabelColor;

    // Hides sound tab (for tutorial)
    if (!StageMorph.prototype.hideSoundsTab) {
        tab.fixLayout();
        tabBar.add(tab);
    }

    tabBar.fixLayout();
    tabBar.children.forEach(each =>
        each.refresh()
    );
    this.spriteBar.tabBar = tabBar;
    this.spriteBar.add(this.spriteBar.tabBar);

    this.spriteBar.fixLayout = function () {
        this.tabBar.setLeft(this.left());
        this.tabBar.setBottom(this.bottom() + myself.padding);
    };
};

// Replaces the snap logo with ours via logo.texture
IDE_Morph.prototype.createLogo = function () {
    var myself = this;

    if (this.logo) {
        this.logo.destroy();
    }

    this.logo = new Morph();

    // the logo texture is not loaded dynamically as an image, but instead
    // hard-copied here to avoid tainting the world canvas. This lets us
    // use Snap's (and Morphic's) color pickers to sense any pixel which
    // otherwise would be compromised by annoying browser security.

    // this.logo.texture = this.logoURL; // original code, commented out
    this.logo.texture = "data:image/png;base64," +
        "iVBORw0KGgoAAAANSUhEUgAAACwAAAAYCAYAAACBbx+6AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gITEyEH0BfhhwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAftSURBVFjD1Vd5VJNXFr/v+7JBCIYYVEKAIqi4sVYghrJKWRRlE0Q5glOl7h7R6lSx6HS0Y9HijnoQcUE6EVCqhXE7DmoQdWpHBxEULKIoJECQELJ9+d78MUeOKbTF6Uw9fX++3+/e97vv3XfffQC/s4Hehjw3Vgqnzsph1ozgiXG+hhlioSmCw4IQu2FaYJE6oDETlL1caO2C601trMLM7Q+OAahM70zwrs1JI4cznn4f66Owo3SvwAB8aFcZYZTQ6jmFSWAgEyi7NGJbPgYW0sJDpSNc+Rd7Qdbum4Xps32h8PTt3+4odm+Kkj4vGY3bSu3xs7Jxr3I3RJezeE7Rg3Hj42clVB/xa35e4oRV5UJcmuOru1fxR4vfRGhqogRCp4VOeVnmjDvKHehtqwO/AQCInjZlCNZeQnlBUP2LEnvcXu6KFyR4HwSIJ/7vohtl49pbSjxx7MzQcbdOBg3AY5Mzf9Y+UCrxqCl4H3eUjsL3TvkbnB3F/o7OLkMSzmUAmjH3i5+CFzGLN4mru86M1HeV2emLN4muAcfF/eRfQp+9ZkgDY5KjknfghIxiffzCE/qw2E+bhxp4XMSEZQ2yKbjz7EjccNqfKsxJ2ggAxJfrowZwR4nswN1jiiRxWbn+zfn+KLev9MroLPtWG+IOkmsP4B5GKC/cC32gKOq7V99kCAQAmJ66v1jg/vnXRoO6HhsV+ymjtstmlJ9oKGIdHGzhzIW6/dM26Nn5199z/a7F5hClbYvctiZCvG575QB+24uXIJ6cuq6PdmSZAYc2+MHj08FeipJR+JFMWuGfVMR4jc2KkHLbSkS9N/aNrgYA+HDBFZy4MO8Pb5NOwWFxb52CASEJCAAgbvHZczOX3sFvYoyPt92Cu/ludy2tuc/HJsmjAeT9YMgkrFH18VbUPOaOBwBACEOnsm0FABT4Tw2HmupLAACQtFjG12CX1r66zIWcSV/l0BRlT9NGYFFNjd8eSxszbV5xJ2I7CQiSASYaA5dDN9/OlwR4z86r4fBdhRqtqZVgDXehKAQM6NWxus8GAsAdABbQtFFpVodPbvHxmunZevdPZU4r+DaifVm7zvxk5BEpuZXsEYmRVF/dE3VzwZnrl/66Njx6HnD4bsON/KQOhv4+aJW30sT21vLGHxRHBG7rg1i9lWn6PgXBIFEtl6l+9aKtV8p3Tjmq63lIkVQHA4RxYGG8s4xH1F0mOa4WL9X2/ySY1lB1QOIQlPHNAaxrczh3PMOrf4dZDPShxsCBHcdu7fulo7pQvDoqIkmXw7TxXTtswo410eKUJarHu1IFdhMrVTQFHfWHt9TILx1/nQ2RollYrzNOv3gqK/kNN4/DZ5LhwomrZmuf5ucBAy25X77oREOLVh0QkoAsWYa57PH7ToWk70ljshjsl3WFn5hduggfoFq7Bn89j2dPGiha9ukn5w+FWemeHy2iSa6lwGN3WW3VQScGSQKHJ2SbOScBEG3iBHi6CMPn7C2NWXy1cfbKK1gwbvFcRNNY3fVEAZgBds6TEQDAjaul+OKFc8W0phGYVmN8NQq57MaN6stmPutbSGRjNXhJnL+l1kK21ePikY1e4h9Bmsuln6Uaaz8eRhAIxgUs3YwxAoIgzVkYA8eSpxw2ZX8bV+DuqW/Ozbl0ICxY/1JWiUiK0vQqMSAEllZCMzOSyQWg1C0Vsq1Hxk8w3zRCXqeps+XpoOAzSf/W71nrDQAAV/Z6V0nHdIQ3d4p63L0DBwR0peZJD9bUA200eVIUNaAxMWEEtgL2R0yr8eTfDwcl1z/4/nA3BVUc7ojHBE1gk8EAgBBYWdn2V4I56VkfmUhbUDSd/i4gcnUF34pjbVYlMnfVVkS/71Y3bfzTLw9lSRrSpzZdv1ir4Z3Inlzh7dg+8WqTd/jnB8/1AAAERS2vMtJou5296w+9fTqWyaDbCVwvaLi56c8OgbEnfyyYphEAxp1GyjQ8OHXP2hH2Ezc+uF06Ayw9V5oQMpIEgUxGCph28R5R8SMUOp3mPQ0nIp9W3bhj47o02UiKIrlau5ibt/9R1C84ZeYH4JY617vmQI46xv1puVrHAD8XNdA02be8cHRmhE97BgBcJgFc+S5JU2kkKtPSFJvJY+nZuiaD4s78ObZiyQVrS6OyXavtfVOwNZfQND15tI9n3cXG/KhVL3pQjMAppLPh2vrzo6U5fjRBACIBerSW50G0hMVFNBiVsvt/+3qDb8y83C9IdttYWcG6orcq4q2lY1S5a3w2/5peRBoUNfgDETw9OzazGYeGBPGG6utnG5C0RCkk73EITZF2ZMsLQx8C+Jnl084NkUNaRF5VOei8JVcACAAoJKQHw6PDPP67Bn5JWtDUVdON12zZz0hs0gKBMNAED0amkAmmvqaywWxc3XwTbu9UlRAGFWAw14MBgYkyQFL+7EqB+9ao5WPndHkK7wswEIAAA40xPH1lC94LHg3QxxiK4LxjVdV5x4C9dNE8vqOg20qjQ3S0+4uW+XEjvY8WDRQsEtlCYuhwt7pWPZy86eowwpoyP3JMAwGAddpuLfTIuXvP6Homufr8h4MQAA2g7jNqAR79ui/Sm6NshyR3srg7JSybv9yCBLMCrDMh48XsjoNVDywqMrbeS39nf7r+niLMH5SvONyspG6Vp7OJiREa4PZuI6Iyjw6zsTQ96W1ofPbuv9sr0wN+kbN4nuR/vu6/AcAxS9LBl+KMAAAAAElFTkSuQmCC";

    this.logo.render = function (ctx) {
        var gradient = ctx.createLinearGradient(
            0,
            0,
            this.width(),
            0
        );
        gradient.addColorStop(0, 'black');
        gradient.addColorStop(0.5, myself.frameColor.toString());
        ctx.fillStyle = MorphicPreferences.isFlat ?
            myself.frameColor.toString() : gradient;
        ctx.fillRect(0, 0, this.width(), this.height());
        if (this.cachedTexture) {
            this.renderCachedTexture(ctx);
        } else if (this.texture) {
            this.renderTexture(this.texture, ctx);
        }
    };

    this.logo.renderCachedTexture = function (ctx) {
        ctx.drawImage(
            this.cachedTexture,
            5,
            Math.round((this.height() - this.cachedTexture.height) / 2)
        );
        this.changed();
    };

    this.logo.mouseClickLeft = function () {
        myself.snapMenu();
    };

    this.logo.color = BLACK;
    this.logo.setExtent(new Point(200, 28)); // dimensions are fixed
    this.add(this.logo);
};

// Updates menu when clicking on logo
IDE_Morph.prototype.snapMenu = function () {
    var menu,
        world = this.world();

    menu = new MenuMorph(this);
    menu.addItem('About...', 'aboutSnap');
    menu.addLine();
    menu.addItem(
        'Reference manual',
        () => {
            var url = this.resourceURL('help', 'SnapManual.pdf');
            window.open(url, 'SnapReferenceManual');
        }
    );
    menu.addItem(
        'CSDT Homepage',
        () => window.open('https://csdt.org/', 'SnapWebsite')
    );
    if (world.isDevMode) {
        menu.addLine();
        menu.addItem(
            'Switch back to user mode',
            'switchToUserMode',
            'disable deep-Morphic\ncontext menus' +
            '\nand show user-friendly ones',
            new Color(0, 100, 0)
        );
    } else if (world.currentKey === 16) { // shift-click
        menu.addLine();
        menu.addItem(
            'Switch to dev mode',
            'switchToDevMode',
            'enable Morphic\ncontext menus\nand inspectors,' +
            '\nnot user-friendly!',
            new Color(100, 0, 0)
        );
    }
    menu.popup(world, this.logo.bottomLeft());
};

// Updates the file menu options
IDE_Morph.prototype.projectMenu = function () {
    var menu,
        world = this.world(),
        pos = this.controlBar.projectButton.bottomLeft(),
        graphicsName = this.currentSprite instanceof SpriteMorph ?
        'Costumes' : 'Backgrounds',
        shiftClicked = (world.currentKey === 16),
        backup = this.availableBackup(shiftClicked);

    menu = new MenuMorph(this);
    menu.addItem('Project notes...', 'editProjectNotes');
    menu.addLine();
    menu.addPair('New', 'createNewProject', '^N');
    menu.addPair('Open...', 'openProjectsBrowser', '^O');
    menu.addPair('Save', "save", '^S');
    menu.addItem('Save As...', 'saveProjectsBrowser');
    if (backup) {
        menu.addItem(
            'Restore unsaved project',
            'restore',
            backup,
            shiftClicked ? new Color(100, 0, 0) : null
        );
        if (shiftClicked) {
            menu.addItem(
                'Clear backup',
                'clearBackup',
                backup,
                new Color(100, 0, 0)
            );
        }
    }
    menu.addLine();
    menu.addItem(
        'Import...',
        'importLocalFile',
        'file menu import hint' // looks up the actual text in the translator
    );

    if (shiftClicked) {
        menu.addItem(
            localize(
                'Export project...') + ' ' + localize('(in a new window)'),
            () => {
                if (this.projectName) {
                    this.exportProject(this.projectName, shiftClicked);
                } else {
                    this.prompt(
                        'Export Project As...',
                        // false - override the shiftClick setting to use XML:
                        name => this.exportProject(name, false),
                        null,
                        'exportProject'
                    );
                }
            },
            'show project data as XML\nin a new browser window',
            new Color(100, 0, 0)
        );
    }
    menu.addItem(
        shiftClicked ?
        'Export project as plain text...' : 'Export project...',
        () => {
            if (this.projectName) {
                this.exportProject(this.projectName, shiftClicked);
            } else {
                this.prompt(
                    'Export Project As...',
                    name => this.exportProject(name, shiftClicked),
                    null,
                    'exportProject'
                );
            }
        },
        'save project data as XML\nto your downloads folder',
        shiftClicked ? new Color(100, 0, 0) : null
    );

    if (this.stage.globalBlocks.length) {
        menu.addItem(
            'Export blocks...',
            () => this.exportGlobalBlocks(),
            'save global custom block\ndefinitions as XML'
        );
        menu.addItem(
            'Unused blocks...',
            () => this.removeUnusedBlocks(),
            'find unused global custom blocks' +
            '\nand remove their definitions'
        );
    }

    menu.addItem(
        'Export summary...',
        () => this.exportProjectSummary(),
        'save a summary\nof this project'
    );

    if (shiftClicked) {
        menu.addItem(
            'Export summary with drop-shadows...',
            () => this.exportProjectSummary(true),
            'download and save' +
            '\nwith a summary of this project' +
            '\nwith drop-shadows on all pictures.' +
            '\nnot supported by all browsers',
            new Color(100, 0, 0)
        );
        menu.addItem(
            'Export all scripts as pic...',
            () => this.exportScriptsPicture(),
            'show a picture of all scripts\nand block definitions',
            new Color(100, 0, 0)
        );
    }

    menu.addLine();
    menu.addItem(
        'Libraries...',
        () => {
            if (location.protocol === 'file:') {
                this.importLocalFile();
                return;
            }
            this.getURL(
                this.resourceURL('libraries', 'LIBRARIES'),
                txt => {
                    var libraries = this.parseResourceFile(txt);
                    new LibraryImportDialogMorph(this, libraries).popUp();
                }
            );
        },
        'Select categories of additional blocks to add to this project.'
    );

    menu.addItem(
        'Sprite Images...',
        () => {
            if (location.protocol === 'file:') {
                this.importLocalFile();
                return;
            }
            this.importMedia(graphicsName);
        },
        'Select an image from the media library'
    );
    menu.addItem(
        localize('Sounds') + '...',
        () => {
            if (location.protocol === 'file:') {
                this.importLocalFile();
                return;
            }
            this.importMedia('Sounds');
        },
        'Select a sound from the media library'
    );

    if (this.trash.length) {
        menu.addLine();
        menu.addItem(
            'Undelete sprites...',
            () => this.undeleteSprites(
                this.controlBar.projectButton.bottomLeft()
            ),
            'Bring back deleted sprites'
        );
    }


    menu.popup(world, pos);
};

// Updates the cloud menu options
IDE_Morph.prototype.cloudMenu = function () {
    var menu,
        world = this.world(),
        pos = this.controlBar.cloudButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);

    if (location.protocol === 'file:' && !shiftClicked) {
        this.showMessage('cloud unavailable without a web server.');
        return;
    }

    menu = new MenuMorph(this);
    if (shiftClicked) {
        menu.addItem(
            'url...',
            'setCloudURL',
            null,
            new Color(100, 0, 0)
        );
        menu.addLine();
    }
    if (!this.cloud.username) {
        menu.addItem(
            'Login...',
            'initializeCloud'
        );
        menu.addItem(
            'Signup...',
            () => window.open('/accounts/signup/', 'SnapWebsite')
        );
        menu.addItem(
            'Reset Password...',
            () => window.open('/accounts/password/reset/', 'SnapWebsite')
        );
    } else {
        menu.addItem(
            localize('Logout') + ' ' + this.cloud.username,
            'logout'
        );
        menu.addItem(
            'My Projects',
            // 'changeCloudPassword'
            () => window.open('/users/' + this.cloud.user_id, 'SnapWebsite')
        );
        menu.addItem(
            'Change Password...',
            // 'changeCloudPassword'
            () => window.open('/accounts/password/reset/', 'SnapWebsite')
        );
    }
    if (this.hasCloudProject()) {
        menu.addLine();
        menu.addItem(
            'Open in Community Site',
            () => {
                var dict = this.urlParameters();
                window.open(
                    this.cloud.showProjectPath(
                        dict.Username, dict.ProjectName
                    ),
                    '_blank'
                );
            }
        );
    }
    if (shiftClicked) {
        menu.addLine();
        menu.addItem(
            'export project media only...',
            () => {
                if (this.projectName) {
                    this.exportProjectMedia(this.projectName);
                } else {
                    this.prompt(
                        'Export Project As...',
                        name => this.exportProjectMedia(name),
                        null,
                        'exportProject'
                    );
                }
            },
            null,
            this.hasChangedMedia ? new Color(100, 0, 0) : new Color(0, 100, 0)
        );
        menu.addItem(
            'export project without media...',
            () => {
                if (this.projectName) {
                    this.exportProjectNoMedia(this.projectName);
                } else {
                    this.prompt(
                        'Export Project As...',
                        name => this.exportProjectNoMedia(name),
                        null,
                        'exportProject'
                    );
                }
            },
            null,
            new Color(100, 0, 0)
        );
        menu.addItem(
            'export project as cloud data...',
            () => {
                if (this.projectName) {
                    this.exportProjectAsCloudData(this.projectName);
                } else {
                    this.prompt(
                        'Export Project As...',
                        name => this.exportProjectAsCloudData(name),
                        null,
                        'exportProject'
                    );
                }
            },
            null,
            new Color(100, 0, 0)
        );
        menu.addLine();
        menu.addItem(
            'open shared project from cloud...',
            () => {
                this.prompt(
                    'Author name…',
                    usr => {
                        this.prompt(
                            'Project name...',
                            prj => {
                                this.showMessage(
                                    'Fetching project\nfrom the cloud...'
                                );
                                this.cloud.getPublicProject(
                                    prj,
                                    usr.toLowerCase(),
                                    projectData => {
                                        var msg;
                                        if (
                                            !Process.prototype.isCatchingErrors
                                        ) {
                                            window.open(
                                                'data:text/xml,' + projectData
                                            );
                                        }
                                        this.nextSteps([
                                            () => {
                                                msg = this.showMessage(
                                                    'Opening project...'
                                                );
                                            },
                                            () => {
                                                this.rawOpenCloudDataString(
                                                    projectData
                                                );
                                                msg.destroy();
                                            },
                                        ]);
                                    },
                                    this.cloudError()
                                );
                            },
                            null,
                            'project'
                        );
                    },
                    null,
                    'project'
                );
            },
            null,
            new Color(100, 0, 0)
        );
    }
    menu.popup(world, pos);
};

// Reformats the import dialog boxes for all media (music, pictures, etc.)
IDE_Morph.prototype.popupMediaImportDialog = function (folderName, items) {
    // private - this gets called by importMedia() and creates
    // the actual dialog
    var dialog = new DialogBoxMorph().withKey('import' + folderName),
        frame = new ScrollFrameMorph(),
        selectedIcon = null,
        turtle = new SymbolMorph('turtle', 60),
        myself = this,
        world = this.world(),
        handle,
        content = new ScrollFrameMorph(),
        section,
        msg,
        listFieldWidth = 100;

    let uniqueSections = [...new Set(items.map(item => item.description))];
    uniqueSections.push('All');


    // Create the media sections
    var listField = new ListMorph(
        uniqueSections,
        function (element) {
            return element;
        }
    );

    listField.setWidth(listFieldWidth);
    listField.contents.children[0].children.forEach(function (x) {

        x.action = function () {

            let msg = myself.showMessage((localize('Loading') + '\n' + localize(x.labelString)), 1);

            frame.destroy();
            frame = new ScrollFrameMorph();
            frame.acceptsDrops = false;
            frame.contents.acceptsDrops = false;
            frame.color = myself.groupColor;
            frame.fixLayout = nop;

            // Filters costume by category
            let currentSection = (x.labelString === 'All') ? items : items.filter(y => y.description == x.labelString);

            // Note to self: need to convert to generic function...
            currentSection.forEach(item => {
                // Caution: creating very many thumbnails can take a long time!
                var url = myself.resourceURL(folderName, item.fileName),
                    img = new Image(),
                    suffix = url.slice(url.lastIndexOf('.') + 1).toLowerCase(),
                    isSVG = suffix === 'svg' && !MorphicPreferences.rasterizeSVGs,
                    isSound = contains(['wav', 'mp3'], suffix),
                    icon;

                if (isSound) {
                    icon = new SoundIconMorph(new Sound(new Audio(), item.name));
                } else {
                    icon = new CostumeIconMorph(
                        new Costume(turtle.getImage(), item.name)
                    );
                }
                icon.isDraggable = false;
                icon.userMenu = nop;
                icon.action = function () {
                    if (selectedIcon === icon) {
                        return;
                    }
                    var prevSelected = selectedIcon;
                    selectedIcon = icon;
                    if (prevSelected) {
                        prevSelected.refresh();
                    }
                };
                icon.doubleClickAction = dialog.ok;
                icon.query = function () {
                    return icon === selectedIcon;
                };
                frame.addContents(icon);
                if (isSound) {
                    icon.object.audio.onloadeddata = function () {
                        icon.createThumbnail();
                        icon.fixLayout();
                        icon.refresh();
                    };

                    icon.object.audio.src = url;
                    icon.object.audio.load();
                } else if (isSVG) {
                    img.onload = function () {
                        icon.object = new SVG_Costume(img, item.name);
                        icon.refresh();

                    };
                    this.getURL(
                        url,
                        txt => img.src = 'data:image/svg+xml;base64,' +
                        window.btoa(txt)
                    );
                } else {
                    img.onload = function () {
                        var canvas = newCanvas(new Point(img.width, img.height), true);
                        canvas.getContext('2d').drawImage(img, 0, 0);
                        icon.object = new Costume(canvas, item.name);
                        icon.refresh();
                    };
                    img.src = url;
                }
            });

            content.add(frame);
            dialog.fixLayout();

        };
    });


    listField.fixLayout = nop;

    frame.acceptsDrops = false;
    frame.contents.acceptsDrops = false;
    frame.color = myself.groupColor;
    frame.fixLayout = nop;
    dialog.labelString = folderName === 'Costumes' ? 'Sprite Images' : folderName;
    dialog.createLabel();
    content.add(frame);
    content.add(listField);
    dialog.addBody(content);
    dialog.addButton('ok', 'Import');
    dialog.addButton('cancel', 'Cancel');

    dialog.ok = function () {
        if (selectedIcon) {
            if (selectedIcon.object instanceof Sound) {
                myself.droppedAudio(
                    selectedIcon.object.copy().audio,
                    selectedIcon.labelString
                );
            } else if (selectedIcon.object instanceof SVG_Costume) {
                myself.droppedSVG(
                    selectedIcon.object.contents,
                    selectedIcon.labelString
                );
            } else {
                myself.droppedImage(
                    selectedIcon.object.contents,
                    selectedIcon.labelString
                );
            }
        }
    };

    dialog.cancel = function () {

        // CSDT Kill Audio Sampling (need to clean up...)
        let audioArray = frame.children[0].children.filter(a => a instanceof SoundIconMorph);
        for (let i = 0; i < audioArray.length; i++) {
            try {
                audioArray[i].object.previewAudio.pause()
                audioArray[i].object.previewAudio.pause();
                audioArray[i].object.previewAudio.terminated = true;
                audioArray[i].object.previewAudio = null;
            } catch (e) {

            }
        }
        dialog.destroy();
    }

    dialog.fixLayout = function () {
        var th = fontHeight(this.titleFontSize) + this.titlePadding * 2,
            x = 0,
            y = 0,
            lw = listFieldWidth,
            margin = 15,
            cp, ce,
            lp, le,
            fp, fe, fw;
        this.buttons.fixLayout();

        cp = this.position().add(new Point(
            this.padding,
            th + this.padding
        ));
        ce = new Point(
            this.width() - this.padding * 2,
            this.height() - this.padding * 3 - th - this.buttons.height()
        );
        content.setPosition(cp);
        content.setExtent(ce);

        this.body.setPosition(new Point(cp.x, cp.y));
        this.body.setExtent(new Point(ce.x, ce.y));

        fp = new Point(cp.x + lw + margin, cp.y);
        lp = new Point(cp.x, cp.y);

        fe = new Point(ce.x - lw - margin, ce.y);
        le = new Point(lw, ce.y);

        frame.setPosition(fp);
        frame.setExtent(fe);
        listField.setPosition(lp);
        listField.setExtent(le);

        frame.contents.children.forEach(function (icon) {
            icon.setPosition(fp.add(new Point(x + 5, y + 5)));
            x += icon.width();
            if (x + icon.width() > fe.x) {
                x = 0;
                y += icon.height() + 4;
            };
        });
        frame.contents.adjustBounds();
        this.label.setCenter(this.center());
        this.label.setTop(this.top() + (th - this.label.height()) / 2);
        this.buttons.setCenter(this.center());
        this.buttons.setBottom(this.bottom() - this.padding);

        // refresh shadow
        this.removeShadow();
        this.addShadow();
    };

    items.forEach(item => {
        // Caution: creating very many thumbnails can take a long time!
        var url = this.resourceURL(folderName, item.fileName),
            img = new Image(),
            suffix = url.slice(url.lastIndexOf('.') + 1).toLowerCase(),
            isSVG = suffix === 'svg' && !MorphicPreferences.rasterizeSVGs,
            isSound = contains(['wav', 'mp3'], suffix),
            icon;

        if (isSound) {
            icon = new SoundIconMorph(new Sound(new Audio(), item.name));
        } else {
            icon = new CostumeIconMorph(
                new Costume(turtle.getImage(), item.name)
            );
        }
        icon.isDraggable = false;
        icon.userMenu = nop;
        icon.action = function () {
            if (selectedIcon === icon) {
                return;
            }
            var prevSelected = selectedIcon;
            selectedIcon = icon;
            if (prevSelected) {
                prevSelected.refresh();
            }
        };
        icon.doubleClickAction = dialog.ok;
        icon.query = function () {
            return icon === selectedIcon;
        };
        frame.addContents(icon);
        if (isSound) {
            icon.object.audio.onloadeddata = function () {
                icon.createThumbnail();
                icon.fixLayout();
                icon.refresh();
            };

            icon.object.audio.src = url;
            icon.object.audio.load();
        } else if (isSVG) {
            img.onload = function () {
                icon.object = new SVG_Costume(img, item.name);
                icon.refresh();
            };
            this.getURL(
                url,
                txt => img.src = 'data:image/svg+xml;base64,' +
                window.btoa(txt)
            );
        } else {
            img.onload = function () {
                var canvas = newCanvas(new Point(img.width, img.height), true);
                canvas.getContext('2d').drawImage(img, 0, 0);
                icon.object = new Costume(canvas, item.name);
                icon.refresh();
            };
            img.src = url;
        }
    });
    dialog.popUp(world);
    dialog.setExtent(new Point(600, 500));
    dialog.setCenter(world.center());

    handle = new HandleMorph(
        dialog,
        300,
        280,
        dialog.corner,
        dialog.corner
    );
};

// Adds trackable fields within xml files for tutorials
SnapSerializer.prototype.rawLoadProjectModel = function (xmlNode, remixID) {
    // private
    var project = {sprites: {}},
        model,
        nameID;

    this.project = project;

    model = {project: xmlNode };
    if (+xmlNode.attributes.version > this.version) {
        throw 'Project uses newer version of Serializer';
    }

    /* Project Info */

    this.objects = {};
    project.name = model.project.attributes.name;
    if (!project.name) {
        nameID = 1;
        while (
            Object.prototype.hasOwnProperty.call(
                localStorage,
                '-snap-project-Untitled ' + nameID
            )
        ) {
            nameID += 1;
        }
        project.name = 'Untitled ' + nameID;
    }
    model.notes = model.project.childNamed('notes');
    if (model.notes) {
        project.notes = model.notes.contents;
    }
    model.globalVariables = model.project.childNamed('variables');
    project.globalVariables = new VariableFrame();

    /* Stage */

    model.stage = model.project.require('stage');
    StageMorph.prototype.frameRate = 0;
    project.stage = new StageMorph(project.globalVariables);
    project.stage.remixID = remixID;
    if (Object.prototype.hasOwnProperty.call(
            model.stage.attributes,
            'id'
        )) {
        this.objects[model.stage.attributes.id] = project.stage;
    }

    // Different types of toggles for tutorials 
    if (model.stage.attributes.hideCostumesTab) {
        StageMorph.prototype.hideCostumesTab = model.stage.attributes.hideCostumesTab === 'true';
    } else {
        StageMorph.prototype.hideCostumesTab = false;
    }
    if (model.stage.attributes.hideSoundsTab) {
        StageMorph.prototype.hideSoundsTab = model.stage.attributes.hideSoundsTab === 'true';
    } else {
        StageMorph.prototype.hideSoundsTab = false;
    }
    if (model.stage.attributes.hideCorralBar) {
        IDE_Morph.prototype.hideCorralBar = model.stage.attributes.hideCorralBar === 'true';
    } else {
        IDE_Morph.prototype.hideCorralBar = false;
    }
    if (model.stage.attributes.hideFileBtn) {
        IDE_Morph.prototype.hideFileBtn = model.stage.attributes.hideFileBtn === 'true';
    } else {
        IDE_Morph.prototype.hideFileBtn = false;
    }
    if (model.stage.attributes.hideCloudBtn) {
        IDE_Morph.prototype.hideCloudBtn = model.stage.attributes.hideCloudBtn === 'true';
    } else {
        IDE_Morph.prototype.hideCloudBtn = false;
    }
    if (model.stage.attributes.hideControlBtns) {
        IDE_Morph.prototype.hideControlBtns = model.stage.attributes.hideControlBtns === 'true';
    } else {
        IDE_Morph.prototype.hideControlBtns = false;
    }
    if (model.stage.attributes.hideSpriteBar) {
        IDE_Morph.prototype.hideSpriteBar = model.stage.attributes.hideSpriteBar === 'true';
    } else {
        IDE_Morph.prototype.hideSpriteBar = false;
    }
    if (model.stage.attributes.decategorize) {
        StageMorph.prototype.decategorize = model.stage.attributes.decategorize === 'true';
    } else {
        StageMorph.prototype.decategorize = false;
    }
    if (model.stage.attributes.changeBlocks) {
        StageMorph.prototype.changeBlocks = model.stage.attributes.changeBlocks === 'true';
    } else {
        StageMorph.prototype.changeBlocks = false;
    }
    if (model.stage.attributes.enableGlide) {
        StageMorph.prototype.enableGlide = model.stage.attributes.enableGlide === 'true';
    } else {
        StageMorph.prototype.enableGlide = false;
    }
// End of our toggles and fields

if (model.stage.attributes.name) {
    project.stage.name = model.stage.attributes.name;
}
if (model.stage.attributes.color) {
    project.stage.color = this.loadColor(model.stage.attributes.color);
    project.stage.cachedHSV = project.stage.color.hsv();
}
if (model.stage.attributes.scheduled === 'true') {
    project.stage.fps = 30;
    StageMorph.prototype.frameRate = 30;
}
if (model.stage.attributes.volume) {
    project.stage.volume = +model.stage.attributes.volume;
}
if (model.stage.attributes.pan) {
    project.stage.pan = +model.stage.attributes.pan;
}
if (model.stage.attributes.penlog) {
    StageMorph.prototype.enablePenLogging =
        (model.stage.attributes.penlog === 'true');
}

    model.pentrails = model.stage.childNamed('pentrails');
    if (model.pentrails) {
        project.pentrails = new Image();
        project.pentrails.onload = function () {
            if (project.stage.trailsCanvas) { // work-around a bug in FF
                normalizeCanvas(project.stage.trailsCanvas);
                var context = project.stage.trailsCanvas.getContext('2d');
                context.drawImage(project.pentrails, 0, 0);
                project.stage.changed();
            }
        };
        project.pentrails.src = model.pentrails.contents;
    }
    project.stage.setTempo(model.stage.attributes.tempo);
    StageMorph.prototype.dimensions = new Point(480, 360);
    if (model.stage.attributes.width) {
        StageMorph.prototype.dimensions.x =
            Math.max(+model.stage.attributes.width, 240);
    }
    if (model.stage.attributes.height) {
        StageMorph.prototype.dimensions.y =
            Math.max(+model.stage.attributes.height, 180);
    }
    project.stage.setExtent(StageMorph.prototype.dimensions);
    SpriteMorph.prototype.useFlatLineEnds =
        model.stage.attributes.lines === 'flat';
    BooleanSlotMorph.prototype.isTernary =
        model.stage.attributes.ternary !== 'false';
    Process.prototype.enableHyperOps =
        model.stage.attributes.hyperops !== 'false';
    project.stage.isThreadSafe =
        model.stage.attributes.threadsafe === 'true';
    StageMorph.prototype.enableCodeMapping =
        model.stage.attributes.codify === 'true';
    StageMorph.prototype.enableInheritance =
        model.stage.attributes.inheritance !== 'false';
    StageMorph.prototype.enableSublistIDs =
        model.stage.attributes.sublistIDs === 'true';

    model.hiddenPrimitives = model.project.childNamed('hidden');
    if (model.hiddenPrimitives) {
        model.hiddenPrimitives.contents.split(' ').forEach(
            sel => {
                if (sel) {
                    StageMorph.prototype.hiddenPrimitives[sel] = true;
                }
            }
        );
    }

    model.codeHeaders = model.project.childNamed('headers');
    if (model.codeHeaders) {
        model.codeHeaders.children.forEach(
            xml => StageMorph.prototype.codeHeaders[xml.tag] = xml.contents
        );
    }

    model.codeMappings = model.project.childNamed('code');
    if (model.codeMappings) {
        model.codeMappings.children.forEach(
            xml => StageMorph.prototype.codeMappings[xml.tag] = xml.contents
        );
    }

    model.globalBlocks = model.project.childNamed('blocks');
    if (model.globalBlocks) {
        this.loadCustomBlocks(project.stage, model.globalBlocks, true);
        this.populateCustomBlocks(
            project.stage,
            model.globalBlocks,
            true
        );
    }
    this.loadObject(project.stage, model.stage);

    /* Sprites */

    model.sprites = model.stage.require('sprites');
    project.sprites[project.stage.name] = project.stage;

    model.sprites.childrenNamed('sprite').forEach(
        model => this.loadValue(model)
    );

    // restore inheritance and nesting associations
    this.project.stage.children.forEach(sprite => {
        var exemplar, anchor;
        if (sprite.inheritanceInfo) { // only sprites can inherit
            exemplar = this.project.sprites[
                sprite.inheritanceInfo.exemplar
            ];
            if (exemplar) {
                sprite.setExemplar(exemplar);
            }
            sprite.inheritedAttributes = sprite.inheritanceInfo.delegated || [];
            sprite.updatePropagationCache();
        }
        if (sprite.nestingInfo) { // only sprites may have nesting info
            anchor = this.project.sprites[sprite.nestingInfo.anchor];
            if (anchor) {
                anchor.attachPart(sprite);
            }
            sprite.rotatesWithAnchor = (sprite.nestingInfo.synch === 'true');
        }
    });
    this.project.stage.children.forEach(sprite => {
        var costume;
        if (sprite.nestingInfo) { // only sprites may have nesting info
            sprite.nestingScale = +(sprite.nestingInfo.scale || sprite.scale);
            delete sprite.nestingInfo;
        }
        ['scripts', 'costumes', 'sounds'].forEach(att => {
            if (sprite.inheritsAttribute(att)) {
                sprite.refreshInheritedAttribute(att);
            }
        });
        if (sprite.inheritsAttribute('costumes')) {
            if (sprite.inheritsAttribute('costume #')) {
                costume = sprite.exemplar.costume;
            } else {
                costume = sprite.costumes.asArray()[
                    sprite.inheritanceInfo.costumeNumber - 1
                ];
            }
            if (costume) {
                if (costume.loaded) {
                    sprite.wearCostume(costume, true);
                } else {
                    costume.loaded = function () {
                        this.loaded = true;
                        sprite.wearCostume(costume, true);
                    };
                }
            }
        }
        delete sprite.inheritanceInfo;
    });

    /* Global Variables */

    if (model.globalVariables) {
        this.loadVariables(
            project.globalVariables,
            model.globalVariables
        );
    }

    this.objects = {};

    /* Watchers */

    model.sprites.childrenNamed('watcher').forEach(model => {
        var watcher, color, target, hidden, extX, extY;

        color = this.loadColor(model.attributes.color);
        target = Object.prototype.hasOwnProperty.call(
            model.attributes,
            'scope'
        ) ? project.sprites[model.attributes.scope] : null;

        // determine whether the watcher is hidden, slightly
        // complicated to retain backward compatibility
        // with former tag format: hidden="hidden"
        // now it's: hidden="true"
        hidden = Object.prototype.hasOwnProperty.call(
            model.attributes,
            'hidden'
        ) && (model.attributes.hidden !== 'false');

        if (Object.prototype.hasOwnProperty.call(
                model.attributes,
                'var'
            )) {
            watcher = new WatcherMorph(
                model.attributes['var'],
                color,
                isNil(target) ? project.globalVariables :
                target.variables,
                model.attributes['var'],
                hidden
            );
        } else {
            watcher = new WatcherMorph(
                localize(this.watcherLabels[model.attributes.s]),
                color,
                target,
                model.attributes.s,
                hidden
            );
        }
        watcher.setStyle(model.attributes.style || 'normal');
        if (watcher.style === 'slider') {
            watcher.setSliderMin(model.attributes.min || '1', true);
            watcher.setSliderMax(model.attributes.max || '100', true);
        }
        watcher.setPosition(
            project.stage.topLeft().add(new Point(
                +model.attributes.x || 0,
                +model.attributes.y || 0
            ))
        );
        project.stage.add(watcher);
        watcher.onNextStep = function () {
            this.currentValue = null;
        };

        // set watcher's contentsMorph's extent if it is showing a list and
        // its monitor dimensions are given
        if (watcher.currentValue instanceof List &&
            watcher.cellMorph.contentsMorph) {
            extX = model.attributes.extX;
            if (extX) {
                watcher.cellMorph.contentsMorph.setWidth(+extX);
            }
            extY = model.attributes.extY;
            if (extY) {
                watcher.cellMorph.contentsMorph.setHeight(+extY);
            }
            // adjust my contentsMorph's handle position
            watcher.cellMorph.contentsMorph.handle.fixLayout();
        }
    });

    // clear sprites' inherited methods caches, if any
    this.project.stage.children.forEach(
        sprite => sprite.inheritedMethodsCache = []
    );

    this.objects = {};
    return project;
};

// Render overrides for tutorials
SnapSerializer.prototype.openProject = function (project, ide) {
    var stage = ide.stage,
        sprites = [],
        sprite;
    if (!project || !project.stage) {
        return;
    }
    ide.siblings().forEach(morph =>
        morph.destroy()
    );
    ide.projectName = project.name;
    ide.projectNotes = project.notes || '';
    if (ide.globalVariables) {
        ide.globalVariables = project.globalVariables;
    }
    if (!stage.changeBlocks) {
        if (stage) {
            stage.destroy();
        }
        ide.add(project.stage);
        ide.stage = project.stage;
    }
    sprites = ide.stage.children.filter(
        child => child instanceof SpriteMorph
    );
    sprites.sort((x, y) => x.idx - y.idx);

    ide.sprites = new List(sprites);
    sprite = sprites[0] || project.stage;

    if (sizeOf(this.mediaDict) > 0) {
        ide.hasChangedMedia = false;
        this.mediaDict = {};
    } else {
        ide.hasChangedMedia = true;
    }
    if (!stage.changeBlocks) {
        project.stage.fixLayout();
    } else {
        ide.stage.fixLayout();
    }
    ide.createCorral();
    ide.selectSprite(sprite);
    if (stage.changeBlocks) {
        ide.flushBlocksCache();
        ide.refreshPalette();
    }
    ide.fixLayout();
    ide.renderTutorialLayout();
    ide.world().keyboardFocus = project.stage;
};

// Adding our custom fields to xml exports
StageMorph.prototype.toXML = function (serializer) {
    var thumbnail = normalizeCanvas(
            this.thumbnail(SnapSerializer.prototype.thumbnailSize),
            true
        ),
        thumbdata,
        costumeIdx = this.getCostumeIdx(),
        ide = this.parentThatIsA(IDE_Morph);

    // catch cross-origin tainting exception when using SVG costumes
    try {
        thumbdata = thumbnail.toDataURL('image/png');
    } catch (error) {
        thumbdata = null;
    }

    function code(key) {
        var str = '';
        Object.keys(StageMorph.prototype[key]).forEach(
            selector => {
                str += (
                    '<' + selector + '>' +
                    XML_Element.prototype.escape(
                        StageMorph.prototype[key][selector]
                    ) +
                    '</' + selector + '>'
                );
            }
        );
        return str;
    }

    this.removeAllClones();
    return serializer.format(
        '<project name="@" app="@" version="@">' +
        '<notes>$</notes>' +
        '<thumbnail>$</thumbnail>' +
        '<stage name="@" width="@" height="@" ' +
        'costume="@" color="@,@,@,@" tempo="@" threadsafe="@" ' +
        'tutorial="@" ' +
        'hideCostumesTab="@" hideSoundsTab="@" hideCorralBar="@" hideFileBtn="@" hideCloudBtn="@" hideControlBtns="@" hideSpriteBar="@" ' +
        'decategorize="@" changeBlocks="@" enableGlide="@" ' +
        'penlog="@" ' +
        '%' +
        'volume="@" ' +
        'pan="@" ' +
        'lines="@" ' +
        'ternary="@" ' +
        'hyperops="@" ' +
        'codify="@" ' +
        'inheritance="@" ' +
        'sublistIDs="@" ' +
        'scheduled="@" ~>' +
        '<pentrails>$</pentrails>' +
        '%' + // current costume, if it's not in the wardrobe
        '<costumes>%</costumes>' +
        '<sounds>%</sounds>' +
        '<variables>%</variables>' +
        '<blocks>%</blocks>' +
        '<scripts>%</scripts><sprites>%</sprites>' +
        '</stage>' +
        '<hidden>$</hidden>' +
        '<headers>%</headers>' +
        '<code>%</code>' +
        '<blocks>%</blocks>' +
        '<variables>%</variables>' +
        '</project>',
        (ide && ide.projectName) ? ide.projectName : localize('Untitled'),
        serializer.app,
        serializer.version,
        (ide && ide.projectNotes) ? ide.projectNotes : '',
        thumbdata,
        this.name,
        StageMorph.prototype.dimensions.x,
        StageMorph.prototype.dimensions.y,
        costumeIdx,
        this.color.r,
        this.color.g,
        this.color.b,
        this.color.a,
        this.getTempo(),
        this.isThreadSafe,
        StageMorph.prototype.tutorial,
        StageMorph.prototype.hideCostumesTab,
        StageMorph.prototype.hideSoundsTab,
        IDE_Morph.prototype.hideCorralBar,
        IDE_Morph.prototype.hideFileBtn,
        IDE_Morph.prototype.hideCloudBtn,
        IDE_Morph.prototype.hideControlBtns,
        IDE_Morph.prototype.hideSpriteBar,
        StageMorph.prototype.decategorize,
        StageMorph.prototype.changeBlocks,
        StageMorph.prototype.enableGlide,
        this.enablePenLogging,
        this.instrument ?
        ' instrument="' + parseInt(this.instrument) + '" ' : '',
        this.volume,
        this.pan,
        SpriteMorph.prototype.useFlatLineEnds ? 'flat' : 'round',
        BooleanSlotMorph.prototype.isTernary,
        Process.prototype.enableHyperOps === true,
        this.enableCodeMapping,
        this.enableInheritance,
        this.enableSublistIDs,
        StageMorph.prototype.frameRate !== 0,
        normalizeCanvas(this.trailsCanvas, true).toDataURL('image/png'),

        // current costume, if it's not in the wardrobe
        !costumeIdx && this.costume ?
        '<wear>' + serializer.store(this.costume) + '</wear>' :
        '',

        serializer.store(this.costumes, this.name + '_cst'),
        serializer.store(this.sounds, this.name + '_snd'),
        serializer.store(this.variables),
        serializer.store(this.customBlocks),
        serializer.store(this.scripts),
        serializer.store(this.children),
        Object.keys(StageMorph.prototype.hiddenPrimitives).reduce(
            (a, b) => a + ' ' + b,
            ''
        ),
        code('codeHeaders'),
        code('codeMappings'),
        serializer.store(this.globalBlocks),
        (ide && ide.globalVariables) ?
        serializer.store(ide.globalVariables) : ''
    );
};

// Override to allow for our projects to load in
IDE_Morph.prototype.openIn = function (world) {
    var hash, myself = this, urlLanguage = null;

    function initUser(username) {
        sessionStorage.username = username;
        myself.controlBar.cloudButton.refresh();
        if (username) {
            myself.source = 'cloud';
            if (!myself.cloud.verified) {
                new DialogBoxMorph().inform(
                    'Unverified account',
                    'Your account is still unverified.\n' +
                    'Please use the verification link that\n' +
                    'was sent to your email address when you\n' +
                    'signed up.\n\n' +
                    'If you cannot find that email, please\n' +
                    'check your spam folder. If you still\n' +
                    'cannot find it, please use the "Resend\n' +
                    'Verification Email..." option in the cloud\n' +
                    'menu.',
                    world,
                    myself.cloudIcon(null, new Color(0, 180, 0))
                );
            }
        }
    }

    this.buildPanes();
    world.add(this);
    world.userMenu = this.userMenu;

    // override SnapCloud's user message with Morphic
    this.cloud.message = (string) => {
        var m = new MenuMorph(null, string),
            intervalHandle;
        m.popUpCenteredInWorld(world);
        intervalHandle = setInterval(() => {
            m.destroy();
            clearInterval(intervalHandle);
        }, 2000);
    };

    // prevent non-DialogBoxMorphs from being dropped
    // onto the World in user-mode
    world.reactToDropOf = (morph) => {
        if (!(morph instanceof DialogBoxMorph ||
        		(morph instanceof MenuMorph))) {
            if (world.hand.grabOrigin) {
                morph.slideBackTo(world.hand.grabOrigin);
            } else {
                world.hand.grab(morph);
            }
        }
    };

    this.reactToWorldResize(world.bounds);

    function applyFlags(dict) {
        if (dict.noCloud) {
            myself.cloud.disable();
        }
        if (dict.embedMode) {
            myself.setEmbedMode();
        }
        if (dict.editMode) {
            myself.toggleAppMode(false);
        } else {
            myself.toggleAppMode(true);
        }
        if (!dict.noRun) {
            autoRun();
        }
        if (dict.hideControls) {
            myself.controlBar.hide();
            window.onbeforeunload = nop;
        }
        if (dict.noExitWarning) {
            window.onbeforeunload = nop;
        }
        if (dict.lang) {
            myself.setLanguage(dict.lang, null, true); // don't persist
        }

        // only force my world to get focus if I'm not in embed mode
        // to prevent the iFrame from involuntarily scrolling into view
        if (!myself.isEmbedMode) {
            world.worldCanvas.focus();
        }
    }
    
    function autoRun () {
        // wait until all costumes and sounds are loaded
        if (isLoadingAssets()) {
            myself.world().animations.push(
                new Animation(nop, nop, 0, 200, nop, autoRun)
            );
        } else {
            myself.runScripts();
        }
    }

    function isLoadingAssets() {
        return myself.sprites.asArray().concat([myself.stage]).some(any =>
            (any.costume ? any.costume.loaded !== true : false) ||
            any.costumes.asArray().some(each => each.loaded !== true) ||
            any.sounds.asArray().some(each => each.loaded !== true)
        );
    }

    // dynamic notifications from non-source text files
    // has some issues, commented out for now
    /*
    this.cloudMsg = getURL('https://snap.berkeley.edu/cloudmsg.txt');
    motd = getURL('https://snap.berkeley.edu/motd.txt');
    if (motd) {
        this.inform('Snap!', motd);
    }
    */

    function interpretUrlAnchors() {
        var dict, idx;

        if (location.hash.substr(0, 6) === '#open:') {
            hash = location.hash.substr(6);
            if (hash.charAt(0) === '%'
                    || hash.search(/\%(?:[0-9a-f]{2})/i) > -1) {
                hash = decodeURIComponent(hash);
            }
            if (contains(
                    ['project', 'blocks', 'sprites', 'snapdata'].map(each =>
                        hash.substr(0, 8).indexOf(each)
                    ),
                    1
                )) {
                this.droppedText(hash);
            } else {
                idx = hash.indexOf("&");
                if (idx > 0) {
                    dict = myself.cloud.parseDict(hash.substr(idx));
                    dict.editMode = true;
                    hash = hash.slice(0, idx);
                    applyFlags(dict);
                }
                this.shield = new Morph();
                this.shield.alpha = 0;
                this.shield.setExtent(this.parent.extent());
                this.parent.add(this.shield);
                this.showMessage('Fetching project...');

                this.getURL(
                    hash,
                    projectData => {
                        var msg;
                        this.nextSteps([
                            () => msg = this.showMessage('Opening project...'),
                            () => {
                                if (projectData.indexOf('<snapdata') === 0) {
                                    this.rawOpenCloudDataString(projectData);
                                } else if (
                                    projectData.indexOf('<project') === 0
                                ) {
                                    this.rawOpenProjectString(projectData);
                                }
                                this.hasChangedMedia = true;
                            },
                            () => {
                                this.shield.destroy();
                                this.shield = null;
                                msg.destroy();
                                this.toggleAppMode(false);
                            }
                        ]);
                    }
                );
            }
        } else if (location.hash.substr(0, 5) === '#run:') {
            hash = location.hash.substr(5);
            idx = hash.indexOf("&");
            if (idx > 0) {
                hash = hash.slice(0, idx);
            }
            if (hash.charAt(0) === '%'
                    || hash.search(/\%(?:[0-9a-f]{2})/i) > -1) {
                hash = decodeURIComponent(hash);
            }
            if (hash.substr(0, 8) === '<project>') {
                this.rawOpenProjectString(hash);
                applyFlags(myself.cloud.parseDict(location.hash.substr(5)));
            } else {
                this.shield = new Morph();
                this.shield.alpha = 0;
                this.shield.setExtent(this.parent.extent());
                this.parent.add(this.shield);
                this.showMessage('Fetching project...');

                this.getURL(
                    hash,
                    projectData => {
                        var msg;
                        this.nextSteps([
                            () => msg = this.showMessage('Opening project...'),
                            () => {
                                if (projectData.indexOf('<snapdata') === 0) {
                                    this.rawOpenCloudDataString(projectData);
                                } else if (
                                    projectData.indexOf('<project') === 0
                                ) {
                                    this.rawOpenProjectString(projectData);
                                }
                                this.hasChangedMedia = true;
                            },
                            () => {
                                this.shield.destroy();
                                this.shield = null;
                                msg.destroy();
                                // this.toggleAppMode(true);
                                applyFlags(
                                    this.cloud.parseDict(
                                        location.hash.substr(5)
                                    )
                                );
                            }
                        ]);
                    }
                );
            }
        } else if (location.hash.substr(0, 9) === '#present:') {
            this.shield = new Morph();
            this.shield.color = this.color;
            this.shield.setExtent(this.parent.extent());
            this.parent.add(this.shield);
            myself.showMessage('Fetching project\nfrom the cloud...');

            // make sure to lowercase the username
            dict = myself.cloud.parseDict(location.hash.substr(9));
            dict.Username = dict.Username.toLowerCase();

            myself.cloud.getPublicProject(
                dict.ProjectName,
                dict.Username,
                projectData => {
                    var msg;
                    myself.nextSteps([
                        () => msg = myself.showMessage('Opening project...'),
                        () => {
                            if (projectData.indexOf('<snapdata') === 0) {
                                myself.rawOpenCloudDataString(projectData);
                            } else if (
                                projectData.indexOf('<project') === 0
                            ) {
                                myself.rawOpenProjectString(projectData);
                            }
                            myself.hasChangedMedia = true;
                        },
                        () => {
                            myself.shield.destroy();
                            myself.shield = null;
                            msg.destroy();
                            applyFlags(dict);
                        }
                    ]);
                },
                this.cloudError()
            );
        } else if (location.hash.substr(0, 7) === '#cloud:') {
            this.shield = new Morph();
            this.shield.alpha = 0;
            this.shield.setExtent(this.parent.extent());
            this.parent.add(this.shield);
            myself.showMessage('Fetching project\nfrom the cloud...');

            // make sure to lowercase the username
            dict = myself.cloud.parseDict(location.hash.substr(7));

            myself.cloud.getPublicProject(
                dict.ProjectName,
                dict.Username,
                projectData => {
                    var msg;
                    myself.nextSteps([
                        () => msg = myself.showMessage('Opening project...'),
                        () => {
                            if (projectData.indexOf('<snapdata') === 0) {
                                myself.rawOpenCloudDataString(projectData);
                            } else if (
                                projectData.indexOf('<project') === 0
                            ) {
                                myself.rawOpenProjectString(projectData);
                            }
                            myself.hasChangedMedia = true;
                        },
                        () => {
                            myself.shield.destroy();
                            myself.shield = null;
                            msg.destroy();
                            myself.toggleAppMode(false);
                        }
                    ]);
                },
                this.cloudError()
            );
        } else if (location.hash.substr(0, 4) === '#dl:') {
            myself.showMessage('Fetching project\nfrom the cloud...');

            // make sure to lowercase the username
            dict = myself.cloud.parseDict(location.hash.substr(4));
            dict.Username = dict.Username.toLowerCase();

            myself.cloud.getPublicProject(
                dict.ProjectName,
                dict.Username,
                projectData => {
                	myself.saveXMLAs(projectData, dict.ProjectName);
                 	myself.showMessage(
                  	   'Saved project\n' + dict.ProjectName,
                      	2
                 	);
                },
                this.cloudError()
            );
        } else if (location.hash.substr(0, 6) === '#lang:') {
            urlLanguage = location.hash.substr(6);
            this.setLanguage(urlLanguage, null, true); // don't persist
            this.loadNewProject = true;
        } else if (location.hash.substr(0, 7) === '#signup') {
            this.createCloudAccount();
        }
        this.loadNewProject = false;
    }

    // Checks and loads in current project
    function loadCSDTProject() {
        if (typeof config !== 'undefined') {
            if (typeof config.project !== 'undefined') {
                myself.cloud.getProject(
                    config.project,
                    '',
                    function (response) {
                        myself.source = 'cloud';
                        myself.droppedText(response);
                    }, myself.cloudError());
            }
        }
    }
    loadCSDTProject();

    if (this.userLanguage) {
        this.loadNewProject = true;
        this.setLanguage(this.userLanguage, interpretUrlAnchors);
    } else {
        interpretUrlAnchors.call(this);
    }

    if (location.protocol !== 'file:') {
        if (!sessionStorage.username) {
            // check whether login should persist across browser sessions
            // this.cloud.initSession(initUser);
        } else {
            // login only persistent during a single browser session
            this.cloud.checkCredentials(initUser);
        }
    }

    this.cloud.checkCredentials(initUser);

    world.keyboardFocus = this.stage;
    this.warnAboutIE();
};

/** Classroom Functionality
 * 
 * Most every override for classrooms..
 */
 ProjectDialogMorph.prototype.classroomList = []
 ProjectDialogMorph.prototype.classroomListField = null;
 ProjectRecoveryDialogMorph.prototype.classroomListField = null;
 
 ProjectDialogMorph.prototype.init = function (ide, task) {
     // additional properties:
     this.ide = ide;
     this.task = task || 'open'; // String describing what do do (open, save)
     this.source = ide.source;
     this.projectList = []; // [{name: , thumb: , notes:}]
     this.classroomList = [];
     this.handle = null;
     this.srcBar = null;
     this.nameField = null;
     this.filterField = null;
     this.magnifyingGlass = null;
     this.listField = null;
     this.classroomListField = null;
     this.preview = null;
     this.notesText = null;
     this.notesField = null;
     this.deleteButton = null;
     this.shareButton = null;
     this.unshareButton = null;
     this.publishButton = null;
     this.unpublishButton = null;
     this.recoverButton = null;
 
     // initialize inherited properties:
     ProjectDialogMorph.uber.init.call(
         this,
         this, // target
         null, // function
         null // environment
     );
 
     // override inherited properites:
     this.labelString = this.task === 'save' ? 'Save Project' : 'Open Project';
     this.createLabel();
     this.key = 'project' + task;
 
     // build contents
     if (task === 'open' && this.source === 'disk') {
         // give the user a chance to switch to another source
         this.source = null;
         this.buildContents();
         this.projectList = [];
         this.listField.hide();
         this.source = 'disk';
     } else {
         this.buildContents();
         this.onNextStep = () => // yield to show "updating" message
             this.setSource(this.source);
     }
 };
 
 ProjectDialogMorph.prototype.buildContents = function () {
     var thumbnail, notification;
 
     this.addBody(new Morph());
     this.body.color = this.color;
 
     this.srcBar = new AlignmentMorph('column', this.padding / 2);
 
     if (this.ide.cloudMsg) {
         notification = new TextMorph(
             this.ide.cloudMsg,
             10,
             null, // style
             false, // bold
             null, // italic
             null, // alignment
             null, // width
             null, // font name
             new Point(1, 1), // shadow offset
             WHITE // shadowColor
         );
         notification.refresh = nop;
         this.srcBar.add(notification);
     }
 
     this.addSourceButton('cloud', localize('Cloud'), 'cloud');
 
     if (this.task === 'open') {
         this.buildFilterField();
         this.addSourceButton('examples', localize('Tools'), 'poster');
         if (this.ide.world().currentKey === 16) {
             // shift- clicked this.hasLocalProjects() || 
             this.addSourceButton('local', localize('Browser'), 'globe');
         }
     }
     this.addSourceButton('disk', localize('Computer'), 'storage');
 
     this.srcBar.fixLayout();
     this.body.add(this.srcBar);
 
     if (this.task === 'save') {
         this.nameField = new InputFieldMorph(this.ide.projectName);
         this.body.add(this.nameField);
     }
 
     this.listField = new ListMorph([]);
     this.fixListFieldItemColors();
     this.listField.fixLayout = nop;
     this.listField.edge = InputFieldMorph.prototype.edge;
     this.listField.fontSize = InputFieldMorph.prototype.fontSize;
     this.listField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
     this.listField.contrast = InputFieldMorph.prototype.contrast;
     this.listField.render = InputFieldMorph.prototype.render;
     this.listField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;
 
     this.body.add(this.listField);
 
     this.preview = new Morph();
     this.preview.fixLayout = nop;
     this.preview.edge = InputFieldMorph.prototype.edge;
     this.preview.fontSize = InputFieldMorph.prototype.fontSize;
     this.preview.typeInPadding = InputFieldMorph.prototype.typeInPadding;
     this.preview.contrast = InputFieldMorph.prototype.contrast;
     this.preview.render = function (ctx) {
         InputFieldMorph.prototype.render.call(this, ctx);
         if (this.cachedTexture) {
             this.renderCachedTexture(ctx);
         } else if (this.texture) {
             this.renderTexture(this.texture, ctx);
         }
     };
     this.preview.renderCachedTexture = function (ctx) {
         ctx.drawImage(this.cachedTexture, this.edge, this.edge);
     };
     this.preview.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;
     this.preview.setExtent(
         this.ide.serializer.thumbnailSize.add(this.preview.edge * 2)
     );
 
     this.body.add(this.preview);
     if (this.task === 'save') {
         thumbnail = this.ide.stage.thumbnail(
             SnapSerializer.prototype.thumbnailSize
         );
         this.preview.texture = null;
         this.preview.cachedTexture = thumbnail;
         this.preview.rerender();
     }
 
     this.notesField = new ScrollFrameMorph();
     this.notesField.fixLayout = nop;
 
     this.notesField.edge = InputFieldMorph.prototype.edge;
     this.notesField.fontSize = InputFieldMorph.prototype.fontSize;
     this.notesField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
     this.notesField.contrast = InputFieldMorph.prototype.contrast;
     this.notesField.render = InputFieldMorph.prototype.render;
     this.notesField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;
 
     this.notesField.acceptsDrops = false;
     this.notesField.contents.acceptsDrops = false;
 
     if (this.task === 'open') {
         this.notesText = new TextMorph('');
     } else { // 'save'
         this.notesText = new TextMorph(this.ide.projectNotes);
         this.notesText.isEditable = true;
         this.notesText.enableSelecting();
     }
 
     this.notesField.isTextLineWrapping = true;
     this.notesField.padding = 3;
     this.notesField.setContents(this.notesText);
     this.notesField.setWidth(this.preview.width());
 
     this.body.add(this.notesField);
 
     if (this.task === 'save') {
         this.classroomListField = new ListMorph([]);
         this.fixClassRoomItemColors();
         this.classroomListField.fixLayout = nop;
         this.classroomListField.edge = InputFieldMorph.prototype.edge;
         this.classroomListField.fontSize = InputFieldMorph.prototype.fontSize;
         this.classroomListField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
         this.classroomListField.contrast = InputFieldMorph.prototype.contrast;
         this.classroomListField.render = InputFieldMorph.prototype.render;
         this.classroomListField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;
         this.classroomListField.acceptsDrops = false;
         this.classroomListField.contents.acceptsDrops = false;
         this.classroomListField.isTextLineWrapping = true;
         this.classroomListField.padding = 3;
         this.classroomListField.setWidth(this.preview.width());
         // if (this.task ==='save'){
         this.body.add(this.classroomListField);
         // }
 
     }
     if (this.task === 'open') {
         this.addButton('openProject', 'Open');
         this.action = 'openProject';
         this.recoverButton = this.addButton('recoveryDialog', 'Recover', true);
         this.recoverButton.hide();
     } else { // 'save'
         this.addButton('saveProject', 'Save');
         this.action = 'saveProject';
     }
     // this.shareButton = this.addButton('shareProject', 'Share', true);
     // this.unshareButton = this.addButton('unshareProject', 'Unshare', true);
     // this.shareButton.hide();
     // this.unshareButton.hide();
     // this.publishButton = this.addButton('publishProject', 'Publish', true);
     // this.unpublishButton = this.addButton(
     //     'unpublishProject',
     //     'Unpublish',
     //     true
     // );
     // this.publishButton.hide();
     // this.unpublishButton.hide();
     // this.deleteButton = this.addButton('deleteProject', 'Delete');
     this.addButton('cancel', 'Cancel');
 
     if (notification) {
         this.setExtent(new Point(500, 360).add(notification.extent()));
     } else {
         this.setExtent(new Point(500, 360));
     }
     this.fixLayout();
 
 };
 
 ProjectDialogMorph.prototype.setSource = function (source) {
     var msg, classmsg;
 
     this.source = source;
     this.srcBar.children.forEach(button =>
         button.refresh()
     );
 
     switch (this.source) {
         case 'cloud':
             msg = this.ide.showMessage('Updating\nproject list...');
             // classmsg = this.ide.showMessage('Updating\nclassroom list...');
             this.projectList = [];
             this.ide.cloud.getProjectList(
                 response => {
                     // Don't show cloud projects if user has since switched panes.
                     if (this.source === 'cloud') {
                         this.installCloudProjectList(response);
                     }
                     msg.destroy();
                 },
                 (err, lbl) => {
                     // msg.destroy();
                     this.ide.cloudError().call(null, err, lbl);
                     this.ide.initializeCloud();
                     //CSDT allow users to login if trying to save without logging in
                 }
             );
             this.classroomList = [];
             this.ide.cloud.getClassroomList(
                 response => {
                     // Don't show cloud projects if user has since switched panes.
                     if (this.source === 'cloud' && this.task == 'save') {
                         this.installCloudClassroomList(response);
                     }
                     // classmsg.destroy();
                 },
                 (err, lbl) => {
                     // classmsg.destroy();
                     this.ide.cloudError().call(null, err, lbl);
                 }
             );
             return;
         case 'examples':
             this.classroomList = [];
             this.projectList = this.getExamplesProjectList();
             break;
         case 'local':
             // deprecated, only for reading
             this.classroomList = [];
             this.projectList = this.getLocalProjectList();
             break;
         case 'disk':
             this.classroomList = [];
             if (this.task === 'save') {
                 this.projectList = [];
             } else {
                 this.destroy();
                 this.ide.importLocalFile();
                 return;
             }
             break;
     }
 
     this.listField.destroy();
     this.listField = new ListMorph(
         this.projectList,
         this.projectList.length > 0 ?
         (element) => {
             return element.name || element;
         } :
         null,
         null,
         () => this.ok()
     );
     if (this.source === 'disk') {
         this.listField.hide();
     }
 
     if (this.classroomListField !== null) {
         this.classroomListField.destroy();
     }
 
     this.classroomListField = new ListMorph(
         this.classroomList,
         this.classroomList.length > 0 ?
         function (element) {
             return element.team_name;
         } : null,
         null,
         function () {
             myself.ok();
         }
     );
 
     if (this.source !== 'save') {
         this.classroomListField.hide();
     }
     this.fixListFieldItemColors();
     this.listField.fixLayout = nop;
     this.listField.edge = InputFieldMorph.prototype.edge;
     this.listField.fontSize = InputFieldMorph.prototype.fontSize;
     this.listField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
     this.listField.contrast = InputFieldMorph.prototype.contrast;
     this.listField.render = InputFieldMorph.prototype.render;
     this.listField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;
 
     this.fixListFieldItemColors();
     this.classroomListField.fixLayout = nop;
     this.classroomListField.edge = InputFieldMorph.prototype.edge;
     this.classroomListField.fontSize = InputFieldMorph.prototype.fontSize;
     this.classroomListField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
     this.classroomListField.contrast = InputFieldMorph.prototype.contrast;
     this.classroomListField.render = InputFieldMorph.prototype.render;
     this.classroomListField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;
 
 
     if (this.source === 'local') {
         this.listField.action = (item) => {
             var src, xml;
             if (item === undefined) {
                 return;
             }
             if (this.nameField) {
                 this.nameField.setContents(item.name || '');
             }
             if (this.task === 'open') {
                 src = localStorage['-snap-project-' + item.name];
                 if (src) {
                     xml = this.ide.serializer.parse(src);
                     this.notesText.text =
                         xml.childNamed('notes').contents || '';
                     this.notesText.rerender();
                     this.notesField.contents.adjustBounds();
                     this.preview.texture =
                         xml.childNamed('thumbnail').contents || null;
                     this.preview.cachedTexture = null;
                     this.preview.rerender();
                 }
             }
             this.edit();
             this.classroomListField.hide();
         };
     } else { // 'examples'; 'cloud' is initialized elsewhere
         this.listField.action = (item) => {
             var src, xml;
             if (item === undefined) {
                 return;
             }
             if (this.nameField) {
                 this.nameField.setContents(item.name || '');
             }
             src = this.ide.getURL(
                 this.ide.resourceURL('Tools', item.fileName)
             );
             xml = this.ide.serializer.parse(src);
             this.notesText.text = xml.childNamed('notes').contents || '';
             this.notesText.rerender();
             this.notesField.contents.adjustBounds();
             this.preview.texture = xml.childNamed('thumbnail').contents || null;
             this.preview.cachedTexture = null;
             this.preview.rerender();
             this.edit();
         };
     }
     this.body.add(this.listField);
     this.body.add(this.classroomListField);
     // this.shareButton.hide();
     // this.unshareButton.hide();
 
     // if (this.task === 'open') {
     //     this.recoverButton.hide();
     // }
 
     // this.publishButton.hide();
     // this.unpublishButton.hide();
     // if (this.source === 'local') {
     //     this.deleteButton.show();
     // } else { // examples
     //     this.deleteButton.hide();
     // }
     this.buttons.fixLayout();
     this.fixLayout();
     if (this.task === 'open') {
         this.clearDetails();
     }
 };
 
 ProjectDialogMorph.prototype.installCloudClassroomList = function (cl) {
     var myself = this;
     this.classroomList = cl || [];
     this.classroomList.sort(function (x, y) {
         return x.name < y.name ? -1 : 1;
     });
 
     this.classroomListField.destroy();
     this.classroomListField = new ListMorph(
         this.classroomList,
         this.classroomList.length > 0 ?
         function (element) {
             return element.team_name;
         } : null,
         [ // format: display shared project names bold
             [
                 'bold',
                 function (proj) {
                     return proj.approved === true;
                 }
             ]
         ],
         function () {
             myself.ok();
         }
     );
     this.fixClassRoomItemColors();
     this.classroomListField.fixLayout = nop;
     this.classroomListField.edge = InputFieldMorph.prototype.edge;
     this.classroomListField.fontSize = InputFieldMorph.prototype.fontSize;
     this.classroomListField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
     this.classroomListField.contrast = InputFieldMorph.prototype.contrast;
     this.classroomListField.render = InputFieldMorph.prototype.render;
     this.classroomListField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;
     this.classroomListField.action = function (item) {
         if (item === undefined) {
             return;
         }
         if (item.team) {
             myself.ide.cloud.classroom_id = item.team;
         }
         myself.edit();
     };
     // this.classroomListField.select(this.classroomListField.elements[0], true);
     this.body.add(this.classroomListField);
     this.fixLayout();
 };
 
 ProjectDialogMorph.prototype.fixClassRoomItemColors = function () {
     // remember to always fixLayout() afterwards for the changes
     // to take effect
     var myself = this;
     this.classroomListField.contents.children[0].alpha = 0;
     this.classroomListField.contents.children[0].children.forEach(function (item) {
         item.pressColor = myself.titleBarColor.darker(20);
         item.color = new Color(0, 0, 0, 0);
         item.noticesTransparentClick = true;
     });
 };
 
 ProjectDialogMorph.prototype.openProject = function () {
     var proj = this.listField.selected,
         src;
     if (!proj) {
         return;
     }
     this.ide.source = this.source;
     if (this.source === 'cloud') {
         this.openCloudProject(proj);
     } else if (this.source === 'examples') {
         // Note "file" is a property of the parseResourceFile function.
         this.ide.source = 'cloud';
         this.ide.cloud.project_id = null;
         this.ide.cloud.project_approved = false;
         this.ide.cloud.classroom_id = '';
         src = this.ide.getURL(this.ide.resourceURL('Tools', proj.fileName));
         this.ide.backup(() => this.ide.openProjectString(src));
         // this.ide.openProjectString(src);
         this.destroy();
     } else { // 'local'
         this.ide.source = null;
         // this.ide.openProject(proj.name);
         this.ide.backup(() => this.ide.openProject(proj.name));
         this.destroy();
     }
 };
 
 ProjectDialogMorph.prototype.rawOpenCloudProject = function (proj, delta) {
     this.ide.cloud.getProject(
         proj,
         delta,
         clouddata => {
             this.ide.source = 'cloud';
             this.ide.nextSteps([
                 () => this.ide.cloud.updateURL(proj.id),
                 () => this.ide.cloud.project_id = proj.id,
                 () => this.ide.cloud.application_id = proj.application,
                 () => this.ide.cloud.project_approved = proj.approved,
                 () => this.ide.cloud.classroom_id = proj.classroom,
                 () => this.ide.droppedText(clouddata)
 
             ]);
             // openCloudDataString was replaced with droppedText since we are directly grabbing the blob 
             location.hash = '';
             if (proj.ispublic) {
                 location.hash = '#present:Username=' +
                     encodeURIComponent(this.ide.cloud.username) + '&ProjectName=' +
                     encodeURIComponent(proj.projectname);
             }
         },
         this.ide.cloudError()
     );
     this.destroy();
 };
 
 ProjectDialogMorph.prototype.fixLayout = function () {
     var th = fontHeight(this.titleFontSize) + this.titlePadding * 2,
         thin = this.padding / 2,
         inputField = this.nameField || this.filterField;
 
     if (this.buttons && (this.buttons.children.length > 0)) {
         this.buttons.fixLayout();
     }
 
     if (this.body) {
         this.body.setPosition(this.position().add(new Point(
             this.padding,
             th + this.padding
         )));
         this.body.setExtent(new Point(
             this.width() - this.padding * 2,
             this.height() - this.padding * 3 - th - this.buttons.height()
         ));
         this.srcBar.setPosition(this.body.position());
 
         inputField.setWidth(
             this.body.width() - this.srcBar.width() - this.padding * 6
         );
         inputField.setLeft(this.srcBar.right() + this.padding * 3);
         inputField.setTop(this.srcBar.top());
 
         this.listField.setLeft(this.srcBar.right() + this.padding);
         this.listField.setWidth(
             this.body.width() -
             this.srcBar.width() -
             this.preview.width() -
             this.padding -
             thin
         );
         this.listField.contents.children[0].adjustWidths();
 
         this.listField.setTop(inputField.bottom() + this.padding);
         this.listField.setHeight(
             this.body.height() - inputField.height() - this.padding
         );
 
         if (this.magnifyingGlass) {
             this.magnifyingGlass.setTop(inputField.top());
             this.magnifyingGlass.setLeft(this.listField.left());
         }
 
         this.preview.setRight(this.body.right());
         this.preview.setTop(inputField.bottom() + this.padding);
 
         this.notesField.setTop(this.preview.bottom() + thin);
         this.notesField.setLeft(this.preview.left());
         this.notesField.setHeight(
             this.body.bottom() - this.preview.bottom() - thin
         );
 
         if (this.classroomListField) {
 
             this.classroomListField.setTop(this.srcBar.bottom() + thin);
             this.classroomListField.setLeft(this.srcBar.left());
             this.classroomListField.setHeight(
                 this.body.bottom() - this.srcBar.bottom() - thin
             );
             this.classroomListField.setWidth(this.srcBar.width());
             this.classroomListField.contents.children[0].adjustWidths();
         }
     }
 
 
     if (this.label) {
         this.label.setCenter(this.center());
         this.label.setTop(this.top() + (th - this.label.height()) / 2);
     }
 
     if (this.buttons && (this.buttons.children.length > 0)) {
         this.buttons.setCenter(this.center());
         this.buttons.setBottom(this.bottom() - this.padding);
     }
 
     // refresh shadow
     this.removeShadow();
     this.addShadow();
 };
 
 ProjectDialogMorph.prototype.getExamplesProjectList = function () {
     return this.ide.getMediaList('Tools');
 };




// Filters different apps, and removes unneeded buttons
ProjectDialogMorph.prototype.installCloudProjectList = function (pl) {
    this.projectList = pl[0] ? pl : [];

    // Filter projects based on CSnap Pro apps (might need to find a better way of doing this, or just make sure that they all can work)
    let filteredProjectList = this.projectList.filter(function (p) {
        if (p.application === 97 || p.application >= 103)
            return true;
        else
            return false;
    });
    this.projectList = filteredProjectList;
    this.projectList.sort((x, y) =>
        x.name.toLowerCase() < y.name.toLowerCase() ? -1 : 1
    );

    this.listField.destroy();
    this.listField = new ListMorph(
        this.projectList,
        this.projectList.length > 0 ?
        (element) => {
            return element.name || element;
        } :
        null,
        [ // format: display shared project names bold
            [
                'bold',
                proj => proj.approved
            ],
            [
                'italic',
                proj => proj.ispublished
            ]
        ],
        () => this.ok()
    );
    this.fixListFieldItemColors();
    this.listField.fixLayout = nop;
    this.listField.edge = InputFieldMorph.prototype.edge;
    this.listField.fontSize = InputFieldMorph.prototype.fontSize;
    this.listField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    this.listField.contrast = InputFieldMorph.prototype.contrast;
    this.listField.render = InputFieldMorph.prototype.render;
    this.listField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;

    this.listField.action = (item) => {
        if (item === undefined) {
            return;
        }
        if (this.nameField) {
            this.nameField.setContents(item.name || '');
        }
        if (this.task === 'open') {
            this.notesText.text = item.notes || '';
            this.notesText.rerender();
            this.notesField.contents.adjustBounds();
            this.preview.texture = '';
            this.preview.rerender();

            this.preview.texture = item.screenshot_url;
            this.preview.cachedTexture = null;
            this.preview.rerender();
        }
        this.buttons.fixLayout();
        this.fixLayout();
        this.edit();
    };
    this.body.add(this.listField);
    this.buttons.fixLayout();
    this.fixLayout();
    if (this.task === 'open') {
        this.clearDetails();
    }
};

// Override to update project number, asking to confirm save
IDE_Morph.prototype.saveProjectToCloud = function (name) {
    var projectBody, projectSize;

    this.confirm(
        localize(
            'Are you sure you want to replace'
        ) + '\n"' + name + '"?',
        'Replace Project',
        () => {
            if (name) {
                this.setProjectName(name);
            }
            this.showMessage('Saving project\nto the cloud...');
            projectBody = this.buildProjectRequest();
            projectSize = this.verifyProject(projectBody);
            if (!projectSize) {
                return;
            } // Invalid Projects don't return anything.
            this.showMessage(
                'Uploading ' + Math.round(projectSize / 1024) + ' KB...'
            );
            this.cloud.saveProject(
                this.projectName,
                projectBody,
                (data) => {
                    this.showMessage('saved.', 2);
                    this.cloud.updateURL(data.id);
                    this.cloud.project_id = data.id;
                    this.cloud.project_approved = data.approved;
                },
                this.cloudError()
            );
        }
    );
};

// Probably not needed, but a save as function. (Probably can be condensed...)
IDE_Morph.prototype.saveAsProjectToCloud = function (name) {
    var projectBody, projectSize;

    if (name) {
        this.setProjectName(name);
    }

    if (this.cloud.project_id) {
        this.cloud.project_id = null;
    }
    this.showMessage('Saving project\nto the cloud...');
    projectBody = this.buildProjectRequest();
    projectSize = this.verifyProject(projectBody);
    if (!projectSize) {
        return;
    } // Invalid Projects don't return anything.
    this.showMessage(
        'Uploading ' + Math.round(projectSize / 1024) + ' KB...'
    );
    this.cloud.saveProject(
        this.projectName,
        projectBody,
        (data) => {
            this.showMessage('saved.', 2);
            this.cloud.updateURL(data.id);
            this.cloud.project_id = data.id;
            this.cloud.project_approved = data.approved;
        },
        this.cloudError()
    );
};

// Hide primitive reversal for tutorials
BlockMorph.prototype.showPrimitive = function () {
    var ide = this.parentThatIsA(IDE_Morph),
        dict,
        cat;
    if (!ide) {
        return;
    }
    delete StageMorph.prototype.hiddenPrimitives[this.selector];
    dict = {
        doWarp: 'control',
        reifyScript: 'operators',
        reifyReporter: 'operators',
        reifyPredicate: 'operators',
        doDeclareVariables: 'variables'
    };
    cat = dict[this.selector] || this.category;
    if (cat === 'lists') {
        cat = 'variables';
    }
    ide.flushBlocksCache(cat);
    ide.refreshPalette();
};

// Overriding text shown in "About Snap"
IDE_Morph.prototype.aboutSnap = function () {
    var dlg, aboutTxt, noticeTxt, creditsTxt, versions = '',
        translations,
        module, btn1, btn2, btn3, btn4, licenseBtn, translatorsBtn,
        world = this.world();

    aboutTxt = 'CSnap! Pro 3.0.0 -\nSnap! with Culture\n\n' +
        '        CSnap Pro! was developed by the CSDT Team and ' +
        'the University of Michigan       \n' +
        'with support from the National Science Foundation (NSF).\n\n' +
        'The design of CSnap! is influenced and inspired by Snap!,\n' +
        'created by Jens M\u00F6nig.\n\n'; +
        'for more information see https://csdt.org';

    noticeTxt = localize('License') +
        '\n\n' +
        'Snap! is free software: you can redistribute it and/or modify\n' +
        'it under the terms of the GNU Affero General Public License as\n' +
        'published by the Free Software Foundation, either version 3 of\n' +
        'the License, or (at your option) any later version.\n\n'

        +
        'This program is distributed in the hope that it will be useful,\n' +
        'but WITHOUT ANY WARRANTY; without even the implied warranty of\n' +
        'MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the\n' +
        'GNU Affero General Public License for more details.\n\n'

        +
        'You should have received a copy of the\n' +
        'GNU Affero General Public License along with this program.\n' +
        'If not, see http://www.gnu.org/licenses/\n\n'

        +
        'Want to use Snap! but scared by the open-source license?\n' +
        'Get in touch with us, we\'ll make it work.';

    creditsTxt = localize('Contributors') +
        '\n\nNathan Dinsmore: Saving/Loading, Snap-Logo Design, ' +
        '\ncountless bugfixes and optimizations' +
        '\nMichael Ball: Time/Date UI, Library Import Dialog,' +
        '\ncountless bugfixes and optimizations' +
        '\nBernat Romagosa: Countless contributions' +
        '\nBartosz Leper: Retina Display Support' +
        '\nZhenlei Jia and Dariusz Dorożalski: IME text editing' +
        '\nKen Kahn: IME support and countless other contributions' +
        '\nJosep Ferràndiz: Video Motion Detection' +
        '\nJoan Guillén: Countless contributions' +
        '\nKartik Chandra: Paint Editor' +
        '\nCarles Paredes: Initial Vector Paint Editor' +
        '\n"Ava" Yuan Yuan, Dylan Servilla: Graphic Effects' +
        '\nKyle Hotchkiss: Block search design' +
        '\nBrian Broll: Many bugfixes and optimizations' +
        '\nIan Reynolds: UI Design, Event Bindings, ' +
        'Sound primitives' +
        '\nJadga Hügle: Icons and countless other contributions' +
        '\nIvan Motyashov: Initial Squeak Porting' +
        '\nLucas Karahadian: Piano Keyboard Design' +
        '\nDavide Della Casa: Morphic Optimizations' +
        '\nAchal Dave: Web Audio' +
        '\nJoe Otto: Morphic Testing and Debugging';

    for (module in modules) {
        if (Object.prototype.hasOwnProperty.call(modules, module)) {
            versions += ('\n' + module + ' (' +
                modules[module] + ')');
        }
    }
    if (versions !== '') {
        versions = localize('current module versions:') + ' \n\n' +
            'morphic (' + morphicVersion + ')' +
            versions;
    }
    translations = localize('Translations') + '\n' + SnapTranslator.credits();

    dlg = new DialogBoxMorph();

    function txt(textString) {
        var tm = new TextMorph(
                textString,
                dlg.fontSize,
                dlg.fontStyle,
                true,
                false,
                'center',
                null,
                null,
                MorphicPreferences.isFlat ? null : new Point(1, 1),
                WHITE
            ),
            scroller,
            maxHeight = world.height() - dlg.titleFontSize * 10;
        if (tm.height() > maxHeight) {
            scroller = new ScrollFrameMorph();
            scroller.acceptsDrops = false;
            scroller.contents.acceptsDrops = false;
            scroller.bounds.setWidth(tm.width());
            scroller.bounds.setHeight(maxHeight);
            scroller.addContents(tm);
            scroller.color = new Color(0, 0, 0, 0);
            return scroller;
        }
        return tm;
    }

    dlg.inform('About CSnap Pro', aboutTxt, world, this.logo.cachedTexture);
    btn1 = dlg.buttons.children[0];
    translatorsBtn = dlg.addButton(
        () => {
            dlg.addBody(txt(translations));
            dlg.body.fixLayout();
            btn1.show();
            btn2.show();
            btn3.hide();
            btn4.hide();
            licenseBtn.hide();
            translatorsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Translators...'
    );
    btn2 = dlg.addButton(
        () => {
            dlg.addBody(txt(aboutTxt));
            dlg.body.fixLayout();
            btn1.show();
            btn2.hide();
            btn3.show();
            btn4.show();
            licenseBtn.show();
            translatorsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Back...'
    );
    btn2.hide();
    licenseBtn = dlg.addButton(
        () => {
            dlg.addBody(txt(noticeTxt));
            dlg.body.fixLayout();
            btn1.show();
            btn2.show();
            btn3.hide();
            btn4.hide();
            licenseBtn.hide();
            translatorsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'License...'
    );
    btn3 = dlg.addButton(
        () => {
            dlg.addBody(txt(versions));
            dlg.body.fixLayout();
            btn1.show();
            btn2.show();
            btn3.hide();
            btn4.hide();
            licenseBtn.hide();
            translatorsBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Modules...'
    );
    btn4 = dlg.addButton(
        () => {
            dlg.addBody(txt(creditsTxt));
            dlg.body.fixLayout();
            btn1.show();
            btn2.show();
            translatorsBtn.show();
            btn3.hide();
            btn4.hide();
            licenseBtn.hide();
            dlg.fixLayout();
            dlg.setCenter(world.center());
        },
        'Credits...'
    );
    translatorsBtn.hide();
    dlg.fixLayout();
};

// Override for presentation mode
IDE_Morph.prototype.rawOpenProjectString = function (str) {
    this.spriteBar.tabBar.tabTo('scripts');
    StageMorph.prototype.hiddenPrimitives = {};
    StageMorph.prototype.codeMappings = {};
    StageMorph.prototype.codeHeaders = {};
    StageMorph.prototype.enableCodeMapping = false;
    StageMorph.prototype.enableInheritance = true;
    StageMorph.prototype.enableSublistIDs = false;
    StageMorph.prototype.enablePenLogging = false;
    Process.prototype.enableLiveCoding = false;
    this.trash = [];
    this.hasUnsavedEdits = false;
    if (Process.prototype.isCatchingErrors) {
        try {
            this.serializer.openProject(
                this.serializer.load(str, this),
                this
            );
        } catch (err) {
            this.showMessage('Load failed: ' + err);
        }
    } else {
        this.serializer.openProject(
            this.serializer.load(str, this),
            this
        );
    }
    // Based on project, decide if it should be in presentation mode or not
    this.toggleAppMode(config.presentation !== undefined ? true : false);
    
    this.stopFastTracking();
};

// Override for CSnap Pro text in SVGs
StageMorph.prototype.trailsLogAsSVG = function () {
    var bottomLeft = this.trailsLog[0][0],
        topRight = bottomLeft,
        maxWidth = this.trailsLog[0][3],
        shift,
        box,
        p1, p2,
        svg;

    // determine bounding box and max line width
    this.trailsLog.forEach(line => {
        bottomLeft = bottomLeft.min(line[0]);
        bottomLeft = bottomLeft.min(line[1]);
        topRight = topRight.max(line[0]);
        topRight = topRight.max(line[1]);
        maxWidth = Math.max(maxWidth, line[3]);
    });
    box = bottomLeft.corner(topRight).expandBy(maxWidth / 2);
    shift = new Point(-bottomLeft.x, topRight.y).translateBy(maxWidth / 2);
    svg = '<svg xmlns="http://www.w3.org/2000/svg" ' +
        'preserveAspectRatio="none" ' +
        'viewBox="0 0 ' + box.width() + ' ' + box.height() + '" ' +
        'width="' + box.width() + '" height="' + box.height() + '" ' +
        // 'style="background-color:black" ' + // for supporting backgrounds
        '>';
    svg += '<!-- Generated by CSnap Pro! - http://csdt.org/ -->';

    // for debugging the viewBox:
    // svg += '<rect width="100%" height="100%" fill="black"/>'

    this.trailsLog.forEach(line => {
        p1 = this.normalizePoint(line[0]).translateBy(shift);
        p2 = this.normalizePoint(line[1]).translateBy(shift);
        svg += '<line x1="' + p1.x + '" y1="' + p1.y +
            '" x2="' + p2.x + '" y2="' + p2.y + '" ' +
            'style="stroke:' + line[2].toRGBstring() + ';' +
            'stroke-opacity:' + line[2].a + ';' +
            'stroke-width:' + line[3] +
            ';stroke-linecap:' + line[4] +
            '" />';
    });
    svg += '</svg>';
    return {
        src : svg,
        rot : new Point(-box.origin.x, box.corner.y)
    };
};

// Block syntax for new dropdown options in blocks
let jensSyntax = SyntaxElementMorph.prototype.labelParts;
let csdtSyntax = {
    '%drc': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            '§_drc': null,
            'width': ['width'],
            'height': ['height'],
        }
    },
    '%scft': {
        type: 'input',
        tags: 'read-only static',
        menu: {
            '§_scft': null,
            'x_and_y': ['x_and_y'],
            'x': ['x'],
            'y': ['y'],
        }
    }
}

SyntaxElementMorph.prototype.labelParts = {
    ...jensSyntax,
    ...csdtSyntax
};



IDE_Morph.prototype.initializeCloud = function () {
    var world = this.world();
    new DialogBoxMorph(
        null,
        user => this.cloud.login(
            user.username.toLowerCase(),
            user.password,
            user.choice,
            (username, message, jqXHR) => {
                sessionStorage.username = username;
                this.controlBar.cloudButton.refresh();
                this.source = 'cloud';
                // if (!isNil(response.days_left)) {
                //     var duration = response.days_left + ' day' +
                //         (response.days_left > 1 ? 's' : '');
                //     new DialogBoxMorph().inform(
                //         'Unverified account: ' + duration + ' left' +
                //         'You are now logged in, and your account\n' +
                //         'is enabled for ' + duration + '.\n' +
                //         'Please use the verification link that\n' +
                //         'was sent to your email address when you\n' +
                //         'signed up.\n\n' +
                //         'If you cannot find that email, please\n' +
                //         'check your spam folder. If you still\n' +
                //         'cannot find it, please use the "Resend\n' +
                //         'Verification Email..." option in the cloud\n' +
                //         'menu.\n\n' +
                //         'You have ' + duration + ' left.',
                //         world,
                //         this.cloudIcon(null, new Color(0, 180, 0))
                //     );
                // } else {
                this.showMessage(message, 2);
                // }
            },
            this.cloudError()
        )
    ).withKey('cloudlogin').promptCredentials(
        'Sign in',
        'login',
        null,
        null,
        null,
        null,
        'stay signed in on this computer\nuntil logging out',
        world,
        this.cloudIcon(),
        this.cloudMsg
    );
};