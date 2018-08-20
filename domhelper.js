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

