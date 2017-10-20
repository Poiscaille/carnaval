
const Promise = require('bluebird');

const Mapping = require('./mapping');
const Mapped = require('./mapped');

class Codec {
    constructor(mapping) {
        this.mapping = mapping;
    }
    encode(object) {
        if (this.mapping.encode) {
            return Promise.resolve(this.mapping.encode(object))
            .then(result => {
                return Promise.map(Object.keys(result), property => {
                    if (Mapping.match(result[property])) {
                        return new Codec(result[property])
                        .encode(object[property])
                        .then(value => {
                            result[property] = value;
                        });
                    }
                })
                .then(() => result);
            });
        } else {
            const result = {};
            return this.mapping.mapProperties((property, mapper) => {
                const value = object && object[property];
                const mapped = new Mapped(value, mapper);
                return this._encodeProperty(value, mapped)
                .then(value => {
                    result[property] = value;
                });
            })
            .then(() => result);
        }
    }
    _encodeProperty(value, mapped) {
        if (mapped.isArray()) {
            return Promise.map(value, item => this._encodeProperty(item, mapped.array()));
        } else if (mapped.isMapping()) {
            return new Codec(mapped.mapping()).encode(value);
        } else {
            return Promise.resolve(mapped.encode(value));
        }
    }
    decode(json) {
        if (this.mapping.decode) {
            return Promise.resolve(this.mapping.decode(json))
            .then(result => {
                return Promise.map(Object.keys(result), property => {
                    if (Mapping.match(result[property])) {
                        return new Codec(result[property])
                        .decode(json[property])
                        .then(value => {
                            result[property] = value;
                        });
                    }
                })
                .then(() => {
                    return new this.mapping.Clazz(result);
                });
            });
        } else {
            const result = {};
            return this.mapping.mapProperties((property, mapper) => {
                const value = json && json[property];
                const mapped = new Mapped(value, mapper);
                return this._decopeProperty(value, mapped)
                .then(value => {
                    result[property] = value;
                });
            })
            .then(() => {
                return new this.mapping.Clazz(result);
            });
        }
    }
    _decopeProperty(value, mapped) {
        if (mapped.isArray()) {
            return Promise.map(value, item => this._decopeProperty(item, mapped.array()));
        } else if (mapped.isMapping()) {
            return new Codec(mapped.mapping()).decode(value);
        } else {
            return Promise.resolve(mapped.decode(value));
        }
    }
}

module.exports = Codec;
