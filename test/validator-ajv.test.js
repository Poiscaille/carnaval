const test = require('ava');

const Domain = require('../lib/domain');
const Mapping = require('../lib/mapping');
const validate = require('../lib/validator-ajv');
const carnaval = require('../lib/carnaval');

class Thing extends Domain {
    get props() {
        return {
            name: {type: String, rules: {required: true}}
        };
    }
}

const ThingMapping = Mapping.pick(Thing, 'name');

test('validate', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().decoders(object => validate(object)).codec(ThingMapping);

    return codec.decode(json)
    .then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate as promise', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().decoders(object => Promise.resolve(object).then(object => validate(object))).codec(ThingMapping);

    return codec.decode(json)
    .then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate required error', t => {
    const json = {name: null};
    const codec = carnaval().decoders(object => validate(object)).codec(ThingMapping);

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'should have required property \'name\'');
    });
});

test('validate typed error', t => {
    const json = {name: 12};
    const codec = carnaval().decoders(object => validate(object)).codec(ThingMapping);

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'name should be string');
    });
});

class Box extends Domain {
    get props() {
        return {
            size: {type: String, rules: {required: true}},
            thing: Thing
        };
    }
}

const BoxMapping = Mapping.pick(Box, 'size', 'thing').mapWith(ThingMapping);

test('validate deep error', t => {
    const json = {size: 'Medium', thing: null};
    const codec = carnaval().decoders(object => validate(object)).codec(BoxMapping);

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'thing should have required property \'name\'');
    });
});

class Gift extends Domain {
    get props() {
        return {
            size: String,
            names: {type: [String], rules: {maxItems: 2}}
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

test('validate array typed error', t => {
    const json = {size: 'Medium', names: ['Shoes', 12]};
    const codec = carnaval().decoders(object => validate(object)).codec(GiftMapping);

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'names[1] should be string');
    });
});

test('validate array condition error', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt', 'Pants']};
    const codec = carnaval().decoders(object => validate(object)).codec(GiftMapping);

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'names should NOT have more than 2 items');
    });
});

class Bookcase extends Domain {
    get props() {
        return {
            size: String,
            things: {type: [Thing], rules: {
                props: {
                    name: {type: String, rules: {required: true}}
                }
            }}
        };
    }
}

const BookcaseMapping = Mapping.pick(Bookcase, 'size', 'things').mapWith(ThingMapping);

test('validate array deep error', t => {
    const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 12}]};
    const codec = carnaval().decoders(object => validate(object)).codec(BookcaseMapping);

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'things[1].name should be string');
    });
});
