import VariableStorage from "./../src/js/variable_storage.js";

import { assert } from "chai";

describe("simple tests", function() {
    let storage = new VariableStorage();
    let id;

    it("test create", function() {
        id = storage.create({"key": "value"});
        let value = storage.get(id);
        let EXPECTED = {"id": id, "key": "value"};
        assert.deepEqual(value, EXPECTED);
    });

    it("test edit", function() {
        let value = {"id": id, "a": 1}
        value = storage.set(id, value);
        let EXPECTED = true;
        assert.deepEqual(value, EXPECTED);
    });
});
