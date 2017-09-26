
class Domain {
    constructor(data) {
        data = data || {};
        Object.keys(this.props).forEach(prop => {
            const value = data[prop];
            if (value) {
                this[prop] = value;
            }
        });
    }
    get props() {
        return {};
    }
    static match(Clazz) {
        return Clazz.prototype instanceof Domain || Clazz === Domain;
    }
}

module.exports = Domain;
