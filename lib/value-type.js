
const Mapper = require('./mapper');

/* represents a native value (String, Number...) or a Mapping */
class ValueType {
    constructor(value, mapper) {
        this.value = value;
        this.encode = value => value;
        this.decode = value => value;

        if (Mapper.match(mapper)) {
            this.mapper = mapper;
        } else if (mapper) {
            this.encode = mapper.encode || this.encode;
            this.decode = mapper.decode || this.decode;
        }
    }
    isArray() {
        return Array.isArray(this.value);
    }
    isCustomMapper() {
        return !!this.mapper;
    }
    arrayItem() {
        return new ValueType(this.value[0], this.mapper);
    }
    customMapper() {
        return this.mapper;
    }
}

module.exports = ValueType;
