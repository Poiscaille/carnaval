
const Promise = require('bluebird');

const Mapping = require('./mapping');
const ValueType = require('./value-type');

class Codec {
    constructor(mapping) {
        this.mapping = mapping;
    }
    encode(object, providers) {
        if (Array.isArray(object)) {
            return Promise.map(object, item => this.encode(item, providers));
        }

        if (this.mapping.encode) {
            return this._customEncode(object, providers);
        }

        const result = {};
        return this.mapping.mapProperties((property, mapper) => {
            const value = object && object[property];
            const valueType = new ValueType(value, mapper);
            return this._encodeProperty(value, valueType)
            .then(value => {
                result[property] = value;
            });
        })
        .then(() => result);
    }
    _customEncode(object, providers) {
        return Promise.resolve(this.mapping.encode(object, providers))
        .then(result => {
            if (!result) {
                return result;
            }

            return Promise.map(Object.keys(result), property => {
                if (Mapping.match(result[property])) {
                    return new Codec(result[property])
                    .encode(object[property], providers)
                    .then(value => {
                        result[property] = value;
                    });
                }
            })
            .then(() => result);
        });
    }
    _encodeProperty(value, valueType) {
        if (valueType.isArray()) {
            return Promise.map(value, item => this._encodeProperty(item, valueType.arrayItem()));
        } else if (valueType.isCustomMapper()) {
            return new Codec(valueType.customMapper()).encode(value);
        } else {
            return Promise.resolve(valueType.encode(value));
        }
    }
    decode(json, providers) {
        if (Array.isArray(json)) {
            return Promise.map(json, item => this.decode(item, providers));
        }

        if (this.mapping.decode) {
            return this._customDecode(json, providers);
        }

        const result = {};
        return this.mapping.mapProperties((property, mapper) => {
            const value = json && json[property];
            const valueType = new ValueType(value, mapper);
            return this._decopeProperty(value, valueType)
            .then(value => {
                result[property] = value;
            });
        })
        .then(() => {
            return new this.mapping.Clazz(result);
        });
    }
    _customDecode(json, providers) {
        return Promise.resolve(this.mapping.decode(json, providers))
        .then(result => {
            if (!result) {
                return result;
            }

            return Promise.map(Object.keys(result), property => {
                if (Mapping.match(result[property])) {
                    return new Codec(result[property])
                    .decode(json[property], providers)
                    .then(value => {
                        result[property] = value;
                    });
                }
            })
            .then(() => {
                return new this.mapping.Clazz(result);
            });
        });
    }
    _decopeProperty(value, valueType) {
        if (valueType.isArray()) {
            return Promise.map(value, item => this._decopeProperty(item, valueType.arrayItem()));
        } else if (valueType.isCustomMapper()) {
            return new Codec(valueType.customMapper()).decode(value);
        } else {
            return Promise.resolve(valueType.decode(value));
        }
    }
}

module.exports = Codec;
