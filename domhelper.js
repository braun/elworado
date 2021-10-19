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
        this.originalDisplayStyle =  this.getAttribute("toDisplay");//""// : this.style.display; // === "" ? "block" : this.style.display;
    if (visible && this.originalDisplayStyle === "")
        this.style.display ="";
    else
        if(visible)
            this.style.display = this.originalDisplayStyle 
        else
        this.style.setProperty("display", "none", "important");
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
Element.prototype.isHidden = function() {
    return (this.offsetParent === null)
}

function isVisible(elem) {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (style.opacity < 0.1) return false;
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false;
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemCenter.y < 0) return false;
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode);
    return false;
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
function sortFactory(prop,opts) {
    var defopts = {
        "desc":false
    };
    opts = Object.assign(defopts,opts);
    return function(a,b){ 
        var v1 = a[prop];
        var v2 = b[prop];
        if(v1 == null && v2 == null)
            return 0;
        if(v1 == null)
            return -1;
        if(v2 == null)
            return -2;
        const cmp = a[prop].localeCompare(b[prop]); 
        if(opts.desc)
            return 0-cmp;
        else
            return cmp;
    };
 }

