
var moment = require("moment");

moment.toXmlString = function(m)
{
    var format = 'YYYY-MM-DDTHH:mm:ss';
    return m.format(format);
}


module.exports.moment = moment;