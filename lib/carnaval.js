
const Codec = require('../lib/codec');

class CodecDecorator extends Codec {
    constructor(mapping, encoders, decoders) {
        super(mapping);
        this.encoders = encoders;
        this.decoders = decoders;
    }
    encode(object) {
        const json = super.encode(object);
        return this.encoders.reduce((memo, middleware) => middleware(memo), json);
    }
    decode(json) {
        const object = super.decode(json);
        return this.decoders.reduce((memo, middleware) => middleware(memo), object);
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
