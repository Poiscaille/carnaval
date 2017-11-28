const test = require('ava');

const Domain = require('../lib/domain');
const validate = require('./extras/validator');

class Thing extends Domain {
    get props() {
        return {
            name: 'string'
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

class ImmutableThing extends Domain {
    get props() {
        return {
            name: 'string'
        };
    }
    get options() {
        return {
            immutable: true
        };
    }
}

test('domain immutable creation', t => {
    const name = 'Kidstown';
    const thing = new ImmutableThing({name});

    t.is(thing.name, name);
});

test('domain immutable update', t => {
    const name = 'Foundry Inc';
    const thing = new ImmutableThing({name: 'Kidstown'});

    const error = t.throws(() => {
        thing.name = name;
    });
    t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<ImmutableThing>\'');
});

test('domain immutable assign', t => {
    const before = 'Kidstown';
    const after = 'Foundry Inc';
    const thing = new ImmutableThing({name: before});

    const assigned = thing.assign({name: after});

    t.is(thing.name, before);
    t.is(assigned.name, after);

    const error = t.throws(() => {
        assigned.name = before;
    });
    t.is(error.message, 'Cannot assign to read only property \'name\' of object \'#<ImmutableThing>\'');
});

class ImmutableValidatedThing extends Domain {
    get props() {
        return {
            name: {type: 'string', rules: {required: true}}
        };
    }
    get options() {
        return {
            immutable: true,
            validate: validate
        };
    }
}

test('domain immutable valid creation', t => {
    const name = 'Kidstown';
    const thing = new ImmutableValidatedThing({name});

    t.is(thing.name, name);
});

test('domain immutable invalid creation', t => {
    const error = t.throws(() => {
        const thing = new ImmutableValidatedThing(); // eslint-disable-line no-unused-vars
    });
    t.is(error.message, 'name is required');
});

test('domain immutable valid update', t => {
    const before = 'Kidstown';
    const after = 'Foundry Inc';
    const thing = new ImmutableValidatedThing({name: before});

    const assigned = thing.assign({name: after});

    t.is(assigned.name, after);
});

test('domain immutable invalid update', t => {
    const before = 'Kidstown';
    const after = null;
    const thing = new ImmutableValidatedThing({name: before});

    const error = t.throws(() => {
        const assigned = thing.assign({name: after}); // eslint-disable-line no-unused-vars
    });
    t.is(error.message, 'name is required');
});
