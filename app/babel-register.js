require("fake-indexeddb/auto");
const register = require('@babel/register').default;

register({
    ignore: [],
    extensions: ['.js']
});
