
class DescBuilder
{
    constructor(opts)
    {
        if(!opts)
            opts = {}
        this.opts = 
        {
            separator:", "
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
       if(cond)
        this.desc(val,prefix,opts,suffix);
        return this;
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
            return;
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
        if(this.pendingSeparator != null && !isEmpty(s) )
        {
            this.buildUp += this.pendingSeparator;
            delete this.pendingSeparator;
        }
    }
}

module.exports.DescBuilder = DescBuilder;