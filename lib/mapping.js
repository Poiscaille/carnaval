
const Promise = require('bluebird');

class Mapping {
    constructor(Clazz, props) {
        this.Clazz = Clazz;
        this.props = props;
        this.mappers = new Map();
    }
    mapProperties(iteratee) {
        return Promise.mapSeries(Object.keys(this.props), property => {
            const field = this.props[property];
            const type = this._getType(field);
            const mapper = this.mappers.get(property) || this.mappers.get(type);
            if (Mapping.match(mapper)) {
                this.mappers.forEach((parentMapper, property) => {
                    if (property.constructor) {
                        mapper.mapWith(parentMapper);
                    }
                });
            }
            return iteratee(property, mapper);
        });
    }
    mapWith(...mappers) {
        mappers = mappers || [];
        mappers.forEach(mapper => {
            if (Mapping.match(mapper)) {
                this.mappers.set(mapper.Clazz, mapper);
            } else {
                Object.keys(mapper).forEach(key => {
                    this.mappers.set(key, mapper[key]);
                });
            }
        });
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
    _getType(field) {
        let type = field.type || field;
        if (Array.isArray(type)) {
            type = type[0];
        }
        return type;
    }
    static match(Clazz) {
        return Clazz instanceof Mapping;
    }
}

class MappingFactory {
    static pick(Clazz, ...keys) {
        keys = keys || [];

        const picked = {};
        const props = Clazz.prototype.props || {};

        keys.forEach(key => {
            picked[key] = props[key];
        });

        return new Mapping(Clazz, picked);
    }
    static pickAll(Clazz) {
        let props = Clazz.prototype.props || {};
        if (props) {
            props = Object.keys(props);
        }
        return MappingFactory.pick(Clazz, ...props);
    }
    static match(Clazz) {
        return Mapping.match(Clazz);
    }
}

module.exports = MappingFactory;
