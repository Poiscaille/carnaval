const {expect} = require('chai');

const Domain = require('../lib/Domain');

class Thing extends Domain {
    get props() {
        return {
            name: String
        };
    }
}

class Box extends Domain {
    name;
    constructor(data) {
        super();
        Domain.assign(this, data);
    }
    
    get props() {
        return {
            size: Number,
            thing: Thing
        };
    }
}


describe('domain', () => {
    it('domain creation', () => {
        const name = 'Shoes';
        const thing = new Thing({name});

        expect(thing.name).to.equal(name);
    });

    it('domain update', () => {
        const name = 'Shirt';
        const thing = new Thing({name: 'Shoes'});

        thing.name = name;

        expect(thing.name).to.equal(name);
    });

    it('domain creation (class property)', () => {
        const name = 'Shoes';
        const box = new Box({size: 40, thing: new Thing({name})});

        expect(box.size).to.equal(40);
        expect(box.thing.name).to.equal(name);
    });

    it('domain assign', () => {
        const name = 'Shirt';
        const thing = new Thing({name: 'Shoes'});

        Domain.assign(thing, {name: name});

        expect(thing.name).to.equal(name);
    });

    it('domain assign (missing prop)', () => {
        const name = 'Shirt';
        const thing = new Thing();

        Domain.assign(thing, {name: name});

        expect(thing.name).to.equal(name);
    });
});
