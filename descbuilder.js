
class DescBuilder
{
    constructor(opts)
    {
        if(!opts)
            opts = {}
        this.opts = 
        {
            separator:", ",
            arraySeparator:" "
        }
        Object.assign(this.opts,opts);
        this.buildUp = "";
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
            return this;
        this._putSeparator(val);
        this.buildUp += val;
        return this;
    }

    build()
    {
        return this.buildUp;
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