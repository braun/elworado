Element.prototype.toggleVisibility = function (originalDisplayStyle) {
    if(originalDisplayStyle)
        this.originalDisplayStyle = originalDisplayStyle;
    var cdisplay = window.getComputedStyle(this).getPropertyValue("display");
    var visible = cdisplay != "none";
    this.setVisible(!visible);
}

Element.prototype.setVisible = function (visible,originalDisplayStyle) {
    if(originalDisplayStyle)
        this.originalDisplayStyle = originalDisplayStyle;
    if (!(this.hasOwnProperty("originalDisplayStyle")))
        this.originalDisplayStyle = visible ? "block" : this.style.display; // === "" ? "block" : this.style.display;
    if (visible && this.originalDisplayStyle === "")
        this.style.display ="";
    else
        this.style.display = visible ? this.originalDisplayStyle : "none";
}

Element.prototype.setVisibility = function (visible) {
   
    if (visible)
        this.style.visibility = "initial";
    else
        this.style.visibility = "hidden";
}
Element.prototype.removeAllChildren = function()
{
    while (this.firstChild) {
        this.removeChild(this.firstChild);
    }
}
Element.prototype.removeClassWithPrefix = function(prefix)
{
    var toremove = [];
    var element = this;
    for(var i = 0;i < element.classList.length; i++)
    {
        var clazz = element.classList.item(i);

        if(clazz.startsWith(prefix))
            toremove.push(clazz);
    }
    for(var i = 0; i < toremove.length;i++)
    {
        element.classList.remove(toremove[i]);
    }
}


function el(id)

{

    return document.getElementById(id);

}

function parseColor(input) {
    var div = document.createElement('div'), m;
    div.style.color = input;
    var ccol = div.style.color ;
    m = ccol.split("(")[1].split(")")[0].split(",");
   return m;
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
  }

function TimeoutPosterReverse(timeout)
{
    this.timeout =  timeout==null?100: timeout;
    this.handler = null;
}
TimeoutPosterReverse.prototype.post = function(callback)
{
    if(this.handler != null)
        return;
        
  
    if(callback ==null)
        return;

    this.handler = window.setTimeout(function()
    {
        this.handler = null;
        callback();
    },this.timeout);
}
function TimeoutPoster(timeout)
{
    this.timeout =  timeout==null?100: timeout;
    this.handler = null;
}
TimeoutPoster.prototype.post = function(callback)
{
    if(this.handler != null)
        window.clearTimeout(this.handler);
    
    this.handler == null;
    if(callback ==null)
        return;

    this.handler = window.setTimeout(function()
    {
        this.handler = null;
        callback();
    },this.timeout);
}


function isMobile()
{
 
        if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        ){
           return true;
         }
        else {
           return false;
         }
       
}

Element.prototype.toggleVisibility = function (originalDisplayStyle) {
    if(originalDisplayStyle)
        this.originalDisplayStyle = originalDisplayStyle;
    var cdisplay = window.getComputedStyle(this).getPropertyValue("display");
    var visible = cdisplay != "none";
    this.setVisible(!visible);
}

Element.prototype.setVisible = function (visible,originalDisplayStyle) {
    if(originalDisplayStyle)
        this.originalDisplayStyle = originalDisplayStyle;
    if (!(this.hasOwnProperty("originalDisplayStyle")))
        this.originalDisplayStyle = this.style.display; // === "" ? "block" : this.style.display;
    if (visible && this.originalDisplayStyle === "")
        this.style.display ="";
    else
        this.style.display = visible ? this.originalDisplayStyle : "none";
}

Element.prototype.setVisibility = function (visible) {
   
    if (visible)
        this.style.visibility = "initial";
    else
        this.style.visibility = "hidden";
}
Element.prototype.removeAllChildren = function()
{
    while (this.firstChild) {
        this.removeChild(this.firstChild);
    }
}

function parseColor(input) {
    var div = document.createElement('div'), m;
    div.style.color = input;
    var ccol = div.style.color ;
    m = ccol.split("(")[1].split(")")[0].split(",");
   return m;
}

function isNearlyWhite(color)
{
    try
    {
        var pc = parseColor(color);
        var rv = parseInt(pc[0]) > 200 && parseInt(pc[1])>200&& parseInt(pc[2])>200;
        return rv;
    }
    catch(ex)   
    {
        return false;
    }
}

function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
  
    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild; 
  }

Element.prototype.getCompStyle = function(styleName)
{
    return window.getComputedStyle(this).getPropertyValue(styleName);
}
Element.prototype.getWidth = function()
{
    return parseInt(this.getCompStyle("width"));
}
Element.prototype.getHeight = function()
{
    return parseInt(this.getCompStyle("height"));
}
Element.prototype.setWidth = function(w)
{
     this.style.width = w+"px";
}
Element.prototype.setHeight = function(h)
{
    this.style.height = h+"px";
}
function appendToBody(element)
{
    var body = document.querySelector(".fakebody");
    if(body == null)
       body = document.body;
    body.appendChild(element)
    return {
        remove: function()
        {
            body.removeChild(element);
        }
    }
}

