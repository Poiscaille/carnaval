

const map = (iterable, mapper) => {
    return Promise.all(iterable.map(item => Promise.resolve(mapper(item))));
};

const reduce = (iterable, reducer, memo) => {
    iterable = iterable.slice(0);
    const item = iterable.shift();
    if (!item) {
        return Promise.resolve(memo);
    }
    return Promise.resolve(reducer(memo, item))
    .then(memo => reduce(iterable, reducer, memo));
};

module.exports = {
    map: map,
    reduce: reduce,
    all: Promise.all.bind(Promise),
    resolve: Promise.resolve.bind(Promise)
};
