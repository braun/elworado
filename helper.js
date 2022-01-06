
const { Base64 } = require("js-base64");

const pako = require("pako");

function decompressBase64Gzip(base64gzipString)
    {
        var base64Data = base64gzipString;
        var compressData = Base64.decode(base64Data);
        compressData = compressData.split('').map(function (e) {
            return e.charCodeAt(0);
        });
        
         var originalText = pako.ungzip(compressData, {to:"string"});
        return originalText;
    }
    function compressToBase64Gzip(string)
    {
        var compressData = pako.gzip(string);

        compressData = compressData.reduce((pre,cur)=>pre+String.fromCharCode(cur),"");
        var base64Data = Base64.encode(compressData);
       return base64Data;
    }

module.exports.decompressBase64Gzip = decompressBase64Gzip;
module.exports.compressToBase64Gzip = compressToBase64Gzip;