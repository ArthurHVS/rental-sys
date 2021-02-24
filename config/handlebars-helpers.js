
module.exports = {
    purgatorio: function (born) {
        var m = new Date(born).getMonth()
        var d = new Date(born).getDate();
        return " " + d + "/" + m;
    },
    first_mf: function (num) {
        if (num == 0) {
            return true
        }
        else return false;
    },
    ten_based: function (num) {
        if (num % 10 == 0) {
            return true
        }        
    }
}