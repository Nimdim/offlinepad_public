import VariableStorage from "./../src/js/variable_storage.js"
import Notepad  from "./../src/js/notepad.js";

import { assert } from "chai";

describe("notepad", function() {
    it("works", function() {
        var notepad = new Notepad(VariableStorage);
        notepad.create();
    })
});
