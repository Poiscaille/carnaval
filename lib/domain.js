
const deepFreeze = o => {
    Object.freeze(o);

    Object.getOwnPropertyNames(o).forEach(prop => {
        if (o.hasOwnProperty(prop) &&
            o[prop] !== null &&
            (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
            !Object.isFrozen(o[prop])) {
            deepFreeze(o[prop]);
        }
    });
    return o;
};

class Domain {
    constructor(data, options) {
        data = data || {};
        options = options || {};

        Object.keys(this.props).forEach(prop => {
            const value = data[prop];
            if (value) {
                this[prop] = value;
            }
        });

        const validate = options.validate || this.options.validate;
        if (validate) {
            validate(this);
        }
        if (this.options.immutable) {
            this.freeze();
        }
    }
    get props() {
        return {};
    }
    get options() {
        return {};
    }
    freeze() {
        return deepFreeze(this);
    }
    assign(data, options) {
        data = data || {};
        options = options || {};

        Object.keys(this.props).forEach(prop => {
            if (!data.hasOwnProperty(prop)) {
                data[prop] = this[prop];
            }
        });

        const validate = options.validate || this.options.validate;
        if (validate) {
            validate(this);
        }

        if (this.options.immutable) {
            return new this.constructor(data);
        } else {
            return Object.assign(this, data);
        }
    }
    static match(Clazz) {
        return Clazz.prototype instanceof Domain || Clazz === Domain;
    }
}

module.exports = Domain;
