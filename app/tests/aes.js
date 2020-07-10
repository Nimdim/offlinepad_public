import { assert } from "chai";
import _ from "lodash";

import test_data from './../test_data/aes_test_data.js';
import cryptobox from './../src/js/cryptobox.js';

describe("aes tests", function() {
    it("encrypt", async function() {
        for(let k = 0; k < test_data.length; k++) {
            let test_item = test_data[k];
            let aes = cryptobox.create_aes(test_item.key, test_item.src);
            let enc = Array.from(aes.encrypt(test_item.src));
            assert.deepEqual(enc, test_item.enc);
        }
    });

    it("decrypt", async function() {
        for(let k = 0; k < test_data.length; k++) {
            let test_item = test_data[k];
            let aes = cryptobox.create_aes(test_item.key, test_item.src);
            let dec = Array.from(aes.decrypt(test_item.enc));
            assert.deepEqual(dec, test_item.src);
        }
    });
});
