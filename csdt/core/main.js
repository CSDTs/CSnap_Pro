import * as LayoutOverrides from "./layout.js";
import * as STLConverter from "./stl.js";
import * as ProjectDialogOverrides from "./dialog.js";
import * as SpriteOverrides from "./sprites.js";
import * as StageOverrides from "./stage.js";
import * as Serializer from "./serializer.js";
import * as CloudOverrides from "./cloud.js";
import * as BlockOverrides from "./blocks.js";

let { csdtSyntax, ...blockOverrides } = BlockOverrides;
let { shrinkToFit, getNoFit, noFit, ...spriteOverrides } = SpriteOverrides;

let jensBlocks = SpriteMorph.prototype.blocks;
let jensMigrations = SpriteMorph.prototype.blockMigrations;

//Generic IDE_Morph overrides (layout, GUI, adding additional options to menus)
Object.assign(IDE_Morph.prototype, LayoutOverrides);

//Adds ability to convert stage to an STL for 3D printing
Object.assign(IDE_Morph.prototype, STLConverter);

//Classrooms, Project Save and Load Prompts
ProjectRecoveryDialogMorph.prototype.classroomListField = null;
Object.assign(ProjectDialogMorph.prototype, ProjectDialogOverrides);

//SpriteMorph Overrides
Object.assign(SpriteMorph.prototype, spriteOverrides);
Object.assign(Costume.prototype, { shrinkToFit, getNoFit, noFit });

//StageMorph Overrides
Object.assign(StageMorph.prototype, StageOverrides);

//Project serializer and cloud functionality
Object.assign(SnapSerializer.prototype, Serializer);
Object.assign(Cloud.prototype, CloudOverrides);

//Blocks
Object.assign(SyntaxElementMorph.prototype.labelParts, {
	...SyntaxElementMorph.prototype.labelParts,
	...csdtSyntax,
});
// Object.assign(SpriteMorph.prototype, DefOverrides);

SpriteMorph.prototype.blockMigrations = {
	...SpriteMorph.prototype.blockMigrations,
	...blockOverrides.csdtMigrations,
};

SpriteMorph.prototype.initBlockMigrations = function () {
	SpriteMorph.prototype.blockMigrations = {
		...jensMigrations,
		...blockOverrides.csdtMigrations,
	};
};

SpriteMorph.prototype.initBlocks = function () {
	SpriteMorph.prototype.blocks = {
		...jensBlocks,
		...blockOverrides.csdtBlocks,
	};
};

Object.assign(SpriteMorph.prototype, blockOverrides);

SpriteMorph.prototype.initBlockMigrations();
SpriteMorph.prototype.initBlocks();

ListMorph.prototype.deactivateIndex = function (idx) {
	var item = this.listContents.children[idx];
	if (!item) {
		return;
	}
	item.userState = "normal";
	item.rerender();
};
