
const Domain = require('./domain');

class Mapping {
    constructor(Clazz, rules, encode, decode) {
        this.Clazz = Clazz;
        this.rules = rules;
        this.encode = encode;
        this.decode = decode;
    }
}

class MappingFactory {
    static of(Clazz) {
        if (!(Clazz.prototype instanceof Domain)) {
            throw new Error('Clazz should be a Domain subclass');
        }

        let rules;
        let encode;
        let decode;
        if (typeof arguments[1] === 'function') {
            encode = arguments[1];
            decode = arguments[2];
        } else {
            rules = arguments[1];
        }
        return new Mapping(Clazz, rules, encode, decode);

    }
    static match(Clazz) {
        return Clazz instanceof Mapping;
    }
}

module.exports = MappingFactory;
