
const Promise = require('./promise-polyfill');

/* represents a native value (String, Number...) or a Mapping */
class ValueType {
    constructor(type, codec) {
        this.type = type;
        this.codec = codec;
        this.encode = value => value;
        this.decode = value => value;

        if (codec) {
            this.encode = codec.encode.bind(codec) || this.encode;
            this.decode = codec.decode.bind(codec) || this.decode;
        }
    }
    encodeProperty(value, providers) {
        if (this.isArray(value)) {
            const itemValueType = this.itemValueType();
            return Promise.map(value, item => itemValueType.encodeProperty(item, providers));
        } else {
            return Promise.resolve(this.encode(value, providers));
        }
    }
    decodeProperty(value, providers) {
        if (this.isArray(value)) {
            const itemValueType = this.itemValueType();
            return Promise.map(value, item => itemValueType.decodeProperty(item, providers));
        } else {
            return Promise.resolve(this.decode(value, providers));
        }
    }
    isArray(value) {
        return Array.isArray(value) && Array.isArray(this.type);
    }
    itemValueType() {
        return new ValueType(this.type[0], this.codec);
    }
}

module.exports = ValueType;
