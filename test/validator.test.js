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

const thingMapping = new Mapping(Thing).select('name');

test('decode', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().codec(thingMapping);

    return codec.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, json.name);
    });
});

test('freeze', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().decoders(object => Object.freeze(object)).codec(thingMapping);

    return codec.decode(json).then(thing => {
        const error = t.throws(() => {
            thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});

test('validate', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().decoders(object => validate(object)).codec(thingMapping);

    return codec.decode(json).then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate required error', t => {
    const json = {name: null};
    const codec = carnaval().decoders(object => validate(object)).codec(thingMapping);

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

const boxMapping = new Mapping(Box).select('size', 'thing').mapProperties({
    thing: thingMapping
});

test('freeze deep', t => {
    const json = {size: 'Medium', thing: {name: 'Shoes'}};
    const codec = carnaval().decoders(object => deepFreeze(object)).codec(boxMapping);

    return codec.decode(json).then(box => {
        const error = t.throws(() => {
            box.thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});

test('validate deep error', t => {
    const json = {size: 'Medium', thing: null};
    const codec = carnaval().decoders(object => validate(object)).codec(boxMapping);

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

const giftMapping = new Mapping(Gift).select('size', 'names');

test('validate array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const codec = carnaval().decoders(object => validate(object)).codec(giftMapping);

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
