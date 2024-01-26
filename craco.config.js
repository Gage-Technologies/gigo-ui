const million = require('million/compiler');

const options = {
    auto: {
        threshold: 0.05, // default: 0.1,
        skip: [] // default []
    }
}

module.exports = {
    webpack: {
        plugins: { 
            add: [
                million.webpack({ auto: true }, options)
            ] 
        }
    }
};