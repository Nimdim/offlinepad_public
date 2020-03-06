import VariableStorage from "./../src/js/variable_storage.js"
import Notepad  from "./../src/js/notepad.js";

import { assert } from "chai";


describe("notepad", function() {
    let notepad = new Notepad(VariableStorage);
    let tag_id;
    let note_id;
    let events = [];
    notepad.on("reset_tags", function(tags) {
        events.push(["reset_tags", tags]);
    })
    notepad.on("reset_notes", function(notes) {
        events.push(["reset_notes", notes]);
    });

    it("create notepad", function() {
        events.splice(0, events.length);
        notepad.create();
        let EXPECTED = [
            ["reset_tags", []],
            ["reset_notes", []],
        ];
        assert.deepEqual(events, EXPECTED);
    });

    it("create tag", function() {
        events.splice(0, events.length);
        tag_id = notepad.create_tag("test_tag");
        let EXPECTED = [
            ["reset_tags", [{id: tag_id, name: "test_tag", count: 0}]],
        ];
        assert.deepEqual(events, EXPECTED);
    });

    it("edit tag", function() {
        events.splice(0, events.length);
        notepad.edit_tag(tag_id, "test_tag_new");
        let EXPECTED = [
            ["reset_tags", [{id: tag_id, name: "test_tag_new", count: 0}]],
        ];
        assert.deepEqual(events, EXPECTED);
    });

    it("delete tag", function() {
        events.splice(0, events.length);
        notepad.delete_tag(tag_id);
        let EXPECTED = [
            ["reset_notes", []],
            ["reset_tags", []],
        ];
        assert.deepEqual(events, EXPECTED);
    });

    it("create note", function() {
        events.splice(0, events.length);
        note_id = notepad.create_note("test note text", 1111, []);
        let EXPECTED = [
            ["reset_notes", [
                {
                    id: note_id,
                    text: "test note text",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [],
                }
            ]],
            ["reset_tags", []],
        ];
        assert.deepEqual(events, EXPECTED);
    });

    it("edit tag", function() {
        events.splice(0, events.length);
        notepad.edit_note(note_id, "test note new text", []);
        let EXPECTED = [
            ["reset_notes", [
                {
                    id: note_id,
                    text: "test note new text",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [],
                }
            ]],
            ["reset_tags", []],
        ];
        assert.deepEqual(events, EXPECTED);
    });

    it("delete tag", function() {
        events.splice(0, events.length);
        notepad.delete_note(note_id);
        let EXPECTED = [
            ["reset_notes", []],
            ["reset_tags", []],
        ];
        assert.deepEqual(events, EXPECTED);
    });
});
