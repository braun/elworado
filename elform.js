var Elbind = require('./elwire.js').Elbind;
function ElForm(formController,parentElbind) {
    this.fields = {};
    this.validationRoundCallbacks = {}

    function formControllerWrapper(scope)
    {
        var element = scope.elbind.element;
        var name = element.getAttribute("name");
        if(!name)
             name = element.getAttribute("id");
        scope[name] = this;
        if(scope.form)
            this.parentForm = scope.form;
       if(!scope.forms)
           scope.forms = {};
        scope.forms[name] = this;
        scope.form = this;
        scope.oAfterModelupdate =scope.afterModelUpdate;
        scope.fireValidationRoundCallbacks = this.fireValidationRoundCallbacks.bind(this);
        scope.afterModelUpdate = function(pscope)
        {
            if(scope.oAfterModelupdate)
                scope.oAfterModelupdate(pscope);
            scope.fireValidationRoundCallbacks(pscope);
        }
        formController(scope);
    }
    Elbind.bind(this)(formControllerWrapper,parentElbind);   
     
}

Object.assign(ElForm.prototype, Elbind.prototype);

Elbind.elbindFactory.add(function(element,controller,parentElbind)
{
    if(element.tagName=="FORM")
        return new ElForm(controller,parentElbind);
    return null;
})
ElForm.prototype.bind = function(opts)
{
    Elbind.prototype.bind.bind(this)(opts);
    this.updateValiphores();
}
ElForm.prototype.setValidationRoundCallback = function(elem,cb)
{
    this.validationRoundCallbacks[elem] = cb;
}
ElForm.prototype.updateModel =  function(el,model,value,more)
{
    Elbind.prototype.updateModel.bind(this)(el,model,value,more)
   
}
ElForm.prototype.updateValiphores = function()
{
    if(this.scope.valiphores)
       this.scope.valiphores.forEach(v=>v.update());
}
ElForm.prototype.fireValidationRoundCallbacks = function()
{
     var vrcs = this.validationRoundCallbacks;
    this.validationRoundCallbacks = {};
    for(var key in vrcs)
    {
        let vrc = vrcs[key];
        vrc.bind(this)();
    }
   this.updateValiphores();
}

ElForm.prototype.getOrCreateField = function(field)
{
    if(this.fields[field] == null)
         this.fields[field] = {}
    return this.fields[field];
}

ElForm.prototype.setFieldDirty = function(field,dirty)
{
   
     this.getOrCreateField(field).dirty = dirty;
}
ElForm.prototype.updateValidity = function(el,validity)
{
    if(validity.valid)
        delete this.validityState.remove(el);
    else
        this.validityState.add(el);
    
        if(this.parentElbind != null && this.parentElbind.updateValidity != null)
            this.parentElbind.updateValidity(el,validity);

    if(this.scope.validityCallback)
        this.scope.validityCallback(el,validity.valid,validity);
}

ElForm.prototype.validate = function(invalidEls)
{
    if(invalidEls == null)
      invalidEls = [];
   
    var form = this.element;
    var valid = false;//item.controleProperties form.reportValidity();
    if(!valid)
    {
        var formLabel = this.getLabel();
        if(formLabel != null && formLabel != "")
            formLabel += " / ";

   
        this.subs.forEach(form=>
            {
               form.elbind.validate(invalidEls);
            })
            this.widgets.forEach(form=>
                {
                   form.elbind.validate(invalidEls);
                })
          if(this.element.elements == null)
            return;
        for(var i = 0; i < this.element.elements.length; i++)
        {
            var element = form.elements[i];
            element.checkValidity();
            var validity = element.validity;
            if(!validity.valid)
            {
                var label = element.enclosingElbind.getLabel();
                invalidEls.push({label:label,fullLabel: formLabel+label,element: element, elbind: form.elbind, validity: validity });
            }
            
        }
    }                   
        return invalidEls;
}
ElForm.prototype.focusInput = function(element)
{
     element.focus();
}
ElForm.prototype.getLabel = function()
{
    var labelel = this.element.querySelector("header");
    if(labelel == null)
        return "";
   var l = labelel.innerHTML;
   return l;
}

ElForm.prototype.validityState = {
    list:[],
    add: function(el)
    {
        if(this.list.indexOf(el) != -1)
            return;
        
        this.list.push(el);
    },
    remove: function(el)
    {

        var idx = this.list.indexOf(el);
        if(idx == -1)
            return;
        
        this.list.splice(idx,1);
    },
    isValid: function()
    {
        var valid = true;
        this.list.forEach((el)=>
            {
                
                valid &= el.validity.valid;
                
            });
        return valid;
    }
}

function ElFormField(element,controller,parentElbind) {
    
    Elbind.bind(this)(controller,parentElbind);
        this.attach(element);
}
Object.assign(ElFormField.prototype, ElForm.prototype);

ElFormField.prototype.getLabel = function()
{
    var labelel = this.element.querySelector("label");
    if(labelel == null)
        return "";
   var l = labelel.innerHTML;
   return l.replace(":","");
}
ElFormField.prototype.onInputChanged = function(el,model,value)
{
 
    el.checkValidity();
    var validity = el.validity;

    el.classList.toggle("invalid",!validity.valid);

    this.updateValidity(el,validity);

    
   Elbind.prototype.onInputChanged.bind(this)(el,model,value);

}

ElFormField.prototype.updateValidity = function(el,validity)
{
    if(validity.valid)
        delete this.validityState.remove(el);
    else
        this.validityState.add(el);
    
        if(this.parentElbind != null && this.parentElbind.updateValidity != null)
            this.parentElbind.updateValidity(el,validity);

    if(this.scope.validityCallback)
        this.scope.validityCallback(el,validity.valid,validity);
}
module.exports.ElForm = ElForm;
module.exports.ElFormField = ElFormField;
