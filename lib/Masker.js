class Masker {
    constructor(Clazz) {
        this.Clazz = Clazz;
    }
    with(schema) {
        this.schema = schema;
        return this;
    }
    except(schema) {
        this.schema = this._toAntiSchema(schema);
        return this;
    }
    settle(destination, source) {
        const props = this._props(this.Clazz);
        const untouched = this._settleObject(destination, source, props, this.schema);
        return untouched === undefined ? {} : untouched;
    }
    _settleObject(destination, source, props, layer) {
        const touched = {};
        let untouched = true;

        Object.keys(props).forEach(prop => {
            const settled = this._settleValue(destination, source, prop, props[prop], layer);
            if (settled.hasOwnProperty('value')) {
                destination[prop] = settled.value;
            }
            if (settled.hasOwnProperty('touched')) {
                touched[prop] = settled.touched;
                untouched = false;
            }
        });

        return untouched ? undefined : touched;
    }
    _settleValue(destination, source, prop, Type, layer) {
        destination = destination || {};
        source = source || {};
        layer = layer || {};
        layer = layer.length ? layer[0] : layer;
        if (Array.isArray(Type)) {
            return this._settleArrayValue(destination, source, prop, Type, layer);
        }

        const settled = {};
        if (!destination[prop] && !source[prop]) {
            return settled;
        }

        if (layer && layer[prop] instanceof Masker) {
            const props = this._props(layer[prop].Clazz);
            const schema = layer[prop].schema;
            
            const holder = destination[prop] || {};
            const touched = layer[prop]._settleObject(holder, source[prop], props, schema);
            destination[prop] = new layer[prop].Clazz(holder);

            if (touched) {
                settled.touched = touched;
            }
            return settled;
        }

        switch (Type) {
            case Boolean:
            case String:
            case Number:
                if (this._isLayered(layer, prop)) {
                    settled.value = source[prop];
                } else if (destination[prop] !== source[prop]) {
                    settled.touched = true;
                }
                break;
            case Date:
                if (this._isLayered(layer, prop)) {
                    settled.value = source[prop];
                } else if (new Date(destination[prop]).getTime() !== new Date(source[prop]).getTime()) {
                    settled.touched = true;
                }
                break;
            default:
                if (this._isLayered(layer, prop) && !destination[prop]) {
                    destination[prop] = this._isClass(Type) ? new Type() : {};
                }

                if (this._isClass(Type)) {
                    const props = this._props(Type);
                    const touched = this._settleObject(destination[prop], source[prop], props, this._isLayered(layer, prop));
                    if (touched) {
                        settled.touched = touched;
                    }
                } else {
                    const props = this._literalProps(Type, destination, source, prop);

                    Object.keys(props).forEach(subprop => {
                        const settledItem = this._settleValue(destination[prop], source[prop], subprop, props[subprop], this._isLayered(layer, prop));
                        if (!settled.value) {
                            settled.value = {};
                        }
                        if (settledItem.hasOwnProperty('value')) {
                            settled.value[subprop] = settledItem.value;
                        } else {
                            const subdestination = destination[prop] || {};
                            settled.value[subprop] = subdestination[subprop];
                        }
                        if (settledItem.hasOwnProperty('touched')) {
                            if (!settled.touched) {
                                settled.touched = {};
                            }
                            settled.touched[subprop] = settledItem.touched;
                        }
                    });
                }
        }
        return settled;
    }
    _settleArrayValue(destination, source, prop, Type, layer) {
        destination[prop] = destination[prop] || [];
        const destinationItems = destination[prop];
        const sourceItems = source[prop] || [];

        const isLayered = this._isLayered(layer, prop);
        const length = isLayered ? sourceItems.length : destinationItems.length;

        const settled = {touched: []};
        let untouched = true;

        if (length === 0) {
            settled.value = [];
            if (!isLayered && sourceItems.length !== destinationItems.length) {
                untouched = false;
            }
        }
        for (let index = 0; index < length; index++) {
            const holder = {[prop]: destinationItems[index]};
            const settledItem = this._settleValue(holder, {[prop]: sourceItems[index]}, prop, Type[0], layer);
            destinationItems[index] = holder[prop];

            if (settledItem.hasOwnProperty('value')) {
                if (!settled.value) {
                    settled.value = [];
                }
                settled.value.push(settledItem.value);
            }
            if (settledItem.hasOwnProperty('touched')) {
                settled.touched.push(settledItem.touched);
                untouched = false;
            } else {
                settled.touched.push(false);
            }
        }
        if (untouched) {
            delete settled.touched;
        }

        return settled;
    }
    _isLayered(layer, prop) {
        return layer === true || layer[prop];
    }
    _isClass(object) {
        return ![Object, Boolean, String, Number, Date].includes(object) && !!object.prototype && !!object.prototype.constructor.name;
    }
    _props(Type) {
        return Type.prototype.props || {};
    }
    _isNotLiteral(object) {
        return object !== Object;
    }
    _literalProps(Type, destination, source, prop) {
        if (Type !== Object) {
            return Type;
        }
        
        const props = new Set();
        if (destination && destination[prop]) {
            Object.keys(destination[prop]).forEach(prop => props.add(prop));
        }
        if (source && source[prop]) {
            Object.keys(source[prop]).forEach(prop => props.add(prop));
        }
        return Array.from(props.keys()).reduce((memo, key) => {
            memo[key] = String; // String has no particular meaning, key will be handled as primitive (deep types not supported)
            return memo;
        }, {});
    }
    _toAntiSchema(schema) {
        const props = this.Clazz.prototype.props;
        const cover = this._toAntiObjectSchema(schema, props);
        return cover === undefined ? {} : cover;
    }
    _toAntiObjectSchema(schema, props) {
        schema = schema || {};

        const cover = {};
        let untouched = true;
        Object.keys(props).forEach(prop => {
            const Type = props[prop];
            switch (Type) {
                case Object:
                case Boolean:
                case String:
                case Number:
                case Date:
                    if (schema[prop] !== false) {
                        cover[prop] = true;
                        untouched = false;
                    }
                    break;
                default:
                    let subprops = Type;
                    if (this._isClass(Type)) {
                        subprops = props[prop].prototype.props;
                    }
                    cover[prop] = this._toAntiObjectSchema(schema[prop], subprops);
                    untouched = false;
            }
        });

        return untouched ? undefined : cover;
    }
}

module.exports = Masker;
