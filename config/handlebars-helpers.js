module.exports = {
    threeBased: function (l, options) {
        if (l % 3 == 0) {
            return true;
        }
        return false;
    },
    fiveBased: function (l, options) {
        if (l % 5 == 0) {
            return true;
        }
        return false;
    },
    truncate: function(brand, model, len){
        var bigStr = brand+" "+model;
        if (bigStr.length > len) {
            var new_str = bigStr.substr (0, len+1);

            while (new_str.length) {
                var ch = new_str.substr ( -1 );
                new_str = new_str.substr ( 0, -1 );

                if (ch == ' ') {
                    break;
                }
            }

            if ( new_str == '' ) {
                new_str = str.substr ( 0, len );
            }

            return new Handlebars.SafeString ( new_str +'...' ); 
        }
        return bigStr;
    }
}