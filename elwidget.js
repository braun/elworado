
var elwire = typeof require == "undefined" ? { } : require("./elwire");

function ElWidget(proto)
{
    this.url = null;
    this.controller = function(scope){}

    if(proto == null)
        proto = {}
    Object.assign(this,proto);
    if(this.url != null)
    httpGet(this.url,function(data)
    {
        proto._urlLoaded = true;
    },true);
}

ElWidget.prototype.controllerWrapper = function(scope)
{
    var attrs = {};
    if(this.attributes)
        this.attributes.forEach((atr)=>
        {
            let atval = scope.elbind.element.getAttribute(atr);
            if(atval)
                attrs[atr] = atval;
        });
    
    scope._modelTemplate = scope.elbind.element.getAttribute("elmodel");
    if(scope._modelTemplate == null)
        console.log.error("no elmodel set for widget");
    scope.elbind.prepareData = function(scope)
    {
        scope._modelTemplate = scope.elbind.element.getAttribute("elmodel");
        var val = this.evalModel(scope._modelTemplate,scope.elbind.element);
        scope.setModel(val);       
    }
    scope.updateModel = function(val,more)
    {
        scope.elbind.parentElbind.updateModel(scope.elbind.element, scope._modelTemplate,val,more);
        if(!scope.noElbindOnUpdateModel)
            scope.elbind.bind();
    }
    this.controller(scope,attrs);
}

function registerStdWidgets()
{ 
    if(elwire.Elbind == null)
        elwire.Elbind = Elbind;
       
        function checkboxController(scope)
        {       
            scope.setModel = function(val)
            {                
                    scope.checked = val == true;           
            }
            scope.doUpdateModel = function()
            {
                scope.updateModel(scope.checked);
            }
            //scope.elbind.aaa = scope.elbind.element.aaa = counter++;
            scope.check = function()
            {
                scope.checked = true;
               scope.doUpdateModel();
            }
            scope.uncheck = function()
            {
                scope.checked = false;
                scope.doUpdateModel();
                
            }
            scope.isChecked = function()
            {
             return scope.checked;   
            }
        }    
    elwire.Elbind.registerWidget("checkbox",
    {
        controller:checkboxController,
        url: 'elworado/elcheckbox.html'
    })
    Elbind.registerWidget("switch",
    {
            controller:checkboxController,        
            url: 'common/elswitch.html'
    })
    elwire.Elbind.registerWidget("select",
    {
        controller:function(scope)
        {       
          
            scope.setModel = function(val)
            {                
                    scope.checked = val == true;           
                    var element = this.elbind.element;
                    function onChange(event)
                    {
                        scope.doUpdateModel();
                    }
                    element.removeEventListener("change",onChange)
                    element.addEventListener("change",onChange);
                    var listname = element.getAttribute("elcodebook");
                    if(listname != null)
                    httpGet(listname,(list)=>
                    {
                        if(list == null)
                            return;
                        while (element.firstChild) 
                            element.removeChild(element.firstChild);
                    
                            scope.list = JSON.parse(list);
                            scope.map = {};
                    scope.list.forEach(item=>
                        {
                        ///    if(scope.listMap != null)
                        //        scope.listMap[item.value] = item.name;
                        numbervals &= isNaN(item.value);
                    });
                    scope.list.forEach(item=>
                        {
                           if(numbervals)
                            item.value = parseInt(item.value);
                            var option = document.createElement("option");
                            option.value = item.value;
                            option.innerHTML = item.name;

                            scope.map[item.value] = item;
                            if(val == item.value)
                                option.selected = "true";
                            
                                element.appendChild(option);
                        });
                        });
                    for(let i = 0; i < element.options.length;i++)
                    {
                        let option = element.options[i];
                        if(option.value == val)
                            option.selected = "true";
                    }
                   
            }
            scope.doUpdateModel = function()
            {
                var e = this.elbind.element;
                var selval = e.options[e.selectedIndex].value;
                var item = scope.map[selval];
                scope.updateModel(selval,item);
            }
            //scope.elbind.aaa = scope.elbind.element.aaa = counter++;
         
        },
        url:null
    })


elwire.Elbind.registerWidget("lov",
    {
    controller:function(scope)
    {       
        scope.selected = 0;
        scope.numbervals = true;

        scope.validate = function(invalidEls)
        {
            if(scope.elbind.element.getAttribute("required")== null)
                return;
            if(scope.curvalDesc != null && scope.curval != "")
                return;
            var label = scope.elbind.parentElbind.getLabel();
            var formLabel = scope.elbind.parentElbind.parentElbind.getLabel();
            if(formLabel != null && formLabel != "")
            formLabel += " / ";

            invalidEls.push({label:label,fullLabel: formLabel+label,element: scope.element, elbind: scope.elbind, validity: { valid: false} });
        }
        scope.keyHandler = function()
        {
            let c = event.key;
            if(c == "Tab")
            {
                var caps = event.getModifierState("CapsLock");
                var numl = event.getModifierState("NumLock");
                var inc = caps||numl ? -1 : 1;
                
                event.stopPropagation();
                event.preventDefault();
                scope.selected += inc;
                if(scope.selected > scope.list.length-1)
                    scope.selected = 0;
                if(scope.selected < 0)
                    scope.selected = scope.list.length-1;
                                
                scope.elbind.bind();
}
            if(c=="Escape")
            {
                event.stopPropagation();
                event.preventDefault();

                scope.toggleLov();
            }
            if(c=="Enter")
            {
                if(scope.selected >= scope.list.length || scope.selected < 0)
                 return;
                event.stopPropagation();
                event.preventDefault();
                var item = scope.list[scope.selected];
                scope.itemClicked(item);
            }

        }
       scope.wireList = function(el)
        {
           
        }

        scope.bindItem = function(el,it)
        {
            if(scope.selected >= scope.list.length || scope.selected < 0)
                return;
            let selit = scope.list[scope.selected];
            var isSelected = selit === it;
            if(isSelected)
            {
                el.scrollIntoView();            
                el.classList.add("selected")
            }else
                el.classList.remove("selected");
        }
      
        scope.setModel = function(val)
        {    
            if(scope.valmap == null)  
                scope.valmap = {};          
            scope.curval = val    
            scope.curvalDesc = val        
            var element = this.elbind.element;
            if(scope.list == null)
            {
                scope.list = [];
                var listname = element.getAttribute("elcodebook");
              
                httpGet(listname,(list)=>
                {
                    if(list != null)
                    {
                      scope.singleColumn = true;
                      scope.list = [];
                      scope.namemap = {};
                        let vlist = JSON.parse(list);  
                        vlist.forEach(it=>
                            {
                                var existing = scope.namemap[it.name];
                                if(existing != null && existing.value == it.value)
                                    return;
                                scope.namemap[it.name] = it;
                                scope.list.push(it);
                                scope.valmap[it.value] = it;
                                scope.singleColumn = (it.value == it.name);
                                scope.numbervals &= !isNaN(it.value);
                           })
                            if(scope.numbervals)
                            vlist.forEach(it=>
                                {
                                    it._vali = parseInt(it.value);
                                });
                            scope.sort="valup"                 ;
                            scope.resort();
                    }
                    scope.buildCurvalDesc();
                    scope.elbind.bind();
                });                            
            } else
            scope.buildCurvalDesc();
           
        }
        scope.isSingleColumn = function()
        {
            return scope.singleColumn;
        }
        scope.buildCurvalDesc = function()
        {
            var val = scope.curval;
            let it = scope.valmap[val];
            if(it != null)
            {
                scope.curvalDesc = val + " - " +it.name;
            }
        }
        scope.bindSelected = function(el,item)
        {
            var selected = scope.isSelected(item);
            el.setVisible(selected);
        }
        scope.isSelected = function(item)
        {
            return scope.curval == item.value;
        }
        scope.bindHeader = function(el)
        {
            if(el.classList.contains("edited"))
                el.classList.remove("edited");
        }
        scope.doUpdateModel = function(item)
        {
          
            var selval = item.value;
            
            scope.updateModel(selval);
        }
        //scope.elbind.aaa = scope.elbind.element.aaa = counter++;
     
        scope.showPopup = false;
        scope.toggleLov = function()
        {
            scope.showPopup = !scope.showPopup;
            if(scope.showPopup)
                document.addEventListener("keydown",scope.keyHandler);        
            else
                document.removeEventListener("keydown",scope.keyHandler);

            scope.elbind.bind();
        }
        scope.itemClicked = function(item)
        {
            document.removeEventListener("keydown",scope.keyHandler);
            scope.showPopup = false;
            scope.doUpdateModel(item);
            scope.elbind.bind();
        }
        scope.sortByName = function()
        {
            if(scope.sort == "nameup")
                scope.sort = "namedown"
            else
                scope.sort = "nameup";
            scope.resort();
        }
        scope.sortByCode = function()
        {
            if(scope.sort == "valup")
                scope.sort = "valdown"
            else
                scope.sort = "valup";
            scope.resort();
        }
        scope.resort = function()
        {
            if(scope.list == null)
                return;

                var column = "name";

                if(scope.sort.startsWith("val"))
                  column = "value";

                  var order = 1;
                if(scope.sort.endsWith("down"))
                  order = -1;
            if(column == "value" && scope.numbervals)
                column = "_vali"
         
            scope.list.sort((item1,item2)=>
            {
                if (item1[column] < item2[column])
                return -1*order;
              if ( item1[column] > item2[column])
                return 1*order;
              return 0;
            });
           for(var i = 0; i < scope.list.length; i++)
                {
                    var it = scope.list[i];
                    if(it.value == scope.curval)
                    {
                        scope.selected = i;
                        break;
                    }
                };
            scope.elbind.bind();
        }
    },
    url:'WebJoust/ellov.html'
})
}

if(typeof module != "undefined")
module.exports = { registerStdWidgets: registerStdWidgets,ElWidget:ElWidget }
