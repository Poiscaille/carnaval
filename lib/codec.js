
const Promise = require('bluebird');

const Mapping = require('./mapping');
const ValueType = require('./value-type');
const Mapper = require('./mapper');

class Codec extends Mapper {
    /* mapping or class type */
    constructor(mixed, options) {
        super();

        if (Mapping.match(mixed)) {
            this.mapping = mixed;
        } else {
            this.mapping = new Mapping(mixed);
            this.customEncode = options.encode;
            this.customDecode = options.decode;
        }
    }
    encode(object, providers) {
        if (Array.isArray(object)) {
            return Promise.map(object, item => this.encode(item, providers));
        }

        if (this.customEncode) {
            return this._customEncode(object, providers);
        }

        const result = {};
        return this.mapping._forEach((property, mapper) => {
            const value = object && object[property];
            const valueType = new ValueType(value, mapper);
            return this._encodeProperty(value, valueType, providers)
            .then(value => {
                result[property] = value;
            });
        })
        .then(() => result);
    }
    _customEncode(object, providers) {
        return Promise.resolve(this.customEncode(object, providers))
        .then(result => {
            if (!result) {
                return result;
            }

            return Promise.map(Object.keys(result), property => {
                const codec = this._wrapAsCodec(result[property]);
                if (!codec) {
                    return;
                }

                return codec
                .encode(object[property], providers)
                .then(value => {
                    result[property] = value;
                });
            })
            .then(() => result);
        });
    }
    _encodeProperty(value, valueType, providers) {
        if (valueType.isArray()) {
            return Promise.map(value, item => this._encodeProperty(item, valueType.arrayItem(), providers));
        } else if (valueType.isCustomMapper()) {
            const codec = this._wrapAsCodec(valueType.customMapper());
            return codec.encode(value, providers);
        } else {
            return Promise.resolve(valueType.encode(value, providers));
        }
    }
    decode(json, providers) {
        if (Array.isArray(json)) {
            return Promise.map(json, item => this.decode(item, providers));
        }

        if (this.customDecode) {
            return this._customDecode(json, providers);
        }

        const result = {};
        return this.mapping._forEach((property, mapper) => {
            const value = json && json[property];
            const valueType = new ValueType(value, mapper);
            return this._decopeProperty(value, valueType, providers)
            .then(value => {
                result[property] = value;
            });
        })
        .then(() => {
            return new this.mapping.Clazz(result);
        });
    }
    _customDecode(json, providers) {
        return Promise.resolve(this.customDecode(json, providers))
        .then(result => {
            if (!result) {
                return result;
            }

            return Promise.map(Object.keys(result), property => {
                const codec = this._wrapAsCodec(result[property]);
                if (!codec) {
                    return;
                }

                return codec
                .decode(json[property], providers)
                .then(value => {
                    result[property] = value;
                });
            })
            .then(() => {
                return new this.mapping.Clazz(result);
            });
        });
    }
    _decopeProperty(value, valueType, providers) {
        if (valueType.isArray()) {
            return Promise.map(value, item => this._decopeProperty(item, valueType.arrayItem(), providers));
        } else if (valueType.isCustomMapper()) {
            const codec = this._wrapAsCodec(valueType.customMapper());
            return codec.decode(value, providers);
        } else {
            return Promise.resolve(valueType.decode(value, providers));
        }
    }
    _mappingClazz() {
        return this.mapping._mappingClazz();
    }
    _wrapAsCodec(mixed) {
        let codec;
        if (Codec.match(mixed)) {
            codec = mixed;
        } else if (Mapping.match(mixed)) {
            codec = new Codec(mixed);
        }
        return codec;
    }
}

module.exports = Codec;
