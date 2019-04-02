var ElWidget = require("./elwidget").ElWidget;
/**
 * simple DOM binding library
 */

function Elbind(controller, parentElbind) {
    this.controller = controller;
    this.nestedData = [];
    this.nestedDataMap = {};
    if (parentElbind) {
        this.parentElbind = parentElbind;
        this.nestedData = parentElbind.nestedData.slice();
        //  Object.assign(this.nestedDataMap,parentElbind.nestedDataMap);
    }

}

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
    this.prepared = true;

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
    this.widgets = Array.prototype.slice.call(this.element.querySelectorAll("[elwidget]"));
    for (var i = 0; i < this.widgets.length; i++) {
        var sub = this.widgets[i];
        sub.originalParent = sub.parentNode;
      //  sub.parentNode.removeChild(sub);

    }

    this.mounts = this.element.querySelectorAll("[elmount]");
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

   var colls = this.element.querySelectorAll("[elcollection]");
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

}


Elbind.prototype.onInputChanged = function(el,model,value,event)
{
    
    this.updateModel(el,model,value);
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
                var model = el.getAttribute("elmodel");                
                if (model != null) {
                    
                   
                    try {              
                        // autowire (bidirectional) input
                        if (el.tagName == "INPUT" || el.tagName == "TEXTAREA") {           
                          
                            el.addEventListener("input",function(event)
                            {
                                thiselbind.onInputChanged(el,model,event.target.value,event);
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
                    var elbind = this;
                    function doaction(event) {
                        var element = el;
                        for(var it in elbind.nestedDataMap)
                            {
                                var itv = elbind.nestedDataMap[it];
                                eval("var "+it+" = itv");
                            }
                       if(scope._onElAction != null)
                            scope._onElAction(event);
                        eval(elaction);
                    }
                    if(el.tagName == "INPUT" || el.tagName == "TEXTAREA")
                    {
                        el.addEventListener("keyup", function(event) {                          
                            event.preventDefault();                           
                            if (event.keyCode === 13) {
                             doaction();
                            }
                          });
                    }
                    else
                     el.onclick = doaction;
                }
              
               
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
            var elparval = eval(elpar);
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
/**
 * binds the controller data to DOM elements
 */
Elbind.prototype.bind = function (rebuildScope) {
    //this.scope._phase = "prepare";
    if (!this.prepared)
        this.prepare();
   
    if (this.scope == null || rebuildScope) {
        this.scope = this.parentElbind != null ? Object.create(this.parentElbind.scope) : {};
        this.scope.elbind = this;

        for (var i = 0; i < this.bindEls.length; i++) {
            var el = this.bindEls[i];
            //set id
            var id = el.getAttribute("elid");
            if(id != null)
            {
                this.scope[id] = el;
            }  
        }
        this.scope._phase = "build";
        if (this.controller)
            this.controller(this.scope);
    }
   

    this.wire();
    this.scope._phase = "bind";
    if (Object.keys(this.nestedDataMap).length > 0)
        Object.assign(this.scope, this.nestedDataMap);

    if(this.prepareData)
        this.prepareData(this.scope);
  // bind own elements
  for (var i = 0; i < this.bindEls.length; i++) {
    var it = this.bindEls[i];

    function bindEl(it) {
        var fn = it.getAttribute("elbind");          
                                     
        // bind  to model autowired element
        var model = it.getAttribute("elmodel");
        if (model != null) {
            if(it.elbind == null)
             { // dont set model on sub elbind (widget)
                var scope = this.scope;
                try {
                    var val = eval("scope." + model);
                    if (val == undefined)
                        val = null;
                    // autowire (bidirectional) input                
                    if (it.tagName == "INPUT" || it.tagName == "TEXTAREA") 
                        it.value = val;                        
                    else if(it.tagName == "IMG")
                        it.src = val;
                    else
                        it.innerHTML = val;
                } catch (err) {
                    console.debug(err);
                }
            }
        }

        // check element visibility
        var show = it.getAttribute("elshow");
        if (show != null) {
            var scope = this.scope;
            scope.scope = scope;
            try
            {
            var val = eval("scope." + show);
            it.setVisible(val);
            }
            catch(error)
            {
                console.error(error.stack);
            }
        }
        it.enclosingElbind = this;
        var pars = [it];

        // eval bind parameter
        var elpar = it.getAttribute("elparam");            
        if (elpar != null) {
            var scope = this.scope;
            var elparval = eval(elpar);
            pars.push(elparval);

        }
      
        // run bind function
        pars = pars.concat(this.nestedData);
        if (fn != null && fn !== "") {
            var elb = this.scope[fn];
            if (elb == null)
                console.error("Elbind binding function not defined: " + fn);
            else
           
              elb.apply(this.scope, pars);
         
        }
        var pre = it.getAttribute("elwire");           
                if (pre != null) {
                    var pars=this.buildPars(it);
                    var elw= this.scope[pre];                    
                    if(elw != null && typeof elw === "object")                       
                    {
                        if(elw.wire == null)
                            console.error("Elbind prepare function not defined in wire object " + pre);
                        else
                            elw.bind.apply(this.scope, pars);
                    }
                }
      
    }
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
            var subc = subEl.getAttribute("elcontroller");
            var controller = subc == null ? function(scope){} : eval(subc);
            var childElbind = new Elbind(controller, this);
            childElbind.attach(subEl);
           // subEl.originalParent.appendChild(subEl);
        }
        subEl.elbind.bind();
    }
    // bind widgets
    var scope = this.scope;
    for (var i = 0; i < this.widgets.length; i++) {
        var subEl = this.widgets[i];
        function fn(subEl)
        {
            if (subEl.elbind == null) {
               
                var widgetid = subEl.getAttribute("elwidget");
                var wtemplate = Elbind.widgets[widgetid];
                if(wtemplate == null)
                {
                    console.error("widget with id: "+widgetid+" not found!");
                    return;
                }
                var controller = wtemplate.controllerWrapper.bind(wtemplate);     
                if(wtemplate.url == null)     
                    Elbind.forElement(subEl,controller,this).bind();            
                else
                Elbind.forHtmlFromUrl(wtemplate.url,controller,this,subEl).then(childElbind=>{
                    childElbind.bind();
                })
                        
            // subEl.originalParent.appendChild(subEl);
            } else
             subEl.elbind.bind();
        }
        fn.bind(this)(subEl);
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
        var collection = this.scope[collectionFn];
        if(collection == null)
            collection = eval("scope."+collectionFn);
        if (collection == null) {
            console.error("Elbind collection getter not defined: " + collectionFn);
            continue;
        }
        var collectionData = null;
        if(typeof(collection)=="function")
        {
            var pars = [collectionEl];

            // eval bind parameter
            var elpar = collectionEl.getAttribute("elparam");            
            if (elpar != null) {
                var scope = this.scope;
                var elparval = eval(elpar);
                pars.push(elparval);

            }
          
            // run bind function
            pars = pars.concat(this.nestedData);
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
                childElbind.addNestedData(iter, itemData);
            } else
                toremove.removeElement(itemNode);
            if(itemNode.parentNode == null)
            {
                if(itemData.ord != null)
                collectionEl.originalParent.insertBefore(itemNode, collectionEl.originalParent.children[itemData.ord]);
                else
                    collectionEl.originalParent.appendChild(itemNode);
                itemNode.elbind.bind();
            }
        }
       

        var after = collectionEl.getAttribute("elafter");
        if(after != null)
        {
            if(this.scope[after] == null)
              console.error("Elbind after function not defined: " + collectionFn);  
              var pars = [collectionEl.originalParent];
              pars = pars.concat(this.nestedData);  
            this.scope[after].apply(this.scope,pars);
        }
    }
  
  


    return this;
}
Elbind.prototype.updateModel = function(el,model,value)
{
    var scope = this.scope;
    var thiselbind = this;
        try {
            if(scope.hasOwnProperty("_modelFunction"))
            {
                scope._modelFunction.apply(scope,this.buildPars(el,[value]));
                return;
            }
            
            var bidi = el.getAttribute("elbidi");
            var onchange = el.getAttribute("elchange");
            eval("scope." + model + "='" + event.target.value.replace("\n","") + "'");
            if(bidi != null)
            {
                thiselbind.bind();
            }
            if(onchange!= null)
            {
                var fn = scope[onchange];
                if(fn == null)
                {
                    console.error("Method: "+onchange+" not found in scope");
                    return;
                }
                var pars = thiselbind.buildPars(el,[event.target.value]);
                fn.apply(scope,pars);
            }
        }catch(err)
        {
            console.warn("cannot evaluate model:"+model,err.stack);
           console.warn(err);
        }
    return
}
Elbind.prototype.evalModel = function(model,el)
{
    if(model == null)
        return;
  
    var scope = this.scope;
        try {
            if(!scope.hasOwnProperty("_modelFunction"))
            {
                for(var it in this.nestedDataMap)
                {
                    var itv = this.nestedDataMap[it];
                    eval("var "+it+" = itv");
                }
                var val = undefined;
                try {
                    val = eval( model);
                }
                catch(e){}
                if (val == undefined)
                try {
                    val = eval("scope."+model);
                }
                catch(e){}
             
                if (val == undefined)
                    val = null;
                else
                    if(typeof val == "function")
                    {
                        scope._modelFunction = val;
                        val = this.evalModel(model,el);
                    }
            }
            else
                val = scope._modelFunction.apply(scope,this.buildPars(el,[undefined]));
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
    this.nestedDataMap[iter] = nestedData;
    this.nestedData.unshift(nestedData);
    return this;
}
Elbind.prototype.setController= function(controller)
{
    this.controller = controller;
    this.wired = false;
}

Elbind.prototype.onUnmount = function()
{
    if(this.scope.onUnmount != null)
     this.scope.onUnmount();

    this.subs.forEach(sub=>
    {
        sub.elbind.onUnmount();
    });
    this.collections.forEach(col=>
    {
        col.elbind.onUnmount();
    });
    this.element = null;
    this.widgets.forEach(sub=>
        {
            sub.elbind.onUnmount();
        });
}
Elbind.prototype.destroy = function()
{
    if(this.destroyed == true)
        return;
    
    this.destroyed = true;
    if(this.scope.onDestroy != null)
    this.scope.onDestroy();

    this.subs.forEach(sub=>
    {
        sub.elbind.destroy();
    });
    this.widgets.forEach(sub=>
        {
            sub.elbind.destroy();
        });
    this.collections.forEach(col=>
    {
        for(key in col.itemMap)
        {
         col.itemMap[key].elbind.destroy();
        }
    });
    this.element = null;
    this.subs = [];
    this.collections = [];
    this.nestedData = [];
    this.nestedDataMap = {};
    this.itemMap = null;
    this.scope.elbind = null;
    this.scope = null;
    this.widgets = [];
    
}
Elbind.prototype.onMount = function()
{
    this.subs.forEach(sub=>
        {
            sub.elbind.onMount();
        });
        this.widgets.forEach(sub=>
            {
                sub.elbind.onMount();
            });
        this.collections.forEach(col=>
        {
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
        httpGet(url,function(data)
        {        
           var originalInnerHtml = parentElement.innerHTML;
            if(controller == null)
                controller = (scope)=>{};
            parentElement.innerHTML = data;
            Elbind.forElement(parentElement,
                function(scope)
                {
                    scope.originalInnerHtml = originalInnerHtml;
                    controller(scope);
                },parentElbind)
            resolve( parentElement.elbind);

        },true)
    })
    return rv;
}


Elbind.prototype.validate = function(protocol)
{
    if(protocol == null)
        protocol = [];
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

}
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
            this.element.elbind.parentElbind.addSub( this.element);
            this.element.elbind.parentElbind.bind();
            if(this.opts.onMount != null)
                this.opts.onMount.bind(this)(elbind);
            resolve(elbind);
        }.bind(this),true);
    });
    return promise;
}

ElMount.prototype.goBack= function()
{
    if(this.stack.length == null)
        return;
    var elbind = null;
    if(this.stack.length > 0)
    {
        this.element.elbind.onUnmount();
        this.element.elbind.destroy();
        var state = this.stack.pop();
        this.element.removeAllChildren();
        for(var i = 0; i < state.nodes.length; i++)
            this.element.appendChild(state.nodes[i]);
        
        state.elbind.attach(this.element);
        this.element.elbind.parentElbind.addSub( this.element);
        this.element.elbind.onMount();
        this.element.elbind.parentElbind.bind();
        elbind = state.elbind;
    }
    if(this.opts.onBack != null)
      this.opts.onBack.bind(this)(elbind);
    if(this.opts.onMount != null)
      this.opts.onMount.bind(this)(elbind);
}

module.exports.Elbind = Elbind;
module.exports.ElApp = ElApp;
module.exports.ElMount = ElMount;