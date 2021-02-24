const Codec = require('./Codec');

class PreCodec extends Codec {
    encode(object) {
        if (Array.isArray(object)) {
            return object.map(item => this.encode(item));
        }

        const result = {};
        const props = this._props(this.Clazz);

        Object.keys(props).forEach(prop => {
            if (!['function', 'object'].includes(typeof props[prop])) {
                throw new Error(`${props[prop]} should be a function or an object`);
            }

            result[prop] = this.encodeValue(object[prop], props[prop]);
        });
        return result;
    }
    encodeValue(value, Type) {
        if (Array.isArray(Type)) {
            return this.encodeArrayValue(value, Type);
        }

        if (value === undefined || value === null) {
            return value;
        }

        switch (Type) {
            case Object:
                return this._clone(value);
            case Boolean:
            case String:
            case Number:
            case Date:
                return value;
            default:
                const result = {};
                const props = this._isClass(Type) ? this._props(Type) : Type;

                Object.keys(props).forEach(prop => {
                    result[prop] = this.encodeValue(value[prop], props[prop]);
                });
                return result;
        }
    }
    encodeArrayValue(value, Type) {
        if (!Array.isArray(value)) {
            return;
        }
        return value.map(item => this.encodeValue(item, Type[0]));
    }
    decode(json) {
        if (Array.isArray(json)) {
            return json.map(item => this.decode(item));
        }

        const result = {};
        const props = this.Clazz.prototype.props || {};

        Object.keys(props).forEach(prop => {
            if (!['function', 'object'].includes(typeof props[prop])) {
                throw new Error(`${props[prop]} should be a function or an object`);
            }

            const transform = this.schema[prop];
            const alias = this._alias(transform, prop);

            result[alias] = this.decodeValue(json[alias], props[prop], transform);
        });
        return result;
    }
    decodeValue(value, Type, transform) {
        transform = transform || {};
        if (Array.isArray(Type)) {
            return this.decodeArrayValue(value, Type, transform);
        }

        if (value === undefined || value === null) {
            return value;
        }

        switch (Type) {
            case Object:
                return this._clone(value);
            case Boolean:
            case String:
            case Number:
            case Date:
                return value;
            default:
                if (this._isClass(Type)) {
                    return value;
                } else {
                    const result = {};
                    const props = Type;

                    Object.keys(props).forEach(prop => {
                        const alias = this._alias(transform[prop], prop);

                        result[alias] = this.decodeValue(value[alias], props[prop], transform[prop]);
                    });
                    return result;
                }
        }
    }
    decodeArrayValue(value, Type, transform) {
        if (!Array.isArray(value)) {
            return;
        }
        return value.map(item => this.decodeValue(item, Type[0], transform));
    }
    _clone(object) {
        const clone = Array.isArray(object) ? [] : {};
        // eslint-disable-next-line guard-for-in
        for (const key in object) {
            const value = object[key];
            clone[key] = (typeof value === 'object' && value !== null) ? this._clone(value) : value;
        }
        return clone;
    }
}

module.exports = PreCodec;
