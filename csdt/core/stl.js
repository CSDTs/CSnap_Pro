/**
 *
 * STL Converter
 * Author: Andrew Hunn (ahunn@umich.edu)
 *
 * Allows for user to interact with our stl converter python package to convert stage
 * to a STL for 3D printing (either quick and easy or ability to tweak various parameters)
 *
 * Depends on:
 * - stage.js (Code below is called via two menu options in stage, through stage right click -- userMenu())
 * - STLCreate / STLCreateWithParams view (located in project_share/views.py)
 *
 * Repositories:
 * - Tools to run converter - https://github.com/CSDTs/csdt_stl_tools
 * - STL Converter - https://github.com/CSDTs/Adinkra_extrusion_converter
 *
 * Additional Documentation: https://docs.google.com/document/d/1dkEE18c57dyifXEf-jxpAI8IP1ybXcsHqCkcuO1AexM/edit
 */

// TODO: Add ability to accurately timeout stl download message (currently just set for 2 seconds)
// TODO: Add 'More Info' buttons to dialog box letting user know what each parameter is / how it changes stl

IDE_Morph.prototype.launchSTLParamsPrompt = function (name) {
	let myself = this;

	new DialogBoxMorph(null, myself.sendVisualizerData).promptForSTLParameters(
		"Convert to STL Download",
		"stl",
		null,
		null,
		null,
		null,
		"check to make the call to the \nvisualizer",
		world,
		null,
		name
	);
};

IDE_Morph.prototype.exportAsSTL = function (name, payload = []) {
	var projectBody, projectSize;

	let getSTL = () => {
		let redirectURL = "";
		if (payload.length == 0) {
			redirectURL = `/stl/${this.cloud.project_id}`;
		} else {
			let searchParams = `${payload.base}-${payload.smooth}-${payload.negative}-${payload.size}-${payload.scale}`;
			redirectURL = `/stl-params/${this.cloud.project_id}/${searchParams}`;
		}

		window.onbeforeunload = nop;
		this.showMessage("exporting as STL...", 2);
		window.location.pathname = redirectURL;

		window.onbeforeunload = (evt) => {
			var e = evt || window.event,
				msg = "Are you sure you want to leave?";
			// For IE and Firefox
			if (e) {
				e.returnValue = msg;
			}
			// For Safari / chrome
			return msg;
		};
	};

	if (this.hasUnsavedEdits() || config?.project?.id == null) {
		this.confirm(
			localize(
				"You need to save first. Are you sure you want to " +
					(config?.project?.id == null ? "save a new project?" : 'replace\n"' + name + '"?')
			),
			"STL Export",
			() => {
				if (name) {
					this.setProjectName(name);
				}
				this.showMessage("Saving project\nto the cloud...");
				projectBody = this.buildProjectRequest();
				projectSize = this.verifyProject(projectBody);
				if (!projectSize) {
					return;
				} // Invalid Projects don't return anything.
				this.showMessage("Uploading " + Math.round(projectSize / 1024) + " KB...");
				this.cloud.saveProject(
					this.getProjectName(),
					projectBody,
					(data) => {
						this.showMessage("saved.", 2);
						this.cloud.updateURL(data.id);
						this.cloud.project_id = data.id;
						this.cloud.project_approved = data.approved;
						this.recordSavedChanges();
						this.controlBar.updateLabel();
						getSTL();
					},
					(error) => {
						this.cloudError();
						console.error(error);
						console.error(JSON.stringify(error));
					}
				);
			}
		);
	} else {
		getSTL();
	}
};

DialogBoxMorph.prototype.promptForSTLParameters = function (
	title,
	purpose,
	tosURL,
	tosLabel,
	prvURL,
	prvLabel,
	checkBoxLabel,
	world,
	pic,
	name
) {
	var inp = new AlignmentMorph("column", 2),
		bdy = new AlignmentMorph("column", this.padding),
		myself = this;

	//-b True or --base=True specifies that a base is added; False would indicate not adding a base (this is the default option).
	let baseParam = new InputFieldMorph(
		"false", // text
		false, // numeric?
		{
			true: ["true"],
			false: ["false"],
		},
		true
	);
	//-g True or --smooth=True specifies that the image is smoothed before converting to STL; False would disable this feature (default option).
	let smoothParam = new InputFieldMorph(
		"true", // text
		false, // numeric?
		{
			true: ["true"],
			false: ["false"],
		},
		true
	);
	//-c True r --negative=True specifies that the image is used to generate a square with the image object as a (default option is False).
	let negativeParam = new InputFieldMorph(
		"false", // text
		false, // numeric?
		{
			true: ["true"],
			false: ["false"],
		},
		true
	);

	//-s 256 or --size=256 specifies that the image be resized to (256x256) (default option).
	let sizeParam = new InputFieldMorph(
		"480", // text
		true, // numeric?
		null,
		false
	);
	//-x 0.1 or --scale=0.1 scales the resulting STL mesh height to 1/10 (default option).
	let scaleParam = new InputFieldMorph(
		"0.1", // text
		true, // numeric?
		null,
		false
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

	inp.alignment = "left";
	inp.setColor(this.color);
	bdy.setColor(this.color);

	baseParam.setWidth(200);
	smoothParam.setWidth(200);
	negativeParam.setWidth(200);
	sizeParam.setWidth(200);
	scaleParam.setWidth(200);

	if (purpose === "stl") {
		inp.add(labelText("Base: "));
		inp.add(baseParam);
		inp.add(labelText("Smooth: "));
		inp.add(smoothParam);
		inp.add(labelText("Negative: "));
		inp.add(negativeParam);
		inp.add(labelText("Size:"));
		inp.add(sizeParam);
		inp.add(labelText("Scale: "));
		inp.add(scaleParam);

		baseParam.value = "False";
	}

	bdy.add(inp);

	inp.fixLayout();

	bdy.fixLayout();

	this.labelString = title;
	this.createLabel();

	this.addBody(bdy);

	this.addButton("ok", "Download");
	this.addButton("cancel", "Cancel");
	this.fixLayout();

	this.accept = function () {
		DialogBoxMorph.prototype.accept.call(myself);
	};

	this.getInput = function () {
		let payload = {
			base: baseParam.getValue() || "false",
			smooth: smoothParam.getValue() || "true",
			negative: negativeParam.getValue() || "false",
			size: sizeParam.getValue() || 480,
			scale: scaleParam.getValue() || 0.1,
		};

		world.children[0].exportAsSTL(name, payload);
		return {
			payload,
		};
	};
	this.popUp(world);
};
