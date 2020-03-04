
function toast(toast)
{
    var div = document.querySelector(".toastContainer");
    if(div == null)
    {
        div = document.createElement('div');
        div.className="toastContainer";
        document.body.appendChild(div);
    }

    var span = document.createElement('div');
    span.innerHTML = toast;    
    span.className = "toast"; 
    div.appendChild(span);
    
    window.setTimeout(function()
    {
        div.removeChild(span);
        if(div.querySelectorAll(".toast").length == 0)
            document.body.removeChild(div);
    },5000);
}



function imageCarousel(slideClass,intervalSecs) {
   
        var slideIndex = 0;
    
        function carouselInternal()
        {
            var i;
            var x = document.getElementsByClassName(slideClass);
            for (i = 0; i < x.length; i++) {
            x[i].style.display = "none"; 
            }
            slideIndex++;
            if (slideIndex > x.length) {slideIndex = 1} 
            x[slideIndex-1].style.display = "block"; 
            setTimeout(carouselInternal, intervalSecs*1000); // Change image every 2 seconds
        }
        carouselInternal();
}
function isElementVisible(element)
{
    if(!element)
        return false;
//
 //   var styles = getComputedStyle(element);
    return  element.offsetHeight > 0;   
}
var focusableTags = ['INPUT','BUTTON','TEXTAREA'];
function isElementFocusable(element)
{
    if(!element)
        return false;

    var name = element.tagName;
    var idx = focusableTags.indexOf(name);
    return idx > -1;  
}
function moveFocusToNextField(id)
{
    var elems = document.querySelectorAll(".prev-"+id);
    moveFocusToElements(elems);
}
function moveFocusToElements(elems)
{
    if(elems != null && elems.length && elems.length > 0)
    {
        for(var j=0; j < elems.length;j++)
        {   
            var el = elems[j];
            if(el == null)
                continue;
            if(isElementVisible(el) && isElementFocusable(el))
            {                            
                el.focus();
                return;
            }
        }
    }
}