class Codec {
    constructor(Clazz, MapperClazz) {
        this.Clazz = Clazz;
        this.MapperClazz = MapperClazz;
        this.permissions = 'rw';
        this.normalize = true;
        this.schema = {};
    }
    encode(object) {
        return object;
    }
    decode(json) {
        return json;
    }
    setSchema(schema) {
        this.schema = schema;
    }
    setNormalize(normalize) {
        this.normalize = normalize;
    }
    setHelpers(helpers) {
        this.helpers = helpers;
    }
    setPermissions(permissions) {
        if (!['rw', 'r-', '-w', '--'].includes(permissions)) {
            return;
        }
        this.permissions = permissions;
    }
    _shouldEncode(transform) {
        return (this.permissions.includes('r') && !transform) || (transform && transform.get !== false);
    }
    _shouldDecode(transform) {
        return (this.permissions.includes('w') && !transform) || (transform && transform.set !== false);
    }
    _isClass(object) {
        return !!object.prototype && !!object.prototype.constructor.name;
    }
    _props(Type) {
        return Type.prototype.props || {};
    }
    _alias(transform, defaultValue) {
        return (transform && transform.alias) || defaultValue;
    }
}

module.exports = Codec;
