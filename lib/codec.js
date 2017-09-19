
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
            for (const property in result) {
                if (!result.hasOwnProperty(property)) {
                    continue;
                }

                if (Mapping.match(result[property].mapper)) {
                    result[property] = new Codec(result[property].mapper).encode(object[property]);
                }
            }
        }

        const rules = this.mapping.rules;
        for (const property in rules) {
            if (!rules.hasOwnProperty(property)) {
                continue;
            }

            const mapped = new Mapped(rules[property]);
            const value = object[property];
            result[property] = this._encodeProperty(mapped, value);
        }
        return result;
    }
    _encodeProperty(mapped, value) {
        let encoded;
        if (mapped.isArray()) {
            encoded = value.map(item => this._encodeProperty(mapped.array(), item));
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
            for (const property in result) {
                if (!result.hasOwnProperty(property)) {
                    continue;
                }

                if (Mapping.match(result[property].mapper)) {
                    result[property] = new Codec(result[property].mapper).decode(json[property]);
                }
            }
        }

        const rules = this.mapping.rules;
        for (const property in rules) {
            if (!rules.hasOwnProperty(property)) {
                continue;
            }

            const mapped = new Mapped(rules[property]);
            const value = json && json[property];
            result[property] = this._decopeProperty(mapped, value);
        }

        return new this.mapping.Clazz(result);
    }
    _decopeProperty(mapped, value) {
        let decoded;
        if (mapped.isArray()) {
            decoded = value.map(item => this._decopeProperty(mapped.array(), item));
        } else if (mapped.isMapping()) {
            decoded = new Codec(mapped.mapping()).decode(value);
        } else {
            decoded = mapped.decode(value);
        }
        return decoded;
    }
}

module.exports = Codec;
