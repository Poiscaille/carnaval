const test = require('ava');

const validate = require('./validator');
const carnaval = require('../../');
const Mapping = carnaval.Mapping;
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
            name: String
        };
    }
    get rules() {
        return {
            name: {required: true}
        };
    }
}

test('decode', t => {
    const json = {name: 'Shoes'};
    const mapping = Mapping.map(Thing);

    return mapping.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, json.name);
    });
});

test('freeze', t => {
    const json = {name: 'Shoes'};
    const mapping = Mapping.map(Thing).afterDecode(object => Object.freeze(object));

    return mapping.decode(json).then(thing => {
        const error = t.throws(() => {
            thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});

test('validate', t => {
    const json = {name: 'Shoes'};
    const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

    return mapping.decode(json).then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate required error', t => {
    const json = {name: undefined};
    const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'name is required');
    });
});

class Box extends Domain {
    get props() {
        return {
            size: String,
            thing: Thing
        };
    }
    get rules() {
        return {
            size: {required: true},
            thing: {
                name: {required: true}
            }
        };
    }
}

test('freeze deep', t => {
    const json = {size: 'Medium', thing: {name: 'Shoes'}};
    const mapping = Mapping.map(Box).afterDecode(object => deepFreeze(object));

    return mapping.decode(json).then(box => {
        const error = t.throws(() => {
            box.thing.name = 'Dress';
        });
        t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<Thing>\'');
    });
});

test('validate deep error', t => {
    const json = {size: 'Medium', thing: null};
    const mapping = Mapping.map(Box).afterDecode(object => validate(object));

    return mapping.decode(json)
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

test('validate array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

    return mapping.decode(json).then(gift => {
        t.true(gift instanceof Gift);
        t.is(gift.size, json.size);
        t.true(gift.names instanceof Array);
        t.is(gift.names[0].constructor, String);
        t.is(gift.names[1].constructor, String);
        t.is(gift.names[0], json.names[0]);
        t.is(gift.names[1], json.names[1]);
    });
});
