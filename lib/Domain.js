class Domain {
    constructor(data) {
        Domain.assign(this, data);
    }

    static assign(target, data = {}) {
        const props = target.props;
        Object.keys(props).forEach(prop => {
            target[prop] = Domain._assignValue(data[prop], props[prop]);
        });
    }

    static override(target, data = {}) {
        const props = target.props;
        Object.keys(props).forEach(prop => {
            if (!data.hasOwnProperty(prop)) {
                data[prop] = this._assignValue(target[prop], props[prop]);
            }
        });
        return Object.assign(target, data);
    }

    static _assignValue(value, Type) {
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
                const isClass = this._isClass(Type);

                const object = {};
                const props = isClass ? this._props(Type) : Type;

                Object.keys(props).forEach(prop => {
                    object[prop] = this._assignValue(value[prop], props[prop]);
                });
                return isClass ? new Type(object) : object;
        }
    }
    static _assignArrayValue(value, Type) {
        if (!Array.isArray(value)) {
            return;
        }
        return value.map(item => this._assignValue(item, Type[0]));
    }
    static _isClass(object) {
        return ![Object, Boolean, String, Number, Date].includes(object) && !!object.prototype && !!object.prototype.constructor.name;
    }
    static _props(Type) {
        return Type.prototype.props || {};
    }
    static match(Clazz) {
        return (Clazz && Clazz.prototype instanceof Domain) || Clazz === Domain;
    }
}

module.exports = Domain;
