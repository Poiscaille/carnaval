
const Mapping = require('./mapping');

/* represents a native class (String, Number...) or a Mapping */
class Mapped {
    constructor(mixed) {
        this.mapper = mixed.mapper || mixed;
        this.encode = mixed.encode || this._cast;
        this.decode = mixed.decode || this._cast;
    }
    _cast(value) {
        // return this.mapper(value); // FIXME cast or don't?
        return value;
    }
    isArray() {
        return Array.isArray(this.mapper);
    }
    isMapping() {
        return Mapping.match(this.mapper);
    }
    array() {
        return new Mapped(this.mapper[0]);
    }
    mapping() {
        return this.mapper;
    }
}

module.exports = Mapped;
