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

const ThingMapping = Mapping.pick(Thing, 'name');

test('decode', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().codec(ThingMapping);

    return codec.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, json.name);
    });
});

test('freeze', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().decoders(object => Object.freeze(object)).codec(ThingMapping);

    return codec.decode(json).then(thing => {
        const error = t.throws(() => {
            thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});

test('validate', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().decoders(object => validate(object)).codec(ThingMapping);

    return codec.decode(json).then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate required error', t => {
    const json = {name: null};
    const codec = carnaval().decoders(object => validate(object)).codec(ThingMapping);

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'name is required');
    });
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

const BoxMapping = Mapping.pick(Box, 'size', 'thing').mapWith({
    thing: ThingMapping
});

test('freeze deep', t => {
    const json = {size: 'Medium', thing: {name: 'Shoes'}};
    const codec = carnaval().decoders(object => deepFreeze(object)).codec(BoxMapping);

    return codec.decode(json).then(box => {
        const error = t.throws(() => {
            box.thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});

test('validate deep error', t => {
    const json = {size: 'Medium', thing: null};
    const codec = carnaval().decoders(object => validate(object)).codec(BoxMapping);

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'thing.name is required');
    });
});

class Gift extends Domain {
    get props() {
        return {
            size: String,
            names: [String]
        };
    }
}

const GiftMapping = Mapping.pick(Gift, 'size', 'names');

test('validate array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const codec = carnaval().decoders(object => validate(object)).codec(GiftMapping);

    return codec.decode(json).then(gift => {
        t.true(gift instanceof Gift);
        t.is(gift.size, json.size);
        t.true(gift.names instanceof Array);
        t.is(gift.names[0].constructor, String);
        t.is(gift.names[1].constructor, String);
        t.is(gift.names[0], json.names[0]);
        t.is(gift.names[1], json.names[1]);
    });
});
