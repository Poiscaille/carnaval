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
            this[prop] = this._assignValue(data[prop], this.props[prop]);
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
                data[prop] = this._assignValue(this[prop], this.props[prop]);
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
    _assignValue(value, Type) {
        if (Array.isArray(Type)) {
            return this._assignArrayValue(value, Type);
        }

        if (value === undefined || value === null) {
            return value;
        }

        switch (Type) {
            case Object:
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
                        result[prop] = this._assignValue(value[prop], props[prop]);
                    });
                    return result;
                }
        }
    }
    _assignArrayValue(value, Type) {
        if (!Array.isArray(value)) {
            return;
        }
        return value.map(item => this._assignValue(item, Type[0]));
    }
    _isClass(object) {
        return !!object.prototype && !!object.prototype.constructor.name;
    }
    static match(Clazz) {
        return (Clazz && Clazz.prototype instanceof Domain) || Clazz === Domain;
    }
}

module.exports = Domain;
