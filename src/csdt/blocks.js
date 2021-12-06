/*
    csdt-blocks.js

    custom blocks and override functions based on objects.js

    Author: Andrew Hunn (ahunn@umich.edu)

    This file allows you to add custom block definitions / alter primitive blocks
    in CSnap.

    Adding custom blocks requrie three steps:
        Writing the function
        Adding the function definition to the block list
        Pushing the block to the proper category
*/

// The migrations are if there are any depricated blocks from older versions of csnap.
let jensMigrations = SpriteMorph.prototype.blockMigrations;
let csdtMigrations = {
  translate_percent: {
    selector: "translatePercent",
    offset: 0,
  },
  changeCostumeColor: {
    selector: "setEffect",
    inputs: [["color"]],
    offset: 1,
  },
  setCostumeShade: {
    selector: "setEffect",
    inputs: [["brightness"]],
    offset: 1,
  },
  changeCostumeShade: {
    selector: "changeEffect",
    inputs: [["brightness"]],
    offset: 1,
  },
  setCostumeColor: {
    selector: "setEffect",
    inputs: [["color"]],
    offset: 1,
  },
  setCostumeOpacity: {
    selector: "setEffect",
    inputs: [["brightness"]],
    offset: 1,
  },
  changeCostumeOpacity: {
    selector: "setEffect",
    inputs: [["brightness"]],
    offset: 1,
  },
};

SpriteMorph.prototype.initBlockMigrations = function () {
  SpriteMorph.prototype.blockMigrations = {
    ...jensMigrations,
    ...csdtMigrations,
  };
};

//You add the block definitions here.  This basically adds the block to the software,
//but it isn't visible unless you add it to blockTemplates() or search in GUI(Ctrl+F)
let jensBlocks = SpriteMorph.prototype.blocks;
let csdtBlocks = {
  translatePercent: {
    only: SpriteMorph,
    type: "command",
    category: "motion",
    spec: "translate by %n of %drc",
    defaults: [100, ["width"]],
  },
  flipVertical: {
    only: SpriteMorph,
    type: "command",
    category: "looks",
    spec: "flip vertical",
  },
  flipHorizontal: {
    only: SpriteMorph,
    type: "command",
    category: "looks",
    spec: "flip horizontal",
  },
  reflectXAxis: {
    only: SpriteMorph,
    type: "command",
    category: "looks",
    spec: "reflect across x axis",
  },
  reflectYAxis: {
    only: SpriteMorph,
    type: "command",
    category: "looks",
    spec: "reflect across y axis",
  },
  newSizeOfCurrent: {
    only: SpriteMorph,
    type: "command",
    category: "looks",
    spec: "scale by factor %n percent",
    defaults: [100],
  },
  pointAtAngle: {
    only: SpriteMorph,
    type: "command",
    category: "motion",
    spec: "point at angle %n",
    defaults: [0],
  },
  rotateByDegrees: {
    only: SpriteMorph,
    type: "command",
    category: "motion",
    spec: "rotate by %n degrees",
    defaults: [0],
  },
  getAngle: {
    only: SpriteMorph,
    type: "reporter",
    category: "motion",
    spec: "angle",
  },
  // setBorderSize: {
  //     type: 'command',
  //     category: 'pen',
  //     spec: 'set pen border: size %n color %n',
  //     defaults: [0, 0]
  // },
  // getBorderSize: {
  //     type: 'reporter',
  //     category: 'pen',
  //     spec: 'pen border size',
  // },
  // setBorderHue: {
  //     type: 'command',
  //     category: 'pen',
  //     spec: 'set pen border color to %n',
  // },
  // getBorderHue: {
  //     type: 'reporter',
  //     category: 'pen',
  //     spec: 'pen border color',
  // },
  smoothBorders: {
    type: "command",
    category: "pen",
    spec: "fix borders",
  },

  // setBorderShade: {
  //     type: 'command',
  //     category: 'pen',
  //     spec: 'set border shade to %n',
  //     defaults: [0]
  // },
  // changeBorderShade: {
  //     type: 'command',
  //     category: 'pen',
  //     spec: 'change border shade by %n',
  //     defaults: [0]
  // },
  // getBorderShade: {
  //     type: 'reporter',
  //     category: 'pen',
  //     spec: 'border shade',
  // },
  flatLineEnds: {
    type: "command",
    category: "pen",
    spec: "flat line end? %b",
  },
  doSetScaleFactor: {
    only: SpriteMorph,
    type: "command",
    category: "looks",
    spec: "scale %scft by factor %n percent",
    defaults: [null, 100],
  },
  // drawLogSpiral: {
  //     only: SpriteMorph,
  //     type: "command",
  //     category: "pen",
  //     spec: "log spiral: c %n sweep %n size %n pen growth %n clockwise? %bool",
  //     defaults: [0.2, 360, 38, 0.1, false]
  // },
  // drawCircle: {
  //     only: SpriteMorph,
  //     type: "command",
  //     category: "pen",
  //     spec: "circle: diameter %n sweep %n",
  //     defaults: [50, 360]
  // },
  // drawTanu: {
  //     only: SpriteMorph,
  //     type: "command",
  //     category: "pen",
  //     spec: "tanu: c %n sweep %n size %n pen growth %n clockwise? %bool depth %n percentage %n",
  //     defaults: [0.2, 360, 38, 0, false, 3, 0.375]
  // },
  // drawLimitedTanu: {
  //     only: SpriteMorph,
  //     type: "command",
  //     category: "pen",
  //     spec: "LimitedTanu: c %n sweep %n size %n pen growth %n clockwise? %bool",
  //     defaults: [0.3, 550, 38, 0, true]
  // },
  degreesToRadians: {
    only: SpriteMorph,
    type: "reporter",
    category: "other",
    spec: "degrees to radians %n",
    defaults: [0],
  },
  getBorderState: {
    only: SpriteMorph,
    type: "reporter",
    category: "pen",
    spec: "pen border",
  },
  setBorder: {
    type: "command",
    category: "pen",
    spec: "set pen border: size %n color %n",
    defaults: [0, 0],
  },
  borderPathLengthHelp: {
    type: "command",
    category: "pen",
    spec: "path length rotate length %n flip %b",
    defaults: [0, false],
  },
  getPenBorderAttribute: {
    type: "reporter",
    category: "pen",
    spec: "pen border %penBorder",
    defaults: [["size"]],
  },
  setEffect: {
    type: "command",
    category: "looks",
    spec: "set %eff effect to %n",
    defaults: [["color"], 0],
  },
  exportAsCSV: {
    type: "command",
    category: "variables",
    spec: "display %l and %l as a CSV",
  },
  changeEffect: {
    type: "command",
    category: "looks",
    spec: "change %eff effect by %n",
    defaults: [["color"], 25],
  },
  getEffect: {
    type: "reporter",
    category: "looks",
    spec: "%eff effect",
    defaults: [["color"]],
  },
  exportToVisualizer: {
    type: "command",
    category: "looks",
    spec: "export stage to visualizer",
  },
};

SpriteMorph.prototype.initBlocks = function () {
  SpriteMorph.prototype.blocks = {
    ...jensBlocks,
    ...csdtBlocks,
  };
};

SpriteMorph.prototype.initBlockMigrations();
SpriteMorph.prototype.initBlocks();

/** Custom block definitions
 *
 * You can place your custom block definitions here
 */

// Translate sprite by its width or height
SpriteMorph.prototype.translatePercent = function (percent, direction) {
  var dest,
    delta = radians(this.heading);
  var width = 0,
    height = 0,
    newX = 0,
    newY = 0,
    dist = 0,
    angle = 0,
    X = 0,
    Y = 0;

  if (this.costume != null) {
    width = this.costume.contents.width * this.scale;
    height = this.costume.contents.height * this.scale;
  } else {
    width = 32 * this.scale;
    height = 20 * this.scale;
  }

  if (direction[0] === "height") {
    newY = this.yPosition() + (height * percent) / 100;
    dist = Math.sqrt(Math.pow(this.yPosition() - newY, 2));
    angle = this.heading * (Math.PI / 180);
  } else {
    newX = this.xPosition() + (width * percent) / 100;
    dist = Math.sqrt(Math.pow(this.xPosition() - newX, 2));
    angle = this.heading * (Math.PI / 180) + Math.PI / 2;
  }
  if (dist != 0) {
    X =
      (-percent / Math.abs(percent)) * dist * Math.cos(angle) +
      this.xPosition();
    Y =
      (percent / Math.abs(percent)) * dist * Math.sin(angle) + this.yPosition();
    this.gotoXY(X, Y);
    this.positionTalkBubble();
  }
};

// Scales the sprite based on its current size
SpriteMorph.prototype.newSizeOfCurrent = function (percent) {
  let val = this.getScale() * (percent / 100);
  this.setScale(val);
};

// Returns the current angle
SpriteMorph.prototype.getAngle = function () {
  return 90 - this.direction();
};

// Returns the current border state
SpriteMorph.prototype.getBorderState = function () {
  return this.hasBorder;
};

SpriteMorph.prototype.setBorder = function (size, color) {
  if (size != 0) {
    this.hasBorder = true;
  } else {
    this.hasBorder = false;
  }
  this.borderSize = size;
  this.borderColor = color;
};
SpriteMorph.prototype.getPenBorderAttribute = function (attrib) {
  var name = attrib instanceof Array ? attrib[0] : attrib.toString(),
    options = ["active", "size", "hue"];
  if (name === "size") {
    return this.borderSize;
  } else if (name == "hue") {
    return this.borderColor;
  }
  return this.hasBorder;
};

// SpriteMorph.prototype.setBorderSize = function (size, color) {
//     if (size != 0){
//         this.hasBorder = true;
//     }else{
//         this.hasBorder = false;
//     }
//     this.borderSize = size;
//     this.borderColor = color;
// };

SpriteMorph.prototype.borderPathLengthHelp = function (length, flip) {
  this.rotateByDegrees(flip ? 90 : -90);
  this.forward(length * (flip ? 0.5 : 1) + this.borderSize / (flip ? 2 : 1));
  this.rotateByDegrees(flip ? -90 : 90);
  this.down();
  this.forward(1);
  this.up();
  if (flip) {
    this.forward(-1);
  }
};
// Alternative to direction, rotates sprite to a specific angle
SpriteMorph.prototype.pointAtAngle = function (angle) {
  let val = 0 - angle + 90;
  this.setHeading(val);
};

// Rotates a sprite based on its current angle
SpriteMorph.prototype.rotateByDegrees = function (angle) {
  this.turnLeft(angle);
};

// Flips the sprite (lakota)
SpriteMorph.prototype.flip = function () {
  var cst;
  var xP = 100;
  var yP = -100;
  cst = this.costume;

  if (!isFinite(+xP * +yP) || isNaN(+xP * +yP)) {
    throw new Error("expecting a finite number\nbut getting Infinity or NaN");
  }

  // If the costume is a turtle, don't do this stretch...
  if (cst != null) {
    cst = cst.stretched(
      Math.round((cst.width() * +xP) / 100),
      Math.round((cst.height() * +yP) / 100)
    );
  }

  this.doSwitchToCostume(cst);
};

// Reflect sprite across x axis
SpriteMorph.prototype.reflectXAxis = function () {
  this.flipVertical();
  this.gotoXY(this.xPosition(), this.yPosition() * -1);
};

// Reflect sprite across y axis
SpriteMorph.prototype.reflectYAxis = function () {
  this.flipHorizontal();
  this.gotoXY(this.xPosition() * -1, this.yPosition());
};

// Flips the sprite vertically (relative)
SpriteMorph.prototype.flipVertical = function () {
  // this.flip();
  // this.pointAtAngle((this.getAngle() * -1));
  var cst;
  var xP = 100;
  var yP = -100;
  cst = this.costume;

  if (!isFinite(+xP * +yP) || isNaN(+xP * +yP)) {
    throw new Error("expecting a finite number\nbut getting Infinity or NaN");
  }

  // If the costume is a turtle, don't do this stretch...
  if (cst != null) {
    cst = cst.stretched(
      Math.round((cst.width() * +xP) / 100),
      Math.round((cst.height() * +yP) / 100)
    );
  }

  this.doSwitchToCostume(cst);
};

// Flips the sprite horizontally (relative)
SpriteMorph.prototype.flipHorizontal = function () {
  // this.flip();
  // this.pointAtAngle(180 - this.getAngle());
  var cst;
  var xP = -100;
  var yP = 100;
  cst = this.costume;

  if (!isFinite(+xP * +yP) || isNaN(+xP * +yP)) {
    throw new Error("expecting a finite number\nbut getting Infinity or NaN");
  }
  // If the costume is a turtle, don't do this stretch...
  if (cst != null) {
    cst = cst.stretched(
      Math.round((cst.width() * +xP) / 100),
      Math.round((cst.height() * +yP) / 100)
    );
  }
  this.doSwitchToCostume(cst);
};

// Based on direction, scales the sprite (by its current size)
SpriteMorph.prototype.doSetScaleFactor = function (direction, percent) {
  var cst, xP, yP;
  cst = this.costume;

  if (direction[0] === "x") {
    xP = percent;
    yP = 100;
  } else if (direction[0] === "y") {
    xP = 100;
    yP = percent;
  } else if (direction[0] === "x_and_y") {
    xP = percent;
    yP = percent;
  } else {
    xP = percent;
    yP = percent;
  }

  if (!isFinite(+xP * +yP) || isNaN(+xP * +yP)) {
    throw new Error("expecting a finite number\nbut getting Infinity or NaN");
  }
  // If the costume is a turtle, don't do this stretch...
  if (cst != null) {
    cst = cst.stretched(
      Math.round((cst.width() * +xP) / 100),
      Math.round((cst.height() * +yP) / 100)
    );
  }

  this.doSwitchToCostume(cst);
};

// Allows for flat ends
SpriteMorph.prototype.flatLineEnds = function (bool) {
  SpriteMorph.prototype.useFlatLineEnds = bool;
};

// Converts degrees to radians
SpriteMorph.prototype.degreesToRadians = function (degrees) {
  return (3.141592653589 * degrees) / 180;
};

//Just try to have only two branches, hense "Limited Tanu"
SpriteMorph.prototype.drawLimitedTanu = function (
  c,
  endangle,
  getSize,
  penGrowth,
  isClockwise
) {
  var xOrigin,
    yOrigin,
    startingDirection,
    t,
    tinc,
    roffset,
    r,
    start,
    end,
    segments,
    clockwise,
    size,
    tempx,
    tempy,
    temppensize,
    tempclockwize;
  this.down();
  segments = 5;

  if (isClockwise === null || typeof isClockwise === undefined) {
    clockwise = false;
  } else {
    clockwise = isClockwise;
  }

  if (clockwise) {
    if (endangle < 0) {
      startingDirection =
        90 - this.direction() - endangle + degrees(Math.atan(1 / c)) - 180;
    } else {
      startingDirection = 90 - this.direction() + degrees(Math.atan(1 / c));
    }
  } else {
    if (endangle < 0) {
      startingDirection =
        90 - this.direction() + endangle + (180 - degrees(Math.atan(1 / c)));
    } else {
      startingDirection = 90 - this.direction() - degrees(Math.atan(1 / c));
    }
  }

  size =
    2 * (getSize / Math.exp(c * this.degreesToRadians(Math.abs(endangle))));
  roffset = size * Math.exp(c * this.degreesToRadians(0));

  if (endangle < 0) {
    start = Math.abs(endangle);
    end = 0;
    r = size * Math.exp(c * this.degreesToRadians(Math.abs(endangle)));
    if (clockwise) {
      xOrigin =
        this.xPosition() -
        (r * Math.cos(radians(startingDirection - start)) -
          roffset * Math.cos(radians(startingDirection)));
      yOrigin =
        this.yPosition() -
        (r * Math.sin(radians(startingDirection - start)) -
          roffset * Math.sin(radians(startingDirection)));
    } else {
      xOrigin =
        this.xPosition() -
        (r * Math.cos(radians(start + startingDirection)) -
          roffset * Math.cos(radians(startingDirection)));
      yOrigin =
        this.yPosition() -
        (r * Math.sin(radians(start + startingDirection)) -
          roffset * Math.sin(radians(startingDirection)));
    }
  } else {
    start = 0;
    end = endangle;
    xOrigin = this.xPosition();
    yOrigin = this.yPosition();
  }

  t = start;
  if (end > start) {
    tinc = 1;
  } else {
    tinc = -1;
  }

  let repeatCounter = Math.abs((end - start) / tinc) / segments;
  let stoppingpoint = 0;
  //distinguish two different mother spiral drawing patterns
  if (endangle < 0) {
    stoppingpoint = (repeatCounter * segments * 0.3).toFixed(0);
  } else {
    stoppingpoint = (repeatCounter * segments * 0.7).toFixed(0);
  }

  for (let i = 0; i < repeatCounter; i++) {
    //  Find way to do warp
    for (let j = 0; j < segments; j++) {
      r = size * Math.exp(c * this.degreesToRadians(t));
      if (!clockwise) {
        this.gotoXY(
          xOrigin +
            r * Math.cos(radians(t + startingDirection)) -
            roffset * Math.cos(radians(startingDirection)),
          yOrigin +
            r * Math.sin(radians(t + startingDirection)) -
            roffset * Math.sin(radians(startingDirection))
        );
      } else {
        this.gotoXY(
          xOrigin +
            r * Math.cos(radians(t * -1 + startingDirection)) -
            roffset * Math.cos(radians(startingDirection)),
          yOrigin +
            r * Math.sin(radians(t * -1 + startingDirection)) -
            roffset * Math.sin(radians(startingDirection))
        );
      }
      t = t + tinc;
      this.changeSize(penGrowth);
      if (clockwise) {
        this.turn(tinc);
      } else {
        this.turnLeft(tinc);
      }

      if (i * 5 + j == stoppingpoint) {
        tempx = this.xPosition();
        tempy = this.yPosition();
        temppensize = this.size; //this is the pensize, not the size of the spiral
        //tempdirection = 135 - this.getAngle();

        if (endangle > 0) {
          tempdirection = 180 + this.getAngle();
        } else {
          tempdirection = this.getAngle();
        }

        //tempdirection = this.direction();
        //This is the direction variable, not where the pen is pointing at this point
      }
    }
  }
  let modCounter = Math.abs((end - start) / tinc) % segments;

  for (let k = 0; k < modCounter; k++) {
    r = size * Math.exp(c * this.degreesToRadians(t));
    if (!clockwise) {
      this.gotoXY(
        xOrigin +
          r * Math.cos(radians(t + startingDirection)) -
          roffset * Math.cos(radians(startingDirection)),
        yOrigin +
          r * Math.sin(radians(t + startingDirection)) -
          roffset * Math.sin(radians(startingDirection))
      );
    } else {
      this.gotoXY(
        xOrigin +
          r * Math.cos(radians(t * -1 + startingDirection)) -
          roffset * Math.cos(radians(startingDirection)),
        yOrigin +
          r * Math.sin(radians(t * -1 + startingDirection)) -
          roffset * Math.sin(radians(startingDirection))
      );
    }
    t = t + tinc;
    this.changeSize(penGrowth);
    if (clockwise) {
      this.turn(tinc);
    } else {
      this.turnLeft(tinc);
    }
  }
  this.up();

  this.gotoXY(tempx, tempy);
  this.setSize(temppensize); //temppensize
  var newspiralsize = getSize * 0.375;
  var newclockwize = !isClockwise; //reverse the clockwise
  var temppengrowth = Math.abs(penGrowth) * -1; //pengrawth will always be negative - drawing outside to inside
  this.pointAtAngle(tempdirection);

  var newsweep = Math.abs(endangle) * -0.618;
  this.drawLogSpiral(c, newsweep, newspiralsize, temppengrowth, newclockwize);
};

//Below is the tanu prototype
SpriteMorph.prototype.drawTanu = function (
  c,
  endangle,
  getSize,
  penGrowth,
  isClockwise,
  depth,
  percentage
) {
  var xOrigin,
    yOrigin,
    startingDirection,
    t,
    tinc,
    roffset,
    r,
    start,
    end,
    segments,
    clockwise,
    size,
    tempx,
    tempy,
    temppensize,
    tempclockwize;

  if (depth >= 1) {
    //implement the below function if the depth value is one (one spiral) or more. end if not
    this.down();
    segments = 5;

    if (isClockwise === null || typeof isClockwise === undefined) {
      clockwise = false;
    } else {
      clockwise = isClockwise;
    }

    if (clockwise) {
      if (endangle < 0) {
        startingDirection =
          90 - this.direction() - endangle + degrees(Math.atan(1 / c)) - 180;
      } else {
        startingDirection = 90 - this.direction() + degrees(Math.atan(1 / c));
      }
    } else {
      if (endangle < 0) {
        startingDirection =
          90 - this.direction() + endangle + (180 - degrees(Math.atan(1 / c)));
      } else {
        startingDirection = 90 - this.direction() - degrees(Math.atan(1 / c));
      }
    }

    size =
      2 * (getSize / Math.exp(c * this.degreesToRadians(Math.abs(endangle))));
    roffset = size * Math.exp(c * this.degreesToRadians(0));

    if (endangle < 0) {
      start = Math.abs(endangle);
      end = 0;
      r = size * Math.exp(c * this.degreesToRadians(Math.abs(endangle)));
      if (clockwise) {
        xOrigin =
          this.xPosition() -
          (r * Math.cos(radians(startingDirection - start)) -
            roffset * Math.cos(radians(startingDirection)));
        yOrigin =
          this.yPosition() -
          (r * Math.sin(radians(startingDirection - start)) -
            roffset * Math.sin(radians(startingDirection)));
      } else {
        xOrigin =
          this.xPosition() -
          (r * Math.cos(radians(start + startingDirection)) -
            roffset * Math.cos(radians(startingDirection)));
        yOrigin =
          this.yPosition() -
          (r * Math.sin(radians(start + startingDirection)) -
            roffset * Math.sin(radians(startingDirection)));
      }
    } else {
      start = 0;
      end = endangle;
      xOrigin = this.xPosition();
      yOrigin = this.yPosition();
    }

    t = start;
    if (end > start) {
      tinc = 1;
    } else {
      tinc = -1;
    }

    let repeatCounter = Math.abs((end - start) / tinc) / segments;
    let stoppingpoint = 0;
    //distinguish two different mother spiral drawing patterns
    if (endangle < 0) {
      stoppingpoint = (repeatCounter * segments * 0.3).toFixed(0);
    } else {
      stoppingpoint = (repeatCounter * segments * 0.7).toFixed(0);
    }

    for (let i = 0; i < repeatCounter; i++) {
      //  Find way to do warp
      for (let j = 0; j < segments; j++) {
        r = size * Math.exp(c * this.degreesToRadians(t));
        if (!clockwise) {
          this.gotoXY(
            xOrigin +
              r * Math.cos(radians(t + startingDirection)) -
              roffset * Math.cos(radians(startingDirection)),
            yOrigin +
              r * Math.sin(radians(t + startingDirection)) -
              roffset * Math.sin(radians(startingDirection))
          );
        } else {
          this.gotoXY(
            xOrigin +
              r * Math.cos(radians(t * -1 + startingDirection)) -
              roffset * Math.cos(radians(startingDirection)),
            yOrigin +
              r * Math.sin(radians(t * -1 + startingDirection)) -
              roffset * Math.sin(radians(startingDirection))
          );
        }
        t = t + tinc;
        this.changeSize(penGrowth);
        if (clockwise) {
          this.turn(tinc);
        } else {
          this.turnLeft(tinc);
        }

        if (i * 5 + j == stoppingpoint) {
          tempx = this.xPosition();
          tempy = this.yPosition();
          temppensize = this.size; //this is the pensize, not the size of the spiral
          //tempdirection = 135 - this.getAngle();

          if (endangle > 0) {
            tempdirection = 180 + this.getAngle();
          } else {
            tempdirection = this.getAngle();
          }

          //tempdirection = this.direction();
          //This is the direction variable, not where the pen is pointing at this point
        }
      }
    }
    let modCounter = Math.abs((end - start) / tinc) % segments;

    for (let k = 0; k < modCounter; k++) {
      r = size * Math.exp(c * this.degreesToRadians(t));
      if (!clockwise) {
        this.gotoXY(
          xOrigin +
            r * Math.cos(radians(t + startingDirection)) -
            roffset * Math.cos(radians(startingDirection)),
          yOrigin +
            r * Math.sin(radians(t + startingDirection)) -
            roffset * Math.sin(radians(startingDirection))
        );
      } else {
        this.gotoXY(
          xOrigin +
            r * Math.cos(radians(t * -1 + startingDirection)) -
            roffset * Math.cos(radians(startingDirection)),
          yOrigin +
            r * Math.sin(radians(t * -1 + startingDirection)) -
            roffset * Math.sin(radians(startingDirection))
        );
      }
      t = t + tinc;
      this.changeSize(penGrowth);
      if (clockwise) {
        this.turn(tinc);
      } else {
        this.turnLeft(tinc);
      }
    }
    this.up();

    if (depth > 1) {
      //this means it has to go to the branching point
      this.gotoXY(tempx, tempy);
      this.setSize(temppensize); //temppensize
      var newspiralsize = getSize * percentage;
      var newclockwize = !isClockwise; //reverse the clockwise
      var temppengrowth = Math.abs(penGrowth) * -1; //pengrawth will always be negative - drawing outside to inside
      this.pointAtAngle(tempdirection);
      var newdepth = depth - 1;

      var newsweep = Math.abs(endangle) * -0.618;
      this.drawTanu(
        c,
        newsweep,
        newspiralsize,
        temppengrowth,
        newclockwize,
        newdepth,
        percentage
      );
    }
  }
  this.up();
};

/** CSDT Classic Blocks (to be tested or modified)
 *
 * These blocks are not really tested, or not needed currently.
 */

SpriteMorph.prototype.smoothBorders = function (start, dest) {
  var tempSize = this.size,
    tempColor = this.color;

  for (line = 0; line < this.lineList.length; line++) {
    this.size = this.lineList[line][2];
    this.color = this.lineList[line][3];
    this.drawLine(this.lineList[line][0], this.lineList[line][1], false);
  }

  this.size = tempSize;
  this.color = tempColor;
  this.lineList = [];
};

SpriteMorph.prototype.getBorderSize = function () {
  return this.borderSize;
};

SpriteMorph.prototype.changeHue = function (delta) {
  this.setHue(this.getHue() + (+delta || 0));
};

SpriteMorph.prototype.getBorderHue = function () {
  return this.borderColor;
};

SpriteMorph.prototype.setBorderHue = function (clr) {
  this.borderColor = clr;
};

SpriteMorph.prototype.getBorderShade = function () {
  return this.borderColor.hsv()[2] * 50 + (50 - this.borderColor.hsv()[1] * 50);
};

SpriteMorph.prototype.setBorderShade = function (num) {
  var hsv = this.borderColor.hsv(),
    x = this.xPosition(),
    y = this.yPosition();

  //Num goes in 0-100 range. 0 is black, 50 is the unchanged hue, 100 is white
  num = Math.max(Math.min(+num || 0, 100), 0) / 50;
  hsv[1] = 1;
  hsv[2] = 1;

  if (num > 1) {
    hsv[1] = 2 - num; //Make it more white
  } else {
    hsv[2] = num; //Make it more black
  }

  this.borderColor.set_hsv.apply(this.borderColor, hsv);
  if (!this.costume) {
    this.drawNew();
    this.changed();
  }
  this.gotoXY(x, y);
};

SpriteMorph.prototype.changeBorderShade = function (delta) {
  return this.setBorderShade(this.getBorderShade() + (+delta || 0));
};

SpriteMorph.prototype.drawBorderedLine = function (start, dest) {
  //drawLine wrapper to draw line and border in one go
  this.drawLine(start, dest, true);
  this.drawLine(start, dest, false);

  if (this.isDown) {
    this.lineList[this.lineList.length] = [start, dest, this.size, this.color];
  }
};

/** CSDT Experimental Blocks (to be tested or modified)
 *
 * These blocks are ones that intend to be a part of the software.
 * Just needs additional functionality and/or testing..
 */

SpriteMorph.prototype.drawLogSpiral = function (
  c,
  endangle,
  getSize,
  penGrowth,
  isClockwise
) {
  var xOrigin,
    yOrigin,
    startingDirection,
    beta,
    t,
    tinc,
    roffset,
    r,
    h,
    start,
    end,
    segments,
    startAngle,
    clockwise,
    size;
  this.down();
  segments = 5;

  if (isClockwise === null || typeof isClockwise === undefined) {
    clockwise = false;
  } else {
    clockwise = isClockwise;
  }

  if (clockwise) {
    if (endangle < 0) {
      startingDirection =
        90 - this.direction() - endangle + degrees(Math.atan(1 / c)) - 180;
    } else {
      startingDirection = 90 - this.direction() + degrees(Math.atan(1 / c));
    }
  } else {
    if (endangle < 0) {
      startingDirection =
        90 - this.direction() + endangle + (180 - degrees(Math.atan(1 / c)));
    } else {
      startingDirection = 90 - this.direction() - degrees(Math.atan(1 / c));
    }
  }

  size =
    2 * (getSize / Math.exp(c * this.degreesToRadians(Math.abs(endangle))));
  roffset = size * Math.exp(c * this.degreesToRadians(0));

  if (endangle < 0) {
    start = Math.abs(endangle);
    end = 0;
    r = size * Math.exp(c * this.degreesToRadians(Math.abs(endangle)));
    if (clockwise) {
      xOrigin =
        this.xPosition() -
        (r * Math.cos(radians(startingDirection - start)) -
          roffset * Math.cos(radians(startingDirection)));
      yOrigin =
        this.yPosition() -
        (r * Math.sin(radians(startingDirection - start)) -
          roffset * Math.sin(radians(startingDirection)));
    } else {
      xOrigin =
        this.xPosition() -
        (r * Math.cos(radians(start + startingDirection)) -
          roffset * Math.cos(radians(startingDirection)));
      yOrigin =
        this.yPosition() -
        (r * Math.sin(radians(start + startingDirection)) -
          roffset * Math.sin(radians(startingDirection)));
    }
  } else {
    start = 0;
    end = endangle;
    xOrigin = this.xPosition();
    yOrigin = this.yPosition();
  }

  t = start;
  if (end > start) {
    tinc = 1;
  } else {
    tinc = -1;
  }

  let repeatCounter = Math.abs((end - start) / tinc) / segments;

  for (let i = 0; i < repeatCounter; i++) {
    //  Find way to do warp
    for (let j = 0; j < segments; j++) {
      r = size * Math.exp(c * this.degreesToRadians(t));
      if (!clockwise) {
        this.gotoXY(
          xOrigin +
            r * Math.cos(radians(t + startingDirection)) -
            roffset * Math.cos(radians(startingDirection)),
          yOrigin +
            r * Math.sin(radians(t + startingDirection)) -
            roffset * Math.sin(radians(startingDirection))
        );
      } else {
        this.gotoXY(
          xOrigin +
            r * Math.cos(radians(t * -1 + startingDirection)) -
            roffset * Math.cos(radians(startingDirection)),
          yOrigin +
            r * Math.sin(radians(t * -1 + startingDirection)) -
            roffset * Math.sin(radians(startingDirection))
        );
      }
      t = t + tinc;
      this.changeSize(penGrowth);
      if (clockwise) {
        this.turn(tinc);
      } else {
        this.turnLeft(tinc);
      }
    }
  }

  let modCounter = Math.abs((end - start) / tinc) % segments;

  for (let k = 0; k < modCounter; k++) {
    r = size * Math.exp(c * this.degreesToRadians(t));
    if (!clockwise) {
      this.gotoXY(
        xOrigin +
          r * Math.cos(radians(t + startingDirection)) -
          roffset * Math.cos(radians(startingDirection)),
        yOrigin +
          r * Math.sin(radians(t + startingDirection)) -
          roffset * Math.sin(radians(startingDirection))
      );
    } else {
      this.gotoXY(
        xOrigin +
          r * Math.cos(radians(t * -1 + startingDirection)) -
          roffset * Math.cos(radians(startingDirection)),
        yOrigin +
          r * Math.sin(radians(t * -1 + startingDirection)) -
          roffset * Math.sin(radians(startingDirection))
      );
    }
    t = t + tinc;
    this.changeSize(penGrowth);
    if (clockwise) {
      this.turn(tinc);
    } else {
      this.turnLeft(tinc);
    }
  }

  this.up();
};

SpriteMorph.prototype.drawCircle = function (diameter, sweep) {
  var anglecount, stepinc, numbsides, cdirection;
  this.down();

  cdirection = 1;
  if (sweep < 0) {
    cdirection = -1;
  }

  sweep = Math.abs(sweep);
  anglecount = 0;
  stepinc = 1;
  numbsides = 3.141592653589 / Math.asin(stepinc / diameter);

  var i;

  while (360 / numbsides + anglecount <= sweep) {
    if (anglecount + 6 > sweep) {
      while (360 / numbsides + anglecount <= sweep) {
        this.turnLeft((360.0 * cdirection) / numbsides);
        this.forward(stepinc);
        anglecount = anglecount + 360 / numbsides;
      }
    } else {
      for (i = 0; i < 6; i++) {
        this.turnLeft((360 * cdirection) / numbsides);
        this.forward(stepinc);
        anglecount += 360 / numbsides;
      }
    }
  }

  if ((cdirection = 1)) {
    this.turnLeft(sweep - anglecount);
  } else {
    this.turn(sweep - anglecount);
  }
  this.up();
};

/** Snap Override Functions
 *
 * These are the override functions for blocks, adding blocks, basically anything with blocks.
 * Make sure to add blocks to csdtBlocks, then blockTemplates()
 */

// Override for primitive set effect
SpriteMorph.prototype.setEffect = function (effect, value) {
  var eff = effect instanceof Array ? effect[0] : effect.toString();
  if (
    !contains(
      [
        "color",
        "saturation",
        "brightness",
        "ghost",
        "fisheye",
        "whirl",
        "pixelate",
        "mosaic",
        "negative",
        // depracated, but still supported in legacy projects:
        "duplicate",
        "comic",
        "confetti",
      ],
      eff
    )
  ) {
    throw new Error(localize("unsupported graphic effect") + ":\n" + eff);
  }
  if (eff === "ghost") {
    this.alpha = 1 - Math.min(Math.max(+value || 0, 0), 100) / 100;
  } else {
    // // CSDT Enable saturation change whenever color is selected.
    if (eff === "color") {
      this.graphicsValues["saturation"] = this.hasSaturation
        ? this.graphicsValues["saturation"]
        : 100;
      this.graphicsValues["brightness"] = this.hasBrightness
        ? this.graphicsValues["brightness"]
        : 68;
    } else if (eff === "saturation") {
      this.hasSaturation = true;
    } else if (eff === "brightness") {
      this.hasBrightness = true;
    }
    this.graphicsValues[eff] = +value;
  }
  this.rerender();
};

// Override for color, brightness, and saturation (transform_HSV())
SpriteMorph.prototype.applyGraphicsEffects = function (canvas) {
  // For every effect: apply transform of that effect(canvas, stored value)
  // Graphic effects from Scratch are heavily based on ScratchPlugin.c

  var ctx, imagedata, w, h;

  function transform_fisheye(imagedata, value) {
    var pixels,
      newImageData,
      newPixels,
      centerX,
      centerY,
      w,
      h,
      x,
      y,
      dx,
      dy,
      r,
      angle,
      srcX,
      srcY,
      i,
      srcI;

    w = imagedata.width;
    h = imagedata.height;
    pixels = imagedata.data;
    newImageData = ctx.createImageData(w, h);
    newPixels = newImageData.data;

    centerX = w / 2;
    centerY = h / 2;
    value = Math.max(0, (value + 100) / 100);
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        dx = (x - centerX) / centerX;
        dy = (y - centerY) / centerY;
        r = Math.pow(Math.sqrt(dx * dx + dy * dy), value);
        if (r <= 1) {
          angle = Math.atan2(dy, dx);
          srcX = Math.floor(centerX + r * Math.cos(angle) * centerX);
          srcY = Math.floor(centerY + r * Math.sin(angle) * centerY);
        } else {
          srcX = x;
          srcY = y;
        }
        i = (y * w + x) * 4;
        srcI = (srcY * w + srcX) * 4;
        newPixels[i] = pixels[srcI];
        newPixels[i + 1] = pixels[srcI + 1];
        newPixels[i + 2] = pixels[srcI + 2];
        newPixels[i + 3] = pixels[srcI + 3];
      }
    }
    return newImageData;
  }

  function transform_whirl(imagedata, value) {
    var pixels,
      newImageData,
      newPixels,
      w,
      h,
      centerX,
      centerY,
      x,
      y,
      radius,
      scaleX,
      scaleY,
      whirlRadians,
      radiusSquared,
      dx,
      dy,
      d,
      factor,
      angle,
      srcX,
      srcY,
      i,
      srcI,
      sina,
      cosa;

    w = imagedata.width;
    h = imagedata.height;
    pixels = imagedata.data;
    newImageData = ctx.createImageData(w, h);
    newPixels = newImageData.data;

    centerX = w / 2;
    centerY = h / 2;
    radius = Math.min(centerX, centerY);
    if (w < h) {
      scaleX = h / w;
      scaleY = 1;
    } else {
      scaleX = 1;
      scaleY = w / h;
    }
    whirlRadians = -radians(value);
    radiusSquared = radius * radius;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        dx = scaleX * (x - centerX);
        dy = scaleY * (y - centerY);
        d = dx * dx + dy * dy;
        if (d < radiusSquared) {
          factor = 1 - Math.sqrt(d) / radius;
          angle = whirlRadians * (factor * factor);
          sina = Math.sin(angle);
          cosa = Math.cos(angle);
          srcX = Math.floor((cosa * dx - sina * dy) / scaleX + centerX);
          srcY = Math.floor((sina * dx + cosa * dy) / scaleY + centerY);
        } else {
          srcX = x;
          srcY = y;
        }
        i = (y * w + x) * 4;
        srcI = (srcY * w + srcX) * 4;
        newPixels[i] = pixels[srcI];
        newPixels[i + 1] = pixels[srcI + 1];
        newPixels[i + 2] = pixels[srcI + 2];
        newPixels[i + 3] = pixels[srcI + 3];
      }
    }
    return newImageData;
  }

  function transform_pixelate(imagedata, value) {
    var pixels, newImageData, newPixels, w, h, x, y, srcX, srcY, i, srcI;

    w = imagedata.width;
    h = imagedata.height;
    pixels = imagedata.data;
    newImageData = ctx.createImageData(w, h);
    newPixels = newImageData.data;

    value = Math.floor(Math.abs(value / 10) + 1);
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        srcX = Math.floor(x / value) * value;
        srcY = Math.floor(y / value) * value;
        i = (y * w + x) * 4;
        srcI = (srcY * w + srcX) * 4;
        newPixels[i] = pixels[srcI];
        newPixels[i + 1] = pixels[srcI + 1];
        newPixels[i + 2] = pixels[srcI + 2];
        newPixels[i + 3] = pixels[srcI + 3];
      }
    }
    return newImageData;
  }

  function transform_mosaic(imagedata, value) {
    var pixels, i, l, newImageData, newPixels, srcI;
    pixels = imagedata.data;
    newImageData = ctx.createImageData(imagedata.width, imagedata.height);
    newPixels = newImageData.data;

    value = Math.round((Math.abs(value) + 10) / 10);
    value = Math.max(
      0,
      Math.min(value, Math.min(imagedata.width, imagedata.height))
    );
    for (i = 0, l = pixels.length; i < l; i += 4) {
      srcI = (i * value) % l;
      newPixels[i] = pixels[srcI];
      newPixels[i + 1] = pixels[srcI + 1];
      newPixels[i + 2] = pixels[srcI + 2];
      newPixels[i + 3] = pixels[srcI + 3];
    }
    return newImageData;
  }

  function transform_duplicate(imagedata, value) {
    var pixels, i;
    pixels = imagedata.data;
    for (i = 0; i < pixels.length; i += 4) {
      pixels[i] = pixels[i * value];
      pixels[i + 1] = pixels[i * value + 1];
      pixels[i + 2] = pixels[i * value + 2];
      pixels[i + 3] = pixels[i * value + 3];
    }
    return imagedata;
  }

  function transform_HSV(
    imagedata,
    hueShift,
    saturationShift,
    brightnessShift
  ) {
    var pixels,
      index,
      l,
      r,
      g,
      b,
      max,
      min,
      span,
      h,
      s,
      v,
      i,
      f,
      p,
      q,
      t,
      newR,
      newG,
      newB;

    // CSDT Brightness/Saturation
    let sat = -100 + saturationShift * 2;
    let bri = -100 + brightnessShift * 2;

    pixels = imagedata.data;
    for (index = 0, l = pixels.length; index < l; index += 4) {
      r = pixels[index];
      g = pixels[index + 1];
      b = pixels[index + 2];

      max = Math.max(r, g, b);
      min = Math.min(r, g, b);
      span = max - min;
      if (span === 0) {
        h = s = 0;
      } else {
        if (max === r) {
          h = (60 * (g - b)) / span;
        } else if (max === g) {
          h = 120 + (60 * (b - r)) / span;
        } else if (max === b) {
          h = 240 + (60 * (r - g)) / span;
        }
        s = (max - min) / max;
      }
      if (h < 0) {
        h += 360;
      }
      v = max / 255;

      // Adjusting color range from 200 to 100 for easier classroom comprehension
      h = (h + (hueShift * 360) / 100) % 360;
      s = Math.max(0, Math.min(s + sat / 100, 1));
      v = Math.max(0, Math.min(v + bri / 100, 1));

      i = Math.floor(h / 60);
      f = h / 60 - i;
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));

      if (i === 0 || i === 6) {
        newR = v;
        newG = t;
        newB = p;
      } else if (i === 1) {
        newR = q;
        newG = v;
        newB = p;
      } else if (i === 2) {
        newR = p;
        newG = v;
        newB = t;
      } else if (i === 3) {
        newR = p;
        newG = q;
        newB = v;
      } else if (i === 4) {
        newR = t;
        newG = p;
        newB = v;
      } else if (i === 5) {
        newR = v;
        newG = p;
        newB = q;
      }

      pixels[index] = newR * 255;
      pixels[index + 1] = newG * 255;
      pixels[index + 2] = newB * 255;
    }
    return imagedata;
  }

  function transform_negative(imagedata, value) {
    var pixels, i, l, rcom, gcom, bcom;
    pixels = imagedata.data;
    for (i = 0, l = pixels.length; i < l; i += 4) {
      rcom = 255 - pixels[i];
      gcom = 255 - pixels[i + 1];
      bcom = 255 - pixels[i + 2];

      if (pixels[i] < rcom) {
        //compare to the complement
        pixels[i] += value;
      } else if (pixels[i] > rcom) {
        pixels[i] -= value;
      }
      if (pixels[i + 1] < gcom) {
        pixels[i + 1] += value;
      } else if (pixels[i + 1] > gcom) {
        pixels[i + 1] -= value;
      }
      if (pixels[i + 2] < bcom) {
        pixels[i + 2] += value;
      } else if (pixels[i + 2] > bcom) {
        pixels[i + 2] -= value;
      }
    }
    return imagedata;
  }

  function transform_comic(imagedata, value) {
    var pixels, i, l;
    pixels = imagedata.data;
    for (i = 0, l = pixels.length; i < l; i += 4) {
      pixels[i] += Math.sin(i * value) * 127 + 128;
      pixels[i + 1] += Math.sin(i * value) * 127 + 128;
      pixels[i + 2] += Math.sin(i * value) * 127 + 128;
    }
    return imagedata;
  }

  function transform_confetti(imagedata, value) {
    var pixels, i, l;
    pixels = imagedata.data;
    for (i = 0, l = pixels.length; i < l; i += 1) {
      pixels[i] = Math.sin(value * pixels[i]) * 127 + pixels[i];
    }
    return imagedata;
  }

  if (this.graphicsChanged()) {
    w = Math.ceil(this.width());
    h = Math.ceil(this.height());
    if (!canvas.width || !canvas.height || !w || !h) {
      // too small to get image data, abort
      return canvas;
    }
    ctx = canvas.getContext("2d");
    imagedata = ctx.getImageData(0, 0, w, h);

    if (this.graphicsValues.fisheye) {
      imagedata = transform_fisheye(imagedata, this.graphicsValues.fisheye);
    }
    if (this.graphicsValues.whirl) {
      imagedata = transform_whirl(imagedata, this.graphicsValues.whirl);
    }
    if (this.graphicsValues.pixelate) {
      imagedata = transform_pixelate(imagedata, this.graphicsValues.pixelate);
    }
    if (this.graphicsValues.mosaic) {
      imagedata = transform_mosaic(imagedata, this.graphicsValues.mosaic);
    }
    if (this.graphicsValues.duplicate) {
      imagedata = transform_duplicate(imagedata, this.graphicsValues.duplicate);
    }
    if (
      this.graphicsValues.color ||
      this.graphicsValues.saturation ||
      this.graphicsValues.brightness
    ) {
      imagedata = transform_HSV(
        imagedata,
        this.graphicsValues.color,
        this.graphicsValues.saturation,
        this.graphicsValues.brightness
      );
    }
    if (this.graphicsValues.negative) {
      imagedata = transform_negative(imagedata, this.graphicsValues.negative);
    }
    if (this.graphicsValues.comic) {
      imagedata = transform_comic(imagedata, this.graphicsValues.comic);
    }
    if (this.graphicsValues.confetti) {
      imagedata = transform_confetti(imagedata, this.graphicsValues.confetti);
    }

    ctx.putImageData(imagedata, 0, 0);
  }

  return canvas;
};

SpriteMorph.prototype.clear = function () {
  this.parent.clearPenTrails();
  // CSDT Clear border list
  this.lineList = [];
  this.clearEffects();
  this.setVisibility(true);
  this.hasBorder = false;
  // // // CSDT Reflect XY
  // if (this.flippedY) {
  //     this.flipHorizontal();
  // }
  // if (this.flippedX) {
  //     this.flipVertical();
  // }
  // // // If reflect was used, reset that effect
  // this.flippedX = false;
  // this.flippedY = false;
};

// This is where you add the blocks to the list of visible blocks per category
SpriteMorph.prototype.blockTemplates = function (category) {
  var blocks = [],
    myself = this,
    varNames,
    button,
    cat = category || "motion",
    txt,
    inheritedVars = this.inheritedVariableNames();

  function block(selector, isGhosted) {
    if (StageMorph.prototype.hiddenPrimitives[selector]) {
      return null;
    }
    var newBlock = SpriteMorph.prototype.blockForSelector(selector, true);
    newBlock.isTemplate = true;
    if (isGhosted) {
      newBlock.ghost();
    }
    return newBlock;
  }

  function variableBlock(varName, isLocal) {
    var newBlock = SpriteMorph.prototype.variableBlock(varName, isLocal);
    newBlock.isDraggable = false;
    newBlock.isTemplate = true;
    if (contains(inheritedVars, varName)) {
      newBlock.ghost();
    }
    return newBlock;
  }

  function watcherToggle(selector) {
    if (StageMorph.prototype.hiddenPrimitives[selector]) {
      return null;
    }
    var info = SpriteMorph.prototype.blocks[selector];
    return new ToggleMorph(
      "checkbox",
      this,
      function () {
        myself.toggleWatcher(
          selector,
          localize(info.spec),
          myself.blockColor[info.category]
        );
      },
      null,
      function () {
        return myself.showingWatcher(selector);
      },
      null
    );
  }

  function variableWatcherToggle(varName) {
    return new ToggleMorph(
      "checkbox",
      this,
      function () {
        myself.toggleVariableWatcher(varName);
      },
      null,
      function () {
        return myself.showingVariableWatcher(varName);
      },
      null
    );
  }

  function helpMenu() {
    var menu = new MenuMorph(this);
    menu.addItem("help...", "showHelp");
    return menu;
  }

  function addVar(pair) {
    var ide;
    if (pair) {
      if (myself.isVariableNameInUse(pair[0], pair[1])) {
        myself.inform("that name is already in use");
      } else {
        ide = myself.parentThatIsA(IDE_Morph);
        myself.addVariable(pair[0], pair[1]);
        myself.toggleVariableWatcher(pair[0], pair[1]);
        ide.flushBlocksCache("variables"); // b/c of inheritance
        ide.refreshPalette();
        ide.recordUnsavedChanges();
      }
    }
  }
  if (!StageMorph.prototype.decategorize) {
    if (cat === "motion") {
      blocks.push(block("forward"));
      blocks.push(block("turn"));
      blocks.push(block("turnLeft"));
      blocks.push("-");
      blocks.push(block("setHeading"));
      blocks.push(block("doFaceTowards"));
      blocks.push("-");
      blocks.push(block("gotoXY"));
      blocks.push(block("doGotoObject"));
      blocks.push(block("doGlide"));
      blocks.push("-");
      blocks.push(block("changeXPosition"));
      blocks.push(block("setXPosition"));
      blocks.push(block("changeYPosition"));
      blocks.push(block("setYPosition"));
      blocks.push("-");
      blocks.push(block("bounceOffEdge"));
      blocks.push("-");
      blocks.push(watcherToggle("xPosition"));
      blocks.push(block("xPosition", this.inheritsAttribute("x position")));
      blocks.push(watcherToggle("yPosition"));
      blocks.push(block("yPosition", this.inheritsAttribute("y position")));
      blocks.push(watcherToggle("direction"));
      blocks.push(block("direction", this.inheritsAttribute("direction")));
      blocks.push(watcherToggle("getAngle"));
      blocks.push(block("getAngle"));
      blocks.push("=");
      blocks.push(block("translatePercent"));
      blocks.push(block("pointAtAngle"));
      blocks.push(block("rotateByDegrees"));
      blocks.push("=");
      blocks.push(this.makeBlockButton(cat));
    } else if (cat === "looks") {
      blocks.push(block("doSwitchToCostume"));
      blocks.push(block("doWearNextCostume"));
      blocks.push(watcherToggle("getCostumeIdx"));
      blocks.push(block("getCostumeIdx", this.inheritsAttribute("costume #")));
      blocks.push("-");
      blocks.push(block("doSayFor"));
      blocks.push(block("bubble"));
      blocks.push(block("doThinkFor"));
      blocks.push(block("doThink"));
      blocks.push("-");
      blocks.push(block("reportGetImageAttribute"));
      blocks.push(block("reportNewCostumeStretched"));
      blocks.push(block("reportNewCostume"));
      blocks.push("-");
      blocks.push(block("changeEffect"));
      blocks.push(block("setEffect"));
      blocks.push(block("clearEffects"));
      blocks.push(block("getEffect"));
      blocks.push("-");
      blocks.push(block("changeScale"));
      blocks.push(block("setScale"));
      blocks.push(watcherToggle("getScale"));
      blocks.push(block("getScale", this.inheritsAttribute("size")));
      blocks.push("-");
      blocks.push(block("show"));
      blocks.push(block("hide"));
      blocks.push(watcherToggle("reportShown"));
      blocks.push(block("reportShown", this.inheritsAttribute("shown?")));
      blocks.push("-");
      blocks.push(block("goToLayer"));
      blocks.push(block("goBack"));
      blocks.push(block("flipVertical"));
      blocks.push(block("flipHorizontal"));
      blocks.push(block("reflectXAxis"));
      blocks.push(block("reflectYAxis"));
      blocks.push(block("newSizeOfCurrent"));
      blocks.push(block("doSetScaleFactor"));
      blocks.push(block("exportToVisualizer"));

      // for debugging: ///////////////

      if (this.world().isDevMode) {
        blocks.push("-");
        txt = new TextMorph(
          localize("development mode \ndebugging primitives:")
        );
        txt.fontSize = 9;
        txt.setColor(this.paletteTextColor);
        blocks.push(txt);
        blocks.push("-");
        blocks.push(block("log"));
        blocks.push(block("alert"));
        blocks.push("-");
        blocks.push(block("doScreenshot"));
      }

      /////////////////////////////////

      blocks.push("=");
      blocks.push(this.makeBlockButton(cat));
    } else if (cat === "sound") {
      blocks.push(block("playSound"));
      blocks.push(block("doPlaySoundUntilDone"));
      blocks.push(block("doStopAllSounds"));
      blocks.push("-");
      blocks.push(block("doPlaySoundAtRate"));
      blocks.push(block("reportGetSoundAttribute"));
      blocks.push(block("reportNewSoundFromSamples"));
      blocks.push("-");
      blocks.push(block("doRest"));
      blocks.push(block("doPlayNote"));
      blocks.push(block("doSetInstrument"));
      blocks.push("-");
      blocks.push(block("doChangeTempo"));
      blocks.push(block("doSetTempo"));
      blocks.push(watcherToggle("getTempo"));
      blocks.push(block("getTempo"));
      blocks.push("-");
      blocks.push(block("changeVolume"));
      blocks.push(block("setVolume"));
      blocks.push(watcherToggle("getVolume"));
      blocks.push(block("getVolume", this.inheritsAttribute("volume")));
      blocks.push("-");
      blocks.push(block("changePan"));
      blocks.push(block("setPan"));
      blocks.push(watcherToggle("getPan"));
      blocks.push(block("getPan", this.inheritsAttribute("balance")));
      blocks.push("-");
      blocks.push(block("playFreq"));
      blocks.push(block("stopFreq"));

      // for debugging: ///////////////

      if (this.world().isDevMode) {
        blocks.push("-");
        txt = new TextMorph(
          localize("development mode \ndebugging primitives:")
        );
        txt.fontSize = 9;
        txt.setColor(this.paletteTextColor);
        blocks.push(txt);
        blocks.push("-");
        blocks.push(block("doPlayFrequency"));
      }

      /////////////////////////////////

      blocks.push("=");
      blocks.push(this.makeBlockButton(cat));
    } else if (cat === "pen") {
      blocks.push(block("clear"));
      blocks.push("-");
      blocks.push(block("down"));
      blocks.push(block("up"));
      blocks.push(watcherToggle("getPenDown"));
      blocks.push(block("getPenDown", this.inheritsAttribute("pen down?")));
      blocks.push("-");
      blocks.push(block("setColor"));
      blocks.push(block("changePenHSVA"));
      blocks.push(block("setPenHSVA"));
      blocks.push(block("getPenAttribute"));
      blocks.push("-");
      blocks.push(block("changeSize"));
      blocks.push(block("setSize"));
      blocks.push("-");
      blocks.push(block("doStamp"));
      blocks.push(block("floodFill"));
      blocks.push(block("write"));
      blocks.push("-");
      blocks.push(block("reportPenTrailsAsCostume"));
      blocks.push("-");
      blocks.push(block("doPasteOn"));
      blocks.push(block("doCutFrom"));
      blocks.push("=");
      blocks.push(this.makeBlockButton(cat));
      // blocks.push(block('smoothBorders'));
      blocks.push(block("flatLineEnds"));
      blocks.push("=");
      // blocks.push(block('setBorderSize'));
      blocks.push(block("setBorder"));

      blocks.push(block("getPenBorderAttribute"));

      // blocks.push(block('getBorderSize'));
      // blocks.push(watcherToggle('getBorderState'));
      // blocks.push(block('getBorderState'));
      // blocks.push(watcherToggle('getBorderHue'));
      // blocks.push(block('getBorderHue'));
      // blocks.push(block('setBorderHue'));

      // blocks.push(block('setBorderShade'));
      // blocks.push(block('getBorderShade'));
      // blocks.push(block('changeBorderShade'));

      // blocks.push(block('borderPathLengthHelp'));

      // blocks.push(block('drawLogSpiral'));
      // blocks.push(block('drawTanu'));
      // blocks.push(block('drawLimitedTanu'));
      // blocks.push(block('drawCircle'));
    } else if (cat === "control") {
      blocks.push(block("receiveGo"));
      blocks.push(block("receiveKey"));
      blocks.push(block("receiveInteraction"));
      blocks.push(block("receiveCondition"));
      blocks.push(block("receiveMessage"));
      blocks.push("-");
      blocks.push(block("doBroadcast"));
      blocks.push(block("doBroadcastAndWait"));
      blocks.push(block("doSend"));
      blocks.push(watcherToggle("getLastMessage"));
      blocks.push(block("getLastMessage"));
      blocks.push("-");
      blocks.push(block("doWarp"));
      blocks.push("-");
      blocks.push(block("doWait"));
      blocks.push(block("doWaitUntil"));
      blocks.push("-");
      blocks.push(block("doForever"));
      blocks.push(block("doRepeat"));
      blocks.push(block("doUntil"));
      blocks.push(block("doFor"));
      blocks.push("-");
      blocks.push(block("doIf"));
      blocks.push(block("doIfElse"));
      blocks.push(block("reportIfElse"));
      blocks.push("-");
      blocks.push(block("doReport"));
      blocks.push(block("doStopThis"));
      blocks.push("-");
      blocks.push(block("doRun"));
      blocks.push(block("fork"));
      blocks.push(block("evaluate"));
      blocks.push("-");
      blocks.push(block("doTellTo"));
      blocks.push(block("reportAskFor"));
      blocks.push("-");
      blocks.push(block("doCallCC"));
      blocks.push(block("reportCallCC"));
      blocks.push("-");
      blocks.push(block("receiveOnClone"));
      blocks.push(block("createClone"));
      blocks.push(block("newClone"));
      blocks.push(block("removeClone"));
      blocks.push("-");
      blocks.push(block("doPauseAll"));
      blocks.push("=");
      blocks.push(this.makeBlockButton(cat));
    } else if (cat === "sensing") {
      blocks.push(block("reportTouchingObject"));
      blocks.push(block("reportTouchingColor"));
      blocks.push(block("reportColorIsTouchingColor"));
      blocks.push("-");
      blocks.push(block("doAsk"));
      blocks.push(watcherToggle("getLastAnswer"));
      blocks.push(block("getLastAnswer"));
      blocks.push("-");
      blocks.push(watcherToggle("reportMouseX"));
      blocks.push(block("reportMouseX"));
      blocks.push(watcherToggle("reportMouseY"));
      blocks.push(block("reportMouseY"));
      blocks.push(block("reportMouseDown"));
      blocks.push("-");
      blocks.push(block("reportKeyPressed"));
      blocks.push("-");
      blocks.push(block("reportRelationTo"));
      blocks.push(block("reportAspect"));
      blocks.push("-");
      blocks.push(block("doResetTimer"));
      blocks.push(watcherToggle("getTimer"));
      blocks.push(block("getTimer"));
      blocks.push("-");
      blocks.push(block("reportAttributeOf"));

      if (SpriteMorph.prototype.enableFirstClass) {
        blocks.push(block("reportGet"));
      }

      blocks.push(block("reportObject"));
      blocks.push("-");
      blocks.push(block("reportURL"));
      blocks.push(block("reportAudio"));
      blocks.push(block("reportVideo"));
      blocks.push(block("doSetVideoTransparency"));
      blocks.push("-");
      blocks.push(block("reportGlobalFlag"));
      blocks.push(block("doSetGlobalFlag"));
      blocks.push("-");
      blocks.push(block("reportDate"));

      // for debugging: ///////////////

      if (this.world().isDevMode) {
        blocks.push("-");
        txt = new TextMorph(
          localize("development mode \ndebugging primitives:")
        );
        txt.fontSize = 9;
        txt.setColor(this.paletteTextColor);
        blocks.push(txt);
        blocks.push("-");
        blocks.push(watcherToggle("reportThreadCount"));
        blocks.push(block("reportThreadCount"));
        blocks.push(block("reportStackSize"));
        blocks.push(block("reportFrameCount"));
        blocks.push(block("reportYieldCount"));
      }

      /////////////////////////////////

      blocks.push("=");
      blocks.push(this.makeBlockButton(cat));
    } else if (cat === "operators") {
      blocks.push(block("reifyScript"));
      blocks.push(block("reifyReporter"));
      blocks.push(block("reifyPredicate"));
      blocks.push("#");
      blocks.push("-");
      blocks.push(block("reportSum"));
      blocks.push(block("reportDifference"));
      blocks.push(block("reportProduct"));
      blocks.push(block("reportQuotient"));
      blocks.push(block("reportPower"));
      blocks.push("-");
      blocks.push(block("reportModulus"));
      blocks.push(block("reportRound"));
      blocks.push(block("reportMonadic"));
      blocks.push(block("reportRandom"));
      blocks.push("-");
      blocks.push(block("reportLessThan"));
      blocks.push(block("reportEquals"));
      blocks.push(block("reportGreaterThan"));
      blocks.push("-");
      blocks.push(block("reportAnd"));
      blocks.push(block("reportOr"));
      blocks.push(block("reportNot"));
      blocks.push(block("reportBoolean"));
      blocks.push("-");
      blocks.push(block("reportJoinWords"));
      blocks.push(block("reportTextSplit"));
      blocks.push(block("reportLetter"));
      blocks.push(block("reportStringSize"));
      blocks.push("-");
      blocks.push(block("reportUnicode"));
      blocks.push(block("reportUnicodeAsLetter"));
      blocks.push("-");
      blocks.push(block("reportIsA"));
      blocks.push(block("reportIsIdentical"));

      if (true) {
        // (Process.prototype.enableJS) {
        blocks.push("-");
        blocks.push(block("reportJSFunction"));
        if (Process.prototype.enableCompiling) {
          blocks.push(block("reportCompiled"));
        }
      }

      // for debugging: ///////////////

      if (this.world().isDevMode) {
        blocks.push("-");
        txt = new TextMorph(
          localize("development mode \ndebugging primitives:")
        );
        txt.fontSize = 9;
        txt.setColor(this.paletteTextColor);
        blocks.push(txt);
        blocks.push("-");
        blocks.push(block("reportTypeOf"));
        blocks.push(block("reportTextFunction"));
      }

      /////////////////////////////////

      blocks.push("=");
      blocks.push(this.makeBlockButton(cat));
    } else if (cat === "variables") {
      button = new PushButtonMorph(
        null,
        function () {
          new VariableDialogMorph(null, addVar, myself).prompt(
            "Variable name",
            null,
            myself.world()
          );
        },
        "Make a variable"
      );
      button.userMenu = helpMenu;
      button.selector = "addVariable";
      button.showHelp = BlockMorph.prototype.showHelp;
      blocks.push(button);

      if (this.deletableVariableNames().length > 0) {
        button = new PushButtonMorph(
          null,
          function () {
            var menu = new MenuMorph(myself.deleteVariable, null, myself);
            myself.deletableVariableNames().forEach((name) =>
              menu.addItem(
                name,
                name,
                null,
                null,
                null,
                null,
                null,
                null,
                true // verbatim - don't translate
              )
            );
            menu.popUpAtHand(myself.world());
          },
          "Delete a variable"
        );
        button.userMenu = helpMenu;
        button.selector = "deleteVariable";
        button.showHelp = BlockMorph.prototype.showHelp;
        blocks.push(button);
      }

      blocks.push("-");

      varNames = this.reachableGlobalVariableNames(true);
      if (varNames.length > 0) {
        varNames.forEach((name) => {
          blocks.push(variableWatcherToggle(name));
          blocks.push(variableBlock(name));
        });
        blocks.push("-");
      }

      varNames = this.allLocalVariableNames(true);
      if (varNames.length > 0) {
        varNames.forEach((name) => {
          blocks.push(variableWatcherToggle(name));
          blocks.push(variableBlock(name, true));
        });
        blocks.push("-");
      }

      blocks.push(block("doSetVar"));
      blocks.push(block("doChangeVar"));
      blocks.push(block("doShowVar"));
      blocks.push(block("doHideVar"));
      blocks.push(block("doDeclareVariables"));

      // inheritance:

      if (StageMorph.prototype.enableInheritance) {
        blocks.push("-");
        blocks.push(block("doDeleteAttr"));
      }

      ///////////////////////////////

      blocks.push("=");

      blocks.push(block("reportNewList"));
      blocks.push(block("reportNumbers"));
      blocks.push("-");
      blocks.push(block("reportCONS"));
      blocks.push(block("reportListItem"));
      blocks.push(block("reportCDR"));
      blocks.push("-");
      blocks.push(block("reportListAttribute"));
      blocks.push(block("reportListIndex"));
      blocks.push(block("reportListContainsItem"));
      blocks.push(block("reportListIsEmpty"));
      blocks.push("-");
      blocks.push(block("reportMap"));
      blocks.push(block("reportKeep"));
      blocks.push(block("reportFindFirst"));
      blocks.push(block("reportCombine"));
      blocks.push("-");
      blocks.push(block("doForEach"));
      blocks.push("-");
      blocks.push(block("reportConcatenatedLists"));
      blocks.push(block("reportReshape"));
      blocks.push("-");
      blocks.push(block("doAddToList"));
      blocks.push(block("doDeleteFromList"));
      blocks.push(block("doInsertInList"));
      blocks.push(block("doReplaceInList"));

      // for debugging: ///////////////

      if (this.world().isDevMode) {
        blocks.push("-");
        txt = new TextMorph(
          localize("development mode \ndebugging primitives:")
        );
        txt.fontSize = 9;
        txt.setColor(this.paletteTextColor);
        blocks.push(txt);
        blocks.push("-");
        blocks.push(block("doShowTable"));
      }

      /////////////////////////////////

      blocks.push("=");

      if (StageMorph.prototype.enableCodeMapping) {
        blocks.push(block("doMapCodeOrHeader"));
        blocks.push(block("doMapValueCode"));
        blocks.push(block("doMapListCode"));
        blocks.push("-");
        blocks.push(block("reportMappedCode"));
        blocks.push("=");
      }

      blocks.push(this.makeBlockButton());
    }
  } else {
    if (myself.parentThatIsA(IDE_Morph).renderBlocks) {
      blocks.push(block("receiveGo"));
      blocks.push(block("doRepeat"));
      blocks.push(block("receiveMessage"));
      blocks.push(block("doBroadcast"));
      blocks.push("-");
      blocks.push(block("gotoXY"));
      blocks.push(block("pointAtAngle"));
      blocks.push(block("rotateByDegrees"));
      blocks.push(block("translatePercent"));
      blocks.push(block("changeXPosition"));
      blocks.push(block("turnLeft"));
      blocks.push(block("forward"));

      blocks.push(block("doSwitchToCostume"));
      blocks.push(block("setEffect"));
      blocks.push(block("reflectYAxis"));
      blocks.push(block("setScale"));
      blocks.push(block("newSizeOfCurrent"));

      blocks.push(block("clear"));
      blocks.push(block("doStamp"));
      blocks.push(block("setSize"));

      blocks.push("-");

      varNames = this.reachableGlobalVariableNames(true);
      if (varNames.length > 0) {
        varNames.forEach((name) => {
          blocks.push(variableWatcherToggle(name));
          blocks.push(variableBlock(name));
        });
        blocks.push("-");
      }

      varNames = this.allLocalVariableNames(true);
      if (varNames.length > 0) {
        varNames.forEach((name) => {
          blocks.push(variableWatcherToggle(name));
          blocks.push(variableBlock(name, true));
        });
        blocks.push("-");
      }

      blocks.push(block("doSetVar"));
      blocks.push(block("doChangeVar"));

      blocks.push(block("reportQuotient"));
      blocks.push(block("reportProduct"));
      blocks.push(block("reportBoolean"));
      blocks.push(block("reportRandom"));
    }
  }
  return blocks;
};

SpriteMorph.prototype.doSwitchToCostume = function (id, noShadow) {
  var w, h;
  if (id instanceof List) {
    // try to turn a list of pixels into a costume
    if (this.costume) {
      // recycle dimensions of current costume
      w = this.costume.width();
      h = this.costume.height();
    } else {
      // assume stage's dimensions
      w = StageMorph.prototype.dimensions.x;
      h = StageMorph.prototype.dimensions.y;
    }
    id = Process.prototype.reportNewCostume(
      id,
      w,
      h,
      this.newCostumeName(localize("snap"))
    );
  }
  if (id instanceof Costume) {
    // allow first-class costumes
    this.wearCostume(id, noShadow);
    return;
  }
  if (id instanceof Array && id[0] === "current") {
    return;
  }

  var num,
    arr = this.costumes.asArray(),
    costume;
  if (
    contains(
      [localize("Turtle"), localize("Empty")],
      id instanceof Array ? id[0] : null
    )
  ) {
    costume = null;
  } else {
    if (id === -1) {
      this.doWearPreviousCostume();
      return;
    }
    costume = detect(arr, (cst) => cst.name === id);
    if (costume === null) {
      num = parseFloat(id);
      if (num === 0) {
        costume = null;
      } else {
        costume = arr[num - 1] || null;
      }
    }
  }
  this.wearCostume(costume, noShadow);
  this.clearEffects();
};

SpriteMorph.prototype.clearEffects = function () {
  var effect;
  for (effect in this.graphicsValues) {
    if (this.graphicsValues.hasOwnProperty(effect)) {
      this.setEffect([effect], 0);
    }
  }
  this.setEffect(["ghost"], 0);
  this.setVisibility(true);
  this.hasBrightness = false;
  this.hasSaturation = false;
  this.graphicsValues["saturation"] = 50;
  this.graphicsValues["brightness"] = 50;
};

SpriteMorph.prototype.exportAsCSV = function (radius_data, angle_data) {
  function roundFloat(val) {
    var rounded_val = Math.round(val * 10) / 10;
    return rounded_val;
  }

  function roundPoints() {
    for (var i = 0; i < radii.length; i++) {
      radii[i] = roundFloat(radii[i]);
      angles[i] = roundFloat(angles[i]) % 360;
    }
  }

  //opens a new window and writes data in CSV format.
  function writeToWindow(points) {
    var str = "";
    var ide = this.world.children[0];
    var radii = [];
    var angles = [];

    var keys = [];

    for (var key of points.keys()) {
      keys.push(key);
    }

    keys.sort(function (a, b) {
      return a - b;
    });

    for (var j = 0; j < keys.length; j++) {
      var values = points.get(keys[j]);
      for (var k = 0; k < values.length; k++) {
        radii.push(keys[j]);
        angles.push(values[k]);
      }
    }

    for (var i = 0; i < radii.length; i++) {
      str += radii[i] + "," + angles[i];
      if (i !== radii.length - 1) {
        str += "\n";
      }
    }
    ide.saveFileAs(str, "data:text/csv", ide.projectName + " csvData");
  }

  function orderRadially(radii, angles) {
    var ordered_points = new Map();
    var ordered_radii = [];
    var ordered_angles = [];
    //iterate through radii, populate map
    //sort map values (arrays of angles)
    //iterate through map in order (small to large radii) and output back to two arrays
    for (var i = 0; i < radii.length; i++) {
      var unordered_angles = [];
      if (ordered_points.has(radii[i])) {
        unordered_angles = ordered_points.get(radii[i]);
        unordered_angles.push(angles[i]);
      } else {
        ordered_points.set(radii[i], unordered_angles);
      }
    }

    return ordered_points;
  }

  //function create an array from a CSnap list object
  function makeArray(input_data) {
    var data_array = [];
    var data_string = input_data.asText(); //converts CSnap list object to a text string
    for (var i = 0; i < data_string.length; i++) {
      var val = "";
      while (data_string[i] !== "," && i < data_string.length) {
        //read through variable-length values until I hit a comma
        val += data_string[i];
        i++;
      }

      if (val !== "") {
        data_array.push(val);
      }
    }
    return data_array;
  }

  var radii = makeArray(radius_data);
  var angles = makeArray(angle_data);
  roundPoints();
  var points = orderRadially(radii, angles);
  writeToWindow(points);
};

SpriteMorph.prototype.exportToVisualizer = function () {
  var ide = this.parentThatIsA(IDE_Morph);
  //   new ProjectDialogMorph(ide, "visualizer").popUp();
  ide.launchVisualizer();
  // ide.saveCanvasAs(ide.stage.fullImage(), ide.stage.name);
};

//# sourceURL=exportAsCSV.js
