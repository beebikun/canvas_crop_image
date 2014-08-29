var CropImage = function(canvas){
    this.settings = new Object;
    this.settings.rect = {
        w: 200,
        h: 200,
        lineWidth: 5,
        strokeStyle: 'black'
    }
    this._init(canvas)
}

CropImage.prototype._init = function(canvas) {
    this.dragok = false;
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.w = canvas.getAttribute('width');
    this.h = canvas.getAttribute('height');
    this.rect = {x: 0, y: 0}
    this.img = new Object


    var self = this

    function _canvasMove(e){
        if ( self.dragok && self._drawRectCanMove(e) ){
            self._setRectPos(e)
            self._redraw()
        }
    }

    function _canvasDown(e){
        self.dragok = true;
        /*if (self._drawRectCanMove(e)){
        }*/
    }

    function _canvasUp(e){
        self.dragok = false;
    };

    canvas.onmousedown = _canvasDown;
    canvas.onmouseup = _canvasUp;
    self.canvas.onmousemove = _canvasMove;
};


CropImage.prototype._setRectPos = function(e) {
    this.rect.x = e.pageX - this.canvas.offsetLeft;
    this.rect.y = e.pageY - this.canvas.offsetTop;
};


CropImage.prototype._drawRectCanMove = function(e) {
    var left = this.canvas.offsetLeft;
    var right = left + this.w - this.rect.w;
    var top = this.canvas.offsetTop;
    var bottom = top + this.h - this.rect.h;

    var eventLeft = e.pageX;
    var eventTop = e.pageY;

    var moreThanLeftBorder = eventLeft > left;
    var lessThanRightBorder = eventLeft < right;
    var moreThanTopBorder = eventTop > top;
    var lessThanBottomBorder = eventTop < bottom;
    return moreThanLeftBorder && lessThanRightBorder &&
           moreThanTopBorder && lessThanBottomBorder
};

CropImage.prototype._updateCanvasSize = function(w, h) {
    var c = this.canvas;
    if(c.getAttribute('width') != w){
        c.setAttribute('width', w);
        this.w = w;
    }
    if(c.getAttribute('height') != h){
        c.setAttribute('height', h);
        this.h = h;
    }
};

CropImage.prototype._drawRect = function (w, h) {
    var w = w || this.settings.rect.w;
    var h = h || this.settings.rect.h;
    var x = this.rect.x;;
    var y = this.rect.y;
    this.context.beginPath();
    this.context.rect(x, y, w, h);
    this.context.closePath();
    this.context.lineWidth = this.settings.rect.lineWidth;
    this.context.strokeStyle = this.settings.rect.strokeStyle;
    this.context.stroke();
    this.rect.w = w;
    this.rect.h = h;
}

CropImage.prototype._clear = function() {
    this.context.clearRect(0, 0, this.w, this.h);
}


CropImage.prototype._redraw = function() {
    this._clear();
    this._drawImage();
    this._drawRect();
};

CropImage.prototype._start = function() {
    var self = this;
    function redraw(){
        self._redraw()
    }
    /*this.drawInterval = setInterval(redraw, 10)*/
};

CropImage.prototype.stopInterval = function(first_argument) {
    if(this.drawInterval){
        clearInterval(this.drawInterval);
        this.drawInterval = undefined;
    }
};

CropImage.prototype._drawImage = function(data, title, is_start) {
    var data = data || this.img.data
    var imageObj = new Image();
    var self = this;

    imageObj.onload = function() {
        var originalW = this.width;
        var originalH = this.height;

        self._updateCanvasSize(originalW, originalH);

        self.context.drawImage(this, 0, 0);
        if (is_start){
            self.rect = {
                x: (self.w - self.settings.rect.w)/2,
                y: (self.h - self.settings.rect.h)/2
            }
            self.img.data = data
            self.img.title = title
        }
        self._drawRect();
    };
    imageObj.src = data;
};

CropImage.prototype.draw = function(data, title) {
    this._drawImage(data, title, true)
};

CropImage.prototype.crop = function() {
    console.log('crop')
    var imageObj = new Image();
    var self = this;

    this._clear();

    imageObj.onload = function() {
        self._updateCanvasSize(self.rect.w, self.rect.h);
        self.context.drawImage(this,
                               self.rect.x, self.rect.y, self.rect.w, self.rect.h, //конфигурация нового куска изображения
                               0, 0, self.rect.w, self.rect.h //конфигурация позиции этого куска на канвасе
                               );
        self.base64ImageData = self.canvas.toDataURL();
        console.log(self.base64ImageData)
    }
    imageObj.src = this.img.data;
};
