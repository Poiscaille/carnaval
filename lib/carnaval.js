
const Promise = require('./promise-polyfill');
const Codec = require('../lib/codec');
const {stringCodec, numberCodec, booleanCodec} = require('../lib/codec');

class CarnavalCodec extends Codec {
    constructor(mixed, encoders, decoders, providers, normalize) {
        super(mixed);
        this.encoders = encoders;
        this.decoders = decoders;
        this.providers = providers;
        
        if (normalize !== false) {
            this.onType('string', stringCodec);
            this.onType('number', numberCodec);
            this.onType('boolean', booleanCodec);
        }
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
    constructor(encodeMiddlewares, decodeMiddlewares, providersObject, normalized) {
        this.encodeMiddlewares = encodeMiddlewares || [];
        this.decodeMiddlewares = decodeMiddlewares || [];
        this.providersObject = providersObject || [];
        this.normalized = (normalized !== false);
    }
    afterEncode(...encodeMiddlewares) {
        return new Carnaval(encodeMiddlewares, this.decodeMiddlewares, this.providersObject, this.normalized);
    }
    afterDecode(...decodeMiddlewares) {
        return new Carnaval(this.encodeMiddlewares, decodeMiddlewares, this.providersObject, this.normalized);
    }
    providers(providersObject) {
        return new Carnaval(this.encodeMiddlewares, this.decodeMiddlewares, providersObject, this.normalized);
    }
    normalize(normalized) {
        return new Carnaval(this.encodeMiddlewares, this.decodeMiddlewares, this.providersObject, normalized);
    }
    codecForClass(Clazz) {
        return new CarnavalCodec(Clazz, this.encodeMiddlewares, this.decodeMiddlewares, this.providersObject, this.normalized);
    }
    codecCustom(options) {
        return new CarnavalCodec(options, this.encodeMiddlewares, this.decodeMiddlewares, this.providersObject, this.normalized);
    }
}

module.exports = () => {
    return new Carnaval();
};

module.exports.Codec = Codec;
module.exports.Domain = require('../lib/domain');
