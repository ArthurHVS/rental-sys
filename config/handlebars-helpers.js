
module.exports = {
    purgatorio: function (born) {
        var m = new Date(born).getMonth()
        var d = new Date(born).getDate();
        return " " + d + "/" + m;
    }
}