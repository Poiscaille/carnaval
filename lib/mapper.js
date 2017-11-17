
class Mapper {
    _mappingClazz() {}
    static match(Clazz) {
        return Clazz instanceof this;
    }
}

module.exports = Mapper;
