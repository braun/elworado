
function ElChest()
{
    this.classes = {};
  this.partitions = {};
}
ElChest.prototype.addClass = function(classId,docclass,defaultClass)
{
    this.classes[classId] = docclass;
    if(defaultClass == true)
      this.defaultClass = classId;
}
ElChest.prototype.applyClassMethod = function(doc,methodName,pars)
{
    var cl = null;
    if(typeof(doc) == "string")
    {
        cl = doc;
        doc = null;
    }
    
    if(cl == null)
            cl = doc == null ? this.defaultClass : doc.classId;
     if(cl == null)
       cl = this.defaultClass;

    if(cl == null)
        return;
    
    var docclass = this.classes[cl];
    if(docclass == null)
        return;
    
    var method = docclass[methodName];
    if(method == null)
        return;

    return method.apply(doc == null ? cl : doc,pars);
}

ElChest.prototype.addPouch = function(pouch)
{
    this.partitions[pouch.id] = pouch;
    pouch.chest = this;
    return this;
}
ElChest.prototype.getDocument = function(partition,docid,create)
{
    if(!this.partitions.hasOwnProperty(partition))
    {
        
        var rv = new Promise((resolve,reject)=>
        {
             reject({ status: 404, message: "No such partition"});
        });
        return rv;
    }

   if(typeof(create) == "boolean" && create == true)
   {
        create = this.partitions[partition].defaultClass;
        if(create == null)
            create = this.defaultClass;
   }
    var rv = this.partitions[partition].getDocument(docid,create);
    return rv;
}

ElChest.prototype.destroy = function()
{
    var keys = Object.keys(this.partitions);
    var parts = this.partitions;
    var i = 0;
    var chest = this;
    function destroyNext()
    {
        if(i == keys.length)
        {
            chest.showInfo("Data smazána");
            return;
        }
        var part = parts[keys[i++]];
        part.destroy().then(()=>
        {
           destroyNext(); 
        }).catch(()=>
        {
            chest.showInfo("Nepodařilo se smazat data");
        });
    }
    destroyNext();
   
}
function ElPouch(id,proto)
{
    this.defaultClass = id;
    if(proto != null)
        Object.assign(this,proto);
    this.id = id;
    if(this.formatDbId == null)
        this.formatDbId = formatDbId;
    this.pouch = new PouchDB(id,this.pouchoptions);
}

ElPouch.prototype.newDocument = function(classId,idbase)
{
    if(classId == null)
        classId  = this.defaultClass;
    var id = this.chest.applyClassMethod(classId,"createDocumentId",[idbase]);
   
    var doc = { _id: id , classId: classId, created: new Date() };
    return doc;
}
ElPouch.prototype.getDocument = function(id,classId)
{
   
   var promise = new Promise((resolve,reject)=>
   {   
           this.pouch.get(id).then((doc)=>
           {             
               resolve(doc);
           }).catch(err=>
           {                      
               if(err.status == 404 && classId != null)
               {
                   resolve(this.newDocument(classId,id));
                   return;
               }
               console.error("getDocument failed: " + id);
               console.error(err);
              // this.chest.applyClassMethod(doc,"onGetDocumentFailed");
               reject(err);
           });
       })
       return promise;
}
ElPouch.prototype.saveDocument = function(doc)
{
    var promise = new Promise((resolve,reject)=>
    {

        this.pouch.put(doc).then((res)=>
        {
            doc._rev = res.rev;
            this.chest.applyClassMethod(doc,"onSave");
            resolve(doc);
        }).catch(err=>
        {                      
            console.error("saveDocument failed: " + id);
            console.error(err,doc);
            this.chest.applyClassMethod(doc,"onSaveFailed");
            reject(err);
        });
    })
    return promise;
}

ElPouch.prototype.listDocuments = function()
{
    var rv = new Promise((resolve,reject)=>
    {
        this.pouch.allDocs({
            include_docs: true,
            limit: 10,
            descending: true
        }).then(function (res) {
            var rv = [];
            for(var i = 0; i < res.rows.length; i++)
                    rv.push(res.rows[i].doc);
            resolve(rv);
        }).catch((err)=>
        {
            reject(err);
        });
    
    });
    return rv;
}
ElPouch.prototype.destroy = function()
{
    var rv = new Promise((resolve,reject)=>
    {
        this.pouch.destroy().then(function (response) {
            resolve(response);
        }).catch(function (err) {
            console.log(err);
            reject(err);
        });
    });
    return rv;
}
var formatDbId= function(prefix)
{
    var rv = "";
    var rnd = Math.random()*0x10000;
    var dates = moment().format("YYMMDDHHmmSS");
    if(prefix != null)
        rv = prefix + "_";
    rv += dates;
    rv+= "_"+rnd.toFixed(0);
    return rv;
};