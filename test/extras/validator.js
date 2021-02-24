const Domain = require('../../lib/Domain');

class Validator {
    static validate(object) {
        const props = object.props || {};
        const rules = object.rules || {};

        Object.keys(props).forEach(prop => {
            Validator._validateValue(object[prop], props[prop], rules[prop], prop);
        });
        return object;
    }
    static _validateValue(value, Type, rule, prop, prefix) {
        rule = rule || {};
        prefix = prefix || '';
        if (Array.isArray(Type)) {
            return Validator._validateArrayValue(value, Type, rule);
        }

        if (rule.required) {
            if (!value) {
                throw new Error(`${prefix}${prop} is required`);
            }
        }

        const props = Domain.match(Type) ? Validator._props(Type) : Type;
        Object.keys(props).forEach(subprop => {
            Validator._validateValue(value && value[subprop], props[subprop], rule[subprop], subprop, `${prop}.`);
        });
    }
    static _validateArrayValue(value, Type) {
        if (!Array.isArray(value)) {
            return;
        }
        return value.map(item => Validator._validateValue(item, Type[0]));
    }
    static _props(Type) {
        return Type.prototype.props || {};
    }
}

module.exports = Validator.validate;
