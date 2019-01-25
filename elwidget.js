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
    scope.elbind.prepareData = function(scope)
    {
        var val = this.evalModel(scope._modelTemplate,scope.elbind.element);
        scope.setModel(val);       
    }
    scope.updateModel = function(val)
    {
        scope.elbind.updateModel( scope._modelTemplate,scope.elbind.element,val);
        scope.elbind.bind();
    }
    this.controller(scope);
}

function registerStdWidgets()
{
    Elbind.registerWidget("checkbox",
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
}