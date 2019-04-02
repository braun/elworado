var elwire = require("./elwire");

function ElWidget(proto)
{
    this.url = null;
    this.controller = function(scope){}

    if(proto == null)
        proto = {}
    Object.assign(this,proto);
    httpGet(this.url,function(data)
    {
        proto._urlLoaded = true;
    },true);
}

ElWidget.prototype.controllerWrapper = function(scope)
{
    scope._modelTemplate = scope.elbind.element.getAttribute("elmodel");
    if(scope._modelTemplate == null)
    log.error("no elmodel set for widget");
    scope.elbind.prepareData = function(scope)
    {
        var val = this.evalModel(scope._modelTemplate,scope.elbind.element);
        scope.setModel(val);       
    }
    scope.updateModel = function(val)
    {
        scope.elbind.updateModel(scope.elbind.element, scope._modelTemplate,val);
        scope.elbind.bind();
    }
    this.controller(scope);
}

function registerStdWidgets()
{ 
    elwire.Elbind.registerWidget("checkbox",
    {
        controller:function(scope)
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
        },
        url: 'WebJoust/elcheckbox.html'
    })

    elwire.Elbind.registerWidget("select",
    {
        controller:function(scope)
        {       
          
            scope.setModel = function(val)
            {                
                    scope.checked = val == true;           
                    var element = this.elbind.element;
                    element.addEventListener("change",(event)=>
                    {
                        scope.doUpdateModel();
                    });
                    var listname = element.getAttribute("elcodebook");
                    httpGet(listname,(list)=>
                    {
                        if(list == null)
                            return;
                        while (element.firstChild) 
                            element.removeChild(element.firstChild);
                    
                            scope.list = JSON.parse(list);
                            
                    scope.list.forEach(item=>
                        {
                        ///    if(scope.listMap != null)
                        //        scope.listMap[item.value] = item.name;
                            var option = document.createElement("option");
                            option.value = item.value;
                            option.innerHTML = item.name;
                            if(val == item.value)
                                option.selected = "true";
                            
                                element.appendChild(option);
                        });
                    })
                   
            }
            scope.doUpdateModel = function()
            {
                var e = this.elbind.element;
                var selval = e.options[e.selectedIndex].value;
                scope.updateModel(selval);
            }
            //scope.elbind.aaa = scope.elbind.element.aaa = counter++;
         
        },
        url:null
    })
}


module.exports = { registerStdWidgets: registerStdWidgets,ElWidget:ElWidget }