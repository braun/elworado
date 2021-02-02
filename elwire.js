
var ElWidget = require("./elwidget").ElWidget;

/**
 * simple DOM binding library
 */

function Elbind(controller, parentElbind) {
    
    this.nestedData = [];
    this.nestedDataMap = {};
    this.controllers = {};
    if (parentElbind) {
        this.parentElbind = parentElbind;
        this.nestedData = parentElbind.nestedData.slice();
          Object.assign(this.nestedDataMap,parentElbind.nestedDataMap);
    }
    this.watchStack = [];
    this.controller = this.findController(controller);

}

/**
 * register controller
 */
Elbind._controllers = {}
Elbind.controller = function(name,controller)
{
    Elbind._controllers[name] =
    {

        controller:controller
    } 
}


Elbind.findController = function(candidate)
{
    if(candidate == null || candidate == "")
        return function(scope){};

    if(typeof candidate == "function")
        return candidate;

    var controller =  null;
    if(Elbind._controllers.hasOwnProperty(candidate))
    {
        controller = Elbind._controllers[candidate];    
        return controller.controller;
    }
       
    try
    {
        controller = eval(candidate);
    } 
    catch(e)
    {}

    if(controller == null)
    {
        console.warn("controller not found: "+candidate);
        return function(scope){};
    }
   return controller;
}


/**
 * Custom tag reister
 */
Elbind._attributes = {};

/**
 *  custom attribute specification. Wire, bind are functions
 */
class AttributeSpec 
{
    /**
     * @member {function} what to do on wire phsase
     */
    wire(elem,val,elbind) {}

     /**
     * @member {function} what to do on bind phsase
     */
    bind(elem,val,elbind) {}

    
    afterWire(elem,val,elbind) {}
    constructor(proto)
    {
        Object.assign(this,proto);
    }

}
/**
 * add new custom attribute
 * @param name {string} name of attribute
 * @param tagSpec {AttributeSpec} tag specificatin, what to do on wire/bind phase
 */
Elbind.addAttribute = function(name,spec)
{
        Elbind._attributes[name] =  typeof spec == "function" ? spec: new AttributeSpec(spec);
        Elbind._attributes[name].name = name;
}


/**
 * processes custom ttributes defined on element. if attribute is defined the mapFucntion is called
 * @param mapFunction does the real work of tagSpec wire/bind invocation
 */
Elbind.prototype._processCustomAttributes = function(elem,mapFunction)
{
    // create list of custom tags
    if(elem.customAttributes == null)
    {
        elem.customAttributes = {}
        for(var attrname in Elbind._attributes)
        {
            
            var atr = elem.getAttribute(attrname)
            if(atr == null)
                continue;
      
            let attrSpec = Elbind._attributes[attrname];
            if(typeof attrSpec == "function")
            {
                attrSpec = new AttributeSpec( attrSpec.call(this,elem));
                attrSpec.name = attrname;
            }
            elem.customAttributes[attrname] = attrSpec;
        }
           
    }
    // invoke tag spec
   for(let key in elem.customAttributes)
   {
        let attrSpec = elem.customAttributes[key];
        let atr = elem.getAttribute(key)
      //  console.log("elbind.processAttributes:" +key+"="+atr+", "+elem.id+","+this.element.name);
        try
        {
            var attrs = {};
            if(attrSpec.attributes)
            attrSpec.attributes.forEach((atr)=>
            {
                let atval = elem.getAttribute(atr);
                if(atval)
                    attrs[atr] = atval;
            });
            mapFunction(attrSpec,atr,attrs);
        }
        catch(ex)
        {
            console.error("maping custom tag "+attrSpec.name+" failed",ex);
        }
   }
    
}

/**
 * add elclass custom attribute
 */
Elbind.addAttribute("elclass",{
    wire: function(elem,value,elbind)
    {
        elem._origClassName = elem.className;
    },
    bind: function(elem,value,elbind)
    {
        elem.className = elem._origClassName;
        var classes = elbind.eleval(value,elem);
        if(typeof classes  === "string" )        
            classes = classes.split(" ");
        
            //elem.className += " "+classes;
        //else 
        if(classes != null)
            classes.forEach(cl=>
                {
                    if(String.isNullOrEmpty(cl) || cl == " ")
                        return;
                    elem.classList.add(cl);
                })
    }
})

/**
 * add elclass custom attribute
 */
Elbind.addAttribute("elstyle",{
    bind: function(elem,value,elbind)
    {
        var styles = elbind.eleval(value,elem);
        for(var stylekey in styles)
            elem.style[stylekey] = styles[stylekey];
    }
})
/**
 * attaches the elbind to a element
 */
Elbind.prototype.attach = function (element) {
    element.elbind = this;
    this.element = element;
    return this;
}

/**
 * attaches binder to element specified by  selector
 */
Elbind.prototype.attachSelector = function (selector, parent) {
    if (parent == null)
        parent = document.body;

    var element = parent.querySelector(selector);
    if (element == null)
        throw "ELBIND: Element not found for selector: " + selector;

    return this.attach(element);
}

/**
 * Prepares the DOM template for binding (searches the binding hint tags)
 */
Elbind.prototype.prepare = function () {
    if (this.prepared)
        return;
  
        this._doprepare();
    
}

Elbind.prototype._doprepare = function () {
    if (this.prepared)
        return;
        this.prepared = true;

    //TODO: optimalize preparing of elcontrollers and elwidgets
    var newsubs  = this.element.querySelectorAll("[elcontroller]");
   this.subs = Array.prototype.slice.call(newsubs);
    for (var i = 0; i < newsubs.length; i++) 
        {
            var possibleParent = newsubs[i];
            for (var j = 0; j < newsubs.length; j++) {
                var possibleSubSub = newsubs[j];
                if(possibleParent !== possibleSubSub && possibleParent.contains(possibleSubSub))
                    {
                        var idx = this.subs.indexOf(possibleSubSub);
                        if(idx > -1)
                           this.subs.splice(idx,1);
                    }
                }
        }
    
    for (var i = 0; i < this.subs.length; i++) {
        var sub = this.subs[i];
        sub.originalParent = sub.parentNode;
      //  sub.parentNode.removeChild(sub);

    }
    var newwidgets = this.element.querySelectorAll("[elwidget]");
    this.widgets = Array.prototype.slice.call(newwidgets);
    var widgets = this.widgets;
    function cleanWidgets(possibleParrents)
    {
        for (var i = 0; i < possibleParrents.length; i++) 
        {
            var possibleParent = possibleParrents[i];
            for (var j = 0; j < newwidgets.length; j++) {
                var possibleSubSub = newwidgets[j];
                if(possibleParent !== possibleSubSub && possibleParent.contains(possibleSubSub))
                    {
                        var idx = widgets.indexOf(possibleSubSub);
                        if(idx > -1)
                        widgets.splice(idx,1);
                    }
                }
        }
    }
    cleanWidgets(newwidgets);
    cleanWidgets(this.subs);
    
    var colls = this.element.querySelectorAll("[elcollection]");
    this.mounts = this.element.querySelectorAll("[elmount]");

    cleanWidgets(colls);
    cleanWidgets(this.mounts);
    for (var i = 0; i < this.widgets.length; i++) {
        var sub = this.widgets[i];
        sub.originalParent = sub.parentNode;
        sub._widgetMount = true;
      //  sub.parentNode.removeChild(sub);

    }

   
    for (var i = 0; i < this.mounts.length; i++) {
        var sub = this.mounts[i];
        sub.originalParent = sub.parentNode;
      //  sub.parentNode.removeChild(sub);

    }
    this.collections = [];
    this.belongsToSubScope = function(el)
    {
       // if(this.element === el)
         //   return false;
         for(var i = 0; i < this.widgets.length; i++)
         {
             if(this.widgets[i].contains(el))
                 return true;
         }
        for(var i = 0; i < this.subs.length; i++)
        {
            if(this.subs[i].contains(el))
                return true;
        }
        for(var i = 0; i < this.mounts.length; i++)
        {
            if(this.mounts[i].contains(el))
                return true;
        }
        for(var i = 0; i < this.collections.length; i++)
        {
            if(this.collections[i].contains(el))
                return true;
        }
        return false;
    }

   
    for (var i = 0; i < colls.length; i++) {
        var collection = colls[i];
        if(this.belongsToSubScope(collection))
            continue;

            // filter out "sub" collections
            for(var j = 0; j < colls.length; j++)            
                if(colls[j].contains(collection))
                    continue;
            
        this.collections.push(collection);
        collection.originalParent = collection.parentNode;
        collection.parentNode.removeChild(collection);

    }
   for (var i = 0; i < colls.length; i++) {
        var collection = colls[i];
        if(this.belongsToSubScope(collection))
            continue;

            // filter out "sub" collections
            for(var j = 0; j < colls.length; j++)            
                if(colls[j].contains(collection))
                    continue;
            
        this.collections.push(collection);
        collection.originalParent = collection.parentNode;
        collection.parentNode.removeChild(collection);

    }
  
    
   
    this.bindEls = [];
    var nls = this.element.querySelectorAll("[elbind]");
    for (var i = 0; i < nls.length; i++)
    {
        if(!this.belongsToSubScope(nls[i]))
            this.bindEls.push(nls[i]);
    }
    var nls = this.element.querySelectorAll("[elwire]");
    for (var i = 0; i < nls.length; i++)
    {
        if(!this.belongsToSubScope(nls[i]) && this.bindEls.indexOf(nls[i])==-1)
            this.bindEls.push(nls[i]);
    }
    if (this.element.getAttribute("elbind") != null)
        this.bindEls.unshift(this.element);
    else
    if (this.element.getAttribute("elwire") != null)
         this.bindEls.unshift(this.element);


   this.bindEls.forEach(el=>
    {
        el.enclosingElbind = this;
    })
}


Elbind.prototype.onInputChanged = function(el,model,value,event)
{
    
    this.updateModel(el,model,value,event);
}
Elbind.prototype.eleval = function(expression,element,extra)
{
    if(expression == null || expression == "")
        return null;
    var scope = this.scope;
    var elbind = this;            
    for(var it in elbind.nestedDataMap)
    {
        let itv = elbind.nestedDataMap[it];
        eval("var "+it+" = itv");
    }
    if(extra)
    for(var it2 in extra)
    {
        let itv = extra[it2];
        eval("var "+it2+" = itv");
    }
   var val = null;
   var firstFailed = false;
   try {
     val = eval(expression);
    }
    catch(e){
     //   console.warn("Cant eval: "+expression,e);
     firstFailed = true;
    }
        
   if (firstFailed || (val == undefined &&  (!extra  || !extra.ignoreSecPas)))
   try {
       val = eval("scope."+expression);
   }
   catch(e){
      console.warn("Cant eval: scope."+expression,e);
   }
  
  

   if (val == undefined)
       val = null;
   return val;
}

 // wire (prepare) the elements
Elbind.prototype.wire = function()
{
       if(this.wired == true)
        return;
        this.wired = true;
        for (var i = 0; i < this.bindEls.length; i++) {
            var el = this.bindEls[i];
            
            function wireEl(el)
            {
                var thiselbind = this;
                var scope = thiselbind.scope;
                // bind  to model autowired element

                this._processCustomAttributes(el,(attrSpec,attrVal,attrs)=>
                {
                    attrSpec.wire(el,attrVal,thiselbind,attrs);
                });
                var model = el.getAttribute("elmodel");                
                if (model != null) {
                    
                   
                    try {              
                        // autowire (bidirectional) input
                        if (el.tagName == "INPUT" || el.tagName == "TEXTAREA") {           
                          
                            el.addEventListener("input",function(event)
                            {
                                model = el.getAttribute("elmodel"); 
                                var val = event.target.type ==="checkbox" ? event.target.checked : event.target.value;
                                thiselbind.onInputChanged(el,model,val,event);
                            } );
                        }
                    } catch (err) {
                        console.debug(err);
                    }
                }
            
                // setup default element action
                var elaction = el.getAttribute("elaction");
                if (elaction != null) {
                    var scope = this.scope;
                  
                    function doaction(event) {
                        event.preventDefault();
                       if(scope._onElAction != null)
                            scope._onElAction(event);
                        scope.elbind.eleval(elaction,el,{event:event,ignoreSecPas:true});
                       
                    }
                    if(el.tagName == "INPUT" || el.tagName == "TEXTAREA")
                    {
                        el.addEventListener("keyup", function(event) {                          
                            event.preventDefault();                           
                            if (event.keyCode === 13) {
                             doaction(event);
                            }
                          });
                    }
                    else
                     el.onclick = doaction;
                }
              
                this.trySetId(el);
                this._processCustomAttributes(el,(attrSpec,attrVal,attrs)=>
                {
                    attrSpec.afterWire(el,attrVal,thiselbind,attrs);
                });
            }
            wireEl.bind(this)(el);
        }
            for (var i = 0; i < this.bindEls.length; i++) {
                var el = this.bindEls[i];
            function customWireEl(el)
            {
                var thiselbind = this;
                var scope = thiselbind.scope;

                // run custom wiring of element
                var pre = el.getAttribute("elwire");           
                if (pre != null && pre != "") {
                    var pars=this.buildPars(el);
                    var elw= this.scope[pre];
                    if(elw  == null)
                        console.error("Elbind prepare function not defined: " + pre);
                    else
                    if(typeof elw === "function")
                        elw.apply(this.scope, pars);
                    else 
                    {
                        if(elw.wire == null)
                            console.error("Elbind prepare function not defined in wire object " + pre);
                        else
                            elw.wire.apply(this.scope, pars);
                    }
                }

              
            }
            customWireEl.bind(this)(el);
        }

        for (var i = 0; i < this.bindEls.length; i++) {
            var el = this.bindEls[i];
            
            function afterWireEl(el)
            {
                var thiselbind = this;
                var scope = thiselbind.scope;
                // bind  to model autowired element

            
                this._processCustomAttributes(el,(attrSpec,attrVal,attrs)=>
                {
                    attrSpec.afterWire(el,attrVal,thiselbind,attrs);
                });
            }
            afterWireEl.bind(this)(el);
        }
}
var elwireKeySequence = 1;
Elbind.prototype.buildPars = function(el,proto)
{
    var pars = [];
    if(proto != null)
        pars=pars.concat(proto);
    pars.push(el);
    var elpar = el.getAttribute("elparam");
    if (elpar != null) {
        try
        {
            var elparval = this.eleval(elpar,el,null);
            pars.push(elparval);
        }
        catch(err)
        {
            console.debug(err);
        }
    }
    pars = pars.concat(this.nestedData);
    return pars;
}
Elbind.prototype.trySetId = function(el)
{
    var ida = el.getAttribute("elid");
    if(ida != null)
    {
        var id =this.eleval(ida,el,null); 
        el.id = id;
        this.scope[id] = el;
    }  
}
Elbind.elbindFactory = 
{
    _list:[],
    add: function(factory)
    {
        this._list.unshift(factory)
    },
    createElbind:function(element,controller,parentElbind)
    {
        for(var i = 0; i < this._list.length;i++)
        {
            let factory = this._list[i];
            let rv = factory(element,controller,parentElbind);
            if(rv)
                return rv;
        }
        return null;

    }
}
Elbind.elbindFactory.add(function(element,controller,parentElbind)
{
    return new Elbind(controller,parentElbind);
})
function namel(el)
{
    if(el == null)
    return "null";
    return el.tagName+":"+el.className+ ((el.id && el.id != "")?", id:"+el.id:"");
}
Elbind.prototype.findController = function(cname)
{
    if(this.controllers[cname] != null)
        return this.controllers[cname];
    else if(this.parentElbind != null)
        return this.parentElbind.findController(cname);
    else
        return Elbind.findController(cname);
}

Elbind.prototype.addController = function(cname,controller)
{
    this.controllers[cname] = controller;
}
/**
 * binds the controller data to DOM elements
 */
Elbind.prototype.bind = function (opts) {
    if(opts == null)
        opts = {}
    //this.scope._phase = "prepare";
  // console.error("elbind.bind:" +namel(this.element),new Error());
    var rebuildScope = opts == null? false: opts.rebuildScope;
    var doPrepareData = opts == null ? false: opts.prepareData;
    if (!this.prepared)
        this.prepare();
   
    if (this.scope == null || rebuildScope) {
        this.scope = this.parentElbind != null ? Object.create(this.parentElbind.scope) : {};
        this.scope.elbind = this;
        this.scope.scope = this.scope;
        for (var i = 0; i < this.bindEls.length; i++) {
            var el = this.bindEls[i];
            //set id
            this.trySetId(el);
        }
        for (var i = 0; i < this.subs.length; i++) {
            var el = this.subs[i];
            //set id
            this.trySetId(el);
        }
 	for (var i = 0; i < this.widgets.length; i++) {
            var el = this.widgets[i];
            //set id
            this.trySetId(el);
        }
        this.scope._phase = "build";
        this.scope.onMount = null;
        this.scope.onUnmount = null;
        if (this.controller)
            this.controller(this.scope);
    }
   

    this.wire();
    this.scope._phase = "bind";
   
    
    if (Object.keys(this.nestedDataMap).length > 0)
        Object.assign(this.scope, this.nestedDataMap);

        // data to widgets are propagated this way
    if(this.prepareData && doPrepareData)
        this.prepareData(this.scope);
    if(this.scope.onBind)
            this.scope.onBind();
  // bind own elements
  var elbind = this;
    function bindEl(it) {
        // console.warn("elbind.bindEl: " +namel(it)+", "+namel(elbind.element),new Error());
        // check element visibility
        var show = it.getAttribute("elshow");
        if (show != null) {
            var scope = this.scope;
            scope.scope = scope;
            try
            {
                var val = this.eleval(show,it,null);
                it.setVisible(val);
                
            }
            catch(error)
            {
                console.error(error.stack);
            }
        }
        this._processCustomAttributes(it,(attrSpec,attrVal,attrs)=>
        {
            attrSpec.bind(it,attrVal,elbind,attrs);
        });

        var bindallways = it.getAttribute("elbindallways");
        if(bindallways == null && it.isHidden())
            return;

        
        var fn = it.getAttribute("elbind");          
                                    
        // bind  to model autowired element
        var model = it.getAttribute("elmodel");
        it.enclosingElbind = this;
        var pars=this.buildPars(it);
        if (model != null) {
            
            if(!it._widgetMount)
            { // dont set model on sub elbind (widget)
                try
                {
                    var val = elbind.evalModel(model,it);
                    var format = it.getAttribute("elformat");
                    if(format != null)
                    {
                        var func = this.scope[format]
                        if(func == null || typeof(func) != "function")
                            return;
                        val = func.apply(this.scope,[val].concat(pars));
                    }
                    // autowire (bidirectional) input                
                    if (it.tagName == "INPUT" || it.tagName == "TEXTAREA") 
                    {
                        if(it.type === "checkbox")
                            it.checked = val;
                            else
                        it.value = val;                        
                    }
                    else if(it.tagName == "IMG")
                        it.src = val;
                    else
                        it.innerHTML = val;
                } catch (err) {
                    console.debug(err);
                }
            }
        }

        
       
    
        // run bind function
    
        if (fn != null && fn !== "") {
            var elb = this.scope[fn];
            if (elb == null)
                console.error("Elbind binding function not defined: " + fn);
            else
            
            elb.apply(this.scope, pars);
        
        }
        var pre = it.getAttribute("elwire");           
        if (pre != null) {
            
            var elw= this.scope[pre];                    
            if(elw != null && typeof elw === "object")                       
            {
                if(elw.bind == null)
                    console.error("Elbind bind function not defined in wire object " + pre);
                else
                    elw.bind.apply(this.scope, pars);
            }
        }
    
    }
  if(opts.bindSelf === true)
    bindEl.bind(this)(this.element);
  for (var i = 0; i < this.bindEls.length; i++) {
    var it = this.bindEls[i];

   
    it.bindel = function(it)
    {
        return function()
        {
            bindEl.bind(this)(it);
        }.bind(this);
    }.bind(this)(it);
   it.bindel();
}
    // bind mounts
    for (var i = 0; i < this.mounts.length; i++) {
        var subEl = this.mounts[i];
        if (subEl.elbind == null) {
          
            var controller = eval(function(scope) {});
            var childElbind = new Elbind(controller, this);
            childElbind.attach(subEl);
           // subEl.originalParent.appendChild(subEl);
        }
        subEl.elbind.bind();
    }
    // bind subs
    for (var i = 0; i < this.subs.length; i++) {
        var subEl = this.subs[i];
        if (subEl.elbind == null) {
            var scope = this.scope;
            this.trySetId(el);
            var subc = subEl.getAttribute("elcontroller");
            var controller = elbind.findController(subc);

            var childElbind = Elbind.elbindFactory.createElbind(subEl,controller,this);
            childElbind.attach(subEl);
           // subEl.originalParent.appendChild(subEl);
        }
        subEl.elbind.bind({bindSelf: true});
    }
    // bind widgets
    var scope = this.scope;
    for (var i = 0; i < this.widgets.length; i++) {
        var subEl = this.widgets[i];
        function fn(subEl)
        {

            // var bindallways = it.getAttribute("elbindallways");
            // if(bindallways == null && it.isHidden())
            //     return;

            if (subEl.elbind == null) {
                if(subEl.instantiating !== true) {
               
                    subEl.instantiating = true;
                    var widgetid = subEl.getAttribute("elwidget");
                    var wtemplate = Elbind.widgets[widgetid];
                    if(wtemplate == null)
                    {
                        console.error("widget with id: "+widgetid+" not found!");
                        return;
                    }
                    var controller = wtemplate.controllerWrapper.bind(wtemplate);     
                    if(wtemplate.url == null)     
                    {
                        Elbind.forElement(subEl,controller,this)            
                        delete subEl.instantiating;     
                        subEl.elbind.bind({prepareData:true});
                    }
                    else
                    Elbind.forHtmlFromUrl(wtemplate.url,controller,this,subEl).then(childElbind=>{
                        delete subEl.instantiating;
                        var op = subEl.elbind.prepare;
                        subEl.elbind.prepare = function()
                        {
                            op.bind(this)();
                        }
                        subEl.elbind.bind({prepareData:true});
                    })
                            
                // subEl.originalParent.appendChild(subEl);
                }
            } else
             subEl.elbind.bind({prepareData:true});
        }
        subEl.bindel = function(it)
        {
            return function()
            {
                fn.bind(this)(subEl);
            }.bind(this);
        }.bind(this)(it);
        subEl.bindel();
       
    }
    // bind collections
    for (var i = 0; i < this.collections.length; i++) {
        var collectionEl = this.collections[i];
        var collectionFn = collectionEl.getAttribute("elcollection");
        var iter = collectionEl.getAttribute("eliterator");
        if (iter == null)
            iter = "i" + this.nestedData.length;
            var toremove = [];
       for(var j = 0; j < collectionEl.originalParent.childNodes.length; j++)
       {
           var node = collectionEl.originalParent.childNodes[j];
           if(node.isCollectionNode == true)
               toremove.push(node);
       }
       toremove.forEach((node)=>
       {
           collectionEl.originalParent.removeChild(node);
       });
      
       var scope =this.scope;
        var collection = this.eleval(collectionFn,collectionEl,null);
      
        if (collection == null) {
            console.warn("Elbind collection getter not defined: " + collectionFn);
            collection = [];
        }
        var collectionData = null;
        if(typeof(collection)=="function")
        {
            var pars = [collectionEl];

            var pars = this.buildPars(collectionEl,null);
            collectionData =  collection.apply(this.scope, pars);
         }
         else
            collectionData =  collection ;
            var len = collectionData.length;
        if(!collectionEl.itemMap)
            collectionEl.itemMap = {};
        for (var j = 0; j < len; j++) {
            var itemData = collectionData[j];

            var elwid = itemData;
            if(typeof itemData == "object")
            {
             if(itemData._elwireId == null)
                    itemData._elwireId = elwireKeySequence++;
                elwid = itemData._elwireId;
            }
            var itemNode = collectionEl.itemMap[elwid];
            
            if(itemNode == null)
            {
                 itemNode = collectionEl.cloneNode(true);
                 itemNode.isCollectionNode = true;
                
                 collectionEl.itemMap[itemData._elwireId] = itemNode;
                //itemData._itemEl = itemNode;
                var childElbind = new Elbind(null, this);
               
                childElbind.attach(itemNode);           
              
            } else
                toremove.removeElement(itemNode);
            if(itemNode.parentNode == null)
            {
                if(itemData.ord != null)
                collectionEl.originalParent.insertBefore(itemNode, collectionEl.originalParent.children[itemData.ord]);
                else
                    collectionEl.originalParent.appendChild(itemNode);
                itemNode.elbind.nestedData = [];
                itemNode.elbind.nestedData = this.nestedData.slice();
                Object.assign(itemNode.elbind.nestedDataMap,this.nestedDataMap);
                    
                itemNode.elbind.addNestedData(iter, itemData);
                if(!opts.doBindCallback || opts.doBindCallback(itemData,itemNode))
                    itemNode.elbind.bind();
                delete itemData._newItem;
            }
        }
       

        var after = collectionEl.getAttribute("elafter");
        if(after != null)
        {
            var val = this.eleval(after,collectionEl,null);
            if(typeof val === "function")
            {
             
              var pars = this.buildPars(collectionEl, [collectionEl.originalParent]);              
              val.apply(this.scope,pars);
            }
        }
    }
  
  


    return this;
}

Elbind.prototype.watches = {}

/**
* installs watch on model update
* @param watchmodel {String} the dot separated pat to property to watch
* @param callback {function} callback on change params are newval,oldval
*/
Elbind.prototype.watch  = function(watchmodel,callback)
{
    if(watchmodel.startsWith("scope."))
        watchmodel = watchmodel.replace("scope.","");
   if(!this.watches.hasOwnProperty(watchmodel))
       this.watches[watchmodel] = { name:watchmodel,watchers:[]}
   var watchspec = this.watches[watchmodel];
   var watcher = {callback: callback};
   if(watchspec.watchers.indexOf(callback) == -1 )
        this.watches[watchmodel].watchers.push(watcher);
    this.watchStack.push(()=>
    {
        this.watches[watchmodel].watchers.removeElement(watcher)
    })
    }

Elbind.prototype.assign = function(model,value,el)
{
    this.eleval("scope." + model + "= value",el,{'value':value});
}

Elbind.prototype.updateModelAssign = function(el,model,value,more)
{
    el._justAssign = true;
    this.updateModel(el,model,value,more);
    delete el._justAssign;
}
/**
 * Update model 
 * @param el element causing the update (editor of value)
 * @param model {string} locating model value in scope
 * @param value value to be set
 */
Elbind.prototype.updateModel = function(el,model,value,more)
{
    //console.warn("elbind.updateModel:" +namel(this.element),new Error());
    var wmodel  = model.startsWith("scope.") ? model.replace("scope.","") : model;
        
    var oldval = this.watches.hasOwnProperty(wmodel) ?  this.evalModel(model,el) : null;
   
    var scope = this.scope;
    var thiselbind = this;
    if(value == null)
        value = event.target.value.replace("\n","")
        try {
             var pars = thiselbind.buildPars(el,[oldval,value]);
            if(el.hasOwnProperty("_modelFunction") && !el._justAssign)            
                el._modelFunction.apply(scope,pars);                                   
            else
                this.assign(model,value,el)
            var bidi = el.getAttribute("elbidi");
            var onchange = el.getAttribute("elchange");
            
            if(bidi != null)
            {
                thiselbind.bind();
            }
            if(onchange!= null)
            {
                var fn = this.eleval(onchange,el,{ignoreSecPas:true});
             
                if(typeof fn == "function")
                {
                   
                    fn.apply(scope,pars);
                }
            }

             //fire watches
            if(this.watches.hasOwnProperty(wmodel))
            {
            
                var watchlist = this.watches[wmodel];
                watchlist.watchers.forEach(watcher=>
                    {
                        watcher.callback(value,oldval,scope);
                    });
            }
            if(scope.afterModelUpdate)
                scope.afterModelUpdate(this.scope);
        }catch(err)
        {
            console.warn("cannot evaluate model:"+model,err.stack);
           console.warn(err);
        }
    return
}


/**
 * evaluate model 
 * @param el element causing the update (editor of value)
 * @param model {string} locating model value in scope
 * @return mode value
 */
Elbind.prototype.evalModel = function(model,el)
{
    if(model == null)
        return;
  
    var scope = this.scope;
        try {
            if(!el.hasOwnProperty("_modelFunction"))
            {
                var val = this.eleval(model,el,null);
             
                if (val == undefined)
                    val = null;
                else
                    if(typeof val == "function")
                    {
                        el._modelFunction = val;
                        val = this.evalModel(model,el);
                    }
            }
            else
            {
                var modo = el._modelFunction;
                var pars=this.buildPars(el,[undefined,undefined]);
                val = modo.apply(scope,pars);                
            }
            return val;
        }catch(err)
        {
           // console.error("cannot evaluate model:"+model,err.stack);
            console.warn(err);
        }
    return
}

Elbind.prototype.removeSub = function(sub)
{
    this.subs.removeElement(sub);
}
Elbind.prototype.addSub= function(sub)
{
    if(this.subs.indexOf(sub) == -1)
        this.subs.push(sub);
}
Elbind.prototype.addNestedData = function (iter, nestedData) {
    var last = this.nestedDataMap[iter];
    if(last != null)
        this.nestedData.removeElement(last);
    this.nestedDataMap[iter] = nestedData;
    this.nestedData.unshift(nestedData);
    return this;
}
Elbind.prototype.setController= function(controller)
{
    this.controller = controller;
    this.wired = false;
   // this.prepared = false;
}

Elbind.prototype.onUnmount = function()
{
    if(!this.prepared)
        return;
    if(this.scope &&this.scope.onUnmount != null)
     this.scope.onUnmount();

     if(this.subs)
     {
        this.subs.forEach(sub=>
        {
            sub.elbind.onUnmount();
        });
    }
    else
    {
        console.warn("no sub array to unmount");
    }
    this.collections.forEach(col=>
    {
        if(col.elbind != null && col.elbind.onUnmount)
        col.elbind.onUnmount();
    });
   // this.element = null;
    this.widgets.forEach(sub=>
        {
            if(sub.elbind && sub.elbind.onUnmount)
                sub.elbind.onUnmount();
        });
}
Elbind.prototype.destroy = function()
{
    if(this.destroyed == true)
        return;
    
    this.destroyed = true;
    try
    {
    if(this.scope.onDestroy != null)
    this.scope.onDestroy();
    }
    catch(e)
    {
        console.exception(e)
    }
    this.watchStack.forEach(remvee=>
        {
            remvee();
        })
    this.subs.forEach(sub=>
    {
        if(sub.elbind != null)
        sub.elbind.destroy();
    });
    this.widgets.forEach(sub=>
        {
            if(sub.elbind != null)
            sub.elbind.destroy();
        });
    this.collections.forEach(col=>
    {
        for(key in col.itemMap)
        {
            if(col.itemMap[key].elbind != null)
         col.itemMap[key].elbind.destroy();
        }
    });
    if(this.element)
    {
        delete this.element.elbind;
        delete this.element.bindel;
    }
    this.element = null;
    this.subs = [];
    this.collections = [];
    this.nestedData = [];
    this.nestedDataMap = {};
    this.itemMap = null;
    if(this.scope.elbind)
    this.scope.elbind = null;
    this.scope = null;
    this.widgets = [];
    this.watches = {};
    
}
Elbind.prototype.onMount = function()
{
    if(!this.prepared)
        return;
    if(this.scope && this.scope.onMount != null)
        this.scope.onMount();
    this.subs.forEach(sub=>
        {
            sub.elbind.onMount();
        });
        this.widgets.forEach(sub=>
            {
                if(sub.elbind)
                sub.elbind.onMount();
            });
        this.collections.forEach(col=>
        {
            if(col.elbind)
            col.elbind.onMount();
        });
}
/**
 * Finds existing or creates new Elbind for DOM element specified by selector
 * @param {CSS selector} selector 
 */
Elbind.forSelector = function (selector, parent,controller) {
    if (parent == null)
        parent = document;
    var element = parent.querySelector(selector);
    return Elbind.forElement( element,controller);
}

Elbind.forElement = function ( element,controller,parentElbind) {
    if (!element.elbind)
        new Elbind(controller,parentElbind).attach(element);
    else
        element.elbind.setController(controller);
    return element.elbind;
}

Elbind.forUrl = function (url,controller,parentElbind) {
    var rv = new Promise((resolve,reject)=>
    {
        httpGet(url,function(data)
        {        
            var element = createElementFromHTML(data);
            if(controller == null)
                controller = (scope)=>{};
            Elbind.forElement(element,controller,parentElbind)
            resolve( element.elbind);
        })
    })
    return rv;
}
Elbind.forHtmlFromUrl = function (url,controller,parentElbind,parentElement) {
    var rv = new Promise((resolve,reject)=>
    {
        function createElbind(data)       
        {        
           var originalInnerHtml = parentElement.innerHTML;
            if(controller == null)
                controller = (scope)=>{};
            if(data != null)
                parentElement.innerHTML = data;
            Elbind.forElement(parentElement,
            function(scope)
            {
                scope.originalInnerHtml = originalInnerHtml;
                controller(scope);
            },parentElbind)
            resolve( parentElement.elbind);

        }
        if(url == null)
            createElbind(null);
        else
            httpGet(url,createElbind,true)
    })
    return rv;
}


Elbind.prototype.validate = function(protocol)
{
    if(protocol == null)
        protocol = [];
        if(this.scope.validate != null)
            this.scope.validate(protocol);
    this.subs.forEach(form=>
        {
           form.elbind.validate(protocol);
        })
        return protocol;
}

Elbind.widgets = {};
Elbind.registerWidget = function(id,opts)
{
    Elbind.widgets[id] = new ElWidget(opts);
 
}
Elbind.prototype.mount = function(name,opts)
{
    var mountE = this.element.querySelector('[elmount="'+name+'"]');
    if(mountE.elmount == null)
    {
        mountE.elmount = new ElMount(mountE,this,opts);
    }
    return mountE.elmount;
}

function ElApp(appController) {
    Elbind.bind(this)(appController);
    var initfn = function () {
        this.attach(document.body);
        this.bind();
        this.onResize();
    }.bind(this);
    if (document.readyState === 'complete')
        initfn();
    else 
        window.addEventListener('load', initfn);
    
    window.addEventListener('resize',this.onResize.bind(this));

    var obind = this.bind;
    this.bind = function(opts)
    {
        obind.bind(this)(opts);
    }
}

ElApp.install = function(appController)
{
    if(ElApp._instance == null)
        ElApp._instance = new ElApp(appController);
    return ElApp._instance;
}
var elem = document.documentElement;


ElApp.prototype.onResize = function()
{
    if(this.scope.onResize)
        this.scope.onResize();
}
Object.assign(ElApp.prototype, Elbind.prototype);


function ElMount(element,app,opts)
{
    this.element = element;
    element.elmount = this;    
    this.elapp = app;
    this.stack = [];
    this.opts = opts;
    if(!this.opts)
        this.opts = {};
}

ElMount.prototype.overlay = function(templateUrl,controller,parentElbind)
{
    var controller = parentElbind == null ? Elbind.findController(controller): parentElbind.findController(controller)
    var elmount = this;
   var promise = new Promise((resolve,reject)=>
    {

    if(controller == null)
        controller = function(scope) {};

        httpGet(templateUrl,function(text){
            var nodes = [];
            for(var i = 0; i <  this.element.childNodes.length; i++)
                    nodes.push( this.element.childNodes[i]);
            this.stack.push({ nodes: nodes,elbind: this.element.elbind });
            this.element.elbind.onUnmount();
            this.element.elbind.parentElbind.removeSub( this.element);
            this.element.innerHTML = text;

            var includes = this.element.querySelectorAll("[elinclude]");
            function getInclude(idx,cb)
            {
                if(idx >= includes.length)
                {
                    cb();
                    return;
                }
                var include = includes[idx];
                var url = include.getAttribute("elinclude");
                httpGet(url,function(htmls)
                {
                    // simple template context customization 
                    var replace = include.getAttribute("elreplace");
                    if(replace != null)
                    {
                        var replaceo = JSON.parse(replace)
                        for(let key in replaceo)
                        {
                            var replacement = replaceo[key]
                            htmls = htmls.replace(new RegExp(key,"g"),replacement);
                        }
                    }
                    include.innerHTML =htmls;
                    getInclude(idx+1,cb);
                });
            }
            function finishOverlay()
            {
                if(controller == null)
                    controller = function(scope) {};

                if(parentElbind == null)
                    parentElbind = this.element.elbind != null ?  this.element.elbind.parentElbind : this.elapp
                var elbind = new Elbind((scope)=>
                {
                    scope.goBack = function()
                    {
                        elmount.goBack();
                    }
                    controller(scope);
                },parentElbind);
               
                elbind.attach(this.element);
            //  this.element.elbind.parentElbind.addSub( this.element);
                this.element.elbind.parentElbind.bind();
                elbind.onMount();
                if(this.opts.onMount != null)
                    this.opts.onMount.bind(this)(elbind);
                resolve(elbind);
            }
            getInclude.bind(this)(0,finishOverlay.bind(this));
        }.bind(this),true);
    });
    return promise;
}

ElMount.prototype.goBack= function()
{
    if(this.stack.length == null)
        return;
    var elbind = null;
    var stackl = this.stack.length;
    if(stackl > 0)
    {
        this.element.elbind.onUnmount();
        this.element.elbind.destroy();
        var state = this.stack.pop();
        this.element.removeAllChildren();
        for(var i = 0; i < state.nodes.length; i++)
            this.element.appendChild(state.nodes[i]);
        
        state.elbind.attach(this.element);
      //  this.element.elbind.parentElbind.addSub( this.element);
        this.element.elbind.onMount();
        this.element.elbind.parentElbind.bind();
        elbind = state.elbind;
    }
    if(this.opts.onBack != null)
      this.opts.onBack.bind(this)(elbind);
      
      if(this.stack.length > 0)
      {  
    if(this.opts.onMount != null)
      this.opts.onMount.bind(this)(elbind);
}
    else if(this.opts.onEmpty != null )
      this.opts.onEmpty.bind(this)(elbind);
}

if(typeof module != "undefined")
{
    module.exports.Elbind = Elbind;
    module.exports.ElApp = ElApp;
    module.exports.ElMount = ElMount;
}
