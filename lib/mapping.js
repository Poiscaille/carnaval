
const Promise = require('bluebird');

const Mapper = require('./mapper');

class Mapping extends Mapper {
    constructor(Clazz) {
        super();

        this.Clazz = Clazz;
        this.mappers = new Map();
        this.props = {};
    }
    select(...keys) {
        if (!keys) {
            return this;
        }

        const props = this.Clazz.prototype.props || {};
        keys.forEach(key => {
            this.props[key] = props[key];
        });
        return this;
    }
    selectAll() {
        const props = this.Clazz.prototype.props || {};
        return this.select(...Object.keys(props));
    }
    mapType(...mappers) {
        mappers = mappers || [];
        mappers.forEach(mapper => {
            this.mappers.set(mapper._mappingClazz(), mapper);
        });
        return this;
    }
    mapProperties(...mappers) {
        mappers = mappers || [];
        mappers.forEach(mapper => {
            Object.keys(mapper).forEach(key => {
                this.mappers.set(key, mapper[key]);
            });
        });
        return this;
    }
    _forEach(iteratee) {
        return Promise.mapSeries(Object.keys(this.props), property => {
            const field = this.props[property];
            const type = this._getType(field);
            const mapper = this.mappers.get(property) || this.mappers.get(type);
            if (Mapping.match(mapper)) {
                this.mappers.forEach((parentMapper, property) => {
                    if (property.constructor) {
                        mapper.mapType(parentMapper);
                    }
                });
            }
            return iteratee(property, mapper);
        });
    }
    _getType(field) {
        let type = field.type || field;
        if (Array.isArray(type)) {
            type = type[0];
        }
        return type;
    }
    _mappingClazz() {
        return this.Clazz;
    }
}

module.exports = Mapping;
