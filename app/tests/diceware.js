import { assert } from "chai";
import _ from "lodash";

import ru_words from './../src/js/diceware/ru.js';
import en_words from './../src/js/diceware/en.js';

let DICEWARE_DICT_SIZE = 7776;

describe("diceware tests", function() {
    it("ru unique words", async function() {
        let words = _.values(ru_words);
        let unique_words = _.uniq(words);
        assert.equal(unique_words.length, DICEWARE_DICT_SIZE);
    });

    it("en unique words", async function() {
        let words = _.values(en_words);
        let unique_words = _.uniq(words);
        assert.equal(unique_words.length, DICEWARE_DICT_SIZE);
    });
});
