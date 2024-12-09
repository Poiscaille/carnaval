const TransformCodec = require('./codecs/TransformCodec');

const Promise = require('./promise-polyfill');

class Mapper {
    constructor(Clazz) {
        this.hooks = {};
        this.helpers = {};

        this.transformCodec = new TransformCodec(Clazz, Mapper);
    }
    with(schema) {
        this.transformCodec.setSchema(schema);
        return this;
    }
    defaults(options) {
        this.transformCodec.setPermissions(options.permissions);
        return this;
    }
    normalize(normalize) {
        this.transformCodec.setNormalize(normalize);
        return this;
    }
    providers(helpers) {
        this.helpers = helpers;
        this.transformCodec.setHelpers(helpers);
        return this;
    }
    beforeEncode(...fn) {
        this.hooks['before:encode'] = fn;
        return this;
    }
    beforeDecode(...fn) {
        this.hooks['before:decode'] = fn;
        return this;
    }
    afterEncode(...fn) {
        this.hooks['after:encode'] = fn;
        return this;
    }
    afterDecode(...fn) {
        this.hooks['after:decode'] = fn;
        return this;
    }
    _hook(event, value, original) {
        if (!this.hooks[event]) {
            return Promise.resolve(value);
        }
        return Promise.reduce(this.hooks[event], (memo, middleware) => {
            if (Array.isArray(memo)) {
                return Promise.map(memo, item => Promise.resolve(middleware(item, original, this.helpers)).then(result => result ? result : item));
            }

            return Promise.resolve(middleware(memo, original, this.helpers))
            .then(result => result ? result : memo);
        }, value);
    }
    encode(object) {
        return this._hook('before:encode', object)
        .then(object => this.transformCodec.encode(object))
        .then(json => this._hook('after:encode', json, object));
    }
    decode(json) {
        return this._hook('before:decode', json)
        .then(json => this.transformCodec.decode(json))
        .then(object => this._hook('after:decode', object, json));
    }
}

module.exports = Mapper;
