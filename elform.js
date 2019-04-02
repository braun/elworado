var Elbind = require('./elwire.js').Elbind;
function ElForm(formElement,formController,parentElbind) {
    
    Elbind.bind(this)(formController,parentElbind);   
        this.attach(formElement);
}
Object.assign(ElForm.prototype, Elbind.prototype);


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
