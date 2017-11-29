# Carnaval

Minimalist, zero dependency, encoding / decoding class ↔ json for [node](https://nodejs.org).

```javascript
class Friend {
    constructor(data) {
        Object.assign(this, data);
    }
    get props() {
        return {
            name: 'string',
            age: 'number'
        };
    }
}

const carnaval = require('carnaval');
const codec = carnaval().codecForClass(Friend);

codec.decode({name: 'Joe', age: 27}).then(friend => { .. });
codec.encode(new Friend({name: 'Joe', age: 27})).then(json => { .. });
```

## Installation

This is a [node](https://nodejs.org) module available through the [npm registry](https://www.npmjs.com/).
Before installing, [download and install Node.js](https://nodejs.org/en/download/) 6.0.0 or higher.

```
$ npm install carnaval
```

## Features

* Encode & decode object with a constructor / class
* Handle deep objects and arrays
* Configurable through middlewares & providers
* Offer a domain class to inherit from, with immutability / validation (_as options_)

## Usage

### Codec

**Props**

To properly encode / decode a class, this class should list its attributes through a `props` literal. One key per attribute (_ex. `name`_), one value for this attribute type (_ex. `'string'`_). Types can be named in any way, their names are only relevant for custom encoding / decoding.

**Codec**

A codec can transform a json into a class object (_with `decode`_) or a class object into json (_with `encode`_). In both cases, it returns a `Promise`. By default, every class' `props` will be copied (_simple types are duplicated, and complex are passed as reference_).

```javascript
const codec = carnaval().codecForClass(Friend);

codec.decode({name: 'Joe', age: 27}).then(friend => { /* new Friend({name: 'Joe', age: 27}) */ });
codec.encode(new Friend({name: 'Joe', age: 27})).then(json => { /* {name: 'Joe', age: 27} */ });
```

A codec can filter some `props` of its target class.

```javascript
const codec = carnaval().codecForClass(Friend).pick('name');

codec.decode({name: 'Joe', age: 27}).then(friend => { /* new Friend({name: 'Joe'}) */ });
codec.encode(new Friend({name: 'Joe', age: 27})).then(json => { /* {name: 'Joe'} */ });
```

A codec can also have a custom-made transform, without the requirement of a class.

```javascript
const codec = carnaval().codecCustom({
    encode: object => object ? object.getTime() : undefined,
    decode: json => json ? new Date(json) : undefined
});

codec.decode(1483916400000).then(date => { /* new Date(1483916400000) */ });
codec.encode(new Date(1483916400000)).then(timestamp => { /* 1483916400000 */ });
```

**Deep properties and arrays**

Sub objects can be handled with sub codecs. A codec may be associated to a property type with `onType` to encode / decode (_recursively_) every property of that type (_ex. `'c:friend'`_). This type can be named in any way, a `c:` prefix can be used  to differentiate types from properties.

Array types are handled though a type in brackets (_ex. `['string']`_).

```javascript
class Group {
    constructor(data) {
        Object.assign(this, data);
    }
    get props() {
        return {
            owner: 'c:friend',
            tags: ['string']
        };
    }
}

const codec = carnaval().codecForClass(Group).onType('c:friend', carnaval().codecForClass(Friend));

codec.encode(new Group({
    owner: new Friend({name: 'Joe', age: 27})},
    tags: ['music', 'culture']
)).then(json => {
    // {
    //   owner: {name: 'Joe', age: 27}}
    //   tags: ['music', 'culture']
    // }
});
```

Sub property can be handled through a custom transform with `onProp`.

```javascript
const codec = carnaval().codecForClass(Friend).onProp('name', {
    decode: value => value ? value.toLowerCase() : undefined,
    encode: value => value ? value.toUpperCase() : undefined
});

codec.decode({name: 'Joe', age: 27}).then(friend => { /* new Friend({name: 'joe', age: 27}) */ });
codec.encode(new Friend({name: 'Joe', age: 27})).then(json => { /* {name: 'JOE', age: 27} */ });
```

### Carnaval

**Middlewares**

Encoding and decoding transforms can be configured through middlewares, with `afterEncode` and `afterDecode`. For example, decoding json may need a validation or an access to a database while encoding an object may add some formatted property.

```javascript
const validate = object => {
    if (object.age < 18)
        throw new Error('must be an adult of full age');
};

const formattedName = json => {
    json.formattedName = json.name ? json.name.toUpperCase() : undefined;
};

const codec = carnaval()
.afterDecode(object => validate(object))
.afterEncode(json => formattedName(json))
.codecForClass(Friend);
```

Middlewares are called **after** transforms. They may return nothing, a value or a `Promise`. If they return a value of the `Promise` of a value, this value will be passed to the next middleware and as a transform's result if this was the last middleware. If they don't return any value, the previous value will be passed to the next middleware and as a transform's result if this was the last middleware.

**Providers**

Helpers can be transmitted to custom encode / decode and to middlewares through `providers`. Once a provider is configured, it is given to every custom `encode`, `decode`, `onType`, `onProp`, `afterEncode` and `afterDecode`.

```javascript
const formattedName = (json, providers) => {
    json.formattedName = providers.upperCase(json.name);
};

const codec = carnaval()
.providers({
    upperCase: value => {
        return value.toUpperCase();
    }
})
.afterEncode(json => formattedName(json))
.codecForClass(Friend);
```

### Domain

A domain class is supplied optionally to inherit from, in order to ease immutability and validation (_both optional_).

```javascript
const Domain = carnaval.Domain;

class Friend extends Domain {
    get props() {
        return {
            name: 'string',
            age: 'number'
        };
    }
    get options() {
        return {
            immutable: true,
            validate: validate
        };
    }
}
```

**Domain immutability**

Using the `immutable` flag as an `options` attribute will froze every instance of the class (_recursively_). Thus, updating one of its attributes will results in a `Cannot assign to read property...`. Immutability improve a stability.

Because updating an immutable object need a new object creation with the one or two attributes changes, a `assign` function is also provided to ease the process. This function is more intended for a class internal usage.

```javascript
class Friend extends Domain {
    birthday() {
        return this.assign({age: this.age + 1})
    }
}

let friend = new Friend({name: 'Joe', age: 27});
friend = friend.birthday();
```

**Domain validation**

A `validate` method can be given as an `options` attributes to validate every class instance before creation. If validation and immutability are configured, validation is done first.

With validation and immutability, an object is always valid, because each of its update is validated (_if validation is done solely with a middleware, it leaves the object updates invalidated_).
