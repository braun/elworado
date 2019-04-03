


var httpGetCache = {}

/**
 * @callback loadCallback
 * @param {String} loadedText loaded data as text
 */
/**
 * 
 * @param {String} url url of http resource  file to be loaded
 * @param {loadCallback} callback 
 */
var httpGet = function(url,callback,tryCache)
{
  if(tryCache)
  {
    if(httpGetCache.hasOwnProperty(url))
      {
        var rv = httpGetCache[url];
        callback(rv);
        return ;
      }
  }
    var xhr = createCORSRequest("GET",url);
    xhr.onreadystatechange = function() {
         if (xhr.readyState == 4 && xhr.status == 200)
         {
           if(tryCache)
              httpGetCache[url] = xhr.responseText;
            callback(xhr.responseText);
         
         }
         
     };

    
    xhr.send(null);

   
 }

 function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
  
      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open(method, url, true);
  
    } else if (typeof XDomainRequest != "undefined") {
  
      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open(method, url);
  
    } else {
  
      // Otherwise, CORS is not supported by the browser.
      xhr = null;
  
    }
    return xhr;
  }

  window.httpGet = httpGet;