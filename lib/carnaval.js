
const Promise = require('bluebird');

const Codec = require('../lib/codec');

class CodecDecorator extends Codec {
    constructor(mapping, encoders, decoders) {
        super(mapping);
        this.encoders = encoders;
        this.decoders = decoders;
    }
    encode(object) {
        return super.encode(object)
        .then(json => {
            return Promise.reduce(this.encoders, (memo, middleware) => {
                return Promise.resolve(middleware(memo));
            }, json);
        });
    }
    decode(json) {
        return super.decode(json)
        .then(object => {
            return Promise.reduce(this.decoders, (memo, middleware) => {
                return Promise.resolve(middleware(memo));
            }, object);
        });
    }
}

class Carnaval {
    constructor(encodeMiddlewares, decodeMiddlewares) {
        this.encodeMiddlewares = encodeMiddlewares || [];
        this.decodeMiddlewares = decodeMiddlewares || [];
    }
    encoders(...encodeMiddlewares) {
        return new Carnaval(encodeMiddlewares, this.decodeMiddlewares);
    }
    decoders(...decodeMiddlewares) {
        return new Carnaval(this.encodeMiddlewares, decodeMiddlewares);
    }
    codec(mapping) {
        return new CodecDecorator(mapping, this.encodeMiddlewares, this.decodeMiddlewares);
    }
}

module.exports = () => {
    return new Carnaval();
};
