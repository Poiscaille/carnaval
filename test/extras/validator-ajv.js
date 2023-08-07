const Ajv = require('ajv').default;

const Domain = require('../../lib/Domain');

const omit = (object, ...keys) => {
    keys = keys || [];
    const omitted = {};
    for (const name in object) {
        if (!keys.includes(name)) {
            omitted[name] = object[name];
        }
    }
    return omitted;
};

class JSONSchema {
    static toSchema(object, rules) {
        const props = object.props || {};
        rules = rules || object.rules || {};

        const schema = {
            properties: {},
            required: []
        };

        Object.keys(rules).forEach(prop => {
            const rule = rules[prop];
            if (rule.required) {
                schema.required.push(prop);
            }

            let propSchema;
            const Type = props[prop];
            if (Array.isArray(Type)) {
                propSchema = JSONSchema._toArrayProp(Type, rule);
            } else {
                propSchema = JSONSchema._toObjectProp(Type, rule);
            }

            schema.properties[prop] = propSchema;
            
            const required = this._isPropRequired(rule);
            const notRequired = rule.required === false;
            if ((propSchema.required && propSchema.required.length && !notRequired) || required) {
                schema.required.push(prop);
            }
        });
        return schema;
    }
    static _toNativeProp(Type, rule) {
        const props = JSONSchema._props(Type);
        
        return Object.assign({
            type: JSONSchema._toStringType(Type)
        }, omit(rule, 'required', ...Object.keys(props)));
    }
    static _toDomainProp(subobject, rule) {
        return Object.assign({
            type: 'object'
        }, JSONSchema.toSchema(subobject, rule));
    }
    static _toObjectProp(Type, rule) {
        switch (Type) {
            case Object:
            case Boolean:
            case String:
            case Number:
            case Date:
                return JSONSchema._toNativeProp(Type, rule);
            default:
                if (Domain.match(Type)) {
                    return JSONSchema._toDomainProp(Type.prototype, rule);
                } else {
                    return JSONSchema.toSchema({props: Type}, rule);
                }
        }
    }
    static _toArrayProp(Types, rule) {
        const Type = Types[0];
        const props = JSONSchema._props(Type);

        rule = Array.isArray(rule) ? rule[0] : rule;

        return Object.assign({
            type: 'array',
            items: JSONSchema._toArrayItems(Type, rule)
        }, omit(rule, 'required', 'enum', ...Object.keys(props)));
    }
    static _toArrayItems(Type, rule) {
        let items;
        if (rule.items) {
            items = rule.items;
        } else {
            items = JSONSchema._toObjectProp(Type, rule);
        }
        return items;
    }
    static _toStringType(Type) {
        switch (Type) {
            case Object: return 'object';
            case String: return 'string';
            case Number: return 'number';
            case Boolean: return 'boolean';
            case Date: return 'object';
            default: return;
        }
    }
    static _isPropRequired(rule) {
        for (const prop in rule) {
            if (rule[prop].required) {
                return true;
            }
        }
        return false;
    }
    static _props(Type) {
        return Domain.match(Type) ? Type.prototype.props : Type;
    }
}

class Validator {
    static validate(object) {
        const schema = JSONSchema.toSchema(object);

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
