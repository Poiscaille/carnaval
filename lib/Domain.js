class Domain {
    constructor(data) {
        data = data || {};

        Object.keys(this.props).forEach(prop => {
            this[prop] = this._assignValue(data[prop], this.props[prop]);
        });
    }
    get props() {
        return {};
    }
    assign(data) {
        data = data || {};

        Object.keys(this.props).forEach(prop => {
            if (!data.hasOwnProperty(prop)) {
                data[prop] = this._assignValue(this[prop], this.props[prop]);
            }
        });

        return Object.assign(this, data);
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
