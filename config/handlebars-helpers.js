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
    }
}