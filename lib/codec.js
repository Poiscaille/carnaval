
const Mapping = require('./mapping');
const Mapped = require('./mapped');

class Codec {
    constructor(mapping) {
        this.mapping = mapping;
    }
    encode(object) {
        let result = {};

        if (this.mapping.encode) {
            result = this.mapping.encode(object);
            Object.keys(result).forEach(property => {
                if (Mapping.match(result[property])) {
                    result[property] = new Codec(result[property]).encode(object[property]);
                }
            });
        } else {
            this.mapping.forEach((property, mapper) => {
                const value = object && object[property];
                const mapped = new Mapped(value, mapper);
                result[property] = this._encodeProperty(value, mapped);
            });
        }
        return result;
    }
    _encodeProperty(value, mapped) {
        let encoded;
        if (mapped.isArray()) {
            encoded = value.map(item => this._encodeProperty(item, mapped.array()));
        } else if (mapped.isMapping()) {
            encoded = new Codec(mapped.mapping()).encode(value);
        } else {
            encoded = mapped.encode(value);
        }
        return encoded;
    }
    decode(json) {
        let result = {};
        if (this.mapping.decode) {
            result = this.mapping.decode(json);
            Object.keys(result).forEach(property => {
                if (Mapping.match(result[property])) {
                    result[property] = new Codec(result[property]).decode(json[property]);
                }
            });
        } else {
            this.mapping.forEach((property, mapper) => {
                const value = json && json[property];
                const mapped = new Mapped(value, mapper);
                result[property] = this._decopeProperty(value, mapped);
            });
        }
        return new this.mapping.Clazz(result);
    }
    _decopeProperty(value, mapped) {
        let decoded;
        if (mapped.isArray()) {
            decoded = value.map(item => this._decopeProperty(item, mapped.array()));
        } else if (mapped.isMapping()) {
            decoded = new Codec(mapped.mapping()).decode(value);
        } else {
            decoded = mapped.decode(value);
        }
        return decoded;
    }
}

module.exports = Codec;
