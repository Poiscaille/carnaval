const test = require('ava');

const validate = require('./validator-ajv');
const carnaval = require('../../');
const Domain = carnaval.Domain;

class Thing extends Domain {
    get props() {
        return {
            name: {type: 'string', rules: {required: true}}
        };
    }
}

test('validate', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Thing).pick('name');

    return codec.decode(json)
    .then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate as promise', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().afterDecode(object => Promise.resolve(object).then(object => validate(object)))
    .codecForClass(Thing).pick('name');

    return codec.decode(json)
    .then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate required error', t => {
    const json = {name: null};
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Thing).pick('name');

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'should have required property \'name\'');
    });
});

test('validate typed error', t => {
    const json = {name: 12};
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Thing).pick('name');

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'name should be string');
    });
});

class Box extends Domain {
    get props() {
        return {
            size: {type: 'string', rules: {required: true}},
            thing: {type: 'thing', rules: {domain: Thing}}
        };
    }
}

test('validate deep error', t => {
    const json = {size: 'Medium', thing: null};
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Box).pick('size', 'thing')
    .onType('thing', carnaval.Codec.forClass(Thing));

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'thing should have required property \'name\'');
    });
});

class Gift extends Domain {
    get props() {
        return {
            size: 'string',
            names: {type: ['string'], rules: {maxItems: 2}}
        };
    }
}

test('validate array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Gift).pick('size', 'names');

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
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Gift).pick('size', 'names');

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'names[1] should be string');
    });
});

test('validate array condition error', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt', 'Pants']};
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Gift).pick('size', 'names');

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'names should NOT have more than 2 items');
    });
});

class Bookcase extends Domain {
    get props() {
        return {
            size: 'string',
            things: {type: ['thing'], rules: {
                domain: Thing,
                props: {
                    name: {type: 'string', rules: {required: true}}
                }
            }}
        };
    }
}

test('validate array deep error', t => {
    const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 12}]};
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Bookcase).pick('size', 'things')
    .onType(carnaval.Codec.forClass(Thing));

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'things[1].name should be string');
    });
});
