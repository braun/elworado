
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