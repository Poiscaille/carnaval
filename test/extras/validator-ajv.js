
const Ajv = require('ajv').default;

const omit = (object, key) => {
    const omitted = {};
    for (const name in object) {
        if (name !== key) {
            omitted[name] = object[name];
        }
    }
    return omitted;
};

class JSONSchema {
    static toSchema(props) {
        const schema = {
            properties: {},
            required: []
        };

        for (const property in props) {
            if (!props.hasOwnProperty(property)) {
                continue;
            }

            const field = props[property];
            const type = field.type || field;
            const rules = omit(field.rules || {}, 'domain');
            const domain = field.rules && field.rules.domain;
            if (rules.required) {
                schema.required.push(property);
            }

            if (Array.isArray(type)) {
                schema.properties[property] = Object.assign({
                    type: 'array',
                    items: JSONSchema._toArrayProp(type[0], domain, rules)
                }, omit(rules, 'required'));
            } else if (!JSONSchema._isSimpleType(type)) {
                Object.assign(rules, domain && domain.prototype.props);
                schema.properties[property] = JSONSchema._toDomainProp(rules);
            } else {
                schema.properties[property] = JSONSchema._toNativeProp(type, rules);
            }
        }
        return schema;
    }
    static _toDomainProp(subprops) {
        return Object.assign({
            type: 'object'
        }, JSONSchema.toSchema(subprops));
    }
    static _toNativeProp(type, rules) {
        return Object.assign({
            type: type
        }, omit(rules, 'required'));
    }
    static _toArrayProp(type, domain, rules) {
        let items;
        if (rules.items) {
            items = rules.items;
        } else if (!JSONSchema._isSimpleType(type)) {
            Object.assign(rules || {}, domain && domain.prototype.props);
            items = JSONSchema._toDomainProp(rules);
        } else {
            items = JSONSchema._toNativeProp(type, rules);
        }
        return items;
    }
    static _isSimpleType(type) {
        return ['string', 'number', 'boolean'].indexOf(type) !== -1;
    }
}

class Validator {
    static validate(object) {
        const schema = JSONSchema.toSchema(object.props);

        const ajv = new Ajv({strict: false});
        const valid = ajv.validate(schema, object);
        if (!valid) {
            let message = ajv.errors[0].dataPath;
            if (message.length) {
                message = message.substring(1) + ' ';
            }
            message += ajv.errors[0].message;

            throw new Error(message);
        }

        return object;
    }
}

module.exports = Validator.validate;
