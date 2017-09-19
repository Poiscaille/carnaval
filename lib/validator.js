
const Domain = require('./domain');

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
            const rules = field.rules || {};
            if (rules.required) {
                if (!object || !object[property]) {
                    prefix = prefix || '';
                    throw new Error(`${prefix}${property} is required`);
                }
            }

            const type = field.type || field;
            if (Domain.match(type)) {
                const subobject = object[property];
                const subprops = field.rules && field.rules.props;
                Validator._validateProps(subobject, subprops, `${property}.`);
            }
        }
    }
}

module.exports = Validator.validate;
