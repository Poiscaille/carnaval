/* eslint-disable no-use-before-define */

const Promise = require('./promise-polyfill');
const Mapping = require('./mapping');
const ValueType = require('./value-type');

class CustomCodec {
    constructor(options) {
        this.customEncode = options.encode;
        this.customDecode = options.decode;
    }
    encode(object, providers) {
        return Promise.resolve(this.customEncode(object, providers))
        .then(result => {
            if (!result) {
                return result;
            }

            return Promise.map(Object.keys(result), property => {
                const codec = result[property];
                if (!(codec instanceof Codec)) {
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
    decode(json, providers) {
        return Promise.resolve(this.customDecode(json, providers))
        .then(result => {
            if (!result) {
                return result;
            }

            return Promise.map(Object.keys(result), property => {
                const codec = result[property];
                if (!(codec instanceof Codec)) {
                    return;
                }

                return codec
                .decode(json[property], providers)
                .then(value => {
                    result[property] = value;
                });
            })
            .then(() => {
                return result;
            });
        });
    }
    onType() {}
    onProp() {}
    pick() {}
}

class ClassCodec {
    constructor(Clazz) {
        this.mapping = new Mapping(Clazz).selectAll();
    }
    encode(object, providers) {
        const result = {};
        return this.mapping._forEach((property, codec) => {
            const value = object && object[property];
            const valueType = new ValueType(value, codec);
            return valueType.encodeProperty(value, providers)
            .then(value => {
                result[property] = value;
            });
        })
        .then(() => result);
    }
    decode(json, providers) {
        const result = {};
        return this.mapping._forEach((property, codec) => {
            const value = json && json[property];
            const valueType = new ValueType(value, codec);
            return valueType.decodeProperty(value, providers)
            .then(value => {
                result[property] = value;
            });
        })
        .then(() => {
            return new this.mapping.Clazz(result);
        });
    }
    onType(type, codec) {
        this.mapping.onType(type, codec);
    }
    onProp(name, codec) {
        this.mapping.onProp(name, codec);
    }
    pick(...props) {
        this.mapping.select(...props);
    }
}

class Codec {
    /* class type or functions */
    constructor(mixed, ...options) {
        if (typeof mixed === 'function') {
            this.codec = new ClassCodec(mixed, ...options);
        } else {
            this.codec = new CustomCodec(mixed);
        }
    }
    encode(object, providers) {
        if (Array.isArray(object)) {
            return Promise.map(object, item => this.encode(item, providers));
        }
        return this.codec.encode(object, providers);
    }
    decode(json, providers) {
        if (Array.isArray(json)) {
            return Promise.map(json, item => this.decode(item, providers));
        }
        return this.codec.decode(json, providers);
    }
    onType(type, codec) {
        this.codec.onType(type, codec);
        return this;
    }
    onProp(name, codec) {
        this.codec.onProp(name, codec);
        return this;
    }
    pick(...props) {
        this.codec.pick(...props);
        return this;
    }
    static forClass(Clazz) {
        return new Codec(Clazz);
    }
    static custom(options) {
        return new Codec(options);
    }
}

module.exports = Codec;
