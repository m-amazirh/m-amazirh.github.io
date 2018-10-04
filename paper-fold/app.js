class App {
  constructor(canvasId, stageWidth, stageHeight) {
    this.stageWidth = stageWidth;
    this.stageHeight = stageHeight;
    

    this.stage = new Konva.Stage({
      container: canvasId,
      width: this.stageWidth,
      height: this.stageHeight
    });

    this.workLayer = new Konva.Layer();
    this.bgLayer = new Konva.Layer();
    this.stage.add(this.bgLayer);
    this.stage.add(this.workLayer);



    this.viewport = new Viewport(this);
    this.bgImage = new KImage(this, "iBgImage");
    this.ulFold = new Fold(this, this.viewport.x, this.viewport.y, true, true);
    this.urFold = new Fold(this, this.viewport.x + this.viewport.w, this.viewport.y, true, false);
    this.llFold = new Fold(this, this.viewport.x, this.viewport.y + this.viewport.h, false, true);
    this.lrFold = new Fold(this, this.viewport.x + this.viewport.w, this.viewport.y + this.viewport.h, false, false);


    this.stage.draw();

    var thisApp = this;

    this.stage.on('wheel', function (e) {
      var delta = e.evt.deltaY || e.evt.wheelDelta;
      if (delta > 0) {
        thisApp.scaleUpBgImage();
      } else {
        thisApp.scaleDownBgImage();
      }
    })

    thisApp.lastMouseX = 0;
    thisApp.lastMouseY = 0;

    document.addEventListener('mousedown', function (e) {
      thisApp.isMouseDown = true;
    })

    document.addEventListener('mouseup', function (e) {
      thisApp.isMouseDown = false;
    })

    document.addEventListener('mousemove', function (e) {
      if (thisApp.isMouseDown && thisApp.bgImageFocus) {
        var deltaX = e.screenX - thisApp.lastMouseX;
        var deltaY = e.screenY - thisApp.lastMouseY;

        if (Math.abs(deltaX) < 100 && Math.abs(deltaY) < 100) {
          thisApp.moveBgImage(deltaX, deltaY);
        }
      }

      thisApp.lastMouseX = e.screenX;
      thisApp.lastMouseY = e.screenY;
    })

    this.bgImageFocus = false;

    document.addEventListener('keydown', function (e) {
      if (e.key == 'f') {
        console.log('DOWN')
        thisApp.bgImageFocus = true;
      }
    })

    document.addEventListener('keyup', function (e) {
      if (e.key == 'f') {
        console.log('UP')
        thisApp.bgImageFocus = false;
      }
    })
  }

  updateFoldColor(color) {
    this.ulFold.getKonvaObj().fill(color);
    this.urFold.getKonvaObj().fill(color);
    this.llFold.getKonvaObj().fill(color);
    this.lrFold.getKonvaObj().fill(color);
    this.stage.draw();
  }

  updateBgImage(data) {
    this.bgImage.updateImage(data);
    this.stage.draw();
  }

  scaleDownBgImage() {
    if (this.bgImageFocus == true) {
      this.bgImage.scaleDown();
      this.stage.draw();
    }
  }

  scaleUpBgImage() {
    if (this.bgImageFocus == true) {
      this.bgImage.scaleUp();
      this.stage.draw();
    }
  }

  moveBgImage(detlaX, deltaY) {
    if (this.bgImageFocus) {
      this.bgImage.move(detlaX, deltaY)
      this.stage.draw();
    }
  }

  getViewport() {
    return this.viewport;
  }

  getKonvaStage() {
    return this.stage;
  }

  getKonvaLayer() {
    return this.workLayer;
  }

  resize(w, h) {
    this.stage.width(w);
    this.stage.height(h);
    this.stage.draw();
    this.viewport.resize();
  }

  exportWorkCanvas() {
    return this.foldLayer.toCanvas();
  }

  exportBackgroundCanvas() {
    return this.bgLayer.toCanvas();
  }

  exportPSD() {
    this.ulFold.hideCorner();
    //this.ulFold.hideMtriangle();
    this.urFold.hideCorner();
    //this.urFold.hideMtriangle();
    this.llFold.hideCorner();
    //this.llFold.hideMtriangle();
    this.lrFold.hideCorner();
    //this.lrFold.hideMtriangle();
    

    var bgCanvas = this.bgLayer.toCanvas();
    var foldCanvas = this.workLayer.toCanvas();
    var psd = {
      width: this.stage.width(),
      height: this.stage.height(),
      children: [
        {
          name: 'arriere_plan',
          canvas: bgCanvas
        },
        {
          name: 'plis',
          canvas: foldCanvas
        }
      ]
    };

    var writePsd = agPsd.writePsd;

    const buffer = writePsd(psd);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'my-file.psd');

    this.ulFold.showCorner();
    //this.ulFold.showMtriangle();
    this.urFold.showCorner();
    //this.urFold.showMtriangle();
    this.llFold.showCorner();
    //this.llFold.showMtriangle();
    this.lrFold.showCorner();
    //this.lrFold.showMtriangle();
  }

  destroy() {
    this.stage.destroy();
  }
}

class KImage {
  constructor(app, imageElementId) {
    this.app = app;
    this.imageElementId = imageElementId;
    this.image = new Konva.Image({
      x: 0,
      y: 0,
    })

    this.XRatio = 1;
    this.YRatio = 1;

    app.bgLayer.add(this.image);

    this.image.moveToBottom();
  }

  updateImage(data) {
    this.image.setImage(data);
  }

  scaleDown() {
    this.image.setScaleX(this.image.scaleX() / 1.1);
    this.image.setScaleY(this.image.scaleY() / 1.1);
  }

  scaleUp() {
    this.image.setScaleX(this.image.scaleX() * 1.1);
    this.image.setScaleY(this.image.scaleY() * 1.1);
  }

  move(deltaX, deltaY) {
    this.image.move({
      x: deltaX,
      y: deltaY
    })
  }
}



class Viewport {
  constructor(app) {
    this.app = app;
    var stage = app.getKonvaStage();

    this.viewport = new Konva.Rect({
    });


    this.resize();

    app.workLayer.add(this.viewport);



  }

  resize() {
    var stage = this.app.getKonvaStage();
    this.x = 0;
    this.y = 0;
    this.w = this.app.stageWidth;
    this.h = this.app.stageHeight;


    this.viewport.x(this.x)
    this.viewport.y(this.y)
    this.viewport.width(this.w)
    this.viewport.height(this.h)
  }
}





class Fold {
  constructor(app, cornerX, cornerY, isUp, isLeft) {
    var thisFold = this;
    this.lastDragPos = {
      x: cornerX,
      y: cornerY
    };
    this.cornerX = cornerX;
    this.cornerY = cornerY;

    this.isLeft = isLeft;
    this.isUp = isUp;
    this.circle = new Konva.Circle({
      x: cornerX,
      y: cornerY,
      opacity: 0.2,
      radius: 10,
      fill: 'green',
      draggable: true,
      dragBoundFunc: function (pos) {
        var bX = pos.x;
        var bY = pos.y;

        if (isLeft) {
          bX = pos.x > cornerX ? pos.x : cornerX;
        } else {
          bX = pos.x <= cornerX ? pos.x : cornerX;
        }

        if (isUp) {
          bY = pos.y > cornerY ? pos.y : cornerY
        } else {
          bY = pos.y <= cornerY ? pos.y : cornerY
        }


        thisFold.lastDragPos = {
          x: bX,
          y: bY
        }
        return thisFold.lastDragPos;
      }
    });

    var coefX = isLeft ? 1 : -1;
    var coefY = isUp ? 1 : -1;

    this.triangle = new Konva.Line({
      fill: '#00D2FF',
      closed: true,
    })

    this.mTriangle = new Konva.Line({
      fill: '#FFFFFF',
      closed: true,
    })


    app.workLayer.add(this.triangle);
    app.workLayer.add(this.mTriangle);
    app.workLayer.add(this.circle);

    this.app = app;

    var circle = this.circle;
    var triangle = this.triangle;
    var mTriangle = this.mTriangle;

    this.lowerPoint = {
      x: cornerX,
      y: cornerY
    }

    this.dragPoint = {
      x: cornerX,
      y: cornerY
    }

    this.upperPoint = {
      x: cornerX,
      y: cornerY
    }

    this.circle.on('dragmove', function () {
      thisFold.updateFoldPoints(cornerX, cornerY,
        circle.x(), circle.y());

      triangle.points([thisFold.lowerPoint.x, thisFold.lowerPoint.y,
      thisFold.dragPoint.x, thisFold.dragPoint.y,
      thisFold.upperPoint.x, thisFold.upperPoint.y]);

      mTriangle.points([thisFold.lowerPoint.x, thisFold.lowerPoint.y,
        cornerX, cornerY,
      thisFold.upperPoint.x, thisFold.upperPoint.y]);
    })

    var circle = this.circle;
    var stage = app.getKonvaStage();

    this.circle.on('mousemove', function () {
      circle.fill('green')
      circle.opacity(1)
      stage.draw();
    })
    this.circle.on('mouseout', function () {
      circle.fill('green')
      circle.opacity(0.2)
      stage.draw();
    })
  }

  getKonvaObj() {
    return this.triangle;
  }

  updateFoldPoints(originX, originY, currentX, currentY) {
    var vX = originX;
    var vY = originY;
    var cX = currentX;
    var cY = currentY;

    var middleX = (cX + vX) / 2;
    var middleY = (cY + vY) / 2;

    var slope = (cX - vX) / (vY - cY);
    var b = middleY - (slope * middleX);

    var y1 = vY;
    var x1 = (y1 - b) / slope

    var x3 = vX;
    var y3 = (slope * x3) + b;

    this.dragPoint = {
      x: currentX,
      y: currentY
    }

    this.upperPoint = {
      x: y1 < y3 ? x1 : x3,
      y: y1 < y3 ? y1 : y3
    }

    this.lowerPoint = {
      x: y1 >= y3 ? x1 : x3,
      y: y1 >= y3 ? y1 : y3
    }

  }

  recalculateDragPoint() {
    var slope = (this.lowerPoint.x - this.upperPoint.x) / (this.upperPoint.y - this.lowerPoint.y)
    var b = this.cornerY - (slope * this.cornerX);

  }

  hideCorner(){
    this.circle.hide();
  }

  showCorner(){
    this.circle.show();
  }

  hideMtriangle(){
    this.mTriangle.hide();
  }

  showMtriangle(){
    this.mTriangle.show();
  }

}
