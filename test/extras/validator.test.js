const test = require('ava');

const validate = require('./validator');
const carnaval = require('../../');
const Domain = carnaval.Domain;

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
            name: {type: 'string', rules: {required: true}}
        };
    }
}

test('decode', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().codecForClass(Thing).pick('name');

    return codec.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, json.name);
    });
});

test('freeze', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().afterDecode(object => Object.freeze(object)).codecForClass(Thing).pick('name');

    return codec.decode(json).then(thing => {
        const error = t.throws(() => {
            thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});

test('validate', t => {
    const json = {name: 'Shoes'};
    const codec = carnaval().afterDecode(object => validate(object)).codecForClass(Thing).pick('name');

    return codec.decode(json).then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate required error', t => {
    const json = {name: null};
    const codec = carnaval().afterDecode(object => validate(object)).codecForClass(Thing).pick('name');

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'name is required');
    });
});

class Box extends Domain {
    get props() {
        return {
            size: {type: 'string', rules: {required: true}},
            thing: {type: 'thing', rules: {
                domain: Thing,
                props: {
                    name: {type: 'string', rules: {required: true}}
                }
            }}
        };
    }
}

test('freeze deep', t => {
    const json = {size: 'Medium', thing: {name: 'Shoes'}};
    const codec = carnaval().afterDecode(object => deepFreeze(object))
    .codecForClass(Box).pick('size', 'thing')
    .onType('thing', carnaval().codecForClass(Thing));

    return codec.decode(json).then(box => {
        const error = t.throws(() => {
            box.thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});

test('validate deep error', t => {
    const json = {size: 'Medium', thing: null};
    const codec = carnaval().afterDecode(object => validate(object))
    .codecForClass(Box).pick('size', 'thing')
    .onType('thing', carnaval().codecForClass(Thing));

    return codec.decode(json)
    .catch(error => {
        t.is(error.message, 'thing.name is required');
    });
});

class Gift extends Domain {
    get props() {
        return {
            size: 'string',
            names: ['string']
        };
    }
}

test('validate array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const codec = carnaval().afterDecode(object => validate(object)).codecForClass(Gift).pick('size', 'names');

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
