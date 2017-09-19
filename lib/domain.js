
class Property {
    constructor(mixed) {
        this.type = mixed.type || mixed;
    }
    cast(value) {
        // return this.type(value); // FIXME cast or don't?
        return value;
    }
    isNative() {
        return this.type === String ||
            this.type === Number ||
            this.type === Boolean;
    }
    isArray() {
        return Array.isArray(this.type);
    }
}

class Domain {
    constructor(data) {
        data = data || {};
        Object.keys(this.props).forEach(prop => {
            const property = new Property(this.props[prop]);
            const value = data[prop];

            if (!property.isNative() || property.isArray()) {
                this[prop] = value;
            } else if (value) {
                this[prop] = property.cast(value);
            }
        });
    }
    get props() {
        return {};
    }
    static match(Clazz) {
        return Clazz.prototype instanceof Domain || Clazz === Domain;
    }
}

module.exports = Domain;
