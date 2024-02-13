const {expect} = require('chai');

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

describe("validator", () => {
    it('decode', () => {
        const json = {name: 'Shoes'};
        const mapping = Mapping.map(Thing);

        return mapping.decode(json).then(thing => {
            expect(thing instanceof Thing).to.equal(true);
            expect(thing.name).to.equal(json.name);
        });
    });

    it('freeze', () => {
        const json = {name: 'Shoes'};
        const mapping = Mapping.map(Thing).afterDecode(object => Object.freeze(object));

        return mapping.decode(json).then(thing => {
            thing.name = 'Dress';
            expect(thing.name).to.equal('Shoes');
        });
    });

    it('validate', () => {
        const json = {name: 'Shoes'};
        const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

        return mapping.decode(json).then(thing => {
            expect(thing.name).to.equal(json.name);
        });
    });

    it('validate required error', () => {
        const json = {name: undefined};
        const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('name is required');
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

    it('freeze deep', () => {
        const json = {size: 'Medium', thing: {name: 'Shoes'}};
        const mapping = Mapping.map(Box).afterDecode(object => deepFreeze(object));

        return mapping.decode(json).then(box => {
            box.thing.name = 'Dress';
            expect(box.thing.name).to.equal('Shoes');
        });
    });

    it('validate deep error', () => {
        const json = {size: 'Medium', thing: null};
        const mapping = Mapping.map(Box).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('thing.name is required');
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

    it('validate array', () => {
        const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
        const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

        return mapping.decode(json).then(gift => {
            expect(gift instanceof Gift).to.equal(true);
            expect(gift.size).to.equal(json.size);
            expect(gift.names instanceof Array).to.equal(true);
            expect(gift.names[0].constructor).to.equal(String);
            expect(gift.names[1].constructor).to.equal(String);
            expect(gift.names[0]).to.equal(json.names[0]);
            expect(gift.names[1]).to.equal(json.names[1]);
        });
    });
});
