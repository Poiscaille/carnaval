
const Promise = require('./promise-polyfill');

class Mapping {
    constructor(Clazz) {
        this.Clazz = Clazz;
        this.namedCodecs = new Map();
        this.typedCodecs = new Map();
        this.props = {};
        this.mappers = {};
    }
    select(...keys) {
        if (!keys) {
            return this;
        }

        const props = this.Clazz.prototype.props || {};
        this.props = {};
        keys.forEach(key => {
            const field = props[key] || {};
            const type = this._getItemType(this._getType(field));

            if (typeof key === 'string') {
                this.props[key] = props[key];
                this.mappers[key] = {
                    type: type,
                    mapped: key,
                    encoded: true,
                    decoded: true
                };
            } else if (typeof key === 'object') {
                this.props[key.prop] = props[key.prop];
                this.mappers[key.prop] = {
                    type: type,
                    mapped: key.mapped || key.prop,
                    encoded: key.encoded !== false,
                    decoded: key.decoded !== false
                };
            }
        });
        return this;
    }
    selectAll() {
        const props = this.Clazz.prototype.props || {};
        return this.select(...Object.keys(props));
    }
    onType(type, codec) {
        this.typedCodecs.set(type, codec);
        return this;
    }
    onProp(prop, codec) {
        this.namedCodecs.set(prop, codec);
        return this;
    }
    forEach(iteratee) {
        return Promise.map(Object.keys(this.props), prop => {
            const mapped = this.mappers[prop];
            const namedCodec = this.namedCodecs.get(prop);
            const typedCodec = this.typedCodecs.get(mapped.type);
            let codec;

            if (namedCodec) {
                codec = namedCodec;
                if (namedCodec.onType) {
                    this.namedCodecs.forEach((parentMapper, type) => {
                        namedCodec.onType(type, parentMapper);
                    });
                }
            } else if (typedCodec) {
                codec = typedCodec;
                if (typedCodec.onType) {
                    this.typedCodecs.forEach((parentMapper, type) => {
                        typedCodec.onType(type, parentMapper);
                    });
                }
            }
            return iteratee(prop, this.mappers[prop], codec);
        });
    }
    _pick(object, ...keys) {
        if (!object || !keys) {
            return;
        }

        const picked = {};
        keys.forEach(key => {
            picked[key] = object[key];
        });
        return picked;
    }
    _getType(field) {
        return field.type || field;
    }
    _getItemType(field) {
        let type = field.type || field;
        if (Array.isArray(type)) {
            type = type[0];
        }
        return type;
    }
}

module.exports = Mapping;
