const {expect} = require('chai');

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

describe("validator-ajv", () => {
    it('validate', () => {
        const json = {name: 'Shoes'};
        const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

        return mapping.decode(json)
        .then(thing => {
            expect(thing.name).to.equal(json.name);
        });
    });

    it('validate as promise', () => {
        const json = {name: 'Shoes'};
        const mapping = Mapping.map(Thing).afterDecode(object => Promise.resolve(object).then(object => validate(object)));

        return mapping.decode(json)
        .then(thing => {
            expect(thing.name).to.equal(json.name);
        });
    });

    it('validate required error', () => {
        const json = {};
        const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('should have required property \'name\'');
        });
    });

    it('validate typed error', () => {
        const json = {name: 12};
        const mapping = Mapping.map(Thing).normalize(false).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('name should be string');
        });
    });

    it('validate no typed error with normalize', () => {
        const json = {name: 12};
        const mapping = Mapping.map(Thing).afterDecode(object => validate(object));

        return mapping.decode(json).then(thing => {
            expect(thing.name).to.equal(String(json.name));
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

    it('validate deep error', () => {
        const json = {size: 'Medium', thing: {}};
        const mapping = Mapping.map(Box).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('thing should have required property \'name\'');
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

    it('validate deep (two levels) optionnal', () => {
        const json = {};
        const mapping = Mapping.map(EmptyBox).afterDecode(object => validate(object));

        return mapping.decode(json)
        .then(emptyBox => {
            expect(emptyBox instanceof EmptyBox).to.equal(true);
            expect(emptyBox.thing).to.equal(undefined);
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

    it('validate deep (two levels) error', () => {
        const json = {};
        const mapping = Mapping.map(NotEmptyBox).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('should have required property \'thing\'');
        });
    });

    class EmptyOrNotBox extends Domain {
        get props() {
            return {
                size: String,
                thing: Thing
            };
        }
        get rules() {
            return {
                thing: {
                    required: false,
                    name: {
                        value: {required: true, enum: ['valued']}
                    }
                }
            };
        }
    }

    it('validate deep (two levels) empty', () => {
        const json = {};
        const mapping = Mapping.map(EmptyOrNotBox).afterDecode(object => validate(object));

        return mapping.decode(json)
        .then(emptyBox => {
            expect(emptyBox instanceof EmptyOrNotBox).to.equal(true);
            expect(emptyBox.thing).to.equal(undefined);
        });
    });

    it('validate deep (two levels) empty but not', () => {
        const json = {thing: {}};
        const mapping = Mapping.map(EmptyOrNotBox).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('thing should have required property \'name\'');
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
                names: {maxItems: 2, enum: ['Shoes', 'Shirt', '12']}
            };
        }
    }

    it('validate array', () => {
        const json = {size: 'Medium', names: ['Shoes', 'Shirt']};
        const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

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

    it('validate array typed error', () => {
        const json = {size: 'Medium', names: ['Shoes', 12]};
        const mapping = Mapping.map(Gift).normalize(false).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('names/1 should be string');
        });
    });

    it('validate array no typed error with normalize', () => {
        const json = {size: 'Medium', names: ['Shoes', 12]};
        const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

        return mapping.decode(json).then(gift => {
            expect(gift instanceof Gift).to.equal(true);
            expect(gift.size).to.equal(json.size);
            expect(gift.names instanceof Array).to.equal(true);
            expect(gift.names[0].constructor).to.equal(String);
            expect(gift.names[1].constructor).to.equal(String);
            expect(gift.names[0]).to.equal(json.names[0]);
            expect(gift.names[1]).to.equal(String(json.names[1]));
        });
    });

    it('validate array condition error', () => {
        const json = {size: 'Medium', names: ['Shoes', 'Shirt', 'Pants']};
        const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('names should NOT have more than 2 items');
        });
    });

    it('validate array content error', () => {
        const json = {size: 'Medium', names: ['Shoe']};
        const mapping = Mapping.map(Gift).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('names/0 should be equal to one of the allowed values');
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

    it('validate array deep class error', () => {
        const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 12}]};
        const mapping = Mapping.map(Bookcase).normalize(false).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('things/1/name should be string');
        });
    });

    it('validate array no deep class error with normalize', () => {
        const json = {size: 'Medium', things: [{name: 'Shoes'}, {name: 12}]};
        const mapping = Mapping.map(Bookcase).afterDecode(object => validate(object));

        return mapping.decode(json).then(bookcase => {
            expect(bookcase instanceof Bookcase).to.equal(true);
            expect(bookcase.size).to.equal(json.size);
            expect(bookcase.things instanceof Array).to.equal(true);
            expect(bookcase.things[0].constructor).to.equal(Thing);
            expect(bookcase.things[1].constructor).to.equal(Thing);
            expect(bookcase.things[0].name).to.equal(json.things[0].name);
            expect(bookcase.things[1].name).to.equal(String(json.things[1].name));
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

    it('validate untyped deep error', () => {
        const json = {size: 40, things: [{name: 'Shoes'}, {}]};
        const mapping = Mapping.map(UnreferencedBoxes).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('things/1 should have required property \'name\'');
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

    it('validate free deep error', () => {
        const json = {size: 40};
        const mapping = Mapping.map(UnknownBoxes).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('things should NOT have fewer than 1 items');
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

    it('validate free deep error (alternative)', () => {
        const json = {size: 40};
        const mapping = Mapping.map(UnknownAlternativeBoxes).afterDecode(object => validate(object));

        return mapping.decode(json)
        .catch(error => {
            expect(error.message).to.equal('things should NOT have fewer than 1 items');
        });
    });
});
