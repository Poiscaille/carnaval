const test = require('ava');
const Promise = require('bluebird');

const carnaval = require('../');
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
            id: 'number',
            name: 'string',
            price: 'number',
            company: 'string',
            creation: 'date'
        };
    }
    get options() {
        return {
            frozen: true,
            validate: validate
        };
    }
    setCompany(company) {
        return this.assign({company: company});
    }
}

const repositoryCodec = carnaval().codecForClass(Thing).onProp('creation', {
    encode: value => !value ? '' : value.toISOString().slice(0, 10),
    decode: value => !value ? null : new Date(value)
});

test('get /route', t => {
    const user = {company: 'Green'};

    const viewCodec = carnaval().codecForClass(Thing).pick('id', 'name', 'price', 'creation');

    return repository.shield(user).find()
    .then(datas => repositoryCodec.decode(datas))
    .then(things => viewCodec.encode(things))
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

    const viewCodec = carnaval().afterEncode(json => formattedPrice(json))
    .codecForClass(Thing).pick('id', 'name', 'price', 'creation');

    return repository.shield(user).findById(id)
    .then(data => repositoryCodec.decode(data))
    .then(thing => viewCodec.encode(thing))
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

    const viewCodec = carnaval().afterDecode(object => object.setCompany(user.company))
    .codecForClass(Thing).pick('id', 'name', 'price', 'creation');

    return viewCodec.decode(body)
    .then(thing => repositoryCodec.encode(thing))
    .then(data => repository.shield(user).insert(data))
    .then(data => repositoryCodec.decode(data))
    .then(thing => viewCodec.encode(thing))
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

    const viewCodec = carnaval().afterDecode(object => object.setCompany(user.company))
    .codecForClass(Thing).pick('id', 'name', 'price', 'creation');

    const repositoryShield = repository.shield(user);

    return viewCodec.decode(body)
    .then(thing => repositoryCodec.encode(thing))
    .then(data => repositoryShield.update(data))
    .then(() => repositoryShield.findById(body.id))
    .then(data => repositoryCodec.decode(data))
    .then(thing => viewCodec.encode(thing))
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

    const viewCodec = carnaval().codecForClass(Thing).pick('id', 'name', 'price', 'creation');

    const repositoryShield = repository.shield(user);

    return repositoryShield.delete(id)
    .then(() => repositoryShield.find())
    .then(datas => repositoryCodec.decode(datas))
    .then(things => viewCodec.encode(things))
    .then(jsons => {
        t.is(jsons.length, 5);
        for (let i = 0; i < 5; i++) {
            t.not(jsons[i].id, 4);
        }
    });
});

// TODO price 10% discount done via frozen object
