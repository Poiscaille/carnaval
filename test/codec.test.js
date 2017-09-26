const test = require('ava');

const Codec = require('../lib/codec');
const Mapping = require('../lib/mapping');
const Domain = require('../lib/domain');

class Thing extends Domain {
    get props() {
        return {
            name: String
        };
    }
}

const ThingMapping = Mapping.pick(Thing, 'name');

test('decode', t => {

    const json = {name: 'Shoes'};
    const codec = new Codec(ThingMapping);
    const thing = codec.decode(json);

    t.true(thing instanceof Thing);
    t.is(thing.name, json.name);
});

test('encode', t => {
    const thing = new Thing({name: 'Shoes'});
    const codec = new Codec(ThingMapping);
    const json = codec.encode(thing);

    t.is(json.name, thing.name);
});

class Box extends Domain {
    get props() {
        return {
            size: String,
            thing: Thing
        };
    }
}

const BoxMapping = Mapping.pick(Box, 'size', 'thing').mapWith({
    thing: ThingMapping
});

test('decode deep', t => {
    const json = {size: 'Medium', thing: {name: 'Shoes'}};
    const codec = new Codec(BoxMapping);
    const box = codec.decode(json);

    t.true(box instanceof Box);
    t.is(box.size, json.size);
    t.true(box.thing instanceof Thing);
    t.is(box.thing.name, json.thing.name);
});

test('encore deep', t => {
    const box = new Box({size: 'Medium', thing: new Thing({name: 'Shoes'})});
    const codec = new Codec(BoxMapping);
    const json = codec.encode(box);

    t.is(json.size, box.size);
    t.is(json.thing.name, box.thing.name);
});

class Gift extends Domain {
    get props() {
        return {
            size: String,
            names: [String]
        };
    }
}

const GiftMapping = Mapping.pick(Gift, 'size', 'names');

test('decode array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const codec = new Codec(GiftMapping);
    const gift = codec.decode(json);

    t.true(gift instanceof Gift);
    t.is(gift.size, json.size);
    t.true(gift.names instanceof Array);
    t.is(gift.names[0].constructor, String);
    t.is(gift.names[1].constructor, String);
    t.is(gift.names[0], json.names[0]);
    t.is(gift.names[1], json.names[1]);
});

test('encode array', t => {
    const gift = new Gift({size: 'Medium', names: ['Shoes', 'Shirt']});
    const codec = new Codec(GiftMapping);
    const json = codec.encode(gift);

    t.is(json.size, gift.size);
    t.true(gift.names instanceof Array);
    t.is(json.names[0], gift.names[0]);
    t.is(json.names[1], gift.names[1]);
});

class Bookcase extends Domain {
    get props() {
        return {
            size: String,
            things: [Thing]
        };
    }
}

const BookcaseMapping = Mapping.pick(Bookcase, 'size', 'things').mapWith({
    things: ThingMapping
});

test('decode array deep', t => {
    const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 'Shirt'}]};
    const codec = new Codec(BookcaseMapping);
    const bookcase = codec.decode(json);

    t.true(bookcase instanceof Bookcase);
    t.is(bookcase.size, json.size);
    t.true(bookcase.things instanceof Array);
    t.true(bookcase.things[0] instanceof Thing);
    t.true(bookcase.things[1] instanceof Thing);
    t.is(bookcase.things.name, json.things.name);
    t.is(bookcase.things.name, json.things.name);
});

test('encode array deep', t => {
    const bookcase = new Bookcase({size: 'Medium', things: [new Thing({name: 'Shoes'}), new Thing({name: 'Shirt'})]});
    const codec = new Codec(BookcaseMapping);
    const json = codec.encode(bookcase);

    t.is(json.size, bookcase.size);
    t.true(bookcase.things instanceof Array);
    t.is(json.things[0].constructor, Object);
    t.is(json.things[1].constructor, Object);
    t.is(json.things.name, bookcase.things.name);
    t.is(json.things.name, bookcase.things.name);
});

class Transform extends Domain {
    get props() {
        return {
            date: Date
        };
    }
}

const TransformMapping = Mapping.pick(Transform, 'date').mapWith({
    date: {
        encode: value => value.getTime(),
        decode: value => new Date(value)
    }
});

test('decode transtyped', t => {
    const json = {date: 1483916400000};
    const codec = new Codec(TransformMapping);
    const mixed = codec.decode(json);

    t.is(mixed.date.getTime(), new Date('01/09/2017').getTime());
});

test('encode transtyped', t => {
    const mixed = new Transform({date: new Date('01/09/2017')});
    const codec = new Codec(TransformMapping);
    const json = codec.encode(mixed);

    t.is(json.date, 1483916400000);
});

test('decode invalid', t => {
    const error = t.throws(() => {
        class Invalid {} // no Domain inheritance
        class InvalidMapping extends Mapping.pick(Invalid) {} // eslint-disable-line no-unused-vars
    });

    t.is(error.message, 'Clazz should be a Domain subclass');
});

class Custom extends Domain {
    get props() {
        return {
            date: Date,
            thing: Thing
        };
    }
}

const CustomMapping = Mapping.pick(Custom)
    .encodeWith(object => {
        return {
            time: object.date.getTime(),
            thing: ThingMapping
        };
    })
    .decodeWith(json => {
        return new Custom({
            date: new Date(json.time),
            thing: ThingMapping
        });
    });

test('decode custom', t => {
    const json = {time: 1483916400000, thing: {name: 'Shoes'}};
    const codec = new Codec(CustomMapping);
    const custom = codec.decode(json);

    t.is(custom.date.getTime(), new Date('01/09/2017').getTime());
    t.true(custom.thing instanceof Thing);
    t.is(custom.thing.name, json.thing.name);
});

test('encode custom', t => {
    const custom = new Custom({date: new Date('01/09/2017'), thing: new Thing({name: 'Shoes'})});
    const codec = new Codec(CustomMapping);
    const json = codec.encode(custom);

    t.is(json.time, 1483916400000);
    t.is(json.thing.name, custom.thing.name);
});
