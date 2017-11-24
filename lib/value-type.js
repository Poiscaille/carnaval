
const Promise = require('./promise-polyfill');

/* represents a native value (String, Number...) or a Mapping */
class ValueType {
    constructor(value, codec) {
        this.value = value;
        this.codec = codec;
        this.encode = value => value;
        this.decode = value => value;

        if (codec) {
            this.encode = codec.encode.bind(codec) || this.encode;
            this.decode = codec.decode.bind(codec) || this.decode;
        }
    }
    encodeProperty(value, providers) {
        if (this.isArray()) {
            return Promise.map(value, item => this.arrayItem().encodeProperty(item, providers));
        } else {
            return Promise.resolve(this.encode(value, providers));
        }
    }
    decodeProperty(value, providers) {
        if (this.isArray()) {
            return Promise.map(value, item => this.arrayItem().decodeProperty(item, providers));
        } else {
            return Promise.resolve(this.decode(value, providers));
        }
    }
    isArray() {
        return Array.isArray(this.value);
    }
    arrayItem() {
        return new ValueType(this.value[0], this.codec);
    }
}

module.exports = ValueType;
