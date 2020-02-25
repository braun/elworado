ELVIRONMENT
===========
* concept telling us the javascript expression in attribute values have common variables in their executing closure
    * element -HTML element the expression is bound to
    * event - the event causing evaluation of the expression (click event for example)
    * elbind - current elbind object
    * scope   - actual ELWIRE scope
    * nested data - all nested collection control variables are defined (see __elcollection__ attribute)



ELWIRE HTML ATTRIBUTES
======================

* __elbind__ -  value scope function (element,bindoptions) called on binding phase - (re)popuplate the element with data from scope. Marks html element managed by elwire too
* __elwire__ -  business logic wiring the element into scope/elbind. called once in wiring phase. Marks html element managed by elwire too. value may be:
    * scope function (element,bindoptions)
    * object specifying wiring options as its fields:
        * __wire__ scope function (element,bindoptions) called once on wire phase. 
        * __bind__ scope function (element,bindoptions) called repeateldy on binding phase (see __elbind__ attribute)
* __elmodel__ - means scope data this element is bound to. value may be:
    * dot separated path to attribute in current scope (possible scope prefix) ex. "scope.name.first"
    * dot separated path to function in current scope. function is called:
        * without params in binding phase, actual value of model is returned by the function in this case
        * With actual model value as param in model update phase, return value is not required.
* __elaction__ - defines action on the element, Enter key on input, click on other element types
    * attribute value can be any javascript epression, __elvironment__ applies.
    * the hook scope._onElaction will be called before evaluating the expression
* __elid__ - sets to id of element to attribute value. field named to value of elid attribute is also created in actuals scope, containing reference to the enclosing HTML element
* __elparam__ sets additional param to binding/wiring/model functions __elvironment__ aplies
* __elshow__ boolean expression, evaluated in binding phsase, determines visibility of enclosing HTML element, __elvironment__ applies.
* __elcontroller__ marks border of subscrope/subelbind value is name of scope function or nothind, when no specific scope is needed, __elvironment__ applies.
* __elcollection__ and __eliterator__ clone of Html element enclosing the __elcollection__ will be created for each member of collection evaluated from __elcollection__ expression. This member will be available to the clined element as execution closure variable named by the __eliterator__ attribute. 
    * __elafter__ - this expression is evaluated after collection binding, __elvironment__ applies. if the expression evaluates to function, the function is executed
* __elwidget__ - see widgets
* __elbidi__ - bidirectional bindin. when set the bind method of element's  elbind is called in update model phase
* __elchange__ - This expression os executed on model update,__elvironment__ applies. if the expression evaluates to function, the function is executed.