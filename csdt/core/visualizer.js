IDE_Morph.prototype.sendVisualizerData = function (data) {
	console.log(data);
};

IDE_Morph.prototype.promptAiImage = function (payload) {
	// open a dialog box letting the user browse available "built-in"
	// costumes, backgrounds or sounds
	// console.log(payload);

	let checkTarget = payload[0] != "";
	let checkSource = payload[1] != "";
	let imageType = "";

	if (checkTarget && checkSource) {
		this.launchVisualizer(payload);
	} else {
		if (checkTarget) {
			imageType = "style";
		} else {
			imageType = "base";
		}
		var msg = this.showMessage("Loading AI images...");
		this.getMediaList("Costumes", (items) => {
			msg.destroy();
			this.getMediaList("Textures", (newitems) => {
				items = items.concat(newitems);
				this.selectAiImage("Costumes", items, imageType, payload);
			});
		});
	}
};

IDE_Morph.prototype.selectAiImage = function (folderName, items, imageType, payload) {
	// private - this gets called by importMedia() and creates
	// the actual dialog
	var dialog = new DialogBoxMorph().withKey("import" + folderName),
		frame = new ScrollFrameMorph(),
		selectedIcon = null,
		turtle = new SymbolMorph("turtle", 60),
		myself = this,
		world = this.world(),
		handle,
		content = new ScrollFrameMorph(),
		section,
		msg,
		listFieldWidth = 100;

	let createSpriteView = function (parent, items) {
		items.forEach((item) => {
			// Caution: creating very many thumbnails can take a long time!
			var url = parent.resourceURL(item.description == "AI" ? "Textures" : folderName, item.fileName),
				img = new Image(),
				suffix = url.slice(url.lastIndexOf(".") + 1).toLowerCase(),
				isSVG = suffix === "svg" && !MorphicPreferences.rasterizeSVGs,
				icon;

			icon = new CostumeIconMorph(new Costume(turtle.getImage(), item.name));

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
			if (isSVG) {
				img.onload = function () {
					icon.object = new SVG_Costume(img, item.name);
					icon.refresh();
				};
				parent.getURL(url, (txt) => (img.src = "data:image/svg+xml;base64," + window.btoa(txt)));
			} else {
				img.onload = function () {
					var canvas = newCanvas(new Point(img.width, img.height), true);
					canvas.getContext("2d").drawImage(img, 0, 0);
					icon.object = new Costume(canvas, item.name);
					icon.url = url;
					icon.refresh();
				};
				img.src = url;
			}
		});
	};

	// console.log(items);
	let uniqueSections = [...new Set(items.map((item) => item.description))];
	uniqueSections.push("All");
	// console.log(items);
	// Create the media sections
	var listField = new ListMorph(uniqueSections, function (element) {
		return element;
	});

	listField.setWidth(listFieldWidth);
	listField.contents.children[0].children.forEach(function (x) {
		x.action = function () {
			let msg = myself.showMessage(localize("Loading") + "\n" + localize(x.labelString), 1);

			frame.destroy();
			frame = new ScrollFrameMorph();
			frame.acceptsDrops = false;
			frame.contents.acceptsDrops = false;
			frame.color = myself.groupColor;
			frame.fixLayout = nop;

			// Filters costume by category
			let currentSection = x.labelString === "All" ? items : items.filter((y) => y.description == x.labelString);

			createSpriteView(myself, currentSection);
			content.add(frame);
			dialog.fixLayout();
		};
	});

	listField.fixLayout = nop;

	frame.acceptsDrops = false;
	frame.contents.acceptsDrops = false;
	frame.color = myself.groupColor;
	frame.fixLayout = nop;
	dialog.labelString = `Select the ${imageType} image: `;
	dialog.createLabel();
	content.add(frame);
	content.add(listField);
	dialog.addBody(content);
	dialog.addButton("ok", "Next");
	dialog.addButton("cancel", "Cancel");

	function cloneCanvas(oldCanvas) {
		//create a new canvas
		var newCanvas = document.createElement("canvas");
		var context = newCanvas.getContext("2d");

		//set dimensions
		newCanvas.width = oldCanvas.width;
		newCanvas.height = oldCanvas.height;

		//apply the old canvas to the new one
		context.drawImage(oldCanvas, 0, 0);

		//return the new canvas
		return newCanvas;
	}

	dialog.ok = function () {
		if (selectedIcon) {
			if (imageType == "base") {
				// console.log(selectedIcon);
				payload[0] = selectedIcon.url;
				SpriteMorph.prototype.createImageForAST({
					type: "base",
					data: selectedIcon.url,
					width: selectedIcon.object.contents.width,
					height: selectedIcon.object.contents.height,
					costume: selectedIcon.object.name,
				});

				let newCanvas = cloneCanvas(selectedIcon.object.contents);
				newCanvas.dataset.library = selectedIcon.object.name;
				newCanvas.id = `base-library-canvas`;
				document.querySelector("#visualizer").appendChild(newCanvas);

				myself.promptAiImage(payload);
				dialog.destroy();
			} else if (imageType == "style") {
				payload[1] = selectedIcon.url;
				SpriteMorph.prototype.createImageForAST({
					type: "style",
					data: selectedIcon.url,
					width: selectedIcon.object.contents.width,
					height: selectedIcon.object.contents.height,
					costume: selectedIcon.object.name,
				});
				let newCanvas = cloneCanvas(selectedIcon.object.contents);
				newCanvas.dataset.library = selectedIcon.object.name;
				newCanvas.id = `style-library-canvas`;
				document.querySelector("#visualizer").appendChild(newCanvas);
				myself.promptAiImage(payload);
				dialog.destroy();
			}
		}
	};

	dialog.cancel = function () {
		dialog.destroy();
	};

	dialog.fixLayout = function () {
		var th = fontHeight(this.titleFontSize) + this.titlePadding * 2,
			x = 0,
			y = 0,
			lw = listFieldWidth,
			margin = 15,
			cp,
			ce,
			lp,
			le,
			fp,
			fe,
			fw;
		this.buttons.fixLayout();

		cp = this.position().add(new Point(this.padding, th + this.padding));
		ce = new Point(this.width() - this.padding * 2, this.height() - this.padding * 3 - th - this.buttons.height());
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
			}
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

	createSpriteView(myself, items);
	dialog.popUp(world);
	dialog.setExtent(new Point(600, 500));
	dialog.setCenter(world.center());

	handle = new HandleMorph(dialog, 300, 280, dialog.corner, dialog.corner);
};

////////////////////////////////////////////////////////////////

SpriteMorph.prototype.importImageOnlyStyleTransfer = function (userVar) {
	if (userVar == "") return;
	this.clearStyleTransferImage(userVar);

	var inp = document.createElement("input"),
		world = this.world();

	if (this.filePicker) {
		document.body.removeChild(this.filePicker);
		this.filePicker = null;
	}
	inp.accept = "image/png, image/gif, image/jpeg";
	inp.type = "file";
	inp.style.color = "transparent";
	inp.style.backgroundColor = "transparent";
	inp.style.border = "none";
	inp.style.outline = "none";
	inp.style.position = "absolute";
	inp.style.top = "0px";
	inp.style.left = "0px";
	inp.style.width = "0px";
	inp.style.height = "0px";
	inp.style.display = "none";

	inp.addEventListener(
		"change",
		() => {
			document.body.removeChild(inp);
			this.filePicker = null;
			world.hand.processImageFromImport(inp.files, userVar);
		},
		false
	);
	document.body.appendChild(inp);
	this.filePicker = inp;
	inp.click();
};

HandMorph.prototype.processImageFromImport = function (event, userVar) {
	/*
      find out whether an external image or audio file was dropped
      onto the world canvas, turn it into an offscreen canvas or audio
      element and dispatch the
  
          droppedImage(canvas, name)
          droppedSVG(image, name)
          droppedAudio(audio, name)
          droppedText(text, name, type)
  
      events to interested Morphs at the mouse pointer
  */
	var files = event instanceof FileList ? event : event.target.files || event.dataTransfer.files,
		file,
		url = event.dataTransfer ? event.dataTransfer.getData("URL") : null,
		txt = event.dataTransfer ? event.dataTransfer.getData("Text/HTML") : null,
		suffix,
		src,
		target = this.morphAtPointer(),
		img = new Image(),
		canvas,
		i;

	function readSVG(aFile) {
		var pic = new Image(),
			frd = new FileReader();
		while (!target.droppedSVG) {
			target = target.parent;
		}
		pic.onload = () => target.droppedSVG(pic, aFile.name);
		frd = new FileReader();
		frd.onloadend = (e) => (pic.src = e.target.result);
		frd.readAsDataURL(aFile);
	}

	function readImage(aFile) {
		var pic = new Image(),
			frd = new FileReader();
		while (!target.droppedImage) {
			target = target.parent;
		}
		let img = "";
		let finalImg = document.createElement("IMG");
		let visualizer = document.getElementById("visualizer");
		// finalImg.src = pic.src;
		// finalImg.width = "auto";
		// finalImg.height = "auto";
		finalImg.id = `${userVar}-img`;
		finalImg.dataset.costume = aFile.name;

		pic.onload = () => {
			// console.log(pic.width, pic.height);
			canvas = newCanvas(new Point(pic.width, pic.height), true);
			canvas.getContext("2d").drawImage(pic, 0, 0);
			// img = target.droppedDreamImage(canvas, aFile.name, userVar);

			// let data = costume.contents.toDataURL("image/jpeg", 1.0);

			visualizer.appendChild(finalImg);
		};
		frd = new FileReader();
		frd.onloadend = (e) => {
			pic.src = e.target.result;
			finalImg.src = e.target.result;
		};

		frd.readAsDataURL(aFile);
	}

	if (files.length > 0) {
		for (i = 0; i < files.length; i += 1) {
			file = files[i];
			suffix = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
			if (file.type.indexOf("svg") !== -1 && !MorphicPreferences.rasterizeSVGs) {
				readSVG(file);
			} else if (file.type.indexOf("image") === 0) {
				let imgResult = readImage(file);
				return imgResult;
			}
		}
	} else {
		new DialogBoxMorph().inform("Help", null, myself.world(), help);
		// let ide = this.parentThatIsA(IDE_Morph);
		// ide.stopAllScripts();

		return "not an image";
	}
};

SpriteMorph.prototype.setDreamImageForAI = function (userVar) {
	if (userVar == "") return;
	this.clearStyleTransferImage(userVar);

	var inp = document.createElement("input"),
		world = this.world();

	if (this.filePicker) {
		document.body.removeChild(this.filePicker);
		this.filePicker = null;
	}
	inp.accept = "image/png, image/gif, image/jpeg";
	inp.type = "file";
	inp.style.color = "transparent";
	inp.style.backgroundColor = "transparent";
	inp.style.border = "none";
	inp.style.outline = "none";
	inp.style.position = "absolute";
	inp.style.top = "0px";
	inp.style.left = "0px";
	inp.style.width = "0px";
	inp.style.height = "0px";
	inp.style.display = "none";
	inp.addEventListener(
		"change",
		() => {
			document.body.removeChild(inp);
			world.hand.processDreamImageDrop(inp.files, userVar);
			this.filePicker = null;
		},
		false
	);

	document.body.appendChild(inp);
	this.filePicker = inp;

	inp.click();
};

HandMorph.prototype.processDreamImageDrop = function (event, userVar) {
	/*
      find out whether an external image or audio file was dropped
      onto the world canvas, turn it into an offscreen canvas or audio
      element and dispatch the
  
          droppedImage(canvas, name)
          droppedSVG(image, name)
          droppedAudio(audio, name)
          droppedText(text, name, type)
  
      events to interested Morphs at the mouse pointer
  */
	var files = event instanceof FileList ? event : event.target.files || event.dataTransfer.files,
		file,
		url = event.dataTransfer ? event.dataTransfer.getData("URL") : null,
		txt = event.dataTransfer ? event.dataTransfer.getData("Text/HTML") : null,
		suffix,
		src,
		target = this.morphAtPointer(),
		img = new Image(),
		canvas,
		i;

	function readSVG(aFile) {
		var pic = new Image(),
			frd = new FileReader();
		while (!target.droppedSVG) {
			target = target.parent;
		}
		pic.onload = () => target.droppedSVG(pic, aFile.name);
		frd = new FileReader();
		frd.onloadend = (e) => (pic.src = e.target.result);
		frd.readAsDataURL(aFile);
	}

	function readImage(aFile) {
		var pic = new Image(),
			frd = new FileReader();
		while (!target.droppedImage) {
			target = target.parent;
		}
		let img = "";
		pic.onload = () => {
			// console.log(pic.width, pic.height);
			canvas = newCanvas(new Point(pic.width, pic.height), true);
			canvas.getContext("2d").drawImage(pic, 0, 0);
			img = target.droppedDreamImage(canvas, aFile.name, userVar);
		};
		frd = new FileReader();
		frd.onloadend = (e) => (pic.src = e.target.result);

		frd.readAsDataURL(aFile);
	}

	if (files.length > 0) {
		for (i = 0; i < files.length; i += 1) {
			file = files[i];
			suffix = file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase();
			if (file.type.indexOf("svg") !== -1 && !MorphicPreferences.rasterizeSVGs) {
				readSVG(file);
			} else if (file.type.indexOf("image") === 0) {
				let imgResult = readImage(file);
				return imgResult;
			}
		}
	} else {
		return "not an image";
	}
};
IDE_Morph.prototype.droppedDreamImage = function (aCanvas, name, userVar) {
	var costume = new Costume(
		aCanvas,
		this.currentSprite.newCostumeName(
			name ? name.split(".")[0] : "" // up to period
		)
	);

	if (costume.isTainted()) {
		this.inform(
			"Unable to import this image",
			"The picture you wish to import has been\n" +
				"tainted by a restrictive cross-origin policy\n" +
				"making it unusable for costumes in Snap!. \n\n" +
				"Try downloading this picture first to your\n" +
				"computer, and import it from there."
		);
		return;
	}

	// this.currentSprite.addCostume(costume);
	costume.editDreamImage(
		this.world(),
		this.parentThatIsA(IDE_Morph),
		false, // not a new costume, retain existing rotation center,
		(e) => {
			console.error(`An error has occured while editing the image: ${e}`);
		},
		() => {
			let finalImg = document.createElement("IMG");
			let visualizer = document.getElementById("visualizer");
			let data = costume.contents.toDataURL("image/jpeg", 1.0);

			finalImg.id = `${userVar}-img`;
			finalImg.dataset.costume = name;
			finalImg.src = data;
			finalImg.style.width = "auto";
			finalImg.style.height = "auto";
			visualizer.appendChild(finalImg);
		}
	);

	// this.currentSprite.wearCostume(costume);
	// this.spriteBar.tabBar.tabTo('costumes');
	this.hasChangedMedia = true;
	this.recordUnsavedChanges();

	// this.setVar(userVar, costume);
};

Costume.prototype.editDreamImage = function (aWorld, anIDE, isnew, oncancel, onsubmit) {
	var editor = new PaintEditorMorph();
	let stageDimensions = new Point(1920, 1080);
	// console.log(isnew);
	editor.oncancel = oncancel || nop;
	editor.openIn(
		aWorld,
		isnew ? newCanvas(stageDimensions, true) : this.contents,
		isnew ? null : this.rotationCenter,
		(img, rc) => {
			this.contents = img;
			this.rotationCenter = rc;
			this.version = Date.now();
			aWorld.changed();
			if (anIDE) {
				if (anIDE.currentSprite instanceof SpriteMorph) {
					// don't shrinkwrap stage costumes
					// this.shrinkWrap();
				}
				// anIDE.currentSprite.wearCostume(this, true); // don't shadow
				// anIDE.hasChangedMedia = true;
			}
			(onsubmit || nop)();
		},
		anIDE
	);
};

SpriteMorph.prototype.getCurrentFilePicker = function () {
	return this.filePicker == null;
};

SpriteMorph.prototype.getCurrentPaintEditor = function () {
	let ide = this.parentThatIsA(IDE_Morph);
	let world = ide.world();
	if (world.children.length > 1) {
		if (world.children[1].labelString == "Paint Editor") {
			return true;
		}
	}

	return false;
};

SpriteMorph.prototype.getWorldChildren = function () {
	let ide = this.parentThatIsA(IDE_Morph);
	let world = ide.world();
	if (world.children.length > 1) {
		return true;
	}

	return false;
};

SpriteMorph.prototype.switchToASTCostume = function () {
	if (!document.querySelector("#style-canvas")) return;

	let image = document.querySelector("#style-canvas");

	let cos = new Costume(image, "processed");

	let ide = this.parentThatIsA(IDE_Morph);
	ide.currentSprite.wearCostume(cos);
};

////////////////////////////////////////////////////////////////
//Refactored Functions
////////////////////////////////////////////////////////////////

SpriteMorph.prototype.setStyleTransferParameter = function (param, value) {
	let ide = this.parentThatIsA(IDE_Morph);
	if (param == "" || value == "") return;
	try {
		ide.setVar(param, value);
	} catch (e) {
		//variable doesn't exist, so create it:
		let pair = [param, true];

		if (this.isVariableNameInUse(pair[0])) {
			this.inform("that name is already in use");
		} else {
			this.addVariable(pair[0], pair[1]);
			// this.toggleVariableWatcher(pair[0], pair[1]);
			this.parentThatIsA(IDE_Morph).refreshPalette();
		}

		ide.setVar(param, value);
	}
};

SpriteMorph.prototype.setStyleTransferMode = function (value) {
	let ide = this.parentThatIsA(IDE_Morph);
	let param = "conversion mode";
	if (value == "") return;
	try {
		ide.setVar(param, value);
	} catch (e) {
		//variable doesn't exist, so create it:
		let pair = [param, true];

		if (this.isVariableNameInUse(pair[0])) {
			this.inform("that name is already in use");
		} else {
			this.addVariable(pair[0], pair[1]);
			// this.toggleVariableWatcher(pair[0], pair[1]);
			this.parentThatIsA(IDE_Morph).refreshPalette();
		}

		ide.setVar(param, value);
	}
};

SpriteMorph.prototype.getStyleTransferParameter = function (param) {
	let ide = this.parentThatIsA(IDE_Morph);
	if (param == "") return;
	try {
		return ide.getVar(param);
	} catch (e) {
		//variable doesn't exist, so create it:
		let pair = [param, true];

		if (this.isVariableNameInUse(pair[0])) {
			this.inform("that name is already in use");
		} else {
			this.addVariable(pair[0], pair[1]);
			// this.toggleVariableWatcher(pair[0], pair[1]);
			this.parentThatIsA(IDE_Morph).refreshPalette();
		}

		return ide.getVar(param);
	}
};

SpriteMorph.prototype.getStyleTransferMode = function () {
	let ide = this.parentThatIsA(IDE_Morph);
	if (param == "") return;
	try {
		return ide.getVar("conversion mode");
	} catch (e) {
		//variable doesn't exist, so create it:
		let pair = [param, true];

		if (this.isVariableNameInUse(pair[0])) {
			this.inform("that name is already in use");
		} else {
			this.addVariable(pair[0], pair[1]);
			// this.toggleVariableWatcher(pair[0], pair[1]);
			this.parentThatIsA(IDE_Morph).refreshPalette();
		}

		return ide.getVar(param);
	}
};

SpriteMorph.prototype.useCostumeForStyleTransferImage = function (name, type) {
	if (type == "") return;
	this.clearStyleTransferImage(type);

	let cst;
	let isCostumeNumber = Process.prototype.reportIsA(name, "number");

	if (isCostumeNumber) cst = this.costumes.asArray()[name - 1];
	else cst = detect(this.costumes.asArray(), (cost) => cost.name === name);

	if (cst == undefined) throw new Error("Costume does not exist");
	let payload = {
		data: cst.contents.toDataURL(),
		type: type,
		width: cst.contents.width,
		height: cst.contents.height,
		costume: name,
	};

	createStyleTransferImage(payload);
};

SpriteMorph.prototype.useStageForStyleTransferImage = function (type) {
	if (type == "") return;
	this.clearStyleTransferImage(type);

	let ide = this.parentThatIsA(IDE_Morph);

	// let finalImg = document.createElement("IMG");
	// let visualizer = document.getElementById("visualizer");
	// let stage = ide.stage.fullImage().toDataURL();

	// finalImg.id = `${type}-img`;
	// finalImg.src = data;

	// finalImg.style.width = "auto";
	// finalImg.style.height = "auto";
	// visualizer.appendChild(finalImg);

	let payload = {
		data: ide.stage.fullImage().toDataURL(),
		type: type,
		width: ide.stage.dimensions.x,
		height: ide.stage.dimensions.y,
		costume: "",
	};

	createStyleTransferImage(payload);
};

SpriteMorph.prototype.createImageUsingStyleTransfer = function (isAdvanced, isDownloadable) {
	let ide = this.parentThatIsA(IDE_Morph);
	let baseImage, styleImage;
	this.clearConvertedStyleTransferImage();

	if (checkForStyleTransferImage("base") && checkForStyleTransferImage("style")) {
		baseImage = getStyleTransferImage("base");
		styleImage = getStyleTransferImage("style");

		if (isAdvanced) {
			ide.callStyleTransferPrompt([baseImage.src, styleImage.src], isDownloadable);
			return;
		}

		let checkForParams = (param) => {
			let value = 1.0;
			try {
				value = parseFloat(ide.getVar(param)) / 100.0;
			} catch (e) {
				value = 1.0;
			}
			return value;
		};

		let checkMode = () => {
			let value = "fast";
			try {
				value = ide.getVar("conversion mode");
			} catch (e) {
				value = "fast";
			}
			return value;
		};

		let mode = checkMode();

		let payload = {
			contentImage: baseImage.src,
			sourceImage: styleImage.src,
			styleModel: mode === "fast" ? "mobilenet" : "inception",
			transformModel: mode === "fast" ? "separable" : "original",
			styleRatio: checkForParams("stylization ratio"),
			contentSize: checkForParams("base image size"),
			sourceSize: checkForParams("style image size"),
			download: isDownloadable || false,
		};

		window.application.generateStylizedImage(payload);
		return;
	}
	if (!checkForStyleTransferImage("base")) throw new Error("You need to set a base image before creating.");
	if (!checkForStyleTransferImage("style")) throw new Error("You need to set a style image before creating.");
};

SpriteMorph.prototype.clearStyleTransferImage = function (type) {
	let vis = document.querySelector("#visualizer");
	let target = document.querySelector(`#${type}-img`);

	if (target) vis.removeChild(target);
};
IDE_Morph.prototype.callStyleTransferPrompt = function (payload, isDownloadable) {
	let myself = this;

	payload.push(createCanvasForStyleTransfer(payload[0]));
	payload.push(createCanvasForStyleTransfer(payload[1]));

	new DialogBoxMorph(null, myself.sendVisualizerData).promptInputForStyleTransfer(
		"Stylize an Image Using AI",
		"style-transfer",
		null,
		null,
		null,
		null,
		null,
		world,
		null,
		isDownloadable,
		payload
	);
};

DialogBoxMorph.prototype.promptInputForStyleTransfer = function (
	title,
	purpose,
	tosURL,
	tosLabel,
	prvURL,
	prvLabel,
	checkBoxLabel,
	world,
	pic,
	isDownloadable,
	data
) {
	var baseSizeSlider = new SliderMorph(50, 200, 100, 6, "horizontal"),
		styleSizeSlider = new SliderMorph(50, 200, 100, 6, "horizontal"),
		ratioSlider = new SliderMorph(1, 100, 100, 6, "horizontal"),
		baseCentLeft = new AlignmentMorph("column", 2),
		baseCentRight = new AlignmentMorph("column", 2),
		basePercentage = new AlignmentMorph("row", 4),
		styleCentLeft = new AlignmentMorph("column", 2),
		styleCentRight = new AlignmentMorph("column", 2),
		stylePercentage = new AlignmentMorph("row", 4),
		ratioColLeft = new AlignmentMorph("column", 2),
		ratioColRight = new AlignmentMorph("column", 2),
		ratioLabelRow = new AlignmentMorph("row", 4),
		baseLabelRow = new AlignmentMorph("row", 4),
		styleLabelRow = new AlignmentMorph("row", 4),
		creationLabelRow = new AlignmentMorph("row", 4),
		ratioPercentage = new AlignmentMorph("row", 4),
		instructions = new TextMorph("Apply a 'style' to your selected\ncontent image.\n", 12),
		inp = new AlignmentMorph("column", 2),
		lnk = new AlignmentMorph("row", 4),
		bdy = new AlignmentMorph("column", this.padding),
		myself = this;

	var baseColumn = new AlignmentMorph("column", 2),
		styleColumn = new AlignmentMorph("column", 2),
		conversionType = new InputFieldMorph(
			"fast", // text
			false, // numeric?
			{
				Fast: ["fast"],
				"High Quality": ["high quality"],
			},
			true // read-only
		);

	function labelText(string) {
		return new TextMorph(
			localize(string),
			10,
			null, // style
			false, // bold
			null, // italic
			null, // alignment
			null, // width
			null, // font name
			MorphicPreferences.isFlat ? null : new Point(1, 1),
			WHITE // shadowColor
		);
	}

	function modalButton(label, action) {
		var btn = new PushButtonMorph(myself, action || "ok", "  " + localize(label || "OK") + "  ");
		btn.fontSize = 10;
		btn.corner = myself.buttonCorner;
		btn.edge = myself.buttonEdge;
		btn.outline = null;
		btn.outlineColor = null;
		btn.outlineGradient = null;
		btn.padding = 0;
		btn.contrast = null;
		btn.fixLayout();
		return btn;
	}

	function addPicture(aMorphOrCanvas) {
		let morph = new Morph();
		morph.isCachingImage = true;
		morph.cachedImage = aMorphOrCanvas;

		morph.bounds.setWidth(200);
		morph.bounds.setHeight(200);

		return morph;
	}

	function createColumn(col, width) {
		col.alignment = "left";
		col.setColor(this.color);
		col.setWidth(width);
		col.setHeight(25);
	}

	function createLabelRow(labelA, labelB, left, right, row, parent) {
		left.add(labelA);
		right.add(labelB);
		row.add(left);
		row.add(right);
		parent.add(row);
	}

	function createHintRow(a, b, row, parent) {
		row.add(a);
		row.add(modalButton("?", b));
		parent.add(row);
	}

	let setSlider = (obj, width) => {
		obj.setWidth(width);
		obj.setHeight(20);
	};

	let getPicture = (type) => {
		let sprites = world.children[0].sprites.asArray()[0].costumes;
		let image = detect(
			sprites.asArray(),
			(cost) => cost.name === document.querySelector(`#${type}-img`).dataset.costume || ""
		);
		let preview = addPicture(image.contents);

		return preview;
	};

	this.explainBase = function () {
		new DialogBoxMorph().inform(
			"Base image size",
			"Insert def here" +
				".\n\nA bigger base image\nresults in a more detailed\noutput, but increases the\nprocessing time\nsignificantly.",
			world,
			null
		);
	};
	this.explainStyle = function () {
		new DialogBoxMorph().inform(
			"Style image size",
			"Insert def here" +
				".\n\nChanging the size of a style\nimage usually affects the\ntexture 'seen' by the\nnetwork.",
			world,
			null
		);
	};
	this.explainRatio = function () {
		new DialogBoxMorph().inform(
			"Stylization ratio",
			"Insert def here" +
				".\n\nThis parameter affects the\nstylization strength.The\nfurther to the right, the\nstronger the stylization. This\nis done via interpolation\nbetween the style vectors of\nthe base and style\nimages.",
			world,
			null
		);
	};
	this.explainConversion = function () {
		new DialogBoxMorph().inform(
			"Creation type",
			"Insert def here" +
				".\n\nFast uses smaller training models\nto produce an image\nquickly, while high quality uses\na larger training model\nat the cost of it being\nmore time consuming.",
			world,
			null
		);
	};

	inp.alignment = "left";
	inp.setColor(this.color);
	bdy.setColor(this.color);

	createColumn(baseCentLeft, 165);
	createColumn(baseCentRight, 10);

	createColumn(styleCentLeft, 165);
	createColumn(styleCentRight, 10);

	createColumn(ratioColLeft, 365);
	createColumn(ratioColRight, 10);

	setSlider(baseSizeSlider, 200);
	setSlider(styleSizeSlider, 200);
	setSlider(ratioSlider, 400);

	conversionType.setWidth(400);
	baseColumn.setWidth(225);
	styleColumn.setWidth(225);

	let bl = labelText("Base image size:");
	bl.setWidth(165);

	let sl = labelText("Style image size:");
	sl.setWidth(165);

	let rl = labelText("Stylization strength:");
	rl.setWidth(365);

	let cl = labelText("Creation type:");
	cl.setWidth(365);

	if (purpose === "style-transfer") {
		createHintRow(bl, "explainBase", baseLabelRow, baseColumn);
		baseColumn.add(baseSizeSlider);
		createLabelRow(labelText("50%"), labelText("200%"), baseCentLeft, baseCentRight, basePercentage, baseColumn);
		if (document.querySelector("#base-img").dataset.costume) baseColumn.add(getPicture("base"));

		createHintRow(sl, "explainStyle", styleLabelRow, styleColumn);
		styleColumn.add(styleSizeSlider);
		createLabelRow(labelText("50%"), labelText("200%"), styleCentLeft, styleCentRight, stylePercentage, styleColumn);
		if (document.querySelector("#style-img").dataset.costume) styleColumn.add(getPicture("style"));

		createHintRow(rl, "explainRatio", ratioLabelRow, inp);
		inp.add(ratioSlider);
		createLabelRow(labelText("1%"), labelText("100%"), ratioColLeft, ratioColRight, ratioPercentage, inp);

		createHintRow(cl, "explainConversion", creationLabelRow, inp);
		inp.add(conversionType);
	}

	lnk.add(baseColumn);
	lnk.add(styleColumn);

	bdy.add(instructions);
	bdy.add(lnk);
	bdy.add(inp);

	basePercentage.fixLayout();
	baseCentLeft.fixLayout();
	baseCentRight.fixLayout();

	stylePercentage.fixLayout();
	styleCentLeft.fixLayout();
	styleCentLeft.fixLayout();

	ratioPercentage.fixLayout();
	ratioColLeft.fixLayout();
	ratioColLeft.fixLayout();

	baseLabelRow.fixLayout();
	styleLabelRow.fixLayout();
	ratioLabelRow.fixLayout();

	creationLabelRow.fixLayout();

	inp.fixLayout();
	baseColumn.fixLayout();
	styleColumn.fixLayout();
	lnk.fixLayout();

	bdy.fixLayout();

	this.labelString = title;
	this.createLabel();
	this.addBody(bdy);

	this.addButton("ok", "Create Image");
	this.addButton("cancel", "Cancel");
	this.fixLayout();

	this.accept = function () {
		DialogBoxMorph.prototype.accept.call(myself);
	};

	this.getInput = function () {
		let payload = {
			contentImage: `${data[0]}`,
			sourceImage: `${data[1]}`,
			styleModel: conversionType.getValue() === "fast" ? "mobilenet" : "inception",
			transformModel: conversionType.getValue() === "fast" ? "separable" : "original",
			styleRatio: ratioSlider.value / 100.0,
			contentSize: baseSizeSlider.value / 100.0,
			sourceSize: styleSizeSlider.value / 100.0,
			download: isDownloadable || false,
		};

		window.application.generateStylizedImage(payload);
		return payload;
	};

	this.popUp(world);
};
SpriteMorph.prototype.saveStyleTransferImageAsCostume = function () {
	if (!document.querySelector("#style-canvas")) return;

	let image = document.querySelector("#style-canvas");

	let cos = new Costume(image, "ast_" + Date.now().toString());

	let ide = this.parentThatIsA(IDE_Morph);
	ide.currentSprite.addCostume(cos);
	ide.currentSprite.wearCostume(cos);
};

SpriteMorph.prototype.sizeErrorHandlingAST = function () {
	new DialogBoxMorph().inform(
		"AI Image Sizing",
		"One of your images is too big. Max size is 1080p. Please try again with smaller images.",
		this.world()
	);
};

SpriteMorph.prototype.toggleASTProgress = function (bool) {
	// console.log(bool);
	let progress = document.querySelector("#vis-progress");
	if (bool) {
		progress.style.display = "inline-flex";
		progress.hidden = !bool;
	} else {
		progress.style.display = "none";
		progress.hidden = bool;
	}
};

SpriteMorph.prototype.checkIfImageWasGenerated = function (type) {
	return document.querySelector(`#${type}-img`) != null;
};

SpriteMorph.prototype.checkIfImageWasConverted = function () {
	return document.querySelector(`#converted-image`).src != "";
};

SpriteMorph.prototype.clearConvertedStyleTransferImage = function () {
	let target = document.querySelector("#converted-image");
	// let target = document.querySelector(`#${type}-img`);

	if (target.src) target.removeAttribute("src");
};

////////////////////////////////////////////////////////////////
// Helper functions
////////////////////////////////////////////////////////////////
function checkForStyleTransferImage(type) {
	let img = document.querySelector(`#${type}-img`);
	if (img) return true;
	return false;
}

function getStyleTransferImage(type) {
	let image = document.querySelector(`#${type}-img`);
	if (image) return image;
	throw new Error(`You have not set a ${type} image yet`);
}

function createStyleTransferImage(payload) {
	// console.log(payload);
	let visualizer = document.getElementById("visualizer");
	let image = document.createElement("IMG");

	image.id = `${payload.type}-img`;
	image.src = payload.data;

	image.width = payload.width;
	image.height = payload.height;

	image.dataset.costume = payload.costume;

	visualizer.appendChild(image);
}

function createCanvasForStyleTransfer(src) {
	let canvas = document.createElement("canvas");
	let ctx = canvas.getContext("2d");
	canvas.width = 200;
	canvas.height = 200;
	let img = new Image();
	img.src = src;

	// get the scale
	var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
	// get the top left position of the image
	var x = canvas.width / 2 - (img.width / 2) * scale;
	var y = canvas.height / 2 - (img.height / 2) * scale;
	ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
	return canvas;
}

function createStyleTransferPromptLabels(a, b, isWide = false) {
	let row = new AlignmentMorph("row", 4);
	let left = new AlignmentMorph("column", 2);
	let right = new AlignmentMorph("column", 2);

	left.alignment = "left";
	left.setColor(this.color);
	left.setWidth(isWide ? 365 : 165);
	left.setHeight(25);

	right.alignment = "left";
	right.setColor(this.color);
	right.setWidth(10);
	right.setHeight(25);

	left.add(a);
	right.add(b);
	row.add(left);
	row.add(right);

	return [left, right, row];
}
////////////////////////////////////////////////////////////////
// Misc functions
////////////////////////////////////////////////////////////////
//Images from the sprite library
SpriteMorph.prototype.checkForASTIcon = function (type) {
	let img = document.querySelector(`#${type}-library-canvas`);
	if (img) return true;
	return false;
};
SpriteMorph.prototype.getASTIcon = function (type) {
	let image = document.querySelector(`#${type}-library-canvas`);
	if (image) return image;
	throw new Error(`You have not selected a ${type} image from the library yet`);
};

SpriteMorph.prototype.clearASTIcon = function (type) {
	let vis = document.querySelector("#visualizer");
	let target = document.querySelector(`#${type}-library-canvas`);

	if (target) vis.removeChild(target);
};
