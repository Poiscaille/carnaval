
const Promise = require('bluebird');

class Mapping {
    constructor(Clazz) {
        this.Clazz = Clazz;
        this.namedCodecs = new Map();
        this.typedCodecs = new Map();
        this.props = {};
    }
    select(...keys) {
        if (!keys) {
            return this;
        }

        const props = this.Clazz.prototype.props || {};
        this.props = {};
        keys.forEach(key => {
            this.props[key] = props[key];
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
        return Promise.mapSeries(Object.keys(this.props), property => {
            const field = this.props[property];
            const type = this._getType(field);
            const namedCodec = this.namedCodecs.get(property);
            const typedCodec = this.typedCodecs.get(type);
            let codec;

            if (namedCodec) {
                codec = namedCodec;
                if (namedCodec.onType) {
                    this.typedCodecs.forEach((parentMapper, type) => {
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
            return iteratee(property, codec);
        });
    }
    _getType(field) {
        let type = field.type || field;
        if (Array.isArray(type)) {
            type = type[0];
        }
        return type;
    }
}

module.exports = Mapping;
