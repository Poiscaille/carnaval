
const Domain = require('./domain');

class Mapping {
    constructor(Clazz, props) {
        this.Clazz = Clazz;
        this.props = props;
        this.mappers = [];
    }
    forEach(iteratee) {
        this.props.forEach(property => {
            return iteratee(property, this.mappers[property]);
        });
    }
    mapWith(mappers) {
        this.mappers = mappers;
        return this;
    }
    encodeWith(encode) {
        this.encode = encode;
        return this;
    }
    decodeWith(decode) {
        this.decode = decode;
        return this;
    }
}

class MappingFactory {
    static pick(Clazz, ...props) {
        if (!(Clazz.prototype instanceof Domain)) {
            throw new Error('Clazz should be a Domain subclass');
        }

        return new Mapping(Clazz, props);
    }
    static pickAll(Clazz) {
        let props = Clazz.prototype.props || [];
        if (props) {
            props = Object.keys(props);
        }
        return MappingFactory.pick(Clazz, ...props);
    }
    static match(Clazz) {
        return Clazz instanceof Mapping;
    }
}

module.exports = MappingFactory;
