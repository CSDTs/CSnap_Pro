/*
    CSDT Custom Block Functions
*/

SpriteMorph.prototype.translatePercent = function (percent, direction) {

    var dest, delta = radians(this.heading),
        width = 0,
        height = 0;
    var newX = 0,
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


    if (direction[0] === 'height') {
        newY = this.yPosition() +
            (height * percent / 100);
        dist = Math.sqrt(Math.pow(this.yPosition() - newY, 2));
        angle = this.heading * (Math.PI / 180);

    } else {
        newX = this.xPosition() +
            (width * percent / 100);
        dist = Math.sqrt(Math.pow(this.xPosition() - newX, 2));
        angle = this.heading * (Math.PI / 180) + (Math.PI / 2);
    }
    if (dist != 0) {
        X = (-percent / Math.abs(percent)) * dist * Math.cos(angle) + this.xPosition();
        Y = (percent / Math.abs(percent)) * dist * Math.sin(angle) + this.yPosition();
        this.gotoXY(X, Y);
        this.positionTalkBubble();
    }


};

SpriteMorph.prototype.newSizeOfCurrent = function (percent) {

    let val = (this.getScale()) * (percent / 100);
    this.setScale(val);
};

SpriteMorph.prototype.pointAtAngle = function (angle) {

    let val = (0 - angle) + (90);
    this.setHeading(val);
};

SpriteMorph.prototype.rotateByDegrees = function (angle) {
    this.turnLeft(angle);
};

SpriteMorph.prototype.reflectXAxis = function () {
    this.flipVertical();
    this.gotoXY(this.xPosition(), (this.yPosition() * -1));
};

SpriteMorph.prototype.reflectYAxis = function () {
    this.flipHorizontal();
    this.gotoXY((this.xPosition() * -1), this.yPosition());
};

SpriteMorph.prototype.getAngle = function () {
    return (90 - this.direction());
};

SpriteMorph.prototype.flipVertical = function () {
    // var costume = this.costumes.contents[this.getCostumeIdx()-1],
    // canvas = newCanvas(costume.extent()),
    // ctx = canvas.getContext('2d');

    // ctx.translate(0, costume.height());
    // ctx.scale(1, -1);
    // ctx.drawImage(costume.contents, 0, 0);
    // costume.contents=canvas;
    // costume.rotationCenter = new Point(
    //        costume.rotationCenter.x,
    //        costume.height() - costume.rotationCenter.y
    // );

    // this.costumes.contents[this.getCostumeIdx()-1] = costume;
    // this.costume = costume;
    // this.flippedX = !this.flippedX;
    // this.changed();
    // this.rerender();
    // this.changed();
    // this.positionTalkBubble();
    var cst;
    var xP = 100;
    var yP = -100;
    cst = this.costume;

    if (!isFinite(+xP * +yP) || isNaN(+xP * +yP)) {
        throw new Error(
            'expecting a finite number\nbut getting Infinity or NaN'
        );
    }

    // If the costume is a turtle, don't do this stretch...
    if (cst != null) {
        cst = cst.stretched(
            Math.round(cst.width() * +xP / 100),
            Math.round(cst.height() * +yP / 100)
        );
    }

    this.doSwitchToCostume(cst);
};

SpriteMorph.prototype.flipHorizontal = function () {
    var cst;
    var xP = -100;
    var yP = 100;
    cst = this.costume;

    if (!isFinite(+xP * +yP) || isNaN(+xP * +yP)) {
        throw new Error(
            'expecting a finite number\nbut getting Infinity or NaN'
        );
    }

    // If the costume is a turtle, don't do this stretch...
    if (cst != null) {
        cst = cst.stretched(
            Math.round(cst.width() * +xP / 100),
            Math.round(cst.height() * +yP / 100)
        );
    }


    this.doSwitchToCostume(cst);

}


SpriteMorph.prototype.doSetScaleFactor = function (direction, percent) {
    var cst, xP, yP;
    // var xP = -100;
    // var yP = 100;
    cst = this.costume;
    
    if (direction[0] === 'x') {
        xP = percent;
        yP = 100;
    } else if (direction[0] === 'y') {
        xP = 100;
        yP = percent;
    } else if (direction[0] === 'x_and_y') {
        xP = percent;
        yP = percent;
    } else {
        xP = percent;
        yP = percent;
    }

    if (!isFinite(+xP * +yP) || isNaN(+xP * +yP)) {
        throw new Error(
            'expecting a finite number\nbut getting Infinity or NaN'
        );
    }
    // If the costume is a turtle, don't do this stretch...
    if (cst != null) {
        cst = cst.stretched(
            Math.round(cst.width() * +xP / 100),
            Math.round(cst.height() * +yP / 100)
        );
    }


    this.doSwitchToCostume(cst);
}

SpriteMorph.prototype.setCostumeColor = function (color) {
    this.setEffect('saturation', 100);
    this.setEffect('color', color);
};

SpriteMorph.prototype.changeCostumeColor = function (color) {
    this.setEffect('saturation', 100);
    this.changeEffect('color', color);
};

SpriteMorph.prototype.setCostumeOpacity = function (opacity) {
    // this.setEffect('saturation', 100);
    this.setEffect('ghost', opacity);
};

SpriteMorph.prototype.changeCostumeOpacity = function (opacity) {
    // this.setEffect('saturation', 100);
    this.changeEffect('ghost', opacity);
};





SpriteMorph.prototype.smoothBorders = function (start, dest) {
    var tempSize = this.size,
        tempColor = this.color;

    // console.log(this.lineList);
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

SpriteMorph.prototype.setBorderSize = function (size) {
    // pen size
    this.borderSize = size;

};


SpriteMorph.prototype.changeHue = function (delta) {
    this.setHue(this.getHue() + (+delta || 0));
};

SpriteMorph.prototype.getBorderHue = function () {
    return this.borderColor.hsv()[0] * 100;
};

SpriteMorph.prototype.setBorderHue = function (num) {
    var hsv = this.borderColor.hsv(),
        x = this.xPosition(),
        y = this.yPosition();

    hsv[0] = Math.max(Math.min(+num || 0, 100), 0) / 100;
    hsv[1] = 1; // we gotta fix this at some time
    this.borderColor.set_hsv.apply(this.borderColor, hsv);
    if (!this.costume) {
        this.drawNew();
        this.changed();
    }
    this.gotoXY(x, y);
};
//add border shade functionality - Get, Set, and Change

SpriteMorph.prototype.getBorderShade = function () {
    return ((this.borderColor.hsv()[2] * 50) + (50 - (this.borderColor.hsv()[1] * 50)));
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
        hsv[1] = (2 - num); //Make it more white
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

SpriteMorph.prototype.drawBorderedLine = function (start, dest) { //drawLine wrapper to draw line and border in one go
    this.drawLine(start, dest, true);
    this.drawLine(start, dest, false);

    if (this.isDown) {
        this.lineList[this.lineList.length] = [start, dest, this.size, this.color];
    }
};

SpriteMorph.prototype.flatLineEnds = function (bool) {
    SpriteMorph.prototype.useFlatLineEnds = bool;
}

SpriteMorph.prototype.degreesToRadians = function(degrees){
    return ((3.141592653589 * degrees) / 180);
}

SpriteMorph.prototype.drawLogSpiral = function(c, endangle, getSize, penGrowth, isClockwise){
    var xOrigin, yOrigin, startingDirection, beta, t, tinc, roffset, r, h, start, end, segments, startAngle, clockwise, size; 
    this.down();
    segments = 5;
 
    if(isClockwise === null || typeof isClockwise === undefined){
        clockwise = false;
    }else{
        clockwise = isClockwise;
    }

    if(clockwise){
        if(endangle < 0){
            startingDirection = ((((90 - this.direction()) - endangle) + degrees(Math.atan(1 / c))) - 180);
        }else{
            startingDirection = ((90 - this.direction()) + degrees(Math.atan(1 / c)));
        }
    }else{
        if(endangle < 0){
            startingDirection = (((90 - this.direction()) + endangle) + (180 - degrees(Math.atan(1 / c))));
        }else{
            startingDirection = (90 - this.direction()) - degrees(Math.atan(1 / c));
        }
    }

    size = 2 * (getSize / Math.exp(c * this.degreesToRadians(Math.abs(endangle))));
    roffset = size * Math.exp(c * this.degreesToRadians(0));

    if(endangle < 0){
        start = Math.abs(endangle);
        end = 0;
        r = size * Math.exp(c * this.degreesToRadians(Math.abs(endangle)));
        if(clockwise){
            xOrigin = this.xPosition() - ((r * Math.cos(radians(startingDirection - start))) - (roffset * Math.cos(radians(startingDirection))));
            yOrigin = this.yPosition() - ((r * Math.sin(radians(startingDirection - start))) - (roffset * Math.sin(radians(startingDirection))));
        }else{
            xOrigin = this.xPosition() - ((r * Math.cos(radians(start + startingDirection))) - (roffset * Math.cos(radians(startingDirection))));
            yOrigin = this.yPosition() - ((r * Math.sin(radians(start + startingDirection))) - (roffset * Math.sin(radians(startingDirection))));
        }
    }else{
        start = 0;
        end = endangle;
        xOrigin = this.xPosition();
        yOrigin = this.yPosition();

    }


    t = start;
    if(end > start){
        tinc = 1;
    }else{
        tinc = -1;
    }

    let repeatCounter = Math.abs((end - start) / tinc) / segments;

    for (let i = 0; i < repeatCounter; i ++){
        //  Find way to do warp
        for (let j = 0; j < segments; j++){
            r = size * Math.exp(c * this.degreesToRadians(t));
            if(!clockwise){
                this.gotoXY(((xOrigin + (r * Math.cos(radians(t + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                            ((yOrigin + (r * Math.sin(radians(t + startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
            }else{
                this.gotoXY(((xOrigin + (r * Math.cos(radians((t * -1) + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                            ((yOrigin + (r * Math.sin(radians((t * -1 )+ startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
            }
            t = t + tinc;
            this.changeSize(penGrowth);
            if(clockwise){
                this.turn(tinc);
            }else{
                this.turnLeft(tinc);
            }
        }
    }

    let modCounter =  Math.abs((end - start) / tinc) % segments;

    for (let k = 0; k < modCounter; k++){
        r = size * Math.exp(c * this.degreesToRadians(t));
        if(!clockwise){
            this.gotoXY(((xOrigin + (r * Math.cos(radians(t + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                        ((yOrigin + (r * Math.sin(radians(t + startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
        }else{
            this.gotoXY(((xOrigin + (r * Math.cos(radians((t * -1) + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                        ((yOrigin + (r * Math.sin(radians((t * -1)+ startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
        }
        t = t + tinc;
        this.changeSize(penGrowth);
        if(clockwise){
            this.turn(tinc);
        }else{
            this.turnLeft(tinc);
        }
    }

    this.up();
}

//Just try to have only two branches, hense "Limited Tanu"
SpriteMorph.prototype.drawLimitedTanu = function(c, endangle, getSize, penGrowth, isClockwise){
    var xOrigin, yOrigin, startingDirection, t, tinc, roffset, r, start, end, segments, clockwise, size, tempx, tempy, temppensize, tempclockwize; 
    this.down();
    segments = 5;
 
    if(isClockwise === null || typeof isClockwise === undefined){
        clockwise = false;
    }else{
        clockwise = isClockwise;
    }

    if(clockwise){
        if(endangle < 0){
            startingDirection = ((((90 - this.direction()) - endangle) + degrees(Math.atan(1 / c))) - 180);
        }else{
            startingDirection = ((90 - this.direction()) + degrees(Math.atan(1 / c)));
        }
    }else{
        if(endangle < 0){
            startingDirection = (((90 - this.direction()) + endangle) + (180 - degrees(Math.atan(1 / c))));
        }else{
            startingDirection = (90 - this.direction()) - degrees(Math.atan(1 / c));
        }
    }

    size = 2 * (getSize / Math.exp(c * this.degreesToRadians(Math.abs(endangle))));
    roffset = size * Math.exp(c * this.degreesToRadians(0));

    if(endangle < 0){
        start = Math.abs(endangle);
        end = 0;
        r = size * Math.exp(c * this.degreesToRadians(Math.abs(endangle)));
        if(clockwise){
            xOrigin = this.xPosition() - ((r * Math.cos(radians(startingDirection - start))) - (roffset * Math.cos(radians(startingDirection))));
            yOrigin = this.yPosition() - ((r * Math.sin(radians(startingDirection - start))) - (roffset * Math.sin(radians(startingDirection))));
        }else{
            xOrigin = this.xPosition() - ((r * Math.cos(radians(start + startingDirection))) - (roffset * Math.cos(radians(startingDirection))));
            yOrigin = this.yPosition() - ((r * Math.sin(radians(start + startingDirection))) - (roffset * Math.sin(radians(startingDirection))));
        }
    }else{
        start = 0;
        end = endangle;
        xOrigin = this.xPosition();
        yOrigin = this.yPosition();

    }


    t = start;
    if(end > start){
        tinc = 1;
    }else{
        tinc = -1;
    }

    let repeatCounter = Math.abs((end - start) / tinc) / segments;
    let stoppingpoint = 0;
    //distinguish two different mother spiral drawing patterns
    if (endangle < 0){
        stoppingpoint = (repeatCounter * segments * 0.3).toFixed(0);
    }
    else{
        stoppingpoint = (repeatCounter * segments * 0.7).toFixed(0);
    }
    

    for (let i = 0; i < repeatCounter; i ++){
        //  Find way to do warp
        for (let j = 0; j < segments; j++){
            r = size * Math.exp(c * this.degreesToRadians(t));
            if(!clockwise){
                this.gotoXY(((xOrigin + (r * Math.cos(radians(t + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                            ((yOrigin + (r * Math.sin(radians(t + startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
            }else{
                this.gotoXY(((xOrigin + (r * Math.cos(radians((t * -1) + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                            ((yOrigin + (r * Math.sin(radians((t * -1 )+ startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
            }
            t = t + tinc;
            this.changeSize(penGrowth);
            if(clockwise){
                this.turn(tinc);
            }else{
                this.turnLeft(tinc);
            }

            if ((i * 5 + j) == stoppingpoint){
                tempx= this.xPosition();
                tempy= this.yPosition();
                temppensize = this.size; //this is the pensize, not the size of the spiral
                //tempdirection = 135 - this.getAngle();

                if (endangle > 0){
                    tempdirection = 180 + this.getAngle();
                }
                else{
                    tempdirection = this.getAngle();
                }
                
                //tempdirection = this.direction();
                //This is the direction variable, not where the pen is pointing at this point
            }
            
        }
    }
    let modCounter =  Math.abs((end - start) / tinc) % segments;

    for (let k = 0; k < modCounter; k++){
        r = size * Math.exp(c * this.degreesToRadians(t));
        if(!clockwise){
            this.gotoXY(((xOrigin + (r * Math.cos(radians(t + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                        ((yOrigin + (r * Math.sin(radians(t + startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
        }else{
            this.gotoXY(((xOrigin + (r * Math.cos(radians((t * -1) + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                        ((yOrigin + (r * Math.sin(radians((t * -1)+ startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
        }
        t = t + tinc;
        this.changeSize(penGrowth);
        if(clockwise){
            this.turn(tinc);
        }else{
            this.turnLeft(tinc);
        }
    }
    this.up();

    this.gotoXY(tempx, tempy);
    this.setSize(temppensize);//temppensize
    var newspiralsize = getSize * 0.375;
    var newclockwize = !isClockwise; //reverse the clockwise
    var temppengrowth = Math.abs(penGrowth) * (-1); //pengrawth will always be negative - drawing outside to inside
    this.pointAtAngle(tempdirection);
    
    
    var newsweep = Math.abs(endangle) * (-0.618);
    this.drawLogSpiral(c, newsweep, newspiralsize, temppengrowth, newclockwize);
    
}

//Below is the tanu prototype
SpriteMorph.prototype.drawTanu = function(c, endangle, getSize, penGrowth, isClockwise, depth, percentage, branch){
    var xOrigin, yOrigin, startingDirection, t, tinc, roffset, r, start, end, segments, clockwise, size, tempx, tempy, temppensize, tempclockwize; 
    
    if (depth >= 1){//implement the below function if the depth value is one (one spiral) or more. end if not
    this.down();
    segments = 5;
 
    if(isClockwise === null || typeof isClockwise === undefined){
        clockwise = false;
    }else{
        clockwise = isClockwise;
    }

    if(clockwise){
        if(endangle < 0){
            startingDirection = ((((90 - this.direction()) - endangle) + degrees(Math.atan(1 / c))) - 180);
        }else{
            startingDirection = ((90 - this.direction()) + degrees(Math.atan(1 / c)));
        }
    }else{
        if(endangle < 0){
            startingDirection = (((90 - this.direction()) + endangle) + (180 - degrees(Math.atan(1 / c))));
        }else{
            startingDirection = (90 - this.direction()) - degrees(Math.atan(1 / c));
        }
    }

    size = 2 * (getSize / Math.exp(c * this.degreesToRadians(Math.abs(endangle))));
    roffset = size * Math.exp(c * this.degreesToRadians(0));

    if(endangle < 0){
        start = Math.abs(endangle);
        end = 0;
        r = size * Math.exp(c * this.degreesToRadians(Math.abs(endangle)));
        if(clockwise){
            xOrigin = this.xPosition() - ((r * Math.cos(radians(startingDirection - start))) - (roffset * Math.cos(radians(startingDirection))));
            yOrigin = this.yPosition() - ((r * Math.sin(radians(startingDirection - start))) - (roffset * Math.sin(radians(startingDirection))));
        }else{
            xOrigin = this.xPosition() - ((r * Math.cos(radians(start + startingDirection))) - (roffset * Math.cos(radians(startingDirection))));
            yOrigin = this.yPosition() - ((r * Math.sin(radians(start + startingDirection))) - (roffset * Math.sin(radians(startingDirection))));
        }
    }else{
        start = 0;
        end = endangle;
        xOrigin = this.xPosition();
        yOrigin = this.yPosition();

    }


    t = start;
    if(end > start){
        tinc = 1;
    }else{
        tinc = -1;
    }

    let repeatCounter = Math.abs((end - start) / tinc) / segments;
    let stoppingpoint = 0;
    //distinguish two different mother spiral drawing patterns
    if (endangle < 0){
        stoppingpoint = (repeatCounter * segments * (1 - branch)).toFixed(0);
    }
    else{
        stoppingpoint = (repeatCounter * segments * branch).toFixed(0);
    }
    

    for (let i = 0; i < repeatCounter; i ++){
        //  Find way to do warp
        for (let j = 0; j < segments; j++){
            r = size * Math.exp(c * this.degreesToRadians(t));
            if(!clockwise){
                this.gotoXY(((xOrigin + (r * Math.cos(radians(t + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                            ((yOrigin + (r * Math.sin(radians(t + startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
            }else{
                this.gotoXY(((xOrigin + (r * Math.cos(radians((t * -1) + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                            ((yOrigin + (r * Math.sin(radians((t * -1 )+ startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
            }
            t = t + tinc;
            this.changeSize(penGrowth);
            if(clockwise){
                this.turn(tinc);
            }else{
                this.turnLeft(tinc);
            }

            if ((i * 5 + j) == stoppingpoint){
                tempx= this.xPosition();
                tempy= this.yPosition();
                temppensize = this.size; //this is the pensize, not the size of the spiral
                //tempdirection = 135 - this.getAngle();

                if (endangle > 0){
                    tempdirection = 180 + this.getAngle();
                }
                else{
                    tempdirection = this.getAngle();
                }
                
                //tempdirection = this.direction();
                //This is the direction variable, not where the pen is pointing at this point
            }
            
        }
    }
    let modCounter =  Math.abs((end - start) / tinc) % segments;

    for (let k = 0; k < modCounter; k++){
        r = size * Math.exp(c * this.degreesToRadians(t));
        if(!clockwise){
            this.gotoXY(((xOrigin + (r * Math.cos(radians(t + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                        ((yOrigin + (r * Math.sin(radians(t + startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
        }else{
            this.gotoXY(((xOrigin + (r * Math.cos(radians((t * -1) + startingDirection)))) - (roffset * Math.cos(radians(startingDirection)))), 
                        ((yOrigin + (r * Math.sin(radians((t * -1)+ startingDirection)))) - (roffset * Math.sin(radians(startingDirection)))));
        }
        t = t + tinc;
        this.changeSize(penGrowth);
        if(clockwise){
            this.turn(tinc);
        }else{
            this.turnLeft(tinc);
        }
    }
    this.up();
    

    if (depth > 1){//this means it has to go to the branching point
        this.gotoXY(tempx, tempy); this.setSize(temppensize);//temppensize
        var newspiralsize = getSize * percentage;
        var newclockwize = !isClockwise; //reverse the clockwise
        var temppengrowth = Math.abs(penGrowth) * (-1); //pengrawth will always be negative - drawing outside to inside
        this.pointAtAngle(tempdirection);
        var newdepth = depth - 1;
    
        var newsweep = Math.abs(endangle) * (-0.618);
        this.drawTanu(c, newsweep, newspiralsize, temppengrowth, newclockwize, newdepth, percentage, branch);
    }

    }
    this.up();
}



SpriteMorph.prototype.drawCircle = function(diameter, sweep){
    var anglecount, stepinc, numbsides, cdirection; 
    this.down();

    cdirection = 1;
    if (sweep < 0){
        cdirection = -1;
    }

    sweep = Math.abs(sweep);
    anglecount = 0;
    stepinc = 1;
    numbsides = (3.141592653589) / Math.asin(stepinc / diameter);

    var i;
    
    while (((360 / numbsides) + anglecount) <= sweep){
        if ((anglecount + 6) > sweep){
            while (((360 / numbsides) + anglecount) <= sweep) {
                this.turnLeft(360.0000 * cdirection / numbsides);
                this.forward(stepinc);
                anglecount = anglecount + 360 / numbsides;
            }
        }
        else{
            
            for (i = 0; i < 6; i++){
                this.turnLeft(360 * cdirection / numbsides);
                this.forward(stepinc);
                anglecount += 360 / numbsides;
            }
        }
    }
    
    if (cdirection = 1){
        this.turnLeft(sweep - anglecount);
    }
    else {
        this.turn(sweep - anglecount);
    } 
    this.up();
}

