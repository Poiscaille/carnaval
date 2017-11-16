const test = require('ava');

const Codec = require('../lib/codec');
const Mapping = require('../lib/mapping');
const Domain = require('../lib/domain');

class Basic {
    constructor(data) {
        Object.assign(this, data);
    }
    get props() {
        return {
            name: String
        };
    }
}

const BasicMapping = Mapping.pick(Basic, 'name');

test('decode', t => {
    const json = {name: 'Shoes'};
    const codec = new Codec(BasicMapping);

    return codec.decode(json).then(basic => {
        t.true(basic instanceof Basic);
        t.is(basic.name, json.name);
    });
});

test('encode', t => {
    const basic = new Basic({name: 'Shoes'});
    const codec = new Codec(BasicMapping);

    return codec.encode(basic).then(json => {
        t.is(json.name, basic.name);
    });
});

const DateMapping = Mapping.pickAll(Date)
.encodeWith(object => object ? object.getTime() : undefined)
.decodeWith(json => json ? new Date(json) : undefined);

test('decode date', t => {
    const timestamp = 1483916400000;
    const codec = new Codec(DateMapping);

    return codec.decode(timestamp).then(date => {
        t.is(date.getTime(), new Date(timestamp).getTime());
    });
});

test('encode date', t => {
    const timestamp = 1483916400000;
    const date = new Date(timestamp);
    const codec = new Codec(DateMapping);

    return codec.encode(date).then(timestamp => {
        t.is(new Date(timestamp).getTime(), date.getTime());
    });
});

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

    return codec.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, json.name);
    });
});

test('encode', t => {
    const thing = new Thing({name: 'Shoes'});
    const codec = new Codec(ThingMapping);

    return codec.encode(thing).then(json => {
        t.is(json.name, thing.name);
    });
});

class Box extends Domain {
    get props() {
        return {
            size: String,
            thing: Thing
        };
    }
}

const BoxMapping = Mapping.pick(Box, 'size', 'thing').mapWith(ThingMapping);

test('decode deep', t => {
    const json = {size: 'Medium', thing: {name: 'Shoes'}};
    const codec = new Codec(BoxMapping);

    return codec.decode(json).then(box => {
        t.true(box instanceof Box);
        t.is(box.size, json.size);
        t.true(box.thing instanceof Thing);
        t.is(box.thing.name, json.thing.name);
    });
});

test('encode deep', t => {
    const box = new Box({size: 'Medium', thing: new Thing({name: 'Shoes'})});
    const codec = new Codec(BoxMapping);

    return codec.encode(box).then(json => {
        t.is(json.size, box.size);
        t.is(json.thing.name, box.thing.name);
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

const GiftMapping = Mapping.pick(Gift, 'size', 'names');

test('decode array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const codec = new Codec(GiftMapping);

    return codec.decode(json).then(gift => {
        t.true(gift instanceof Gift);
        t.is(gift.size, json.size);
        t.true(gift.names instanceof Array);
        t.is(gift.names[0].constructor, String);
        t.is(gift.names[1].constructor, String);
        t.is(gift.names[0], json.names[0]);
        t.is(gift.names[1], json.names[1]);
    });
});

test('encode array', t => {
    const gift = new Gift({size: 'Medium', names: ['Shoes', 'Shirt']});
    const codec = new Codec(GiftMapping);

    return codec.encode(gift).then(json => {
        t.is(json.size, gift.size);
        t.true(gift.names instanceof Array);
        t.is(json.names[0], gift.names[0]);
        t.is(json.names[1], gift.names[1]);
    });
});

class Bookcase extends Domain {
    get props() {
        return {
            size: String,
            things: [Thing]
        };
    }
}

const BookcaseMapping = Mapping.pick(Bookcase, 'size', 'things').mapWith(ThingMapping);

test('decode array deep', t => {
    const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 'Shirt'}]};
    const codec = new Codec(BookcaseMapping);

    return codec.decode(json).then(bookcase => {
        t.true(bookcase instanceof Bookcase);
        t.is(bookcase.size, json.size);
        t.true(bookcase.things instanceof Array);
        t.true(bookcase.things[0] instanceof Thing);
        t.true(bookcase.things[1] instanceof Thing);
        t.is(bookcase.things.name, json.things.name);
        t.is(bookcase.things.name, json.things.name);
    });
});

test('encode array deep', t => {
    const bookcase = new Bookcase({size: 'Medium', things: [new Thing({name: 'Shoes'}), new Thing({name: 'Shirt'})]});
    const codec = new Codec(BookcaseMapping);

    return codec.encode(bookcase).then(json => {
        t.is(json.size, bookcase.size);
        t.true(bookcase.things instanceof Array);
        t.is(json.things[0].constructor, Object);
        t.is(json.things[1].constructor, Object);
        t.is(json.things.name, bookcase.things.name);
        t.is(json.things.name, bookcase.things.name);
    });
});

class Event extends Domain {
    get props() {
        return {
            date: Date
        };
    }
}

const EventPropertyMapping = Mapping.pick(Event, 'date').mapWith({
    date: {
        encode: value => value.getTime(),
        decode: value => new Date(value)
    }
});

test('decode property mapping', t => {
    const json = {date: 1483916400000};
    const codec = new Codec(EventPropertyMapping);

    return codec.decode(json).then(mixed => {
        t.is(mixed.date.getTime(), new Date('01/09/2017').getTime());
    });
});

test('encode property mapping', t => {
    const mixed = new Event({date: new Date('01/09/2017')});
    const codec = new Codec(EventPropertyMapping);

    return codec.encode(mixed).then(json => {
        t.is(json.date, 1483916400000);
    });
});

const EventReferenceCopyMapping = Mapping.pickAll(Event);

test('decode date as same', t => {
    const date = new Date(1483916400000);
    const json = {date: date};
    const codec = new Codec(EventReferenceCopyMapping);

    return codec.decode(json).then(transform => {
        t.is(transform.date.getTime(), date.getTime());
        t.is(transform.date, date);
    });
});

test('encode date as same', t => {
    const date = new Date(1483916400000);
    const transform = new Event({date: date});
    const codec = new Codec(EventReferenceCopyMapping);

    return codec.encode(transform).then(json => {
        t.is(json.date.getTime(), date.getTime());
        t.is(json.date, date);
    });
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

    return codec.decode(json).then(custom => {
        t.is(custom.date.getTime(), new Date('01/09/2017').getTime());
        t.true(custom.thing instanceof Thing);
        t.is(custom.thing.name, json.thing.name);
    });
});

test('encode custom', t => {
    const custom = new Custom({date: new Date('01/09/2017'), thing: new Thing({name: 'Shoes'})});
    const codec = new Codec(CustomMapping);

    return codec.encode(custom).then(json => {
        t.is(json.time, 1483916400000);
        t.is(json.thing.name, custom.thing.name);
    });
});

const EventMapping = Mapping.pickAll(Event).mapWith(DateMapping);

test('decode type mappings', t => {
    const json = {date: 1483916400000};
    const codec = new Codec(EventMapping);

    return codec.decode(json).then(event => {
        t.true(event instanceof Event);
        t.is(event.date.getTime(), new Date(json.date).getTime());
    });
});

test('encode type mappings', t => {
    const event = new Event({date: new Date(1483916400000)});
    const codec = new Codec(EventMapping);

    return codec.encode(event).then(json => {
        t.is(json.date, 1483916400000);
        t.is(new Date(json.date).getTime(), event.date.getTime());
    });
});

test('encode type mappings empty', t => {
    const event = new Event();
    const codec = new Codec(EventMapping);

    return codec.encode(event).then(json => {
        t.is(json.date, undefined);
    });
});

class EmbeddedEvent extends Domain {
    get props() {
        return {
            event: Event
        };
    }
}

const EmbeddedEventMapping = Mapping.pickAll(EmbeddedEvent)
.mapWith(Mapping.pickAll(Event), DateMapping);

test('decode deep with mappings', t => {
    const json = {event: {date: 1483916400000}};
    const codec = new Codec(EmbeddedEventMapping);

    return codec.decode(json).then(deep => {
        t.true(deep.event instanceof Event);
        t.is(deep.event.date.getTime(), new Date(json.event.date).getTime());
    });
});

test('encode deep with mappings', t => {
    const deep = new EmbeddedEvent({event: new Event({date: new Date(1483916400000)})});
    const codec = new Codec(EmbeddedEventMapping);

    return codec.encode(deep).then(json => {
        t.is(json.event.date, 1483916400000);
        t.is(new Date(json.event.date).getTime(), deep.event.date.getTime());
    });
});
