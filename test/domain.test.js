const {expect} = require('chai');

const Domain = require('../lib/Domain');

class Thing extends Domain {
    get props() {
        return {
            name: String
        };
    }
}

describe("domain", () => {
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

    it('domain assign', () => {
        const name = 'Shirt';
        const thing = new Thing({name: 'Shoes'});

        thing.assign({name: name});

        expect(thing.name).to.equal(name);
    });
});
