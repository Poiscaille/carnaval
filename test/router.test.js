const {expect} = require('chai');
const Promise = require('bluebird');

const carnaval = require('../');
const Mapping = carnaval.Mapping;
const Domain = carnaval.Domain;
const validate = require('./extras/validator');

const repository = {
    store: [
        {id: 1, name: 'Geoffrey Baker', price: 490, creation: '2017-10-25', company: 'Green'},
        {id: 2, name: 'Kidstown', price: 490, creation: '2017-10-25', company: 'Green'},
        {id: 3, name: 'Military Collectibles', price: 490, creation: '2017-10-25', company: 'Green'},
        {id: 4, name: 'Barney Clothiers', price: 490, creation: '2017-10-25', company: 'Green'},
        {id: 5, name: 'Foundry Inc', price: 490, creation: '2017-10-25', company: 'Green'},
        {id: 6, name: 'Blue Bargains', price: 490, creation: '2017-10-25', company: 'Green'},
        {id: 7, name: 'Treasure House', price: 490, creation: '2017-10-25', company: 'Yellow'},
        {id: 8, name: 'Omnico', price: 490, creation: '2017-10-25', company: 'Yellow'},
        {id: 9, name: 'Fifth Avenue', price: 490, creation: '2017-10-25', company: 'Yellow'}
    ],
    shield: user => {
        user = user || {};
        let store = repository.store.slice(0);

        return {
            find: () => {
                return Promise.resolve(store.filter(item => {
                    return item.company === user.company;
                }));
            },
            findById: id => {
                return Promise.resolve(store.find(item => {
                    return item.company === user.company && item.id === id;
                }));
            },
            insert: body => {
                body.id = store.length + 1;
                body.creation = '2017-10-25';
                store.push(body);

                return Promise.resolve(body);
            },
            update: body => {
                const index = store.findIndex(item => {
                    return item.company === user.company && item.id === body.id;
                });
                if (index !== -1) {
                    body.creation = store[index].creation;
                    store[index] = body;
                }
                return Promise.resolve();
            },
            delete: id => {
                store = store.filter(item => {
                    return item.company === user.company && item.id !== id;
                });

                return Promise.resolve();
            }
        };
    }
};

class Thing extends Domain {
    get props() {
        return {
            id: Number,
            name: String,
            price: Number,
            company: String,
            creation: Date
        };
    }
    get options() {
        return {
            frozen: true,
            validate: validate
        };
    }
    setCompany(company) {
        return Domain.override(this, {company: company});
    }
}

const repositoryMapping = Mapping.map(Thing).with({
    creation: {
        get: value => !value ? '' : value.toISOString().slice(0, 10),
        set: value => !value ? null : new Date(value)
    }
});

describe('router', () => {
    it('get /route', () => {
        const user = {company: 'Green'};

        const viewMapping = Mapping.map(Thing).with({
            company: {get: false}
        });

        return repository.shield(user).find()
        .then(datas => repositoryMapping.decode(datas))
        .then(things => viewMapping.encode(things))
        .then(jsons => {
            expect(jsons.length, 6);
            for (let i = 0; i < 6; i++) {
                expect(jsons[i].id, i + 1);
            }
        });
    });

    it('get /route/:id', () => {
        const user = {company: 'Green'};

        const id = 2;
        const formattedPrice = json => {
            json.formattedPrice = ((json.price || 0) / 100).toFixed(2) + '€';
        };

        const viewMapping = Mapping.map(Thing).with({
            company: {get: false}
        })
        .afterEncode(json => formattedPrice(json));

        return repository.shield(user).findById(id)
        .then(data => repositoryMapping.decode(data))
        .then(thing => viewMapping.encode(thing))
        .then(json => {
            expect(json.id).to.equal(id);
            expect(json.name).to.equal('Kidstown');
            expect(json.price).to.equal(490);
            expect(json.formattedPrice).to.equal('4.90€');
            expect(json.creation.getTime()).to.equal(new Date('2017-10-25').getTime());
            expect(json.hasOwnProperty('company')).to.equal(false);
        });
    });

    it('post /route', () => {
        const user = {company: 'Green'};

        const body = {name: '319 Men', price: 490};

        const viewMapping = Mapping.map(Thing).with({
            company: {get: false}
        })
        .afterDecode(object => object.setCompany(user.company));

        return viewMapping.decode(body)
        .then(thing => repositoryMapping.encode(thing))
        .then(data => repository.shield(user).insert(data))
        .then(data => repositoryMapping.decode(data))
        .then(thing => viewMapping.encode(thing))
        .then(json => {
            expect(json.id).to.equal(10);
            expect(json.name).to.equal('319 Men');
            expect(json.price).to.equal(490);
            expect(json.creation.getTime()).to.equal(new Date('2017-10-25').getTime());
            expect(json.hasOwnProperty('company')).to.equal(false);
        });
    });

    it('put /route/:id', () => {
        const user = {company: 'Green'};

        const body = {id: 3, name: 'Alamo Military Collectibles', price: 490};

        const viewMapping = Mapping.map(Thing).with({
            company: {get: false}
        })
        .afterDecode(object => object.setCompany(user.company));

        const repositoryShield = repository.shield(user);

        return viewMapping.decode(body)
        .then(thing => repositoryMapping.encode(thing))
        .then(data => repositoryShield.update(data))
        .then(() => repositoryShield.findById(body.id))
        .then(data => repositoryMapping.decode(data))
        .then(thing => viewMapping.encode(thing))
        .then(json => {
            expect(json.id).to.equal(3);
            expect(json.name).to.equal('Alamo Military Collectibles');
            expect(json.price).to.equal(490);
            expect(json.creation.getTime()).to.equal(new Date('2017-10-25').getTime());
            expect(json.hasOwnProperty('company')).to.equal(false);
        });
    });

    it('delete /route/:id', () => {
        const user = {company: 'Green'};

        const id = 4;

        const viewMapping = Mapping.map(Thing).with({
            company: {get: false}
        });

        const repositoryShield = repository.shield(user);

        return repositoryShield.delete(id)
        .then(() => repositoryShield.find())
        .then(datas => repositoryMapping.decode(datas))
        .then(things => viewMapping.encode(things))
        .then(jsons => {
            expect(jsons.length, 5);
            for (let i = 0; i < 5; i++) {
                expect(jsons[i].id).to.not.equal(4);
            }
        });
    });

    // TODO price 10% discount done via frozen object
});
