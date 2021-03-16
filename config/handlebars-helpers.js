module.exports = {
    purgatorio: function(born) {
        var m = new Date(born).getMonth()
        var d = new Date(born).getDate();
        return " " + d + "/" + m;
    },
    first_mf: function(num) {
        if (num == 0) {
            return true
        } else return false;
    },
    ten_based: function(num) {
        if (num % 10 == 0) {
            return true
        }
    },
    jsonMe: function(objeto) {
        return JSON.stringify(objeto)
    },
    strCut: function(str, str2) {
        if ((str.length + str2.length) > 24) {
            var strfinal = str.concat(' ', str2.substring(0, 12), '...')
            return strfinal;
        } else {
            return str + ' ' + str2;
        }
    },
    consoleMe: function(objeto) {
        console.log(objeto);
    }
}