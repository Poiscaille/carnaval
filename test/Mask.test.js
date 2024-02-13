const {expect} = require('chai');

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

describe("Mark", () => {
    it('assign, touched & schema', () => {
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

        expect(thing.name).to.equal(name);
        expect(thing.description).to.equal(undefined);
        expect(thing.size).to.equal(undefined);
        expect(thing.physical).to.equal(physical);

        expect(touched.name).to.equal(true);
        expect(touched.description).to.equal(true);
        expect(touched.size).to.equal(undefined);
        expect(touched.physical).to.equal(undefined);
    });

    it('assign missing, touched & schema', () => {
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

        expect(thing.name).to.equal(undefined);
        expect(thing.description).to.equal(undefined);
        expect(thing.size).to.equal(undefined);
        expect(thing.physical).to.equal(physical);

        expect(touched.name).to.equal(true);
        expect(touched.description).to.equal(true);
        expect(touched.size).to.equal(undefined);
        expect(touched.physical).to.equal(undefined);
    });

    class Gift extends Domain {
        get props() {
            return {
                names: [String]
            };
        }
    }

    it('assign array, touched (less)', () => {
        const mask = Mask.cover(Gift);

        const names = ['Shoes', 'Shirt', 'Jeans'];

        const gift = new Gift({names});
        const touched = mask.settle(
            gift,
            new Gift({names: ['Jeans', 'Shirt']})
        );

        expect(gift.names).to.deep.equal(['Shoes', 'Shirt', 'Jeans']);
        expect(touched.names).to.deep.equal([true, false, true]);
    });

    it('assign array, touched (more)', () => {
        const mask = Mask.cover(Gift);

        const names = ['Shoes', 'Shirt'];

        const gift = new Gift({names});
        const touched = mask.settle(
            gift,
            new Gift({names: ['Jeans', 'Shirt', 'Jeans']})
        );

        expect(gift.names).to.deep.equal(['Shoes', 'Shirt']);
        expect(touched.names).to.deep.equal([true, false]);
    });

    it('assign empty array, touched', () => {
        const mask = Mask.cover(Gift);

        const names = [];

        const gift = new Gift({names});
        const touched = mask.settle(
            gift,
            new Gift({names: ['Jeans', 'Shirt', 'Jeans']})
        );

        expect(gift.names).to.deep.equal([]);
        expect(touched.names).to.deep.equal([]);
    });

    it('assign array, untouched', () => {
        const mask = Mask.cover(Gift).with({
            names: true
        });

        const names = [];

        const gift = new Gift({names});
        const touched = mask.settle(
            gift,
            new Gift({names: ['Jeans', 'Shirt', 'Jeans']})
        );

        expect(gift.names).to.deep.equal(['Jeans', 'Shirt', 'Jeans']);
        expect(touched.names).to.deep.equal(undefined);
    });

    it('assign array, touched & schema', () => {
        const mask = Mask.cover(Gift).with({
            names: true
        });

        const names = ['Shoes', 'Shirt', 'Jeans'];

        const gift = new Gift({names});
        const touched = mask.settle(
            gift,
            new Gift({names: ['Jeans', 'Shirt']})
        );

        expect(gift.names).to.deep.equal(['Jeans', 'Shirt']);
        expect(touched.names).to.equal(undefined);
    });

    it('assign empty array, touched & schema', () => {
        const mask = Mask.cover(Gift).with({
            names: true
        });

        const names = ['Shoes', 'Shirt', 'Jeans'];

        const gift = new Gift({names});
        const touched = mask.settle(
            gift,
            new Gift({names: []})
        );

        expect(gift.names).to.deep.equal([]);
        expect(touched.names).to.equal(undefined);
    });

    class Box extends Domain {
        get props() {
            return {
                thing: Thing
            };
        }
    }

    it('assign deep, touched & schema', () => {
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

        expect(box.thing.name).to.equal(name);
        expect(box.thing.description).to.equal(description);
        expect(box.thing.size).to.equal(size);
        expect(box.thing.physical).to.equal(physical);

        expect(touched.thing.name).to.equal(true);
        expect(touched.thing.description).to.equal(undefined);
        expect(touched.thing.size).to.equal(true);
        expect(touched.thing.physical).to.equal(undefined);
    });

    it('assign empty deep, touched & schema', () => {
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

        expect(box.thing instanceof Thing).to.equal(true);
        expect(box.thing.name).to.equal(undefined);
        expect(box.thing.description).to.equal(undefined);
        expect(box.thing.size).to.equal(undefined);
        expect(box.thing.physical).to.equal(physical);

        expect(touched.thing).to.equal(undefined);
    });

    it('assign empty root deep, touched & schema', () => {
        const mask = Mask.cover(Box).with({
            thing: true
        });

        const physical = true;

        const box = new Box();
        const touched = mask.settle(
            box,
            new Box({thing: {physical}})
        );

        expect(box.thing.name).to.equal(undefined);
        expect(box.thing.description).to.equal(undefined);
        expect(box.thing.size).to.equal(undefined);
        expect(box.thing.physical).to.equal(physical);
        expect(box.thing instanceof Thing).to.equal(true);

        expect(touched.thing).to.equal(undefined);
    });

    it('assign empty deeply, touched & schema', () => {
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

        expect(box.thing instanceof Thing).to.equal(true);
        expect(box.thing.name).to.equal(undefined);
        expect(box.thing.description).to.equal(undefined);
        expect(box.thing.size).to.equal(undefined);
        expect(box.thing.physical).to.equal(physical);

        expect(touched.thing).to.equal(undefined);
    });

    it('assign empty tuned deeply, touched & schema', () => {
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

        expect(box.thing instanceof Thing).to.equal(true);
        expect(box.thing.name).to.equal(undefined);
        expect(box.thing.description).to.equal(undefined);
        expect(box.thing.size).to.equal(undefined);
        expect(box.thing.physical).to.equal(physical);

        expect(touched.thing).to.equal(undefined);
    });

    class Garage extends Domain {
        get props() {
            return {
                boxes: [{
                    thing: Thing
                }]
            };
        }
    }

    it('assign empty array deeply, touched & schema', () => {
        const mask = Mask.cover(Garage).except({
            boxes: {
                thing: {
                    name: false,
                    description: false,
                    size: false
                }
            }
        });

        const physical = true;

        const garage = new Garage({boxes: []});
        const touched = mask.settle(
            garage,
            new Garage({boxes: [{thing: new Thing({physical})}]})
        );

        expect(garage.boxes.length).to.equal(1);
        expect(garage.boxes[0].thing instanceof Thing).to.equal(true);
        expect(garage.boxes[0].thing.name).to.equal(undefined);
        expect(garage.boxes[0].thing.description).to.equal(undefined);
        expect(garage.boxes[0].thing.size).to.equal(undefined);
        expect(garage.boxes[0].thing.physical).to.equal(physical);

        expect(touched.boxes).to.equal(undefined);
    });

    class Shipping extends Domain {
        get props() {
            return {
                box: Box
            };
        }
    }

    it('assign double empty deep, touched & schema', () => {
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

        expect(shipping.box).to.equal(undefined);
        expect(touched.box).to.equal(undefined);
    });

    class UnknownBox extends Domain {
        get props() {
            return {
                thing: Object
            };
        }
    }

    it('assign empty class tree, touched & schema', () => {
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

        expect(box.thing.name).to.equal(name);
        expect(box.thing.size).to.equal(undefined);

        expect(touched.thing).to.equal(undefined);
    });

    class Boxes extends Domain {
        get props() {
            return {
                things: [Thing]
            };
        }
    }

    it('assign deep array, touched', () => {
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
            expect(boxes.things[i].name).to.equal(name);
            expect(boxes.things[i].description).to.equal(description);
            expect(boxes.things[i].size).to.equal(undefined);
            expect(boxes.things[i].physical).to.equal(physical);
        }

        expect(touched.things.length).to.equal(2);

        for (let i = 0; i < 2; i++) {
            expect(touched.things[i].name).to.equal(true);
            expect(touched.things[i].description).to.equal(undefined);
            expect(touched.things[i].size).to.equal(undefined);
            expect(touched.things[i].physical).to.equal(undefined);
        }
    });

    it('assign deep array, touched (less)', () => {
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
            expect(boxes.things[i].name).to.equal(name);
            expect(boxes.things[i].description).to.equal(description);
            expect(boxes.things[i].size).to.equal(undefined);
            expect(boxes.things[i].physical).to.equal(physical);
        }

        expect(touched.things).to.equal(undefined);
    });

    it('assign deep array, touched (more)', () => {
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

        expect(boxes.things.length).to.equal(1);

        for (let i = 0; i < 1; i++) {
            expect(boxes.things[i].name).to.equal(name);
            expect(boxes.things[i].description).to.equal(description);
            expect(boxes.things[i].size).to.equal(undefined);
            expect(boxes.things[i].physical).to.equal(physical);
        }

        expect(touched.things).to.equal(undefined);
    });

    it('assign deep array, typed', () => {
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

        expect(boxes.things[0] instanceof Thing).to.equal(true);
        expect(boxes.things[0].name).to.equal(undefined);
        expect(boxes.things[0].description).to.equal(undefined);
        expect(boxes.things[0].size).to.equal(undefined);
        expect(boxes.things[0].physical).to.equal(physical);

        expect(touched.things[0].name).to.equal(true);
        expect(touched.things[0].description).to.equal(true);
    });

    it('assign deep array, untouched', () => {
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
            expect(boxes.things[i].name).to.equal(name);
            expect(boxes.things[i].description).to.equal(description);
            expect(boxes.things[i].size).to.equal(undefined);
            expect(boxes.things[i].physical).to.equal(physical);
        }

        expect(touched.thing).to.equal(undefined);
    });

    it('assign missing deep array, untouched', () => {
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
            expect(boxes.things[i].name).to.equal(name);
            expect(boxes.things[i].description).to.equal(description);
            expect(boxes.things[i].size).to.equal(undefined);
            expect(boxes.things[i].physical).to.equal(physical);
        }

        expect(touched.thing).to.equal(undefined);
    });

    class Cart extends Domain {
        get props() {
            return {
                gifts: [Gift]
            };
        }
    }

    it('assign deep array within array, touched (less)', () => {
        const mask = Mask.cover(Cart);

        const names = ['Shoes', 'Shirt', 'Jeans'];

        const cart = new Cart({gifts: [new Gift({names}), new Gift({names})]});
        const touched = mask.settle(
            cart,
            new Cart({gifts: [new Gift({names: ['Jeans', 'Shirt']})]})
        );

        expect(cart.gifts[0].names).to.deep.equal(['Shoes', 'Shirt', 'Jeans']);
        expect(cart.gifts[1].names).to.deep.equal(['Shoes', 'Shirt', 'Jeans']);
        expect(touched.gifts[0].names).to.deep.equal([true, false, true]);
        expect(touched.gifts[1].names).to.deep.equal([true, true, true]);
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

    it('assign class tree array, touched & schema', () => {
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
            expect(boxes.things[i].name).to.equal(name);
            expect(boxes.things[i].size).to.equal(undefined);
            expect(boxes.things[i].details.more).to.equal(true);
            expect(boxes.things[i].details.less).to.equal(false);
        }

        expect(touched.things.length).to.equal(2);

        for (let i = 0; i < 2; i++) {
            expect(touched.things[i].name).to.equal(true);
            expect(touched.things[i].size).to.equal(undefined);
            expect(touched.things[i].details.more).to.equal(true);
            expect(touched.things[i].details.less).to.equal(undefined);
        }
    });

    it('assign deep mask, touched & schema', () => {
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

        expect(box.thing.name).to.equal(name);
        expect(box.thing.description).to.equal(description);
        expect(box.thing.size).to.equal(size);
        expect(box.thing.physical).to.equal(physical);

        expect(touched.thing.name).to.equal(true);
        expect(touched.thing.description).to.equal(undefined);
        expect(touched.thing.size).to.equal(true);
        expect(touched.thing.physical).to.equal(undefined);
    });

    it('domain cover props', () => {
        const mask = Mask.cover(Thing).except();
        
        const name = 'Shoes';

        const thing = new Thing({name: 'ignored'});
        mask.settle(thing, new Thing({name: name}));
        
        expect(thing.name).to.equal(name);
    });

    it('domain cover & omit props', () => {
        const mask = Mask.cover(Thing).except({name: false});
        
        const name = 'Shoes';

        const thing = new Thing({name: name});
        mask.settle(thing, new Thing({name: 'overriden'}));
        
        expect(thing.name).to.equal(name);
    });

    it('domain cover deep props', () => {
        const mask = Mask.cover(Box).except();
        
        const name = 'Shoes';

        const box = new Box({thing: {name: 'ignored'}});
        mask.settle(box, new Box({thing: {name: name}}));
        
        expect(box.thing.name).to.equal(name);
    });

    it('domain cover & omit deep props', () => {
        const mask = Mask.cover(Box).except({thing: {name: false}});
        
        const name = 'Shoes';

        const box = new Box({thing: {name: name}});
        mask.settle(box, new Box({thing: {name: 'overriden'}}));
        
        expect(box.thing.name).to.equal(name);
    });

    it('domain cover deep free props', () => {
        const mask = Mask.cover(UnknownBox).except();
        
        const name = 'Shoes';

        const box = new UnknownBox({thing: {name: 'ignored'}});
        mask.settle(box, new UnknownBox({thing: {name: name}}));
        
        expect(box.thing.name).to.equal(name);
    });

    it('domain cover & omit deep free props', () => {
        const mask = Mask.cover(UnknownBox).except({thing: false});
        
        const name = 'Shoes';

        const box = new UnknownBox({thing: {name: name}});
        mask.settle(box, new UnknownBox({thing: {name: 'overriden'}}));
        
        expect(box.thing.name).to.equal(name);
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

    it('domain cover deep untyped props', () => {
        const mask = Mask.cover(UnreferencedBox).except();
        
        const name = 'Shoes';

        const box = new UnreferencedBox({thing: {name: 'ignored'}});
        mask.settle(box, new UnreferencedBox({thing: {name: name}}));
        
        expect(box.thing.name).to.equal(name);
    });

    it('domain cover & omit deep untyped props', () => {
        const mask = Mask.cover(UnreferencedBox).except({thing: {name: false}});
        
        const name = 'Shoes';

        const box = new UnreferencedBox({thing: {name: name}});
        mask.settle(box, new UnreferencedBox({thing: {name: 'overriden'}}));
        
        expect(box.thing.name).to.equal(name);
    });

    class DatedBox extends Domain {
        get props() {
            return {
                date: Date
            };
        }
    }

    it('assign, date untouched', () => {
        const mask = Mask.cover(DatedBox);

        const date = new Date();

        const box = new DatedBox({date});
        const touched = mask.settle(
            box,
            new DatedBox({date})
        );

        expect(box.date).to.equal(date);

        expect(touched.date).to.equal(undefined);
    });

    it('assign, date touched', () => {
        const mask = Mask.cover(DatedBox);

        const date = new Date();
        const dateClone = new Date(date.getTime());

        const box = new DatedBox({date});
        const touched = mask.settle(
            box,
            new DatedBox({date: dateClone})
        );

        expect(box.date).to.equal(date);

        expect(touched.date).to.equal(undefined);
    });

    it('assign, date touched & updated', () => {
        const mask = Mask.cover(DatedBox);

        const date = new Date();
        const epoch = new Date();
        epoch.setTime(0); // 1970-01-01

        const box = new DatedBox({date});
        const touched = mask.settle(
            box,
            new DatedBox({date: epoch})
        );

        expect(box.date).to.equal(date);

        expect(touched.date).to.equal(true);
    });
});
