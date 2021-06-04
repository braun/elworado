
class DescBuilder
{
    constructor(opts)
    {
        if(!opts)
            opts = {}
        this.opts = 
        {
            separator:", ",
            arraySeparator:" ",
            defaultStyle:"text",
            defaultStackStyle:"stack"
        }
        Object.assign(this.opts,opts);
        this.buildUp = "";
        this.structure = [];
        this.curstack = this.structure;
        this.stack = [];
    }
    get isEmpty() {
        return this.buildUp.length == 0
    }

    push(style,opts)
    {
        style = style||this.opts.defaultStackStyle;
        if(!Array.isArray(style))
            style = [style];
        opts = opts||{};
        const stackn = []
        this.curstack.push({stack:stackn,style:style,opts:opts});
        this.stack.push(this.curstack);
        this.curstack = stackn;
        return this;
    }
    pop()
    {
        if(this.stack.length > 0)
            this.curstack = this.stack.pop();
           
        return this;
    }

    par(style,opts)
    {  
        style = style||this.opts.defaultStyle;
        if(!Array.isArray(style))
            style = [style];
        opts = opts||{};
           
        this.curstack.push({text:this.buildUp(),style:style,opts:opts})
        this.reset();
    }

    reset(val)
    {
        if(val == null)
            val = "";
        this.buildUp = val;
        return this;
    }
    desc(val,prefix,opts,suffix)
    {
      if(typeof opts == "string")
      {
      	const o = suffix;
      	suffix = opts;
      	opts = o;
      }
        if(Array.isArray(val))
        {
            var ib = new DescBuilder(this.opts);
        
            val.forEach(it=>
                {
                    ib.desc(it,null,opts,null).separe(this.opts.arraySeparator)
                })
                val = ib.build();
        }
        var s = describeValue(val,prefix,opts,suffix);
        this._putSeparator(s);
        this.buildUp += s;
        return this;
    }
   
    resetPending()
    {
        delete this.pendingSeparator;
    }
   descIf(cond,val,prefix,opts,suffix)
   {
       if(!cond)
            return this;
        var v = typeof val == "function" ? val(cond) : val;
        this.desc(v,prefix,opts,suffix);
        return this;
   }
   decode(code,arr,prefix,opts,suffix)
   {
       if(code == null || arr == null || arr.length <= code)
        return this;
    
       var it = arr[code];
       if(typeof it == "function")
            it = it(this);

        this.desc(it,prefix,opts,suffix);
        return this;
   }
   descEach(arr,describeFunc)
   {
       arr.forEach(v=>describeFunc.bind(this)(v,this));
       return this;
   }
   fork(cond,onTrue,onFalse)
   {
        if(cond && onTrue != null)
            onTrue.bind(this)(this);
        if(!cond && onFalse != null)
            onFalse.bind(this)(this);
        return this;
   }
   sep(separator)
   {
      return  this.separe(separator);
   }
    separe(separator)
    {
        if(separator == null)
            separator = this.opts.separator;
        this.pendingSeparator = separator;
    

        return this;
    }
    add(val)
    {
        if(val == null)
            return  this;
        this._putSeparator(val);
        this.buildUp += val;
        return this;
    }

    build()
    {
        return this.buildUp;
    }
    struct()
    {
        if(this.buildUp.length > 0)
            this.par();
        return this.struct();
    }
    transform(transformerCb,initv,stack)
    {
        stack = stack || this.structure;
        const rv = stack.reduce((prev,cur,idx,arr)=>
        {
        
                var tmprv = transformerCb(prev,cur,idx,arr)
                if(cur.stack)
                    tmprv = this.transform(transformerCb,tmprv,cur.stack);
                 tmprv = transformerCb(prev,cur,idx,arr)
                return tmprv;

        },initv);
        return rv;
    }
    _putSeparator(s)
    {
        if(this.pendingSeparator != null)
        {
            if(!isEmpty(s) && !isEmpty(this.buildUp))
               this.buildUp += this.pendingSeparator;
            delete this.pendingSeparator;
        }
    }
}

function DESC(txt)
{
    var rv =  new DescBuilder();
    if(txt)
        rv.reset(txt);
    return rv;
}

module.exports.DescBuilder = DescBuilder;
module.exports.DESC = DESC;