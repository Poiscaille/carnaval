const test = require('ava');

const Mask = require('../lib/Mask');
const Domain = require('../lib/Domain');

class Thing extends Domain {
    get props() {
        return {
            name: String,
            description: String,
            size: Number,
            physical: Boolean
        };
    }
}

test('assign, touched & schema', t => {
    const mask = Mask.cover(Thing).with({
        size: true,
        physical: true
    });

    const name = 'Shoes';
    const description = 'Adventure Playground';
    const physical = true;

    const thing = new Thing({name, size: 'ignored', physical: 'ignored'});
    const touched = mask.settle(
        thing,
        new Thing({name: 'overriden', description, physical})
    );

    t.is(thing.name, name);
    t.is(thing.description, undefined);
    t.is(thing.size, undefined);
    t.is(thing.physical, physical);

    t.true(touched.name);
    t.true(touched.description);
    t.is(touched.size, undefined);
    t.is(touched.physical, undefined);
});

test('assign missing, touched & schema', t => {
    const mask = Mask.cover(Thing).with({
        size: true,
        physical: true
    });

    const description = 'Adventure Playground';
    const physical = true;

    const thing = new Thing({});
    const touched = mask.settle(
        thing,
        new Thing({name: 'overriden', description, physical})
    );

    t.is(thing.name, undefined);
    t.is(thing.description, undefined);
    t.is(thing.size, undefined);
    t.is(thing.physical, physical);

    t.true(touched.name);
    t.true(touched.description);
    t.is(touched.size, undefined);
    t.is(touched.physical, undefined);
});

class Gift extends Domain {
    get props() {
        return {
            names: [String]
        };
    }
}

test('assign array, touched (less)', t => {
    const mask = Mask.cover(Gift);

    const names = ['Shoes', 'Shirt', 'Jeans'];

    const gift = new Gift({names});
    const touched = mask.settle(
        gift,
        new Gift({names: ['Jeans', 'Shirt']})
    );

    t.deepEqual(gift.names, ['Shoes', 'Shirt', 'Jeans']);
    t.deepEqual(touched.names, [true, false, true]);
});

test('assign array, touched (more)', t => {
    const mask = Mask.cover(Gift);

    const names = ['Shoes', 'Shirt'];

    const gift = new Gift({names});
    const touched = mask.settle(
        gift,
        new Gift({names: ['Jeans', 'Shirt', 'Jeans']})
    );

    t.deepEqual(gift.names, ['Shoes', 'Shirt']);
    t.deepEqual(touched.names, [true, false]);
});

test('assign empty array, touched', t => {
    const mask = Mask.cover(Gift);

    const names = [];

    const gift = new Gift({names});
    const touched = mask.settle(
        gift,
        new Gift({names: ['Jeans', 'Shirt', 'Jeans']})
    );

    t.deepEqual(gift.names, []);
    t.deepEqual(touched.names, []);
});

test('assign array, untouched', t => {
    const mask = Mask.cover(Gift).with({
        names: true
    });

    const names = [];

    const gift = new Gift({names});
    const touched = mask.settle(
        gift,
        new Gift({names: ['Jeans', 'Shirt', 'Jeans']})
    );

    t.deepEqual(gift.names, ['Jeans', 'Shirt', 'Jeans']);
    t.deepEqual(touched.names, undefined);
});

test('assign array, touched & schema', t => {
    const mask = Mask.cover(Gift).with({
        names: true
    });

    const names = ['Shoes', 'Shirt', 'Jeans'];

    const gift = new Gift({names});
    const touched = mask.settle(
        gift,
        new Gift({names: ['Jeans', 'Shirt']})
    );

    t.deepEqual(gift.names, ['Jeans', 'Shirt']);
    t.is(touched.names, undefined);
});

test('assign empty array, touched & schema', t => {
    const mask = Mask.cover(Gift).with({
        names: true
    });

    const names = ['Shoes', 'Shirt', 'Jeans'];

    const gift = new Gift({names});
    const touched = mask.settle(
        gift,
        new Gift({names: []})
    );

    t.deepEqual(gift.names, []);
    t.is(touched.names, undefined);
});

class Box extends Domain {
    get props() {
        return {
            thing: Thing
        };
    }
}

test('assign deep, touched & schema', t => {
    const mask = Mask.cover(Box).with({
        thing: {
            physical: true
        }
    });

    const name = 'Shoes';
    const size = 40;
    const description = 'Adventure Playground';
    const physical = true;

    const box = new Box({thing: {name, description, size, physical: 'ignored'}});
    const touched = mask.settle(
        box,
        new Box({thing: {name: 'overriden', description, physical}})
    );

    t.is(box.thing.name, name);
    t.is(box.thing.description, description);
    t.is(box.thing.size, size);
    t.is(box.thing.physical, physical);

    t.true(touched.thing.name);
    t.is(touched.thing.description, undefined);
    t.true(touched.thing.size);
    t.is(touched.thing.physical, undefined);
});

test('assign empty deep, touched & schema', t => {
    const mask = Mask.cover(Box).with({
        thing: {
            physical: true
        }
    });

    const physical = true;

    const box = new Box();
    const touched = mask.settle(
        box,
        new Box({thing: new Thing({physical})})
    );

    t.true(box.thing instanceof Thing);
    t.is(box.thing.name, undefined);
    t.is(box.thing.description, undefined);
    t.is(box.thing.size, undefined);
    t.is(box.thing.physical, physical);

    t.is(touched.thing, undefined);
});

test('assign empty root deep, touched & schema', t => {
    const mask = Mask.cover(Box).with({
        thing: true
    });

    const physical = true;

    const box = new Box();
    const touched = mask.settle(
        box,
        new Box({thing: {physical}})
    );

    t.is(box.thing.name, undefined);
    t.is(box.thing.description, undefined);
    t.is(box.thing.size, undefined);
    t.is(box.thing.physical, physical);
    t.true(box.thing instanceof Thing);

    t.is(touched.thing, undefined);
});

test('assign empty deeply, touched & schema', t => {
    const mask = Mask.cover(Box).with({
        thing: {
            physical: true
        }
    });

    const physical = true;

    const box = new Box();
    const touched = mask.settle(
        box,
        new Box({thing: new Thing({physical})})
    );

    t.true(box.thing instanceof Thing);
    t.is(box.thing.name, undefined);
    t.is(box.thing.description, undefined);
    t.is(box.thing.size, undefined);
    t.is(box.thing.physical, physical);

    t.is(touched.thing, undefined);
});

test('assign empty tuned deeply, touched & schema', t => {
    const mask = Mask.cover(Box).with({
        thing: Mask.cover(Thing).with({
            physical: true
        })
    });

    const physical = true;

    const box = new Box();
    const touched = mask.settle(
        box,
        new Box({thing: new Thing({physical})})
    );

    t.true(box.thing instanceof Thing);
    t.is(box.thing.name, undefined);
    t.is(box.thing.description, undefined);
    t.is(box.thing.size, undefined);
    t.is(box.thing.physical, physical);

    t.is(touched.thing, undefined);
});

class Shipping extends Domain {
    get props() {
        return {
            box: Box
        };
    }
}

test('assign double empty deep, touched & schema', t => {
    const mask = Mask.cover(Shipping).with({
        box: {
            thing: {
                size: true
            }
        }
    });

    const shipping = new Shipping();
    const touched = mask.settle(
        shipping,
        new Shipping()
    );

    t.is(shipping.box, undefined);
    t.is(touched.box, undefined);
});

class UnknownBox extends Domain {
    get props() {
        return {
            thing: Object
        };
    }
}

test('assign empty class tree, touched & schema', t => {
    const mask = Mask.cover(UnknownBox).with({
        thing: {
            name: true
        }
    });

    const name = 'Shoes';

    const box = new UnknownBox();
    const touched = mask.settle(
        box,
        new UnknownBox({thing: {name}})
    );

    t.is(box.thing.name, name);
    t.is(box.thing.size, undefined);

    t.is(touched.thing, undefined);
});

class Boxes extends Domain {
    get props() {
        return {
            things: [Thing]
        };
    }
}

test('assign deep array, touched', t => {
    const mask = Mask.cover(Boxes).with({
        things: [{
            physical: true
        }]
    });

    const name = 'Shoes';
    const description = 'Adventure Playground';
    const physical = true;

    const boxes = new Boxes({things: [{name, description, physical: 'ignored'}, {name, description, physical: 'ignored'}]});
    const touched = mask.settle(
        boxes,
        new Boxes(({things: [new Thing({name: 'overriden', description, physical}), new Thing({name: 'overriden', description, physical})]}))
    );

    for (let i = 0; i < 2; i++) {
        t.is(boxes.things[i].name, name);
        t.is(boxes.things[i].description, description);
        t.is(boxes.things[i].size, undefined);
        t.is(boxes.things[i].physical, physical);
    }

    t.is(touched.things.length, 2);

    for (let i = 0; i < 2; i++) {
        t.true(touched.things[i].name);
        t.is(touched.things[i].description, undefined);
        t.is(touched.things[i].size, undefined);
        t.is(touched.things[i].physical, undefined);
    }
});

test('assign deep array, touched (less)', t => {
    const mask = Mask.cover(Boxes).with({
        things: true
    });

    const name = 'Shoes';
    const description = 'Adventure Playground';
    const physical = true;

    const boxes = new Boxes({things: [{name: 'ignored', description, size: 40, physical: 'ignored'}]});
    const touched = mask.settle(
        boxes,
        new Boxes(({things: [new Thing({name, description, physical}), new Thing({name, description, physical})]}))
    );

    for (let i = 0; i < 2; i++) {
        t.is(boxes.things[i].name, name);
        t.is(boxes.things[i].description, description);
        t.is(boxes.things[i].size, undefined);
        t.is(boxes.things[i].physical, physical);
    }

    t.is(touched.things, undefined);
});

test('assign deep array, touched (more)', t => {
    const mask = Mask.cover(Boxes).with({
        things: true
    });

    const name = 'Shoes';
    const description = 'Adventure Playground';
    const physical = true;

    const boxes = new Boxes({things: [{name: 'ignored', description, physical: 'ignored'}, {name: 'ignored', description, physical: 'ignored'}]});
    const touched = mask.settle(
        boxes,
        new Boxes(({things: [new Thing({name, description, physical})]}))
    );

    t.is(boxes.things.length, 1);

    for (let i = 0; i < 1; i++) {
        t.is(boxes.things[i].name, name);
        t.is(boxes.things[i].description, description);
        t.is(boxes.things[i].size, undefined);
        t.is(boxes.things[i].physical, physical);
    }

    t.is(touched.things, undefined);
});

test('assign deep array, typed', t => {
    const mask = Mask.cover(Boxes).with({
        things: [{
            physical: true
        }]
    });

    const description = 'Adventure Playground';
    const physical = true;

    const boxes = new Boxes({things: []});
    const touched = mask.settle(
        boxes,
        new Boxes(({things: [new Thing({name: 'overriden', description, physical})]}))
    );

    t.true(boxes.things[0] instanceof Thing);
    t.is(boxes.things[0].name, undefined);
    t.is(boxes.things[0].description, undefined);
    t.is(boxes.things[0].size, undefined);
    t.is(boxes.things[0].physical, physical);

    t.true(touched.things[0].name);
    t.true(touched.things[0].description);
});

test('assign deep array, untouched', t => {
    const mask = Mask.cover(Boxes).with({
        things: true
    });

    const name = 'Shoes';
    const description = 'Adventure Playground';
    const physical = true;

    const boxes = new Boxes({things: []});
    const touched = mask.settle(
        boxes,
        new Boxes({things: [new Thing({name, description, physical}), new Thing({name, description, physical})]})
    );

    for (let i = 0; i < 2; i++) {
        t.is(boxes.things[i].name, name);
        t.is(boxes.things[i].description, description);
        t.is(boxes.things[i].size, undefined);
        t.is(boxes.things[i].physical, physical);
    }

    t.is(touched.thing, undefined);
});

test('assign missing deep array, untouched', t => {
    const mask = Mask.cover(Boxes).with({
        things: true
    });

    const name = 'Shoes';
    const description = 'Adventure Playground';
    const physical = true;

    const boxes = new Boxes({});
    const touched = mask.settle(
        boxes,
        new Boxes({things: [new Thing({name, description, physical}), new Thing({name, description, physical})]})
    );

    for (let i = 0; i < 2; i++) {
        t.is(boxes.things[i].name, name);
        t.is(boxes.things[i].description, description);
        t.is(boxes.things[i].size, undefined);
        t.is(boxes.things[i].physical, physical);
    }

    t.is(touched.thing, undefined);
});

class Cart extends Domain {
    get props() {
        return {
            gifts: [Gift]
        };
    }
}

test('assign deep array within array, touched (less)', t => {
    const mask = Mask.cover(Cart);

    const names = ['Shoes', 'Shirt', 'Jeans'];

    const cart = new Cart({gifts: [new Gift({names}), new Gift({names})]});
    const touched = mask.settle(
        cart,
        new Cart({gifts: [new Gift({names: ['Jeans', 'Shirt']})]})
    );

    t.deepEqual(cart.gifts[0].names, ['Shoes', 'Shirt', 'Jeans']);
    t.deepEqual(cart.gifts[1].names, ['Shoes', 'Shirt', 'Jeans']);
    t.deepEqual(touched.gifts[0].names, [true, false, true]);
    t.deepEqual(touched.gifts[1].names, [true, true, true]);
});

class UnreferencedBoxes extends Domain {
    get props() {
        return {
            things: [{
                name: String,
                size: Boolean,
                details: {
                    more: Boolean,
                    less: Boolean
                }
            }]
        };
    }
}

test('assign class tree array, touched & schema', t => {
    const mask = Mask.cover(UnreferencedBoxes).with({
        things: [{
            size: true,
            details: {
                less: true
            }
        }]
    });

    const name = 'Shoes';

    const boxes = new UnreferencedBoxes({things: [{name, size: 'ignored', details: {more: true, less: true}}, {name, size: 'ignored', details: {more: true, less: true}}]});
    const touched = mask.settle(
        boxes,
        new UnreferencedBoxes({things: [{name: 'overriden', details: {more: false, less: false}}, {name: 'overriden', details: {more: false, less: false}}]})
    );

    for (let i = 0; i < 2; i++) {
        t.is(boxes.things[i].name, name);
        t.is(boxes.things[i].size, undefined);
        t.true(boxes.things[i].details.more);
        t.false(boxes.things[i].details.less);
    }

    t.is(touched.things.length, 2);

    for (let i = 0; i < 2; i++) {
        t.true(touched.things[i].name);
        t.is(touched.things[i].size, undefined);
        t.true(touched.things[i].details.more);
        t.is(touched.things[i].details.less, undefined);
    }
});

test('assign deep mask, touched & schema', t => {
    const mask = Mask.cover(Box).with({
        thing: Mask.cover(Thing).with({
            physical: true
        })
    });

    const name = 'Shoes';
    const size = 40;
    const description = 'Adventure Playground';
    const physical = true;

    const box = new Box({thing: {name, description, size, physical: 'ignored'}});
    const touched = mask.settle(
        box,
        new Box({thing: {name: 'overriden', description, physical}})
    );

    t.is(box.thing.name, name);
    t.is(box.thing.description, description);
    t.is(box.thing.size, size);
    t.is(box.thing.physical, physical);

    t.true(touched.thing.name);
    t.is(touched.thing.description, undefined);
    t.true(touched.thing.size);
    t.is(touched.thing.physical, undefined);
});

test('domain cover props', t => {
    const mask = Mask.cover(Thing).except();
    
    const name = 'Shoes';

    const thing = new Thing({name: 'ignored'});
    mask.settle(thing, new Thing({name: name}));
    
    t.is(thing.name, name);
});

test('domain cover & omit props', t => {
    const mask = Mask.cover(Thing).except({name: false});
    
    const name = 'Shoes';

    const thing = new Thing({name: name});
    mask.settle(thing, new Thing({name: 'overriden'}));
    
    t.is(thing.name, name);
});

test('domain cover deep props', t => {
    const mask = Mask.cover(Box).except();
    
    const name = 'Shoes';

    const box = new Box({thing: {name: 'ignored'}});
    mask.settle(box, new Box({thing: {name: name}}));
    
    t.is(box.thing.name, name);
});

test('domain cover & omit deep props', t => {
    const mask = Mask.cover(Box).except({thing: {name: false}});
    
    const name = 'Shoes';

    const box = new Box({thing: {name: name}});
    mask.settle(box, new Box({thing: {name: 'overriden'}}));
    
    t.is(box.thing.name, name);
});

test('domain cover deep free props', t => {
    const mask = Mask.cover(UnknownBox).except();
    
    const name = 'Shoes';

    const box = new UnknownBox({thing: {name: 'ignored'}});
    mask.settle(box, new UnknownBox({thing: {name: name}}));
    
    t.is(box.thing.name, name);
});

test('domain cover & omit deep free props', t => {
    const mask = Mask.cover(UnknownBox).except({thing: false});
    
    const name = 'Shoes';

    const box = new UnknownBox({thing: {name: name}});
    mask.settle(box, new UnknownBox({thing: {name: 'overriden'}}));
    
    t.is(box.thing.name, name);
});

class UnreferencedBox extends Domain {
    get props() {
        return {
            thing: {
                name: String
            }
        };
    }
}

test('domain cover deep untyped props', t => {
    const mask = Mask.cover(UnreferencedBox).except();
    
    const name = 'Shoes';

    const box = new UnreferencedBox({thing: {name: 'ignored'}});
    mask.settle(box, new UnreferencedBox({thing: {name: name}}));
    
    t.is(box.thing.name, name);
});

test('domain cover & omit deep untyped props', t => {
    const mask = Mask.cover(UnreferencedBox).except({thing: {name: false}});
    
    const name = 'Shoes';

    const box = new UnreferencedBox({thing: {name: name}});
    mask.settle(box, new UnreferencedBox({thing: {name: 'overriden'}}));
    
    t.is(box.thing.name, name);
});

class DatedBox extends Domain {
    get props() {
        return {
            date: Date
        };
    }
}

test('assign, date untouched', t => {
    const mask = Mask.cover(DatedBox);

    const date = new Date();

    const box = new DatedBox({date});
    const touched = mask.settle(
        box,
        new DatedBox({date})
    );

    t.is(box.date, date);

    t.is(touched.date, undefined);
});

test('assign, date touched', t => {
    const mask = Mask.cover(DatedBox);

    const date = new Date();
    const dateClone = new Date(date.getTime());

    const box = new DatedBox({date});
    const touched = mask.settle(
        box,
        new DatedBox({date: dateClone})
    );

    t.is(box.date, date);

    t.is(touched.date, undefined);
});

test('assign, date touched & updated', t => {
    const mask = Mask.cover(DatedBox);

    const date = new Date();
    const epoch = new Date();
    epoch.setTime(0); // 1970-01-01

    const box = new DatedBox({date});
    const touched = mask.settle(
        box,
        new DatedBox({date: epoch})
    );

    t.is(box.date, date);

    t.true(touched.date);
});
