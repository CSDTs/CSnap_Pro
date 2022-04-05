IDE_Morph.prototype.launchVisualizer = function (payload) {
	let myself = this;
	new DialogBoxMorph(null, myself.sendVisualizerData).promptVisualizerInput(
		"Stylize an Image Using AI",
		"signup",
		null,
		null,
		null,
		null,
		null,
		world,
		null,
		null,
		payload
	);
};

IDE_Morph.prototype.sendVisualizerData = function (data) {
	console.log(data);
};

DialogBoxMorph.prototype.promptVisualizerInput = function (
	title,
	purpose,
	tosURL,
	tosLabel,
	prvURL,
	prvLabel,
	checkBoxLabel,
	world,
	pic,
	msg,
	data
) {
	var contentImg = new InputFieldMorph(
			"images/zigzag.jpg",
			false,
			{
				Beach: ["images/beach.jpg"],
				Chicago: ["images/chicago.jpg"],
				GoldenGate: ["images/golden_gate.jpg"],
				SeaPort: ["images/seaport.jpg"],
				StatueOfLiberty: ["images/statue_of_liberty.jpg"],
				Towers: ["images/towers.jpg"],
				ZigZag: ["images/zigzag.jpg"],
			},
			true
		),
		imageA = new TextMorph(data[0].split("/static/csnap_pro/")[1], 12),
		sizeSliderA = new SliderMorph(256, 400, 256, 6, "horizontal"),
		imageB = new TextMorph(data[1].split("/static/csnap_pro/")[1], 12),
		sizeSliderB = new SliderMorph(256, 400, 256, 6, "horizontal"),
		slider = new SliderMorph(0, 100, 50, 6, "horizontal"),
		styleModel,
		transformModel,
		sourceImg = new InputFieldMorph(),
		contentImgSize = new InputFieldMorph(),
		sourceImgSize = new InputFieldMorph(),
		agree = false,
		chk,
		dof = new AlignmentMorph("row", 4),
		styleModelColumn = new AlignmentMorph("column", 2),
		transformModelColumn = new AlignmentMorph("column", 2),
		instructions = new TextMorph("Apply a 'style' to your selected\ncontent image.\n", 12);
	(inp = new AlignmentMorph("column", 2)),
		(lnk = new AlignmentMorph("row", 4)),
		(bdy = new AlignmentMorph("column", this.padding)),
		(myself = this);

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

	function linkButton(label, url) {
		var btn = new PushButtonMorph(myself, () => window.open(url), "  " + localize(label) + "  ");
		btn.fontSize = 10;
		btn.corner = myself.buttonCorner;
		btn.edge = myself.buttonEdge;
		btn.outline = myself.buttonOutline;
		btn.outlineColor = myself.buttonOutlineColor;
		btn.outlineGradient = myself.buttonOutlineGradient;
		btn.padding = myself.buttonPadding;
		btn.contrast = myself.buttonContrast;
		btn.fixLayout();
		return btn;
	}

	styleModel = new InputFieldMorph(
		"mobilenet", // text
		false, // numeric?
		{
			Fast: ["mobilenet"],
			High: ["inception"],
		},
		true // read-only
	);

	transformModel = new InputFieldMorph(
		"separable", // text
		false, // numeric?
		{
			Fast: ["separable"],
			High: ["original"],
		},
		true // read-only
	);

	conversionType = new InputFieldMorph(
		"fast", // text
		false, // numeric?
		{
			Fast: ["fast"],
			"High Quality": ["high quality"],
		},
		true // read-only
	);
	inp.alignment = "left";
	inp.setColor(this.color);
	bdy.setColor(this.color);

	styleModelColumn.alignment = "left";
	styleModelColumn.setColor(this.color);
	transformModelColumn.alignment = "left";
	transformModelColumn.setColor(this.color);

	contentImg.setWidth(200);
	imageA.setWidth(200);
	imageB.setWidth(200);
	sizeSliderA.setWidth(200);
	sizeSliderA.setHeight(20);
	sizeSliderB.setWidth(200);
	sizeSliderB.setHeight(20);
	conversionType.setWidth(200);
	slider.setWidth(200);
	slider.setHeight(20);
	styleModel.setWidth(100);
	transformModel.contents().minWidth = 80;
	transformModel.setWidth(80);
	sourceImg.setWidth(200);
	contentImgSize.setWidth(200);
	sourceImgSize.setWidth(200);

	if (purpose === "signup") {
		inp.add(instructions);

		// inp.add(labelText("Content Image:"));
		// inp.add(imageA);
		inp.add(labelText("\nBase image size:"));
		inp.add(sizeSliderA);
		// inp.add(labelText("\nStyle Image:"));
		// inp.add(imageB);
		inp.add(labelText("\nStyle image size:"));
		inp.add(sizeSliderB);
		inp.add(labelText("\nStylization strength:"));
		inp.add(slider);
		inp.add(labelText("\nCreation type:"));
		inp.add(conversionType);
		// styleModelColumn.add(conversionType);
		// styleModelColumn.add(labelText("Style Model:"));
		// styleModelColumn.add(styleModel);
		// transformModelColumn.add(labelText("Transform Model:"));
		// transformModelColumn.add(transformModel);
		// dof.add(styleModelColumn);
		// dof.add(transformModelColumn);
		inp.add(dof);
	}

	if (msg) {
		bdy.add(labelText(msg));
	}

	bdy.add(inp);

	if (tosURL || prvURL) {
		bdy.add(lnk);
	}
	if (tosURL) {
		lnk.add(linkButton(tosLabel, tosURL));
	}
	if (prvURL) {
		lnk.add(linkButton(prvLabel, prvURL));
	}

	if (checkBoxLabel) {
		chk = new ToggleMorph(
			"checkbox",
			this,
			() => (agree = !agree), // action,
			checkBoxLabel,
			() => agree //query
		);
		chk.edge = this.buttonEdge / 2;
		chk.outline = this.buttonOutline / 2;
		chk.outlineColor = this.buttonOutlineColor;
		chk.outlineGradient = this.buttonOutlineGradient;
		chk.contrast = this.buttonContrast;
		chk.fixLayout();
		bdy.add(chk);
	}

	dof.fixLayout();
	styleModelColumn.fixLayout();
	transformModelColumn.fixLayout();
	inp.fixLayout();
	lnk.fixLayout();
	bdy.fixLayout();

	this.labelString = title;
	this.createLabel();

	if (pic) {
		this.setPicture(pic);
	}

	this.addBody(bdy);

	this.addButton("ok", "Create Image");
	this.addButton("cancel", "Cancel");
	this.fixLayout();

	this.accept = function () {
		DialogBoxMorph.prototype.accept.call(myself);
		// world.children[0].showMessage("Creating image. One moment...", 5);
	};

	this.getInput = function () {
		let ide = world.children[0];
		let stage = ide.stage.fullImage();

		let conversion = conversionType.getValue();

		console.log(conversion);
		let payload = {
			// contentImage: stage.toDataURL(),
			// contentImage: stage.toDataURL(),
			contentImage: `${data[0]}`,
			// choiceImageSize: contentImgSize.getValue(),
			// sourceImage: sourceImg.getValue(),
			sourceImage: `${data[1]}`,

			// sourceImageSize: sourceImgSize.getValue(),
			styleModel: conversionType.getValue() === "fast" ? "mobilenet" : "inception",
			transformModel: conversionType.getValue() === "fast" ? "separable" : "original",
			// choice: agree,
			styleRatio: slider.value / 100.0,
			contentSize: `${sizeSliderA.value}px`,
			sourceSize: `${sizeSliderB.value}px`,
		};

		console.table(payload);
		if (agree) {
			// let ide = world.children[0];

			// console.log(ide.stage.fullImage());
			// console.log(window.application);
			window.application.generateStylizedImage();
		} else {
			// console.log(window.application);

			window.application.generateStylizedImage(payload);
		}
		// console.log(payload);
		return payload;
	};

	if (!this.key) {
		this.key = "credentials" + title + purpose;
	}

	this.popUp(world);
};

IDE_Morph.prototype.promptAiImage = function (payload) {
	// open a dialog box letting the user browse available "built-in"
	// costumes, backgrounds or sounds
	console.log(payload);

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

	dialog.ok = function () {
		if (selectedIcon) {
			if (imageType == "base") {
				payload[0] = selectedIcon.url;
				myself.promptAiImage(payload);
				dialog.destroy();
			} else if (imageType == "style") {
				payload[1] = selectedIcon.url;
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

IDE_Morph.prototype.setAiImageByURL = function (url) {};

////////////////////////////////////////////////////////////////

SpriteMorph.prototype.useStageForStyleTransferImage = function (type) {
	if (type == "") return;
	this.clearStyleTransferImage(type);
	let ide = this.parentThatIsA(IDE_Morph);

	let finalImg = document.createElement("IMG");
	let visualizer = document.getElementById("visualizer");
	let data = ide.stage.fullImage().toDataURL();

	finalImg.id = `${type}-img`;
	finalImg.src = data;
	finalImg.style.width = "auto";
	finalImg.style.height = "auto";
	visualizer.appendChild(finalImg);
};

SpriteMorph.prototype.clearStyleTransferImage = function (type) {
	console.log(type);
	let vis = document.querySelector("#visualizer");
	let target = document.querySelector(`#${type}-img`);

	if (target) vis.removeChild(target);
};

SpriteMorph.prototype.checkIfImageWasGenerated = function (type) {
	return document.querySelector(`#${type}-img`) != null;
};

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
		finalImg.style.width = "auto";
		finalImg.style.height = "auto";
		finalImg.id = `${userVar}-img`;
		pic.onload = () => {
			console.log(pic.width, pic.height);
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

SpriteMorph.prototype.toggleASTProgress = function (bool) {
	console.log(bool);
	let progress = document.querySelector("#vis-progress");
	if (bool) {
		progress.style.display = "inline-flex";
		progress.hidden = !bool;
	} else {
		progress.style.display = "none";
		progress.hidden = bool;
	}
};

SpriteMorph.prototype.sizeErrorHandlingAST = function () {
	new DialogBoxMorph().inform(
		"AI Image Sizing",
		"One of your images is too big. Max size is 1080p. Please try again with smaller images.",
		this.world()
	);
};

SpriteMorph.prototype.createImageUsingAI = function () {
	let ide = this.parentThatIsA(IDE_Morph);
	let checkTarget = document.querySelector("#base-img");
	let checkSource = document.querySelector("#style-img");
	let target, source;
	let payload = ["", ""];

	if (checkTarget && checkSource) {
		ide.launchVisualizer([checkTarget.src, checkSource.src]);
	} else {
		if (checkTarget) {
			payload[0] = checkTarget.src;
		} else if (checkSource) {
			payload[1] = checkSource.src;
		}
		ide.promptAiImage(payload);
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
			console.log(pic.width, pic.height);
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
	console.log(isnew);
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

SpriteMorph.prototype.useCostumeForStyleTransferImage = function (name, type) {
	if (type == "") return;
	this.clearStyleTransferImage(type);
	let ide = this.parentThatIsA(IDE_Morph);
	let finalImg = document.createElement("IMG");
	let visualizer = document.getElementById("visualizer");
	let cst = detect(this.costumes.asArray(), (cost) => cost.name === name);
	let data = cst.contents.toDataURL();

	finalImg.id = `${type}-img`;
	finalImg.src = data;
	finalImg.style.width = "auto";
	finalImg.style.height = "auto";
	visualizer.appendChild(finalImg);
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
