const test = require('ava');

const Domain = require('../lib/domain');
const validate = require('../lib/validator');

class Thing extends Domain {
    get props() {
        return {
            name: String
        };
    }
}

test('domain creation', t => {
    const name = 'Kidstown';
    const thing = new Thing({name});

    t.is(thing.name, name);
});

test('domain update', t => {
    const name = 'Foundry Inc';
    const thing = new Thing({name: 'Kidstown'});

    thing.name = name;

    t.is(thing.name, name);
});

test('domain assign', t => {
    const name = 'Foundry Inc';
    const thing = new Thing({name: 'Kidstown'});

    thing.assign({name: name});

    t.is(thing.name, name);
});

class FrozenThing extends Domain {
    get props() {
        return {
            name: String
        };
    }
    get options() {
        return {
            frozen: true
        };
    }
}

test('domain frozen creation', t => {
    const name = 'Kidstown';
    const thing = new FrozenThing({name});

    t.is(thing.name, name);
});

test('domain frozen update', t => {
    const name = 'Foundry Inc';
    const thing = new FrozenThing({name: 'Kidstown'});

    const error = t.throws(() => {
        thing.name = name;
    });
    t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<FrozenThing>\'');
});

test('domain frozen assign', t => {
    const before = 'Kidstown';
    const after = 'Foundry Inc';
    const thing = new FrozenThing({name: before});

    const assigned = thing.assign({name: after});

    t.is(thing.name, before);
    t.is(assigned.name, after);

    const error = t.throws(() => {
        assigned.name = before;
    });
    t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<FrozenThing>\'');
});

class FrozenValidatedThing extends Domain {
    get props() {
        return {
            name: {type: String, rules: {required: true}}
        };
    }
    get options() {
        return {
            frozen: true,
            validate: validate
        };
    }
}

test('domain frozen valid creation', t => {
    const name = 'Kidstown';
    const thing = new FrozenValidatedThing({name});

    t.is(thing.name, name);
});

test('domain frozen invalid creation', t => {
    const error = t.throws(() => {
        const thing = new FrozenValidatedThing(); // eslint-disable-line no-unused-vars
    });
    t.is(error.message, 'name is required');
});

test('domain frozen valid update', t => {
    const before = 'Kidstown';
    const after = 'Foundry Inc';
    const thing = new FrozenValidatedThing({name: before});

    const assigned = thing.assign({name: after});

    t.is(assigned.name, after);
});

test('domain frozen invalid update', t => {
    const before = 'Kidstown';
    const after = null;
    const thing = new FrozenValidatedThing({name: before});

    const error = t.throws(() => {
        const assigned = thing.assign({name: after}); // eslint-disable-line no-unused-vars
    });
    t.is(error.message, 'name is required');
});
