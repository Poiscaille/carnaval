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

const basicMapping = new Mapping(Basic).select('name');

test('decode a class through mapping', t => {
    const json = {name: 'Shoes'};
    const codec = new Codec(basicMapping);

    return codec.decode(json).then(basic => {
        t.true(basic instanceof Basic);
        t.is(basic.name, json.name);
    });
});

test('encode a class through mapping', t => {
    const basic = new Basic({name: 'Shoes'});
    const codec = new Codec(basicMapping);

    return codec.encode(basic).then(json => {
        t.is(json.name, basic.name);
    });
});

const dateCodec = new Codec(Date, {
    encode: object => object ? object.getTime() : undefined,
    decode: json => json ? new Date(json) : undefined
});

test('decode a date through codec', t => {
    const timestamp = 1483916400000;
    const codec = dateCodec;

    return codec.decode(timestamp).then(date => {
        t.is(date.getTime(), new Date(timestamp).getTime());
    });
});

test('encode a date through codec', t => {
    const timestamp = 1483916400000;
    const date = new Date(timestamp);
    const codec = dateCodec;

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

const thingMapping = new Mapping(Thing).select('name');

test('decode a domain class through mapping', t => {
    const json = {name: 'Shoes'};
    const codec = new Codec(thingMapping);

    return codec.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, json.name);
    });
});

test('encode a domain class through mapping', t => {
    const thing = new Thing({name: 'Shoes'});
    const codec = new Codec(thingMapping);

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

const boxMapping = new Mapping(Box).select('size', 'thing').mapType(thingMapping);

test('decode a deep domain class through mapping', t => {
    const json = {size: 'Medium', thing: {name: 'Shoes'}};
    const codec = new Codec(boxMapping);

    return codec.decode(json).then(box => {
        t.true(box instanceof Box);
        t.is(box.size, json.size);
        t.true(box.thing instanceof Thing);
        t.is(box.thing.name, json.thing.name);
    });
});

test('encode a deep domain class through mapping', t => {
    const box = new Box({size: 'Medium', thing: new Thing({name: 'Shoes'})});
    const codec = new Codec(boxMapping);

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

const giftMapping = new Mapping(Gift).select('size', 'names');

test('decode an array through mapping', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const codec = new Codec(giftMapping);

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

test('encode an array through mapping', t => {
    const gift = new Gift({size: 'Medium', names: ['Shoes', 'Shirt']});
    const codec = new Codec(giftMapping);

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

const bookcaseMapping = new Mapping(Bookcase).select('size', 'things').mapType(thingMapping);

test('decode a domain array through mapping', t => {
    const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 'Shirt'}]};
    const codec = new Codec(bookcaseMapping);

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

test('encode a domain array through mapping', t => {
    const bookcase = new Bookcase({size: 'Medium', things: [new Thing({name: 'Shoes'}), new Thing({name: 'Shirt'})]});
    const codec = new Codec(bookcaseMapping);

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

const eventPropertyMapping = new Mapping(Event).select('date').mapProperties({
    date: {
        encode: value => value.getTime(),
        decode: value => new Date(value)
    }
});

test('decode a domain mapped property through mapping', t => {
    const json = {date: 1483916400000};
    const codec = new Codec(eventPropertyMapping);

    return codec.decode(json).then(mixed => {
        t.is(mixed.date.getTime(), new Date('01/09/2017').getTime());
    });
});

test('encode a domain property through mapping', t => {
    const mixed = new Event({date: new Date('01/09/2017')});
    const codec = new Codec(eventPropertyMapping);

    return codec.encode(mixed).then(json => {
        t.is(json.date, 1483916400000);
    });
});

const eventReferenceCopyMapping = new Mapping(Event).selectAll();

test('decode a date as reference without a codec', t => {
    const date = new Date(1483916400000);
    const json = {date: date};
    const codec = new Codec(eventReferenceCopyMapping);

    return codec.decode(json).then(transform => {
        t.is(transform.date.getTime(), date.getTime());
        t.is(transform.date, date);
    });
});

test('encode a date as reference without a codec', t => {
    const date = new Date(1483916400000);
    const transform = new Event({date: date});
    const codec = new Codec(eventReferenceCopyMapping);

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

const CustomCodec = new Codec(Custom, {
    encode: object => {
        return {
            time: object.date.getTime(),
            thing: thingMapping
        };
    },
    decode: json => {
        return new Custom({
            date: new Date(json.time),
            thing: thingMapping
        });
    }
});

test('decode a domain class through mapping codec with embedded mapping', t => {
    const json = {time: 1483916400000, thing: {name: 'Shoes'}};
    const codec = CustomCodec;

    return codec.decode(json).then(custom => {
        t.is(custom.date.getTime(), new Date('01/09/2017').getTime());
        t.true(custom.thing instanceof Thing);
        t.is(custom.thing.name, json.thing.name);
    });
});

test('encode a domain class through mapping codec with embedded mapping', t => {
    const custom = new Custom({date: new Date('01/09/2017'), thing: new Thing({name: 'Shoes'})});
    const codec = CustomCodec;

    return codec.encode(custom).then(json => {
        t.is(json.time, 1483916400000);
        t.is(json.thing.name, custom.thing.name);
    });
});

const EventMapping = new Mapping(Event).selectAll().mapType(dateCodec);

test('decode a domain class though mapping with embedded codec', t => {
    const json = {date: 1483916400000};
    const codec = new Codec(EventMapping);

    return codec.decode(json).then(event => {
        t.true(event instanceof Event);
        t.is(event.date.getTime(), new Date(json.date).getTime());
    });
});

test('encode a domain class though mapping with embedded codec', t => {
    const event = new Event({date: new Date(1483916400000)});
    const codec = new Codec(EventMapping);

    return codec.encode(event).then(json => {
        t.is(json.date, 1483916400000);
        t.is(new Date(json.date).getTime(), event.date.getTime());
    });
});

test('encode a domain class though mapping with embedded codec (empty value)', t => {
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

const embeddedEventMapping = new Mapping(EmbeddedEvent).selectAll()
.mapType(new Mapping(Event).selectAll(), dateCodec);

test('decode a deep domain class though mapping with embedded codec', t => {
    const json = {event: {date: 1483916400000}};
    const codec = new Codec(embeddedEventMapping);

    return codec.decode(json).then(deep => {
        t.true(deep.event instanceof Event);
        t.is(deep.event.date.getTime(), new Date(json.event.date).getTime());
    });
});

test('encode a deep domain class though mapping with embedded codec', t => {
    const deep = new EmbeddedEvent({event: new Event({date: new Date(1483916400000)})});
    const codec = new Codec(embeddedEventMapping);

    return codec.encode(deep).then(json => {
        t.is(json.event.date, 1483916400000);
        t.is(new Date(json.event.date).getTime(), deep.event.date.getTime());
    });
});

class Subscription extends Domain {
    get props() {
        return {
            size: String,
            dates: [Date]
        };
    }
}

const subscriptionMapping = new Mapping(Subscription).select('size', 'dates').mapType(dateCodec);

test('decode an array through mapping with embedded codec', t => {
    const json = {size: 'Medium', dates: [1483916400000, 1484002800000]};
    const codec = new Codec(subscriptionMapping);

    return codec.decode(json).then(subscription => {
        t.true(subscription instanceof Subscription);
        t.is(subscription.size, json.size);
        t.true(subscription.dates instanceof Array);
        t.is(subscription.dates[0].constructor, Date);
        t.is(subscription.dates[1].constructor, Date);
        t.is(subscription.dates[0].getTime(), new Date(json.dates[0]).getTime());
        t.is(subscription.dates[1].getTime(), new Date(json.dates[1]).getTime());
    });
});

test('encode an array through mapping with embedded codec', t => {
    const subscription = new Subscription({size: 'Medium', dates: [new Date(1483916400000), new Date(1484002800000)]});
    const codec = new Codec(subscriptionMapping);

    return codec.encode(subscription).then(json => {
        t.is(json.size, subscription.size);
        t.true(subscription.dates instanceof Array);
        t.is(json.dates[0], subscription.dates[0].getTime());
        t.is(json.dates[1], subscription.dates[1].getTime());
    });
});
