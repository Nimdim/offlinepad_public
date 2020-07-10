import { assert } from "chai";
import _ from "lodash";


import test_data from './../test_data/pbkdf2_test_data.js';
import pbkdf2 from 'pbkdf2';

describe("pbkdf2 tests", function() {
    it("run", async function() {
        this.timeout(60000);
        for(let k = 0; k < test_data.length; k++) {
            let test_item = test_data[k];
            let result = Array.from(pbkdf2.pbkdf2Sync(
                Uint8Array.from(test_item.src),
                Uint8Array.from(test_item.salt),
                10000, 32, 'sha256'
            ));
            assert.deepEqual(result, test_item.result);
        }
    });
});
