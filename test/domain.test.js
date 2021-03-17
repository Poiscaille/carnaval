const test = require('ava');

const Domain = require('../lib/Domain');

class Thing extends Domain {
    get props() {
        return {
            name: String
        };
    }
}

test('domain creation', t => {
    const name = 'Shoes';
    const thing = new Thing({name});

    t.is(thing.name, name);
});

test('domain update', t => {
    const name = 'Shirt';
    const thing = new Thing({name: 'Shoes'});

    thing.name = name;

    t.is(thing.name, name);
});

test('domain assign', t => {
    const name = 'Shirt';
    const thing = new Thing({name: 'Shoes'});

    thing.assign({name: name});

    t.is(thing.name, name);
});
