var CropImage = function(body){
    this.settings = new Object;
    this.settings.croper = {
        border: 10,
        min: 100,
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
    body.onmouseup = function(ev){
        self._clearState(ev)
    }
    body.onmousemove = function(ev){
        if(self.dragok){
            var newX = ev.clientX - self.body.offsetLeft - self.startX;
            var newY = ev.clientY - self.body.offsetTop - self.startY;
            if(newX > 0 &&
               newX < (self.w - self.croper.offsetWidth) &&
               newY > 0 &&
               newY < (self.h - self.croper.offsetHeight)){
                self.croper.style.left = newX + 'px';
                self.croper.style.top = newY + 'px';
            }
        }
        if(self.resizeok){
            self._resizeCrope(ev)
        }
    }
};

CropImage.prototype._resizeCrope = function(ev) {
    var croper = this.croper;
    var cr = {x: croper.offsetLeft, rx: croper.offsetLeft + croper.offsetWidth,
                     y: croper.offsetTop, by: croper.offsetTop + croper.offsetHeight}
    var zero = {x: croper.offsetWidth/2, y: croper.offsetHeight/2}

    var evInCanvas = {x: ev.clientX - this.body.offsetLeft, y: ev.clientY - this.body.offsetTop} //в этой точке - новая граница

    var difX = cr.x - evInCanvas.x;
    var difY = cr.y - evInCanvas.y;
    if(this.startX > zero.x) var difX = evInCanvas.x - cr.rx
    if(this.startY > zero.y) var difY = evInCanvas.y - cr.by
    var dif = Math.floor((difX + difY)/2);
    var newVal = croper.offsetWidth + dif*2
    var newX = cr.x - dif
    var newY = cr.y - dif
    if( dif && newVal > this.settings.croper.min &&
        newX > 0 && (newX + newVal) < this.w &&
        newY > 0 && (newY + newVal) < this.h){
        self.croper.style.left = newX + 'px';
        self.croper.style.top = newY + 'px';
        self.croper.style.width = newVal + 'px';
        self.croper.style.height = newVal + 'px';
    }

};

CropImage.prototype._clearState = function() {
    this.dragok = false;
    this.resizeok = false;
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
    var self = this, border = this.settings.croper.border;
    this.croper = croper = document.createElement('div')
    croper.className = 'croper'
    croper.onmousedown = function(ev){
        self.startX = ev.offsetX
        self.startY = ev.offsetY
        if( ev.offsetX > border &&
            (ev.offsetX + border) < self.croper.offsetWidth &&
            ev.offsetY > border &&
            (ev.offsetY + border) < self.croper.offsetHeight){
                self.dragok = true
        } else{
            self.resizeok = true
        }
    }
    croper.onmouseup = function(ev){
        self._clearState(ev)
    }
    this.body.appendChild(croper)
    croper.style.left = (this.w - croper.offsetWidth)/2 + 'px'
    croper.style.top = (this.h - croper.offsetHeight)/2 + 'px'
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
