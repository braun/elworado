

String.isNullOrEmpty = function(str)
{
    return str == null || str === "";
}
String.nullToEmpty = function(str)
{
    if(str == null)
        return "";
    return str;
}
/**
 * replaces occurences of {<propname>} placeholder in this string with values of equally named properties of the hash object
 * @param {Object} hash 
 * @returns string withplacehlders replces
 */
String.prototype.replaceFields = function (hash) {
    var string = this, key; 
    for (key in hash) 
        string = string.replace(new RegExp('\\{' + key + '\\}', 'gm'), hash[key]); 
    return string;
}
/**
 * Replaces all occurences of search string with replacement
 */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
/**
 * renders template with ejs
 * @param {Object} model data to be used while exapnding the template
 */
String.prototype.renderTemplate = function(model)
{
    var rv = ejs.render(this,model);
    return rv;
}

String.prototype.removeDiacritics = function() {
    return this.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}
String.prototype.capitalize = function()
{    
        return this.charAt(0).toUpperCase() + this.slice(1);    
}
Array.prototype.contains = function(substr)
{
    return this.indexOf(substr) > -1;
}
String.prototype.contains = function(substr)
{
    return this.indexOf(substr) > -1;
}
/**
 * Java's hashCode() implementation
 */
String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}
Array.prototype.removeElement = function(element)
{
    var idx = this.indexOf(element);
    if(idx == -1)
        return;
    this.splice(idx,1);
}
Object.iterate = function(obj,callback,accu)
{
    var accum = accu;
    for(var key in obj)
    {
        if(!obj.hasOwnProperty(key))
            continue;
        var item = obj[key];
        var rv = callback(item,accum);
        if(rv === false)
            break;
    }
    return accum;
}
Object.traverse = function (structure,callback) {

    function wrapCallback(item)
    {
        Object.traverse(item,callback);
        var rv =callback(item);
      
        return rv;
    }
   if(Array.isArray(structure))
   {
     
       structure.forEach((i,idx)=>{
           const r = wrapCallback(i);
          if(r != undefined)
            structure[idx] = r;
       });
     
   } else if(typeof(structure) == "object")
        for(var key in structure)
        {
            if(!structure.hasOwnProperty(key))
                continue;
            var item = structure[key];
            wrapCallback(item);
          
     }
}
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

function getIntBytes( x ){
    var bytes = [];
    var i = 4;
    do {
    bytes[--i] = x & (255);
    x = x>>8;
    } while ( i )
    return bytes;
}

String.fillLeft = function( strOrNumber, width,padding )
{
    if(padding == null)
        padding = "0";

    if(typeof strOrNumber == "number")
        strOrNumber = strOrNumber.toString();
  width -= strOrNumber.length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( strOrNumber ) ? 2 : 1) ).join( '0' ) + strOrNumber;
  }
  return strOrNumber + ""; // always return a string
}
function fixEmpty(val,def)
{
    if(def == null)
        def = "";
    if(val == null)
        return def;
    return val
}

function isEmpty(val)
{
    return String.isNullOrEmpty(val);
}

String.condense = function(str)
{
    var s = "";
    s = s+str;
    s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    s= s.replace(/[^0-9a-zA-Z]/g, '') 
    return s;   
}
function describeValue(val,prefix,opts,suffix)
{
    if(typeof opts == "function" || opts == null)
        opts = {formatter: opts,suffix:suffix};
    if(typeof val == "function")
        val = val();
    if(val == null)
        if(opts.defval == null)
            return "";
        else
            return opts.defval;

            var rv = "";
    if(prefix != null)
        rv += prefix;
    if(opts.formatter)
        rv += opts.formatter(val);
    else 
        rv += val;
    if(opts.suffix)
        rv += suffix;

    return rv;
}

