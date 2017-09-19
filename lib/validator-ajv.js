
const Ajv = require('ajv');

const Domain = require('./domain');

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
            const rules = field.rules || {};
            if (rules.required) {
                schema.required.push(property);
            }

            if (Array.isArray(type)) {
                schema.properties[property] = Object.assign({
                    type: 'array',
                    items: JSONSchema._toArrayProp(type[0], rules)
                }, omit(rules, 'required'));
            } else if (Domain.match(type)) {
                schema.properties[property] = JSONSchema._toDomainProp(field.rules);
            } else {
                schema.properties[property] = JSONSchema._toNativeProp(type, rules);
            }
        }
        return schema;
    }
    static _toDomainProp(rules) {
        const subprops = rules && rules.props;

        return Object.assign({
            type: 'object'
        }, JSONSchema.toSchema(subprops));
    }
    static _toNativeProp(type, rules) {
        return Object.assign({
            type: JSONSchema.toType(type)
        }, omit(rules, 'required'));
    }
    static _toArrayProp(type, rules) {
        let items;
        if (rules.items) {
            items = rules.items;
        } else if (Domain.match(type)) {
            items = JSONSchema._toDomainProp(rules);
        } else {
            items = JSONSchema._toNativeProp(type, rules);
        }
        return items;
    }
    static toType(type) {
        let transtyped;
        switch (type) {
            case String:
                transtyped = 'string';
                break;
            case Number:
                transtyped = 'number';
                break;
            case Boolean:
                transtyped = 'boolean';
                break;
            default:
        }
        return transtyped;
    }
}

class Validator {
    static validate(object) {
        const schema = JSONSchema.toSchema(object.props);

        const ajv = new Ajv();
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
