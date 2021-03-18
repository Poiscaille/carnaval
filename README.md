# Carnaval

Minimalist, zero dependency, encoding / decoding class ↔ json for [node](https://nodejs.org).

```javascript
class Friend {
    constructor(data) {
        Object.assign(this, data);
    }
    get props() {
        return {
            name: String,
            age: Number
        };
    }
}

const Mapping = require('carnaval').Mapping;
const mapping = Mapping.map(Friend);

mapping.decode({name: 'Joe', age: 27}).then(friend => { .. });
mapping.encode(new Friend({name: 'Joe', age: 27})).then(json => { .. });
```

## Installation

This is a [node](https://nodejs.org) module available through the [npm registry](https://www.npmjs.com/).
Before installing, [download and install Node.js](https://nodejs.org/en/download/) 6.0.0 or higher.

```
$ npm install carnaval
```

## Features

* Encode & decode objects with a constructor / class
* Handle deep objects and arrays
* Configurable through middlewares & providers
* Options to mask / merge instances for update scenarios
* Provide a domain class to inherit from

## Usage

**Props**

To properly encode / decode / mask a class, this class should list its attributes through a `props` literal. One key per attribute (_ex. `name`_), one value for this attribute type (_ex. `String`_). Types should be `function` / `constructor`, their names are relevant for deep encoding / decoding.

### Mapping

A mapping defines the way a json literal will be mapped to a class object (_with `decode`_) or mapped from it (_with `encode`_). In both cases, this returns a `Promise`. By default, every class' `props` will be duplicated (_deep copy_).

```javascript
const mapping = Mapping.map(Friend);

mapping.decode({name: 'Joe', age: 27}).then(friend => { /* new Friend({name: 'Joe', age: 27}) */ });
mapping.encode(new Friend({name: 'Joe', age: 27})).then(json => { /* {name: 'Joe', age: 27} */ });
```

A mapping can hide some `props` of its target class on encode, decode, or both.

```javascript
const mapping = Mapping.map(Friend).with({
    size: {set: false}
});

mapping.decode({name: 'Joe', age: 27}).then(friend => { /* new Friend({name: 'Joe'}) */ });
```

```javascript
const mapping = Mapping.map(Friend).with({
    size: {get: false}
});

mapping.encode(new Friend({name: 'Joe', age: 27})).then(json => { /* {name: 'Joe'} */ });
```

A mapping can transform some `props`.

```javascript
const mapping = Mapping.map(Friend).with({
    name: {
        set: value => value && value.trim(),
        get: value => value && value.toUpperCase()
    }
});

mapping.decode({name: ' Joe '}).then(friend => { /* new Friend({name: 'Joe'}) */ });
mapping.encode(new Friend({name: 'Joe'})).then(friend => { /* {name: 'JOE'} */ });
```

**Renaming properties**

A mapping can rename some `props` of its target class.

```javascript
const mapping = Mapping.map(Friend).with({
    name: {alias: 'firstName'}
});

mapping.decode({firstName: 'Joe', age: 27}).then(friend => { /* new Friend({name: 'Joe'}) */ });
mapping.encode(new Friend({name: 'Joe', age: 27})).then(json => { /* {firstName: 'Joe'} */ });
```

**Deep properties and arrays**

Sub objects are handled automatically (as literal or as class instance). Array types are handled though a type in brackets (_ex. `[String]`_).

```javascript
class Group {
    constructor(data) {
        Object.assign(this, data);
    }
    get props() {
        return {
            rights: {public: Boolean},
            owner: Friend,
            tags: [String]
        };
    }
}

const mapping = Mapping.map(Group);

mapping.decode({
    rights: {public: true},
    owner: {name: 'Joe', age: 27}}
    tags: ['music', 'culture']
)).then(group => {
    // new Group({
    //     rights: {public: true},
    //     owner: new Friend({name: 'Joe', age: 27}),
    //     tags: ['music', 'culture']
    // }
});
```

Sub properties can also be transformed.

```javascript
const mapping = Mapping.map(Group).with({
    owner: {
        name: {
            set: value => value && value.toUpperCase()
        }
    },
    tags: {
        get: value => value && value.toUpperCase()
    }
});

mapping.decode({owner: {name: 'Joe'}, tags: ['music']).then(owner => { /* new Group({owner: new Friend({name: 'JOE'}), tags: ['music']})) */ });
mapping.encode(new Group({owner: new Friend({name: 'Joe'}, tags: ['music'])).then(json => { /* {owner: {name: 'Joe'}, tags: ['MUSIC']} */ });
```

**Middlewares**

Encoding and decoding transforms can be supplemented by middlewares `beforeEncode`, `beforeDecode`, `afterEncode` and `afterDecode`. For example, decoding json may need a validation or a query to a database while encoding an object to json may add some formatted property.

```javascript
const validate = object => {
    if (object.age < 18)
        throw new Error('must be an adult of full age');
};

const formattedName = json => {
    json.formattedName = json.name && json.name.toUpperCase();
};

const mapping = Mapping.map(Friend)
.afterDecode(object => validate(object))
.afterEncode(json => formattedName(json));
```

Middlewares are available **before** and **after** transforms. Before, they work on copies. After, they work on the proper result. 

They may return nothing, a value or a `Promise`. If they return a value of the `Promise` of a value, this value will be passed to the next middleware and as a transform's result if this was the last middleware. If they don't return any value, the previous value will be passed to the next middleware and as a transform's result if this was the last middleware.

**Providers**

Helpers can be transmitted to custom get / set and to middlewares through `providers`. Once a provider is configured, it is given to every custom `beforeEncode`, `beforeDecode`, `afterEncode`, `afterDecode`, `get`, and `set`.

```javascript
const mapping = Mapping.map(Friend)
.providers({
    upperCase: value => value.toUpperCase()
})
.afterEncode((json, providers) => {
    json.formattedName = providers.upperCase(json.name)
});
```

**Defaults**

Defaults permissions can be configured to avoid repetition. All `props` are readen and writen if not stated otherwise. Valid flags are `'rw'`, `'r-'`,`'-w'` and `'--'`.

```javascript
const mapping = Mapping.map(Friend)
.defaults({
    permissions: 'r-'
});

mapping.decode({name: 'Joe', age: 27}).then(friend => { /* new Friend({name: 'Joe'}) */ });
```

**Casting to primitive**

By default, String, Number, Boolean and Date are parsed. This can be turned off through `normalize`.

```javascript
const mapping = Mapping.map(Friend);
const mappingNotCasted = Mapping.map(Friend).normalize(false);

mapping.decode({age: '27'}).then(friend => { /* new Friend({age: 27}) */ });
mappingNotCasted.decode({age: '27'}).then(friend => { /* new Friend({age: '27'}) */ });
```

### Mask

Used after mapping json to class, masks ease update scenarios. A mask defines the way an instance can be overriden by another one (of the same type) according to a 'readonly' schema (thus erasing on the new instance the attributes from the original that should not be changed).

```javascript
const mask = Mask.cover(Friend).with({age: true})
const touched = mask.settle(new Friend({name: 'Joe', age: 27}), new Friend({name: 'Jack', age: 33})); /* settle(dest, source) */

friend; /* {name: 'Joe', age: 33} */
touched; /* {name: true} */

const mask = Mask.cover(Friend).except({age: true})
const touched = mask.settle(new Friend({name: 'Joe', age: 27}), new Friend({name: 'Jack', age: 33})); /* settle(dest, source) */

friend; /* {name: 'Jack', age: 27} */
touched; /* {age: true} */
```

A `touched` literal is returned a list of the updated attributes.

### Domain

A domain class is supplied optionally to inherit from, in order to ease `props` definition and creation (its constructor copy only defined props in the instance attributes on `new`).

```javascript
const Domain = carnaval.Domain;

class Friend extends Domain {
    get props() {
        return {
            name: String,
            age: Number
        };
    }
}
```

**Domain validation**

A `rules` attributes can be used to define a validation schema. A custom validate implentation can then handle all the checks. An [ajv implentation](./test/extras/validator-ajv.js) is providen as an example.

```javascript
class Friend extends Domain {
    get props() {
        return {
            name: String,
            age: Number
        };
    }
    get rules() {
        return {
            name: {required: true}
        }
    }
}

const mapping = Mapping.map(Friend).afterDecode(object => validate(object));
mapping.decode({}) // depending on validate, this will throw an error
```