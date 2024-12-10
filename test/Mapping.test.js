const {expect} = require('chai');

const Mapping = require('../lib/Mapping');
const Domain = require('../lib/Domain');

class Thing extends Domain {
    get props() {
        return {
            name: String
        };
    }
}

describe('Mapping', () => {
    it('decode through mapping', () => {
        const mapping = Mapping.map(Thing);
        const json = {name: 'Shoes'};

        return mapping.decode(json).then(thing => {
            expect(thing instanceof Thing).to.equal(true);
            expect(thing.name).to.equal(json.name);
        });
    });

    it('encode through mapping', () => {
        const mapping = Mapping.map(Thing);
        const thing = new Thing({name: 'Shoes'});

        return mapping.encode(thing).then(json => {
            expect(json.name).to.equal(thing.name);
        });
    });

    it('decode list through mapping', () => {
        const mapping = Mapping.map(Thing);
        const jsons = [{name: 'Shoes'}, {name: 'Shirt'}];

        return mapping.decode(jsons).then(things => {
            expect(things instanceof Array).to.equal(true);
            expect(things[0] instanceof Thing).to.equal(true);
            expect(things[1] instanceof Thing).to.equal(true);
            expect(things[0].name).to.equal(jsons[0].name);
            expect(things[1].name).to.equal(jsons[1].name);
        });
    });

    it('encode list through mapping', () => {
        const mapping = Mapping.map(Thing);
        const things = [new Thing({name: 'Shoes'}), new Thing({name: 'Shirt'})];

        return mapping.encode(things).then(jsons => {
            expect(jsons instanceof Array).to.equal(true);
            expect(jsons[0].name).to.equal(things[0].name);
            expect(jsons[1].name).to.equal(things[1].name);
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

    it('decode class tree through mapping', () => {
        const mapping = Mapping.map(Box);
        const json = {size: 40, thing: {name: 'Shoes'}};

        return mapping.decode(json).then(box => {
            expect(box instanceof Box).to.equal(true);
            expect(box.size).to.equal(json.size);
            expect(box.thing instanceof Thing).to.equal(true);
            expect(box.thing.name).to.equal(json.thing.name);
        });
    });

    it('encode class tree through mapping', () => {
        const mapping = Mapping.map(Box);
        const box = new Box({size: 40, thing: new Thing({name: 'Shoes'})});

        return mapping.encode(box).then(json => {
            expect(json.size).to.equal(box.size);
            expect(json.thing.name).to.equal(box.thing.name);
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

    it('decode deeply through mapping', () => {
        const mapping = Mapping.map(UnreferencedBox);
        const json = {size: 40, thing: {name: 'Shoes', details: {more: true}}};

        return mapping.decode(json).then(box => {
            expect(box instanceof UnreferencedBox).to.equal(true);
            expect(box.size).to.equal(json.size);
            expect(box.thing instanceof Object).to.equal(true);
            expect(box.thing.name).to.equal(json.thing.name);
            expect(box.thing.details.more).to.equal(json.thing.details.more);
        });
    });

    it('encode deeply through mapping', () => {
        const mapping = Mapping.map(UnreferencedBox);
        const box = new UnreferencedBox({size: 40, thing: {name: 'Shoes', details: {more: false}}});

        return mapping.encode(box).then(json => {
            expect(json.size).to.equal(box.size);
            expect(json.thing.name).to.equal(box.thing.name);
            expect(json.thing.details.more).to.equal(box.thing.details.more);
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

    it('decode deeply through untyped mapping', () => {
        const mapping = Mapping.map(UnreferencedBoxes);
        const json = {size: 40, things: [{name: 'Shoes'}, {name: 'Shirt'}]};

        return mapping.decode(json).then(box => {
            expect(box instanceof UnreferencedBoxes).to.equal(true);
            expect(box.size).to.equal(json.size);
            expect(box.things instanceof Array).to.equal(true);
            expect(box.things[0].name).to.equal(json.things[0].name);
            expect(box.things[1].name).to.equal(json.things[1].name);
        });
    });

    it('encode deeply through untyped mapping', () => {
        const mapping = Mapping.map(UnreferencedBoxes);
        const box = new UnreferencedBoxes({size: 40, things: [{name: 'Shoes'}, {name: 'Shirt'}]});

        return mapping.encode(box).then(json => {
            expect(json.size).to.equal(box.size);
            expect(json.things instanceof Array).to.equal(true);
            expect(json.things[0].name).to.equal(box.things[0].name);
            expect(json.things[1].name).to.equal(box.things[1].name);
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

    it('decode deeply through free mapping', () => {
        const mapping = Mapping.map(UnknownBox);
        const json = {size: 40, thing: {name: 'Shoes', details: {more: true}}};

        return mapping.decode(json).then(box => {
            expect(box instanceof UnknownBox).to.equal(true);
            expect(box.size).to.equal(json.size);
            expect(box.thing instanceof Object).to.equal(true);
            expect(box.thing.name).to.equal(json.thing.name);
            expect(box.thing.details.more).to.equal(json.thing.details.more);
        });
    });

    it('encode deeply through free mapping', () => {
        const mapping = Mapping.map(UnknownBox);
        const box = new UnknownBox({size: 40, thing: {name: 'Shoes', details: {more: false}}});

        return mapping.encode(box).then(json => {
            expect(json.size).to.equal(box.size);
            expect(json.thing.name).to.equal(box.thing.name);
            expect(json.thing.details.more).to.equal(box.thing.details.more);
        });
    });

    class Shipping extends Domain {
        get props() {
            return {
                box: Box
            };
        }
    }

    it('decode deep class tree through mapping', () => {
        const mapping = Mapping.map(Shipping);
        const json = {box: {size: 42, thing: {name: 'Shoes'}}};

        return mapping.decode(json).then(shipping => {
            expect(shipping instanceof Shipping).to.equal(true);
            expect(shipping.box instanceof Box).to.equal(true);
            expect(shipping.box.size).to.equal(json.box.size);
            expect(shipping.box.thing instanceof Thing).to.equal(true);
            expect(shipping.box.thing.name).to.equal(json.box.thing.name);
        });
    });

    it('encode deep class through mapping', () => {
        const mapping = Mapping.map(Shipping);
        const thing = new Shipping({box: new Box({size: 42, thing: new Thing({name: 'Shoes'})})});

        return mapping.encode(thing).then(json => {
            expect(json.box instanceof Object).to.equal(true);
            expect(json.box.size).to.equal(thing.box.size);
            expect(json.box.thing instanceof Object).to.equal(true);
            expect(json.box.thing.name).to.equal(thing.box.thing.name);
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

    it('decode array through mapping', () => {
        const mapping = Mapping.map(Gift);
        const json = {size: 'Medium', names: ['Shoes', 'Shirt']};

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

    it('encode array through mapping', () => {
        const mapping = Mapping.map(Gift);
        const gift = new Gift({size: 'Medium', names: ['Shoes', 'Shirt']});

        return mapping.encode(gift).then(json => {
            expect(json.size).to.equal(gift.size);
            expect(json.names instanceof Array).to.equal(true);
            expect(json.names[0]).to.equal(gift.names[0]);
            expect(json.names[1]).to.equal(gift.names[1]);
        });
    });

    it('decode empty array through mapping', () => {
        const mapping = Mapping.map(Gift);
        const json = {size: 'Medium'};

        return mapping.decode(json).then(gift => {
            expect(gift instanceof Gift).to.equal(true);
            expect(gift.size).to.equal(json.size);
            expect(gift.names instanceof Array).to.equal(true);
            expect(gift.names.length).to.equal(0);
        });
    });

    it('encode empty array through mapping', () => {
        const mapping = Mapping.map(Gift);
        const gift = new Gift({size: 'Medium'});

        return mapping.encode(gift).then(json => {
            expect(json.size).to.equal(gift.size);
            expect(json.names instanceof Array).to.equal(true);
            expect(json.names.length).to.equal(0);
        });
    });

    it('decode literal to array through mapping', () => {
        const mapping = Mapping.map(Gift).with({
            names: {
                set: value => Object.keys(value).reduce((memo, item) => {
                    memo.push(item);
                    return memo;
                }, [])
            }
        });
        const json = {names: {'Shoes': true, 'Shirt': true}};

        return mapping.decode(json).then(gift => {
            expect(gift instanceof Gift).to.equal(true);
            expect(gift.names instanceof Array).to.equal(true);
            expect(gift.names[0]).to.equal('Shoes');
            expect(gift.names[1]).to.equal('Shirt');
        });
    });

    it('encode array to literal through mapping', () => {
        const mapping = Mapping.map(Gift).with({
            names: {
                get: value => value.reduce((memo, item) => {
                    memo[item] = true;
                    return memo;
                }, {})
            }
        });
        const gift = new Gift({names: ['Shoes', 'Shirt']});

        return mapping.encode(gift).then(json => {
            expect(json.names instanceof Object).to.equal(true);
            expect(json.names['Shoes']).to.equal(true);
            expect(json.names['Shirt']).to.equal(true);
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

    it('decode class array through mapping', () => {
        const mapping = Mapping.map(Bookcase);
        const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 'Shirt'}]};

        return mapping.decode(json).then(bookcase => {
            expect(bookcase instanceof Bookcase).to.equal(true);
            expect(bookcase.size).to.equal(json.size);
            expect(bookcase.things instanceof Array).to.equal(true);
            expect(bookcase.things[0] instanceof Thing).to.equal(true);
            expect(bookcase.things[1] instanceof Thing).to.equal(true);
            expect(bookcase.things.name).to.equal(json.things.name);
            expect(bookcase.things.name).to.equal(json.things.name);
        });
    });

    it('encode class array through mapping', () => {
        const mapping = Mapping.map(Bookcase);
        const bookcase = new Bookcase({size: 'Medium', things: [new Thing({name: 'Shoes'}), new Thing({name: 'Shirt'})]});

        return mapping.encode(bookcase).then(json => {
            expect(json.size).to.equal(bookcase.size);
            expect(bookcase.things instanceof Array).to.equal(true);
            expect(json.things[0].constructor).to.equal(Object);
            expect(json.things[1].constructor).to.equal(Object);
            expect(json.things.name).to.equal(bookcase.things.name);
            expect(json.things.name).to.equal(bookcase.things.name);
        });
    });

    class Event extends Domain {
        get props() {
            return {
                date: Date
            };
        }
    }

    it('decode date through mapping', () => {
        const mapping = Mapping.map(Event);
        const json = {date: new Date('01/09/2017')};

        return mapping.decode(json).then(event => {
            expect(event.date.getTime()).to.equal(new Date('01/09/2017').getTime());
        });
    });

    it('encode date through mapping', () => {
        const mapping = Mapping.map(Event);
        const event = new Event({date: new Date('01/09/2017')});

        return mapping.encode(event).then(json => {
            expect(json.date.getTime()).to.equal(new Date('01/09/2017').getTime());
        });
    });

    it('decode date through mapping & transform', () => {
        const mapping = Mapping.map(Event).with({
            date: {
                set: value => new Date(value)
            }
        });
        const json = {date: 1483916400000};

        return mapping.decode(json).then(event => {
            expect(event.date.getTime()).to.equal(new Date('01/09/2017').getTime());
        });
    });

    it('encode date through mapping & transform', () => {
        const mapping = Mapping.map(Event).with({
            date: {
                get: value => value.getTime()
            }
        });
        const event = new Event({date: new Date('01/09/2017')});

        return mapping.encode(event).then(json => {
            expect(json.date).to.equal(1483916400000);
        });
    });

    class Period extends Domain {
        get props() {
            return {
                dates: [Date]
            };
        }
    }

    it('decode date array through mapping & transform', () => {
        const mapping = Mapping.map(Period).with({
            dates: [{
                set: value => new Date(value)
            }]
        });
        const json = {dates: [1483916400000, 1484002800000]};

        return mapping.decode(json).then(period => {
            expect(period instanceof Period).to.equal(true);
            expect(period.dates instanceof Array).to.equal(true);
            expect(period.dates[0].constructor).to.equal(Date);
            expect(period.dates[1].constructor).to.equal(Date);
            expect(period.dates[0].getTime()).to.equal(new Date(json.dates[0]).getTime());
            expect(period.dates[1].getTime()).to.equal(new Date(json.dates[1]).getTime());
        });
    });

    it('encode date array through mapping & transform', () => {
        const mapping = Mapping.map(Period).with({
            dates: [{
                get: value => value.getTime()
            }]
        });
        const period = new Period({dates: [new Date('01/09/2017'), new Date('10/09/2017')]});

        return mapping.encode(period).then(json => {
            expect(period.dates instanceof Array).to.equal(true);
            expect(json.dates[0]).to.equal(period.dates[0].getTime());
            expect(json.dates[1]).to.equal(period.dates[1].getTime());
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

    it('decode date deeply though mapping & transform', () => {
        const mapping = Mapping.map(Travel).with({
            from: Mapping.map(Event).with({
                date: {
                    set: value => new Date(value)
                }
            })
        });
        const json = {from: {date: 1483916400000}, to: {date: new Date('10/09/2017')}};

        return mapping.decode(json).then(travel => {
            expect(travel.from instanceof Event).to.equal(true);
            expect(travel.to instanceof Event).to.equal(true);
            expect(travel.from.date.getTime()).to.equal(new Date(json.from.date).getTime());
            expect(travel.to.date.getTime()).to.equal(json.to.date.getTime());
        });
    });

    it('encode date deeply though mapping & transform', () => {
        const mapping = Mapping.map(Travel).with({
            from: Mapping.map(Event).with({
                date: {
                    get: value => value.getTime()
                }
            })
        });
        const travel = new Travel({from: new Event({date: new Date('01/09/2017')}), to: new Event({date: new Date('10/09/2017')})});

        return mapping.encode(travel).then(json => {
            expect(json.from.date).to.equal(1483916400000);
            expect(json.to.date.getTime()).to.equal(travel.to.date.getTime());
        });
    });

    it('decode deeply through mapping & transform', () => {
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
            expect(box instanceof UnreferencedBox).to.equal(true);
            expect(box.size).to.equal(json.size);
            expect(box.thing instanceof Object).to.equal(true);
            expect(box.thing.name).to.equal(json.thing.name);
            expect(box.thing.details.more).to.equal(true);
        });
    });

    it('decode deeply through mapping & transform, two conditions failed', () => {
        const mapping = Mapping.map(UnreferencedBox).with({
            thing: {
                details: {
                    more: {
                        set: (value, json) => value && json.size > 50
                    }
                }
            }
        });
        const json = {size: 40, thing: {name: 'Shoes', details: {more: 'invisible'}}};

        return mapping.decode(json).then(box => {
            expect(box.thing.details.more).to.equal(false);
        });
    });

    it('decode deeply through mapping & transform, one condition failed', () => {
        const mapping = Mapping.map(UnreferencedBox).with({
            thing: {
                details: {
                    more: {
                        set: (value, json) => value && json.size > 50
                    }
                }
            }
        });
        const json = {size: 40, thing: {name: 'Shoes', details: {more: 'visible'}}};

        return mapping.decode(json).then(box => {
            expect(box.thing.details.more).to.equal(false);
        });
    });

    it('decode deeply through mapping & transform, two conditions passed', () => {
        const mapping = Mapping.map(UnreferencedBox).with({
            thing: {
                details: {
                    more: {
                        set: (value, json) => value && json.size > 50
                    }
                }
            }
        });
        const json = {size: 60, thing: {name: 'Shoes', details: {more: 'visible'}}};

        return mapping.decode(json).then(box => {
            expect(box.thing.details.more).to.equal(true);
        });
    });

    it('encode deeply through mapping & transform', () => {
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
            expect(json.size).to.equal(box.size);
            expect(json.thing.name).to.equal(box.thing.name);
            expect(json.thing.details.more).to.equal('invisible');
        });
    });

    it('encode deeply through mapping & dependency transform, two conditions failed', () => {
        const mapping = Mapping.map(UnreferencedBox).with({
            thing: {
                details: {
                    more: {
                        get: (value, object) => value && object.size > 50 ? 'visible' : 'invisible'
                    }
                }
            }
        });
        const box = new UnreferencedBox({size: 40, thing: {name: 'Shoes', details: {more: false}}});

        return mapping.encode(box).then(json => {
            expect(json.thing.details.more).to.equal('invisible');
        });
    });

    it('encode deeply through mapping & dependency transform, one condition failed', () => {
        const mapping = Mapping.map(UnreferencedBox).with({
            thing: {
                details: {
                    more: {
                        get: (value, object) => value && object.size > 50 ? 'visible' : 'invisible'
                    }
                }
            }
        });
        const box = new UnreferencedBox({size: 40, thing: {name: 'Shoes', details: {more: 'visible'}}});

        return mapping.encode(box).then(json => {
            expect(json.thing.details.more).to.equal('invisible');
        });
    });

    it('encode deeply through mapping & dependency transform, two conditions passed', () => {
        const mapping = Mapping.map(UnreferencedBox).with({
            thing: {
                details: {
                    more: {
                        get: (value, object) => value && object.size > 50 ? 'visible' : 'invisible'
                    }
                }
            }
        });
        const box = new UnreferencedBox({size: 60, thing: {name: 'Shoes', details: {more: 'visible'}}});

        return mapping.encode(box).then(json => {
            expect(json.thing.details.more).to.equal('visible');
        });
    });

    it('decode class tree through mapping & transform', () => {
        const mapping = Mapping.map(Box).with({
            thing: Mapping.map(Thing).with({
                name: {
                    set: value => value.toUpperCase()
                }
            })
        });
        const json = {size: 40, thing: {name: 'Shoes'}};

        return mapping.decode(json).then(box => {
            expect(box instanceof Box).to.equal(true);
            expect(box.size).to.equal(json.size);
            expect(box.thing instanceof Thing).to.equal(true);
            expect(box.thing.name).to.equal(json.thing.name.toUpperCase());
        });
    });

    it('encode class tree through mapping & transform', () => {
        const mapping = Mapping.map(Box).with({
            thing: Mapping.map(Thing).with({
                name: {
                    get: value => value.toLowerCase()
                }
            })
        });
        const box = new Box({size: 40, thing: new Thing({name: 'Shoes'})});

        return mapping.encode(box).then(json => {
            expect(json.size).to.equal(40);
            expect(json.thing.name).to.equal(box.thing.name.toLowerCase());
        });
    });

    it('decode array class tree through mapping & transform', () => {
        const mapping = Mapping.map(UnreferencedBoxes).with({
            things: [Mapping.map(Thing).with({
                name: {
                    set: value => value.toUpperCase()
                }
            })]
        });
        const json = {size: 40, things: [{name: 'Shoes'}]};

        return mapping.decode(json).then(boxes => {
            expect(boxes instanceof UnreferencedBoxes).to.equal(true);
            expect(boxes.size).to.equal(json.size);
            expect(boxes.things instanceof Array).to.equal(true);
            expect(boxes.things[0].name).to.equal(json.things[0].name.toUpperCase());
        });
    });

    it('encode array class tree through mapping & transform', () => {
        const mapping = Mapping.map(UnreferencedBoxes).with({
            things: [Mapping.map(Thing).with({
                name: {
                    get: value => value.toLowerCase()
                }
            })]
        });
        const boxes = new UnreferencedBoxes({size: 40, things: [new Thing({name: 'Shoes'})]});

        return mapping.encode(boxes).then(json => {
            expect(json.size).to.equal(boxes.size);
            expect(json.things instanceof Array).to.equal(true);
            expect(json.size).to.equal(40);
            expect(json.things[0].name).to.equal(boxes.things[0].name.toLowerCase());
        });
    });

    it('decode class tree through mapping & visibility transform', () => {
        const mapping = Mapping.map(Box).with({
            size: {
                set: false
            }
        });
        const json = {size: 40, thing: {name: 'Shoes'}};

        return mapping.decode(json).then(box => {
            expect(box instanceof Box).to.equal(true);
            expect(box.size).to.equal(undefined);
            expect(box.thing instanceof Thing).to.equal(true);
            expect(box.thing.name).to.equal(json.thing.name);
        });
    });

    it('encode class tree through mapping & visibility transform', () => {
        const mapping = Mapping.map(Box).with({
            size: {
                get: false
            }
        });
        const box = new Box({size: 40, thing: new Thing({name: 'Shoes'})});

        return mapping.encode(box).then(json => {
            expect(json.hasOwnProperty('size')).to.equal(false);
            expect(json.thing.name).to.equal(box.thing.name);
        });
    });

    it('decode through mapping & alias', () => {
        const mapping = Mapping.map(UnreferencedBox).with({
            size: {alias: 'fullsize'},
            thing: {name: {alias: 'fullname'}}
        }).afterDecode((box, original) => {
            expect(original.fullsize).to.equal(40);
        });
        const json = {fullsize: 40, thing: {fullname: 'Shoes'}};

        return mapping.decode(json).then(box => {
            expect(box instanceof UnreferencedBox).to.equal(true);
            expect(box.size).to.equal(json.fullsize);
            expect(box.thing.name).to.equal(json.thing.fullname);
        });
    });

    it('encode through mapping & alias', () => {
        const mapping = Mapping.map(UnreferencedBox).with({
            size: {alias: 'fullsize'},
            thing: {name: {alias: 'fullname'}}
        });
        const box = new UnreferencedBox({size: 40, thing: new Thing({name: 'Shoes'})});

        return mapping.encode(box).then(json => {
            expect(json.fullsize).to.equal(box.size);
            expect(json.thing.fullname).to.equal(box.thing.name);
        });
    });

    it('decode array through mapping & alias', () => {
        const mapping = Mapping.map(UnreferencedBoxes).with({
            size: {alias: 'fullsize'},
            things: [{name: {alias: 'fullname'}}]
        });
        const json = {fullsize: 40, things: [{fullname: 'Shoes'}]};

        return mapping.decode(json).then(boxes => {
            expect(boxes instanceof UnreferencedBoxes).to.equal(true);
            expect(boxes.size).to.equal(json.fullsize);
            expect(boxes.things instanceof Array).to.equal(true);
            expect(boxes.things[0].name).to.equal(json.things[0].fullname);
        });
    });

    it('encode array through mapping & alias', () => {
        const mapping = Mapping.map(UnreferencedBoxes).with({
            size: {alias: 'fullsize'},
            things: [{name: {alias: 'fullname'}}]
        }).afterEncode((json, original) => {
            expect(original.size).to.equal(40);
        });
        const boxes = new UnreferencedBoxes({size: 40, things: [new Thing({name: 'Shoes'})]});

        return mapping.encode(boxes).then(json => {
            expect(json.fullsize).to.equal(boxes.size);
            expect(json.things instanceof Array).to.equal(true);
            expect(json.things[0].fullname).to.equal(boxes.things[0].name);
        });
    });

    class UnreferencedBoxesWithin extends Domain {
        get props() {
            return {
                size: Number,
                things: [{
                    details: [{
                        name: String
                    }]
                }]
            };
        }
    }

    it('decode deeply and deeply through untyped mapping', () => {
        const mapping = Mapping.map(UnreferencedBoxesWithin).with({
            things: [{details: [{name: {alias: 'fullname'}}]}]
        });
        const json = {size: 40, things: [{details: [{fullname: 'Shoes'}, {fullname: 'Small'}]}, {details: [{fullname: 'Shirt'}, {fullname: 'Large'}]}]};

        return mapping.decode(json).then(box => {
            expect(box instanceof UnreferencedBoxesWithin).to.equal(true);
            expect(box.size).to.equal(json.size);
            expect(box.things instanceof Array).to.equal(true);
            expect(box.things[0].details[0].name).to.equal(json.things[0].details[0].fullname);
            expect(box.things[1].details[1].name).to.equal(json.things[1].details[1].fullname);
        });
    });

    it('encode deeply and deeply through untyped mapping', () => {
        const mapping = Mapping.map(UnreferencedBoxesWithin).with({
            things: [{details: [{name: {alias: 'fullname'}}]}]
        });
        const box = new UnreferencedBoxesWithin({size: 40, things: [{details: [{name: 'Shoes'}, {name: 'Small'}]}, {details: [{name: 'Shirt'}, {name: 'Large'}]}]});

        return mapping.encode(box).then(json => {
            expect(json.size).to.equal(box.size);
            expect(json.things instanceof Array).to.equal(true);
            expect(json.things[0].details[0].fullname).to.equal(box.things[0].details[0].name);
            expect(json.things[1].details[1].fullname).to.equal(box.things[1].details[1].name);
        });
    });

    it('decode through mapping & hook', () => {
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
            expect(thing instanceof Thing).to.equal(true);
            expect(thing.name).to.equal(`2x ${json.name}`);
            expect(thing.formattedName).to.equal(`2x ${json.name}`.toLowerCase());
        });
    });

    it('encode through mapping & hook', () => {
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
            expect(json.name).to.equal(`2x ${thing.name}`);
            expect(json.formattedName).to.equal(`2x ${thing.name}`.toLowerCase());
        });
    });

    it('decode array through mapping & hook', () => {
        const mapping = Mapping.map(Thing)
        .beforeDecode(json => {
            const clone = Object.assign({}, json);
            clone.name = `2x ${clone.name}`;
            return clone;
        })
        .afterDecode((object, original) => {
            expect(original.name).to.equal('Shoes');

            object.formattedName = object.name.toLowerCase();
            return object;
        });
        const jsons = [{name: 'Shoes'}];

        return mapping.decode(jsons).then(things => {
            expect(things instanceof Array).to.equal(true);
            expect(things[0] instanceof Thing).to.equal(true);
            expect(things[0].name).to.equal(`2x ${jsons[0].name}`);
            expect(things[0].formattedName).to.equal(`2x ${jsons[0].name}`.toLowerCase());
        });
    });

    it('encode array through mapping & hook', () => {
        const mapping = Mapping.map(Thing)
        .beforeEncode(object => {
            const clone = new Thing(object);
            clone.name = `2x ${clone.name}`;
            return clone;
        })
        .afterEncode((json, original) => {
            expect(original.name).to.equal('Shoes');

            json.formattedName = json.name.toLowerCase();
            return json;
        });
        const things = [new Thing({name: 'Shoes'})];

        return mapping.encode(things).then(jsons => {
            expect(jsons instanceof Array).to.equal(true);
            expect(jsons[0].name).to.equal(`2x ${things[0].name}`);
            expect(jsons[0].formattedName).to.equal(`2x ${things[0].name}`.toLowerCase());
        });
    });

    it('decode through mapping & defaults', () => {
        const mapping = Mapping.map(Thing)
        .defaults({
            permissions: 'r-'
        });
        const json = {name: 'Shoes'};

        return mapping.decode(json).then(thing => {
            expect(thing instanceof Thing).to.equal(true);
            expect(thing.name).to.equal(undefined);
        });
    });

    it('decode through mapping & defaults overriden', () => {
        const mapping = Mapping.map(Thing)
        .with({
            name: {}
        })
        .defaults({
            permissions: 'r-'
        });
        const json = {name: 'Shoes'};

        return mapping.decode(json).then(thing => {
            expect(thing instanceof Thing).to.equal(true);
            expect(thing.name).to.equal(json.name);
        });
    });

    it('decode through mapping & defaults overriden x2', () => {
        const mapping = Mapping.map(Thing)
        .with({
            name: {set: false}
        })
        .defaults({
            permissions: 'r-'
        });
        const json = {name: 'Shoes'};

        return mapping.decode(json).then(thing => {
            expect(thing instanceof Thing).to.equal(true);
            expect(thing.name).to.equal(undefined);
        });
    });

    it('encode through mapping & defaults', () => {
        const mapping = Mapping.map(Thing)
        .defaults({
            permissions: '-w'
        });
        const thing = new Thing({name: 'Shoes'});

        return mapping.encode(thing).then(json => {
            expect(json.hasOwnProperty('name')).to.equal(false);
        });
    });

    it('encode through mapping & defaults overriden', () => {
        const mapping = Mapping.map(Thing)
        .with({
            name: {}
        })
        .defaults({
            permissions: '-w'
        });
        const thing = new Thing({name: 'Shoes'});

        return mapping.encode(thing).then(json => {
            expect(json.name).to.equal(thing.name);
        });
    });

    it('encode through mapping & defaults overriden x2', () => {
        const mapping = Mapping.map(Thing)
        .with({
            name: {get: false}
        })
        .defaults({
            permissions: '-w'
        });
        const thing = new Thing({name: 'Shoes'});

        return mapping.encode(thing).then(json => {
            expect(json.hasOwnProperty('name')).to.equal(false);
        });
    });

    it('encode through mapping & providers', () => {
        const mapping = Mapping.map(Thing)
        .providers({
            toUpperCase: value => {
                return value.toUpperCase();
            }
        })
        .afterEncode((json, original, providers) => {
            json.formattedName = providers.toUpperCase(json.name);
        });
        const thing = new Thing({name: 'Shoes'});

        return mapping.encode(thing).then(json => {
            expect(json.name).to.equal(thing.name);
            expect(json.formattedName).to.equal(thing.name.toUpperCase());
        });
    });
});
