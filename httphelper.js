


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
var httpGet = function(url,callback,tryCache,options)
{
  try
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

      var xhr = createCORSRequest((options != null && options.method) ? options.method : "GET",url);
      if(options && options.headers)
      {
        for(var header in options.headers)
          xhr.setRequestHeader(header,options.headers[header]);
      }
    xhr.onreadystatechange = function() {
          if (xhr.readyState == 4)
          {
              if(xhr.status == 200)
         {
           if(tryCache)
              httpGetCache[url] = xhr.responseText;
                callback(xhr.responseText,xhr);
         }
              else
                callback(null,xhr);
          }
     };

    
      xhr.timeout = 30000;
      xhr.send((options != null && options.data) ? options.data :null);
    }
    catch(error)
    {

      console.log(error.stack);
      callback(null,null,error);
    }
   
 }

  function renderUrlTemplate(url,model)
  {
    var promise = new Promise(function(resolve,reject)
    {  httpGet(url,function(data,rq)
      {
        if(data == null)
        {
          reject(rq);
          return;
        }
        var rv = data.renderTemplate(model);
        resolve(rv);
      });
    });
    return promise;
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

  function httpGetPromise(url,tryCache,options)
  {
    var rv = new Promise((resolve,reject)=>
    {
      httpGet(url,(data)=>
      {
        resolve(data);
      },tryCache,options);
    })
    return rv;
  }
  window.httpGetPromise = httpGetPromise;
  window.httpGet = httpGet;
