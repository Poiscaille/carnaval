const test = require('ava');

const Domain = require('../lib/domain');
const Mapping = require('../lib/mapping');
const validate = require('../lib/validator');
const carnaval = require('../lib/carnaval');

const deepFreeze = o => {
    Object.freeze(o);

    Object.getOwnPropertyNames(o).forEach(prop => {
        if (o.hasOwnProperty(prop) &&
            o[prop] !== null &&
            (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
            !Object.isFrozen(o[prop])) {
            deepFreeze(o[prop]);
        }
    });
    return o;
};

class Thing extends Domain {
    get props() {
        return {
            name: {type: String, rules: {required: true}}
        };
    }
}

const ThingMapping = Mapping.of(Thing, {
    name: {mapper: String}
});


test('decode', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().codec(ThingMapping);
    const thing = codec.decode(json);

    t.true(thing instanceof Thing);
    t.is(thing.name, json.name);
});

test('freeze', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().decoders(object => Object.freeze(object)).codec(ThingMapping);
    const thing = codec.decode(json);

    const error = t.throws(() => {
        thing.name = 'Dress';
    });

    t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
});

test('validate', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().decoders(object => validate(object)).codec(ThingMapping);
    const thing = codec.decode(json);

    t.is(thing.name, json.name);
});

test('validate required error', t => {
    const json = {name: null};
    const codec = carnaval().decoders(object => validate(object)).codec(ThingMapping);

    const error = t.throws(() => {
        const thing = codec.decode(json); // eslint-disable-line no-unused-vars
    });

    t.is(error.message, 'name is required');
});

class Box extends Domain {
    get props() {
        return {
            size: {type: String, rules: {required: true}},
            thing: {type: Thing, rules: {
                props: {
                    name: {type: String, rules: {required: true}}
                }
            }}
        };
    }
}

const BoxMapping = Mapping.of(Box, {
    size: {mapper: String},
    thing: {mapper: ThingMapping}
});

test('freeze deep', t => {
    const json = {size: 'Medium', thing: {name: 'Shoes'}};
    const codec = carnaval().decoders(object => deepFreeze(object)).codec(BoxMapping);
    const box = codec.decode(json);

    const error = t.throws(() => {
        box.thing.name = 'Dress';
    });

    t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
});

test('validate deep error', t => {
    const json = {size: 'Medium', thing: null};
    const codec = carnaval().decoders(object => validate(object)).codec(BoxMapping);

    const error = t.throws(() => {
        const box = codec.decode(json); // eslint-disable-line no-unused-vars
    });

    t.is(error.message, 'thing.name is required');
});

class Gift extends Domain {
    get props() {
        return {
            size: String,
            names: [String]
        };
    }
}

const GiftMapping = Mapping.of(Gift, {
    size: {mapper: String},
    names: {mapper: [String]}
});

test('validate array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const codec = carnaval().decoders(object => validate(object)).codec(GiftMapping);
    const gift = codec.decode(json);

    t.true(gift instanceof Gift);
    t.is(gift.size, json.size);
    t.true(gift.names instanceof Array);
    t.is(gift.names[0].constructor, String);
    t.is(gift.names[1].constructor, String);
    t.is(gift.names[0], json.names[0]);
    t.is(gift.names[1], json.names[1]);
});
