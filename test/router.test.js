const test = require('ava');
const Promise = require('bluebird');

const Domain = require('../lib/domain');
const Mapping = require('../lib/mapping');
const carnaval = require('../lib/carnaval');

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
}

const ThingViewMapping = Mapping.pick(Thing, 'id', 'name', 'price', 'creation');

const ThingRepositoryMapping = Mapping.pickAll(Thing)
.encodeWith(object => {
    return Object.assign({}, object, {
        creation: !object.creation ? '' : object.creation.toISOString().slice(0, 10)
    });
})
.decodeWith(json => {
    return new Thing(Object.assign({}, json, {
        creation: !json.creation ? null : new Date(json.creation)
    }));
});

test('get /route', t => {
    const user = {company: 'Green'};

    const codecView = carnaval().decoders(object => Object.freeze(object)).codec(ThingViewMapping);
    const repositoryView = carnaval().decoders(object => Object.freeze(object)).codec(ThingRepositoryMapping);

    return repository.shield(user).find()
    .then(datas => {
        return Promise.map(datas, data => repositoryView.decode(data));
    })
    .then(things => {
        return Promise.map(things, thing => codecView.encode(thing));
    })
    .then(jsons => {
        t.is(jsons.length, 6);
        for (let i = 0; i < 6; i++) {
            t.is(jsons[i].id, i + 1);
        }
    });
});

test('get /route/:id', t => {
    const user = {company: 'Green'};

    const id = 2;
    const formattedPrice = json => {
        json.formattedPrice = ((json.price || 0) / 100).toFixed(2) + '€';
    };

    const codecView = carnaval().encoders(json => formattedPrice(json)).decoders(object => Object.freeze(object)).codec(ThingViewMapping);
    const repositoryView = carnaval().decoders(object => Object.freeze(object)).codec(ThingRepositoryMapping);

    return repository.shield(user).findById(id)
    .then(data => {
        return repositoryView.decode(data);
    })
    .then(thing => {
        return codecView.encode(thing);
    })
    .then(json => {
        t.is(json.id, id);
        t.is(json.name, 'Kidstown');
        t.is(json.price, 490);
        t.is(json.formattedPrice, '4.90€');
        t.is(json.creation.getTime(), new Date('2017-10-25').getTime());
        t.false(json.hasOwnProperty('company'));
    });
});

test('post /route', t => {
    const user = {company: 'Green'};

    const body = {name: '319 Men', price: 490};
    const company = json => {
        json.company = user.company;
    };

    const codecView = carnaval().decoders(object => company(object), object => Object.freeze(object)).codec(ThingViewMapping);
    const repositoryView = carnaval().decoders(object => Object.freeze(object)).codec(ThingRepositoryMapping);

    return codecView.decode(body)
    .then(thing => {
        return repositoryView.encode(thing);
    })
    .then(data => {
        return repository.shield(user).insert(data);
    })
    .then(data => {
        return repositoryView.decode(data);
    })
    .then(thing => {
        return codecView.encode(thing);
    })
    .then(json => {
        t.is(json.id, 10);
        t.is(json.name, '319 Men');
        t.is(json.price, 490);
        t.is(json.creation.getTime(), new Date('2017-10-25').getTime());
        t.false(json.hasOwnProperty('company'));
    });
});

test('put /route/:id', t => {
    const user = {company: 'Green'};

    const body = {id: 3, name: 'Alamo Military Collectibles', price: 490};
    const company = json => {
        json.company = user.company;
    };

    const codecView = carnaval().decoders(object => company(object), object => Object.freeze(object)).codec(ThingViewMapping);
    const repositoryView = carnaval().decoders(object => Object.freeze(object)).codec(ThingRepositoryMapping);

    const repositoryShield = repository.shield(user);

    return codecView.decode(body)
    .then(thing => {
        return repositoryView.encode(thing);
    })
    .then(data => {
        return repositoryShield.update(data);
    })
    .then(() => {
        return repositoryShield.findById(body.id);
    })
    .then(data => {
        return repositoryView.decode(data);
    })
    .then(thing => {
        return codecView.encode(thing);
    })
    .then(json => {
        t.is(json.id, 3);
        t.is(json.name, 'Alamo Military Collectibles');
        t.is(json.price, 490);
        t.is(json.creation.getTime(), new Date('2017-10-25').getTime());
        t.false(json.hasOwnProperty('company'));
    });
});

test('delete /route/:id', t => {
    const user = {company: 'Green'};

    const id = 4;
    const company = json => {
        json.company = user.company;
    };

    const codecView = carnaval().decoders(object => company(object), object => Object.freeze(object)).codec(ThingViewMapping);
    const repositoryView = carnaval().decoders(object => Object.freeze(object)).codec(ThingRepositoryMapping);

    const repositoryShield = repository.shield(user);

    return repositoryShield.delete(id)
    .then(() => {
        return repositoryShield.find();
    })
    .then(datas => {
        return Promise.map(datas, data => repositoryView.decode(data));
    })
    .then(things => {
        return Promise.map(things, thing => codecView.encode(thing));
    })
    .then(jsons => {
        t.is(jsons.length, 5);
        for (let i = 0; i < 5; i++) {
            t.not(jsons[i].id, 4);
        }
    });
});

// TODO price 10% discount done via frozen object
// TODO validation
