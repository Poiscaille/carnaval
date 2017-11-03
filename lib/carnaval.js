
const Promise = require('bluebird');

const Codec = require('../lib/codec');

class CodecDecorator extends Codec {
    constructor(mapping, encoders, decoders, providers) {
        super(mapping);
        this.encoders = encoders;
        this.decoders = decoders;
        this.providers = providers;
    }
    encode(object) {
        return super.encode(object, this.providers)
        .then(json => {
            return Promise.reduce(this.encoders, (memo, middleware) => {
                return Promise.resolve(middleware(memo, this.providers))
                .then(result => result ? result : memo);
            }, json);
        });
    }
    decode(json) {
        return super.decode(json, this.providers)
        .then(object => {
            return Promise.reduce(this.decoders, (memo, middleware) => {
                return Promise.resolve(middleware(memo, this.providers))
                .then(result => result ? result : memo);
            }, object);
        });
    }
}

class Carnaval {
    constructor(encodeMiddlewares, decodeMiddlewares, providersObject) {
        this.encodeMiddlewares = encodeMiddlewares || [];
        this.decodeMiddlewares = decodeMiddlewares || [];
        this.providersObject = providersObject || [];
    }
    encoders(...encodeMiddlewares) {
        return new Carnaval(encodeMiddlewares, this.decodeMiddlewares, this.providersObject);
    }
    decoders(...decodeMiddlewares) {
        return new Carnaval(this.encodeMiddlewares, decodeMiddlewares, this.providersObject);
    }
    providers(providersObject) {
        return new Carnaval(this.encodeMiddlewares, this.decodeMiddlewares, providersObject);
    }
    codec(mapping) {
        return new CodecDecorator(mapping, this.encodeMiddlewares, this.decodeMiddlewares, this.providersObject);
    }
}

module.exports = () => {
    return new Carnaval();
};
