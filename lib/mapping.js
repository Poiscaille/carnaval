
const Promise = require('./promise-polyfill');

class Mapping {
    constructor(Clazz) {
        this.Clazz = Clazz;
        this.namedCodecs = new Map();
        this.typedCodecs = new Map();
        this.props = {};
        this.mapper = {};
    }
    select(...keys) {
        if (!keys) {
            return this;
        }

        const props = this.Clazz.prototype.props || {};
        this.props = {};
        keys.forEach(key => {
            if (typeof key === 'string') {
                this.props[key] = props[key];
            } else if (typeof key === 'object') {
                this.props[key.prop] = props[key.prop];
                this.mapper[key.prop] = key.mapped;
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
    _forEach(iteratee) {
        return Promise.map(Object.keys(this.props), prop => {
            const field = this.props[prop];
            const namedCodec = this.namedCodecs.get(prop);
            const typedCodec = this.typedCodecs.get(this._getItemType(field));
            let codec;

            if (namedCodec) {
                codec = namedCodec;
                if (namedCodec.onType) {
                    this.namedCodec.forEach((parentMapper, type) => {
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
            return iteratee(prop, this.mapper[prop] || prop, this._getType(field), codec);
        });
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
