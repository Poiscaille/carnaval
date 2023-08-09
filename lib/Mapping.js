const Mapper = require('./Mapper');

class Mapping {
    static map(Clazz) {
        return new Mapper(Clazz);
    }
}

module.exports = Mapping;
