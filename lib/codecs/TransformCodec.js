const Codec = require('./Codec');
const Promise = require('../promise-polyfill');

class TransformCodec extends Codec {
    encode(object, original) {
        original = original || object;

        if (Array.isArray(object)) {
            return Promise.map(object, item => this.encode(item, original));
        }

        const props = this._props(this.Clazz);
        return this.encodeObject(object, props, this.schema, original);
    }
    encodeObject(object, props, transform, original) {
        const result = {};
        return Promise.map(Object.keys(props), prop => {
            if (!this._shouldEncode(transform[prop])) {
                return;
            }

            return Promise.resolve(this.encodeValue(object && object[prop], props[prop], transform[prop], original))
            .then(encoded => {
                const alias = this._alias(transform[prop], prop);
                result[alias] = encoded;
            });
        })
        .then(() => result);
    }
    encodeValue(value, Type, transform, original) {
        transform = transform || {};
        if (transform.get && !Array.isArray(transform)) {
            return transform.get(value, original, this.helpers);
        }

        if (Array.isArray(Type)) {
            return this.encodeArrayValue(value, Type, transform, original);
        }

        if (transform instanceof this.MapperClazz) {
            return transform.encode(value);
        } else if (transform.get) {
            return transform.get(value, original, this.helpers);
        }

        if (value === undefined || value === null) {
            return value;
        }

        switch (Type) {
            case Object:
            case Boolean:
            case String:
            case Number:
                return value;
            case Date:
                return value && new Date(value.getTime());
            default:
                const props = this._isClass(Type) ? this._props(Type) : Type;
                return this.encodeObject(value, props, transform, original);
        }
    }
    encodeArrayValue(value, Type, transform, original) {
        value = value || [];
        return Promise.map(value, item => {
            if (!this._shouldEncode(transform)) {
                return;
            }

            return Promise.resolve(this.encodeValue(item, Type[0], transform[0], original));
        });
    }
    decode(json, original) {
        original = original || json;

        if (Array.isArray(json)) {
            return Promise.map(json, item => this.decode(item, original));
        }

        const props = this.Clazz.prototype.props || {};

        return this.decodeObject(json, props, this.schema, original)
        .then(result => new this.Clazz(result));
    }
    decodeObject(json, props, transform, original) {
        const result = {};
        return Promise.map(Object.keys(props), prop => {
            if (!this._shouldDecode(transform[prop])) {
                return;
            }
            
            const alias = this._alias(transform[prop], prop);

            return Promise.resolve(this.decodeValue(json && json[alias], props[prop], transform[prop], original))
            .then(decoded => {
                result[prop] = decoded;
            });
        })
        .then(() => result);
    }
    decodeValue(value, Type, transform, original) {
        transform = transform || {};
        if (transform.set && !Array.isArray(transform)) {
            return transform.set(value, original, this.helpers);
        }

        if (Array.isArray(Type)) {
            return this.decodeArrayValue(value, Type, transform, original);
        }

        if (transform instanceof this.MapperClazz) {
            return transform.decode(value);
        } else if (transform.set) {
            return transform.set(value, original, this.helpers);
        }

        if (value === undefined || value === null) {
            return value;
        }

        switch (Type) {
            case Object:
                return value;
            case Boolean:
                return this.normalize ? Boolean(value) : value;
            case String:
                return this.normalize ? String(value) : value;
            case Number:
                if (Number.isNaN(Number(value))) {
                    return value;
                } else {
                    return this.normalize ? Number(value) : value;
                }
            case Date:
                return this.normalize ? (value && new Date(value.getTime())) : value;
            default:
                const isClass = this._isClass(Type);
                const props = isClass ? this._props(Type) : Type;

                return this.decodeObject(value, props, transform, original)
                .then(object => {
                    return isClass ? new Type(object) : object;
                });
        }
    }
    decodeArrayValue(value, Type, transform, original) {
        value = value || [];
        return Promise.map(value, item => {
            if (!this._shouldDecode(transform)) {
                return;
            }

            return Promise.resolve(this.decodeValue(item, Type[0], transform[0], original));
        });
    }
}

module.exports = TransformCodec;
