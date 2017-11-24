
const omit = (object, key) => {
    const omitted = {};
    for (const name in object) {
        if (name !== key) {
            omitted[name] = object[name];
        }
    }
    return omitted;
};

class Validator {
    static validate(object) {
        Validator._validateProps(object, object.props);
        return object;
    }
    static _validateProps(object, props, prefix) {
        for (const property in props) {
            if (!props.hasOwnProperty(property)) {
                continue;
            }

            const field = props[property];
            const rules = omit(field.rules || {}, 'domain');
            const domain = field.rules && field.rules.domain;
            if (rules.required) {
                if (!object || !object[property]) {
                    prefix = prefix || '';
                    throw new Error(`${prefix}${property} is required`);
                }
            }

            const type = field.type || field;
            if (!Validator._isSimpleType(type)) {
                const subobject = object[property];
                const subprops = domain && domain.prototype.props;
                Validator._validateProps(subobject, subprops, `${property}.`);
            }
        }
    }
    static _isSimpleType(type) {
        return ['string', 'number', 'boolean'].indexOf(type) !== -1;
    }
}

module.exports = Validator.validate;
