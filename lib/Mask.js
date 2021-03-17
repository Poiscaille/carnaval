const Masker = require('./Masker');

class Mask {
    static cover(Clazz) {
        return new Masker(Clazz);
    }
}

module.exports = Mask;
