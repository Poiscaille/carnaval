const {expect} = require('chai');

const Domain = require('../lib/Domain');

class Thing extends Domain {
    name;
    constructor(data) {
        super();
        Domain.assign(this, data);
    }

    get props() {
        return {
            name: String
        };
    }
}

class Box extends Domain {
    size;
    thing;

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

    class Bookcase extends Domain {
        size;
        things;
        
        constructor(data) {
            super();
            Domain.assign(this, data);
        }

        get props() {
            return {
                size: String,
                things: [Thing]
            };
        }
    }

    it('domain creation (cloning props)', () => {
        const name = 'Shoes';
        const json = {size: 40, thing: new Thing({name})};
        const box = new Box(json);
        const duplicate = new Box(json);

        box.thing.name = '';

        expect(box.thing.name).to.equal('');
        expect(duplicate.thing.name).to.equal('Shoes');
    });

    it('domain creation (cloning array props)', () => {
        const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 'Shirt'}]};
        const bookcase = new Bookcase(json);
        const duplicate = new Bookcase(json);

        bookcase.things[0].name = '';

        expect(bookcase.things[0].name).to.equal('');
        expect(duplicate.things[0].name).to.equal('Shoes');
    });
});
