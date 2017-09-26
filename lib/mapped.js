
const Mapping = require('./mapping');

/* represents a native class (String, Number...) or a Mapping */
class Mapped {
    constructor(type, mapper) {
        this.type = type;
        this.encode = value => value;
        this.decode = value => value;

        if (Mapping.match(mapper)) {
            this.mapper = mapper;
        } else if (mapper) {
            this.encode = mapper.encode || this.encode;
            this.decode = mapper.decode || this.decode;
        }
    }
    isArray() {
        return Array.isArray(this.type);
    }
    isMapping() {
        return !!this.mapper;
    }
    array() {
        return new Mapped(this.type[0], this.mapper);
    }
    mapping() {
        return this.mapper;
    }
}

module.exports = Mapped;
