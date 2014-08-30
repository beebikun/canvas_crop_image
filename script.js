var CropImage = function(body){
    this.settings = new Object;
    this.settings.croper = {
        width: 200 + 'px',
        height: 200 + 'px',
        border: '4px solid black',
    }
    this._init(body)
}

CropImage.prototype._init = function(body) {
    this.dragok = false;
    this.body = body;
    this._createCanvas()
    this.rectParams = {x: 0, y: 0}
    this.img = new Object


    var self = this

    function _canvasMove(e){
        if ( self.dragok && self._drawRectCanMove(e) ){
            self._setRectPos(e)
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




/*    body.onmousedown = _canvasDown;
    body.onmouseup = _canvasUp;
    body.onmousemove = _canvasMove;*/
    body.onmouseup = function(ev){
        self.dragok = false
    }
    body.onmousemove = function(ev){
        if(self.dragok){
            var newX = ev.clientX - self.body.offsetLeft;
            var newY = ev.clientY - self.body.offsetTop;
            if(newX > 0 &&
               newX < (self.w - self.croper.offsetWidth) &&
               newY > 0 &&
               newY < (self.h - self.croper.offsetHeight)){
                self.croper.style.left = newX + 'px';
                self.croper.style.top = newY + 'px';
            }
        }
    }
};


CropImage.prototype._createCanvas = function() {
    this.canvas = canvas = document.createElement('canvas')
    canvas.style.border = "1px solid red";
    this.body.appendChild(canvas);
    this.context = canvas.getContext('2d');
    this.w = canvas.getAttribute('width');
    this.h = canvas.getAttribute('height');
};

CropImage.prototype._createCroper = function() {
    var self = this;
    this.croper = croper = document.createElement('div')
    croper.onmousedown = function(ev){
        self.dragok = true
    }
    croper.onmouseup = function(ev){
        self.dragok = false
    }
    croper.className = 'croper'
    this.body.appendChild(croper)
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

CropImage.prototype._clearCanvas = function() {
    this.context.clearRect(0, 0, this.w, this.h);
}

CropImage.prototype._deleteCroper = function() {
    this.body.removeChild(this.croper)
    this.croper = undefined
};


CropImage.prototype._drawImage = function() {
    var data = this.img.data
    var imageObj = new Image();
    var self = this;

    imageObj.onload = function() {
        var originalW = this.width;
        var originalH = this.height;
        self._updateCanvasSize(originalW, originalH);

        self.context.drawImage(this, 0, 0);

        self._createCroper();
    };
    imageObj.src = data;
};

CropImage.prototype.draw = function(data, title) {
    this._clearCanvas()
    this.img.data = data;
    this._drawImage(data, title)
};

CropImage.prototype.crop = function() {
    var imageObj = new Image();
    var self = this;
    var w = this.croper.offsetWidth, h = this.croper.offsetHeight,
        x = this.croper.offsetLeft, y = this.croper.offsetTop;

    this._deleteCroper()

    imageObj.onload = function() {
        self._updateCanvasSize(w, h);
        self.context.drawImage(this,
                               x, y, w, h, //конфигурация нового куска изображения
                               0, 0, w, h //конфигурация позиции этого куска на канвасе
                               );
        self.base64ImageData = self.canvas.toDataURL();
        console.log(self.base64ImageData)
    }
    imageObj.src = this.img.data;
};
