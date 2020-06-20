import { assert } from "chai";
import _ from "lodash";

import ru_words from './../src/js/diceware/ru.js';
import en_words from './../src/js/diceware/en.js';

let DICEWARE_DICT_SIZE = 7776;

let difference = function(source, for_remove) {
    let map = {};
    let result = []
    _.forEach(for_remove, (item) => {map[item] = false});
    _.forEach(source, (item) => {
        if(map[item] == false) {
            map[item] = true;
        } else {
            result.push(item);
        }
    });
    return result;
};

describe("diceware tests", function() {
    it("ru unique words", async function() {
        let words = _.values(ru_words);
        let unique_words = _.uniq(words);
        let repeats = difference(words, unique_words)
        assert.deepEqual(repeats, []);
    });

    it("en unique words", async function() {
        let words = _.values(en_words);
        let unique_words = _.uniq(words);
        let repeats = difference(words, unique_words)
        assert.deepEqual(repeats, []);
    });
});
