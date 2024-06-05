const lodash = require('lodash')
const range = (x,y) => {
    console.log('lodash from module-a!!!！！！！')
    return lodash.range(x,y)
}
console.log('log from module-a')
module.exports = {
    range
} 