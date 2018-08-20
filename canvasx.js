/**
 * Simple wrapper around Canvas object supporting non trivial image operations
 * @param {number} width width of new canvas
 * @param {height} height height of new canvas
 * @constructor
 */
function CanvasX(width, height) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;

    this.ctx = this.canvas.getContext("2d");
}

/**
 * @callback canvasxcallback
 * @param context Canvas context 
 * @param {CanvasX} CanvasX object to operate on
 */
/**
 * utility to draw on canvas with the save/restore bounds
 * @param {canvasxCallback} callback 
 */
CanvasX.prototype.draw = function (callback) {
    this.ctx.save();
    callback(this.ctx, this);
    this.ctx.restore();
}

/**
 * clear the canvas
 */
CanvasX.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
}

/**
 * Draw image from url onto canvas
 * @param {string} url url with image
 * @param {canvasxCallback} callback callback to be called on image load
 * @param {number=} x  x coord of canvas where the image souhle be placed, default 0
 * @param {number=} y  y coord of canvas where the image should be placed, default 0
 * @param {number=} width width of canvas portion, image will be placed onto, default canvas width - x
 * @param {number=} height height of canvas portion, image will be placed onto,default canvas width - y
 */
CanvasX.prototype.drawImage = function (url, callback, x, y, width, height) {
    var img = new Image(); // Create new img element
    img.addEventListener('load', function () {       
        if (x === undefined)
            x = 0;
        if (y === undefined)
            y = 0;
        if (width === undefined)
            width = this.canvas.width - x;
        if (height === undefined)
            height = this.canvas.height - y;
           // this.ctx.globalCompositeOperation = "destination-over";
        this.ctx.drawImage(img, 0, 0, width, height);

        if(callback != null)
            callback(this.ctx,this);
    }.bind(this));
    img.src = url;

}

/**
 * Callback providing result of getImage operation
 * @callback imageCallback
 * @param {Image} img resulting image
 * @param {CanvasX} canvasX the original canvasX object
 */
/**
 * Converts canvas into image
 * @param {imageCallback} callback 
 */
CanvasX.prototype.getImage = function(callback)
{
    var img = new Image();
    img.src = this.getImageUrl();
    img.addEventListener('load',function()
    {
        callback(img,this);
    });
   
}

CanvasX.prototype.getImageUrl = function()
{
    return this.canvas.toDataURL("image/png");
}
/**
 * @callback processImageDataCallback 
 * @param {number[][]} imgdata RGBA data from canvas
 * @param {number} cnt overall count of components (bytes) in imgdata
 * @param {CanvasX} canvasX the original canvasX object
 * @returns {boolean} true when edited data should be saved back to canvas
 */
/**
 * allows direct editing of canvas data and saving edited data back to canvas
 * @param {processImageDataCallback} callback youd should edit data here
 */
CanvasX.prototype.processImageData = function (callback) {
    var imgdata = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    var cnt = 4 * imgdata.height * imgdata.width;
    if (callback(imgdata, cnt, this))
        this.ctx.putImageData(imgdata, 0, 0);
}

/**
 * Draws elipse on canvas
 * @param {*} ctx canvas context to draw on
 * @param {number} cx  center x coord
 * @param {number} cy  center y coord
 * @param {number} w   width of elipse
 * @param {number} h   height od elispe
 */
function drawEllipseByCenter(ctx, cx, cy, w, h) {
    drawEllipse(ctx, cx - w/2.0, cy - h/2.0, w, h);
  }
  function drawEllipseByPoints(ctx, x0, y0, x1, y1) {
    drawEllipse(ctx, x0,y0, x1-x0,y1-y0);
   }
  function drawEllipse(ctx, x, y, w, h) {
    var kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle
  
   
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    //ctx.closePath(); // not used correctly, see comments (use to close off open path)
    
  }
  