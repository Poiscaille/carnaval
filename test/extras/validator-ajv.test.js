const test = require('ava');

const validate = require('./validator-ajv');
const carnaval = require('../../');
const Mapping = carnaval.Mapping;
const Domain = carnaval.Domain;

class Thing extends Domain {
    get props() {
        return {
            name: String
        };
    }
    get rules() {
        return {
            name: {required: true}
        };
    }
}

test('validate', t => {
    const json = {name: 'Shoes'};
    const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

    return mapping.decode(json)
    .then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate as promise', t => {
    const json = {name: 'Shoes'};
    const mapping = Mapping.map(Thing).afterDecode(object => Promise.resolve(object).then(object => validate(object)));

    return mapping.decode(json)
    .then(thing => {
        t.is(thing.name, json.name);
    });
});

test('validate required error', t => {
    const json = {};
    const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'should have required property \'name\'');
    });
});

test('validate typed error', t => {
    const json = {name: 12};
    const mapping = Mapping.map(Thing).normalize(false).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'name should be string');
    });
});

test('validate no typed error with normalize', t => {
    const json = {name: 12};
    const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

    return mapping.decode(json).then(thing => {
        t.is(thing.name, String(json.name));
    });
});

class Box extends Domain {
    get props() {
        return {
            size: String,
            thing: Thing
        };
    }
    get rules() {
        return {
            size: {required: true},
            thing: {
                name: {required: true}
            }
        };
    }
}

test('validate deep error', t => {
    const json = {size: 'Medium', thing: {}};
    const mapping = Mapping.map(Box).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'thing should have required property \'name\'');
    });
});

class EmptyBox extends Domain {
    get props() {
        return {
            size: String,
            thing: Thing
        };
    }
    get rules() {
        return {
            thing: {
                name: {
                    value: {enum: ['valued']}
                }
            }
        };
    }
}

test('validate deep (two levels) optionnal', t => {
    const json = {};
    const mapping = Mapping.map(EmptyBox).afterDecode(object => validate(object));

    return mapping.decode(json)
    .then(emptyBox => {
        t.true(emptyBox instanceof EmptyBox);
        t.is(emptyBox.thing, undefined);
    });
});

class NotEmptyBox extends Domain {
    get props() {
        return {
            size: String,
            thing: Thing
        };
    }
    get rules() {
        return {
            thing: {
                name: {
                    value: {required: true, enum: ['valued']}
                }
            }
        };
    }
}

test('validate deep (two levels) error', t => {
    const json = {};
    const mapping = Mapping.map(NotEmptyBox).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'should have required property \'thing\'');
    });
});

class Gift extends Domain {
    get props() {
        return {
            size: String,
            names: [String]
        };
    }
    get rules() {
        return {
            names: {maxItems: 2}
        };
    }
}

test('validate array', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
    const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

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

test('validate array typed error', t => {
    const json = {size: 'Medium', names: ['Shoes', 12]};
    const mapping = Mapping.map(Gift).normalize(false).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'names/1 should be string');
    });
});

test('validate array no typed error with normalize', t => {
    const json = {size: 'Medium', names: ['Shoes', 12]};
    const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

    return mapping.decode(json).then(gift => {
        t.true(gift instanceof Gift);
        t.is(gift.size, json.size);
        t.true(gift.names instanceof Array);
        t.is(gift.names[0].constructor, String);
        t.is(gift.names[1].constructor, String);
        t.is(gift.names[0], json.names[0]);
        t.is(gift.names[1], String(json.names[1]));
    });
});

test('validate array condition error', t => {
    const json = {size: 'Medium', names: ['Shoes', 'Shirt', 'Pants']};
    const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'names should NOT have more than 2 items');
    });
});

class Bookcase extends Domain {
    get props() {
        return {
            size: String,
            things: [Thing]
        };
    }
    get rules() {
        return {
            things: {
                name: {required: true}
            }
        };
    }
}

test('validate array deep class error', t => {
    const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 12}]};
    const mapping = Mapping.map(Bookcase).normalize(false).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'things/1/name should be string');
    });
});

test('validate array no deep class error with normalize', t => {
    const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 12}]};
    const mapping = Mapping.map(Bookcase).afterDecode(object => validate(object));

    return mapping.decode(json).then(bookcase => {
        t.true(bookcase instanceof Bookcase);
        t.is(bookcase.size, json.size);
        t.true(bookcase.things instanceof Array);
        t.is(bookcase.things[0].constructor, Thing);
        t.is(bookcase.things[1].constructor, Thing);
        t.is(bookcase.things[0].name, json.things[0].name);
        t.is(bookcase.things[1].name, String(json.things[1].name));
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
    get rules() {
        return {
            things: {
                name: {required: true}
            }
        };
    }
}

test('validate untyped deep error', t => {
    const json = {size: 40, things: [{name: 'Shoes'}, {}]};
    const mapping = Mapping.map(UnreferencedBoxes).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'things/1 should have required property \'name\'');
    });
});

class UnknownBoxes extends Domain {
    get props() {
        return {
            size: Number,
            things: [Object]
        };
    }
    get rules() {
        return {
            things: {minItems: 1}
        };
    }
}

test('validate free deep error', t => {
    const json = {size: 40};
    const mapping = Mapping.map(UnknownBoxes).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'things should NOT have fewer than 1 items');
    });
});

class UnknownAlternativeBoxes extends Domain {
    get props() {
        return {
            size: Number,
            things: [Object]
        };
    }
    get rules() {
        return {
            things: [{minItems: 1}]
        };
    }
}

test('validate free deep error (alternative)', t => {
    const json = {size: 40};
    const mapping = Mapping.map(UnknownAlternativeBoxes).afterDecode(object => validate(object));

    return mapping.decode(json)
    .catch(error => {
        t.is(error.message, 'things should NOT have fewer than 1 items');
    });
});
