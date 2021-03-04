const test = require('ava');

const Mapping = require('../lib/Mapping');
const Domain = require('../lib/Domain');

class Thing extends Domain {
    get props() {
        return {
            name: String
        };
    }
}

test('decode through mapping', t => {
    const mapping = Mapping.map(Thing);
    const json = {name: 'Shoes'};

    return mapping.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, json.name);
    });
});

test('encode through mapping', t => {
    const mapping = Mapping.map(Thing);
    const thing = new Thing({name: 'Shoes'});

    return mapping.encode(thing).then(json => {
        t.is(json.name, thing.name);
    });
});

test('decode list through mapping', t => {
    const mapping = Mapping.map(Thing);
    const jsons = [{name: 'Shoes'}, {name: 'Shirt'}];

    return mapping.decode(jsons).then(things => {
        t.true(things instanceof Array);
        t.true(things[0] instanceof Thing);
        t.true(things[1] instanceof Thing);
        t.is(things[0].name, jsons[0].name);
        t.is(things[1].name, jsons[1].name);
    });
});

test('encode list through mapping', t => {
    const mapping = Mapping.map(Thing);
    const things = [new Thing({name: 'Shoes'}), new Thing({name: 'Shirt'})];

    return mapping.encode(things).then(jsons => {
        t.true(jsons instanceof Array);
        t.is(jsons[0].name, things[0].name);
        t.is(jsons[1].name, things[1].name);
    });
});

class Box extends Domain {
    get props() {
        return {
            size: Number,
            thing: Thing
        };
    }
}

test('decode class tree through mapping', t => {
    const mapping = Mapping.map(Box);
    const json = {size: 40, thing: {name: 'Shoes'}};

    return mapping.decode(json).then(box => {
        t.true(box instanceof Box);
        t.is(box.size, json.size);
        t.true(box.thing instanceof Thing);
        t.is(box.thing.name, json.thing.name);
    });
});

test('encode class tree through mapping', t => {
    const mapping = Mapping.map(Box);
    const box = new Box({size: 40, thing: new Thing({name: 'Shoes'})});

    return mapping.encode(box).then(json => {
        t.is(json.size, box.size);
        t.is(json.thing.name, box.thing.name);
    });
});

class UnreferencedBox extends Domain {
    get props() {
        return {
            size: Number,
            thing: {
                name: String,
                details: {
                    more: Boolean
                }
            }
        };
    }
}

test('decode deeply through mapping', t => {
    const mapping = Mapping.map(UnreferencedBox);
    const json = {size: 40, thing: {name: 'Shoes', details: {more: true}}};

    return mapping.decode(json).then(box => {
        t.true(box instanceof UnreferencedBox);
        t.is(box.size, json.size);
        t.true(box.thing instanceof Object);
        t.is(box.thing.name, json.thing.name);
        t.is(box.thing.details.more, json.thing.details.more);
    });
});

test('encode deeply through mapping', t => {
    const mapping = Mapping.map(UnreferencedBox);
    const box = new UnreferencedBox({size: 40, thing: {name: 'Shoes', details: {more: false}}});

    return mapping.encode(box).then(json => {
        t.is(json.size, box.size);
        t.is(json.thing.name, box.thing.name);
        t.is(json.thing.details.more, box.thing.details.more);
    });
});

class UnreferencedBoxes extends Domain {
    get props() {
        return {
            size: Number,
            things: [{
                name: String
            }]
        };
    }
}

test('decode deeply through untyped mapping', t => {
    const mapping = Mapping.map(UnreferencedBoxes);
    const json = {size: 40, things: [{name: 'Shoes'}, {name: 'Shirt'}]};

    return mapping.decode(json).then(box => {
        t.true(box instanceof UnreferencedBoxes);
        t.is(box.size, json.size);
        t.true(box.things instanceof Array);
        t.is(box.things[0].name, json.things[0].name);
        t.is(box.things[1].name, json.things[1].name);
    });
});

test('encode deeply through untyped mapping', t => {
    const mapping = Mapping.map(UnreferencedBoxes);
    const box = new UnreferencedBoxes({size: 40, things: [{name: 'Shoes'}, {name: 'Shirt'}]});

    return mapping.encode(box).then(json => {
        t.is(json.size, box.size);
        t.true(json.things instanceof Array);
        t.is(json.things[0].name, box.things[0].name);
        t.is(json.things[1].name, box.things[1].name);
    });
});

class UnknownBox extends Domain {
    get props() {
        return {
            size: Number,
            thing: Object
        };
    }
}

test('decode deeply through free mapping', t => {
    const mapping = Mapping.map(UnknownBox);
    const json = {size: 40, thing: {name: 'Shoes', details: {more: true}}};

    return mapping.decode(json).then(box => {
        t.true(box instanceof UnknownBox);
        t.is(box.size, json.size);
        t.true(box.thing instanceof Object);
        t.is(box.thing.name, json.thing.name);
        t.is(box.thing.details.more, json.thing.details.more);
    });
});

test('encode deeply through free mapping', t => {
    const mapping = Mapping.map(UnknownBox);
    const box = new UnknownBox({size: 40, thing: {name: 'Shoes', details: {more: false}}});

    return mapping.encode(box).then(json => {
        t.is(json.size, box.size);
        t.is(json.thing.name, box.thing.name);
        t.is(json.thing.details.more, box.thing.details.more);
    });
});

class Shipping extends Domain {
    get props() {
        return {
            box: Box
        };
    }
}

test('decode deep class tree through mapping', t => {
    const mapping = Mapping.map(Shipping);
    const json = {box: {size: 42, thing: {name: 'Shoes'}}};

    return mapping.decode(json).then(shipping => {
        t.true(shipping instanceof Shipping);
        t.true(shipping.box instanceof Box);
        t.is(shipping.box.size, json.box.size);
        t.true(shipping.box.thing instanceof Thing);
        t.is(shipping.box.thing.name, json.box.thing.name);
    });
});

test('encode deep class through mapping', t => {
    const mapping = Mapping.map(Shipping);
    const thing = new Shipping({box: new Box({size: 42, thing: new Thing({name: 'Shoes'})})});

    return mapping.encode(thing).then(json => {
        t.true(json.box instanceof Object);
        t.is(json.box.size, thing.box.size);
        t.true(json.box.thing instanceof Object);
        t.is(json.box.thing.name, thing.box.thing.name);
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

test('decode array through mapping', t => {
    const mapping = Mapping.map(Gift);
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};

    return mapping.decode(json).then(gift => {
        t.true(gift instanceof Gift);
        t.is(gift.size, json.size);
        t.true(gift.names instanceof Array);
        t.is(gift.names[0].constructor, String);
        t.is(gift.names[1].constructor, String);
        t.is(gift.names[0], json.names[0]);
        t.is(gift.names[1], json.names[1]);
    });
});

test('encode array through mapping', t => {
    const mapping = Mapping.map(Gift);
    const gift = new Gift({size: 'Medium', names: ['Shoes', 'Shirt']});

    return mapping.encode(gift).then(json => {
        t.is(json.size, gift.size);
        t.true(json.names instanceof Array);
        t.is(json.names[0], gift.names[0]);
        t.is(json.names[1], gift.names[1]);
    });
});

test('decode empty array through mapping', t => {
    const mapping = Mapping.map(Gift);
    const json = {size: 'Medium'};

    return mapping.decode(json).then(gift => {
        t.true(gift instanceof Gift);
        t.is(gift.size, json.size);
        t.true(gift.names instanceof Array);
        t.is(gift.names.length, 0);
    });
});

test('encode empty array through mapping', t => {
    const mapping = Mapping.map(Gift);
    const gift = new Gift({size: 'Medium'});

    return mapping.encode(gift).then(json => {
        t.is(json.size, gift.size);
        t.true(json.names instanceof Array);
        t.is(json.names.length, 0);
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

test('decode class array through mapping', t => {
    const mapping = Mapping.map(Bookcase);
    const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 'Shirt'}]};

    return mapping.decode(json).then(bookcase => {
        t.true(bookcase instanceof Bookcase);
        t.is(bookcase.size, json.size);
        t.true(bookcase.things instanceof Array);
        t.true(bookcase.things[0] instanceof Thing);
        t.true(bookcase.things[1] instanceof Thing);
        t.is(bookcase.things.name, json.things.name);
        t.is(bookcase.things.name, json.things.name);
    });
});

test('encode class array through mapping', t => {
    const mapping = Mapping.map(Bookcase);
    const bookcase = new Bookcase({size: 'Medium', things: [new Thing({name: 'Shoes'}), new Thing({name: 'Shirt'})]});

    return mapping.encode(bookcase).then(json => {
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

test('decode date through mapping', t => {
    const mapping = Mapping.map(Event);
    const json = {date: new Date('01/09/2017')};

    return mapping.decode(json).then(event => {
        t.is(event.date.getTime(), new Date('01/09/2017').getTime());
    });
});

test('encode date through mapping', t => {
    const mapping = Mapping.map(Event);
    const event = new Event({date: new Date('01/09/2017')});

    return mapping.encode(event).then(json => {
        t.is(json.date.getTime(), new Date('01/09/2017').getTime());
    });
});

test('decode date through mapping & transform', t => {
    const mapping = Mapping.map(Event).with({
        date: {
            set: value => new Date(value)
        }
    });
    const json = {date: 1483916400000};

    return mapping.decode(json).then(event => {
        t.is(event.date.getTime(), new Date('01/09/2017').getTime());
    });
});

test('encode date through mapping & transform', t => {
    const mapping = Mapping.map(Event).with({
        date: {
            get: value => value.getTime()
        }
    });
    const event = new Event({date: new Date('01/09/2017')});

    return mapping.encode(event).then(json => {
        t.is(json.date, 1483916400000);
    });
});

class Period extends Domain {
    get props() {
        return {
            dates: [Date]
        };
    }
}

test('decode date array through mapping & transform', t => {
    const mapping = Mapping.map(Period).with({
        dates: {
            set: value => new Date(value)
        }
    });
    const json = {dates: [1483916400000, 1484002800000]};

    return mapping.decode(json).then(period => {
        t.true(period instanceof Period);
        t.true(period.dates instanceof Array);
        t.is(period.dates[0].constructor, Date);
        t.is(period.dates[1].constructor, Date);
        t.is(period.dates[0].getTime(), new Date(json.dates[0]).getTime());
        t.is(period.dates[1].getTime(), new Date(json.dates[1]).getTime());
    });
});

test('encode date array through mapping & transform', t => {
    const mapping = Mapping.map(Period).with({
        dates: {
            get: value => value.getTime()
        }
    });
    const period = new Period({dates: [new Date('01/09/2017'), new Date('10/09/2017')]});

    return mapping.encode(period).then(json => {
        t.true(period.dates instanceof Array);
        t.is(json.dates[0], period.dates[0].getTime());
        t.is(json.dates[1], period.dates[1].getTime());
    });
});

class Travel extends Domain {
    get props() {
        return {
            from: Event,
            to: Event
        };
    }
}

test('decode date deeply though mapping & transform', t => {
    const mapping = Mapping.map(Travel).with({
        from: Mapping.map(Event).with({
            date: {
                set: value => new Date(value)
            }
        })
    });
    const json = {from: {date: 1483916400000}, to: {date: new Date('10/09/2017')}};

    return mapping.decode(json).then(travel => {
        t.true(travel.from instanceof Event);
        t.true(travel.to instanceof Event);
        t.is(travel.from.date.getTime(), new Date(json.from.date).getTime());
        t.is(travel.to.date.getTime(), json.to.date.getTime());
    });
});

test('encode date deeply though mapping & transform', t => {
    const mapping = Mapping.map(Travel).with({
        from: Mapping.map(Event).with({
            date: {
                get: value => value.getTime()
            }
        })
    });
    const travel = new Travel({from: new Event({date: new Date('01/09/2017')}), to: new Event({date: new Date('10/09/2017')})});

    return mapping.encode(travel).then(json => {
        t.is(json.from.date, 1483916400000);
        t.is(json.to.date.getTime(), travel.to.date.getTime());
    });
});

test('decode deeply through mapping & transform', t => {
    const mapping = Mapping.map(UnreferencedBox).with({
        thing: {
            details: {
                more: {
                    set: value => value === 'visible'
                }
            }
        }
    });
    const json = {size: 40, thing: {name: 'Shoes', details: {more: 'visible'}}};

    return mapping.decode(json).then(box => {
        t.true(box instanceof UnreferencedBox);
        t.is(box.size, json.size);
        t.true(box.thing instanceof Object);
        t.is(box.thing.name, json.thing.name);
        t.is(box.thing.details.more, true);
    });
});

test('encode deeply through mapping & transform', t => {
    const mapping = Mapping.map(UnreferencedBox).with({
        thing: {
            details: {
                more: {
                    get: value => value ? 'visible' : 'invisible'
                }
            }
        }
    });
    const box = new UnreferencedBox({size: 40, thing: {name: 'Shoes', details: {more: false}}});

    return mapping.encode(box).then(json => {
        t.is(json.size, box.size);
        t.is(json.thing.name, box.thing.name);
        t.is(json.thing.details.more, 'invisible');
    });
});

test('decode class tree through mapping & transform', t => {
    const mapping = Mapping.map(Box).with({
        thing: Mapping.map(Thing).with({
            name: {
                set: value => value.toUpperCase()
            }
        })
    });
    const json = {size: 40, thing: {name: 'Shoes'}};

    return mapping.decode(json).then(box => {
        t.true(box instanceof Box);
        t.is(box.size, json.size);
        t.true(box.thing instanceof Thing);
        t.is(box.thing.name, json.thing.name.toUpperCase());
    });
});

test('encode class tree through mapping & transform', t => {
    const mapping = Mapping.map(Box).with({
        thing: Mapping.map(Thing).with({
            name: {
                get: value => value.toLowerCase()
            }
        })
    });
    const box = new Box({size: 40, thing: new Thing({name: 'Shoes'})});

    return mapping.encode(box).then(json => {
        t.is(json.size, 40);
        t.is(json.thing.name, box.thing.name.toLowerCase());
    });
});

test('decode class tree through mapping & visibility transform', t => {
    const mapping = Mapping.map(Box).with({
        size: {
            set: false
        }
    });
    const json = {size: 40, thing: {name: 'Shoes'}};

    return mapping.decode(json).then(box => {
        t.true(box instanceof Box);
        t.is(box.size, undefined);
        t.true(box.thing instanceof Thing);
        t.is(box.thing.name, json.thing.name);
    });
});

test('encode class tree through mapping & visibility transform', t => {
    const mapping = Mapping.map(Box).with({
        size: {
            get: false
        }
    });
    const box = new Box({size: 40, thing: new Thing({name: 'Shoes'})});

    return mapping.encode(box).then(json => {
        t.false(json.hasOwnProperty('size'));
        t.is(json.thing.name, box.thing.name);
    });
});

test('decode through mapping & alias', t => {
    const mapping = Mapping.map(UnreferencedBox).with({
        size: {alias: 'fullsize'},
        thing: {name: {alias: 'fullname'}}
    });
    const json = {fullsize: 40, thing: {fullname: 'Shoes'}};

    return mapping.decode(json).then(box => {
        t.true(box instanceof UnreferencedBox);
        t.is(box.size, json.fullsize);
        t.is(box.thing.name, json.thing.fullname);
    });
});

test('encode through mapping & alias', t => {
    const mapping = Mapping.map(UnreferencedBox).with({
        size: {alias: 'fullsize'},
        thing: {name: {alias: 'fullname'}}
    });
    const box = new UnreferencedBox({size: 40, thing: new Thing({name: 'Shoes'})});

    return mapping.encode(box).then(json => {
        t.is(json.fullsize, box.size);
        t.is(json.thing.fullname, box.thing.name);
    });
});

test('decode through mapping & hook', t => {
    const mapping = Mapping.map(Thing)
    .beforeDecode(json => {
        const clone = Object.assign({}, json);
        clone.name = `2x ${clone.name}`;
        return clone;
    })
    .afterDecode(object => {
        object.formattedName = object.name.toLowerCase();
        return object;
    });
    const json = {name: 'Shoes'};

    return mapping.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, `2x ${json.name}`);
        t.is(thing.formattedName, `2x ${json.name}`.toLowerCase());
    });
});

test('encode through mapping & hook', t => {
    const mapping = Mapping.map(Thing)
    .beforeEncode(object => {
        const clone = new Thing(object);
        clone.name = `2x ${clone.name}`;
        return clone;
    })
    .afterEncode(json => {
        json.formattedName = json.name.toLowerCase();
        return json;
    });
    const thing = new Thing({name: 'Shoes'});

    return mapping.encode(thing).then(json => {
        t.is(json.name, `2x ${thing.name}`);
        t.is(json.formattedName, `2x ${thing.name}`.toLowerCase());
    });
});

test('decode through mapping & defaults', t => {
    const mapping = Mapping.map(Thing)
    .defaults({
        permissions: 'r-'
    });
    const json = {name: 'Shoes'};

    return mapping.decode(json).then(thing => {
        t.true(thing instanceof Thing);
        t.is(thing.name, undefined);
    });
});

test('encode through mapping & defaults', t => {
    const mapping = Mapping.map(Thing)
    .defaults({
        permissions: '-w'
    });
    const thing = new Thing({name: 'Shoes'});

    return mapping.encode(thing).then(json => {
        t.false(json.hasOwnProperty('name'));
    });
});

test('encode through mapping & providers', t => {
    const mapping = Mapping.map(Thing)
    .providers({
        toUpperCase: value => {
            return value.toUpperCase();
        }
    })
    .afterEncode((json, providers) => {
        json.formattedName = providers.toUpperCase(json.name);
    });
    const thing = new Thing({name: 'Shoes'});

    return mapping.encode(thing).then(json => {
        t.is(json.name, thing.name);
        t.is(json.formattedName, thing.name.toUpperCase());
    });
});
