import VariableStorage from "./../src/js/variable_storage.js"
import Notepad  from "./../src/js/notepad.js";

import { assert } from "chai";


describe("notepad simle tests", function() {
    let notepad = new Notepad(new VariableStorage());
    let tag_id;
    let note_id;
    let tags_events = [];
    let notes_events = [];
    notepad.on("reset_tags", function(tags) {
        tags_events.push(tags);
    })
    notepad.on("reset_notes", function(notes) {
        notes_events.push(notes);
    });
    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    }

    it("create notepad", function() {
        reset_events();
        notepad.create();
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("create tag", function() {
        reset_events();
        tag_id = notepad.create_tag("test_tag");
        let EXPECTED_TAGS = [
            [{id: tag_id, name: "test_tag", count: 0}],
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("edit tag", function() {
        reset_events();
        notepad.edit_tag(tag_id, "test_tag_new");
        let EXPECTED_TAGS = [
            [{id: tag_id, name: "test_tag_new", count: 0}],
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("delete tag", function() {
        reset_events();
        notepad.delete_tag(tag_id);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("create note", function() {
        reset_events()
        note_id = notepad.create_note("test note text", 1111, []);
        let EXPECTED_NOTES = [
            [
                {
                    id: note_id,
                    text: "test note text",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [],
                }
            ],
        ];
        let EXPECTED_TAGS = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("edit tag", function() {
        reset_events()
        notepad.edit_note(note_id, "test note new text", []);
        let EXPECTED_NOTES = [
            [
                {
                    id: note_id,
                    text: "test note new text",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [],
                }
            ],
        ];
        let EXPECTED_TAGS = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("delete tag", function() {
        reset_events()
        notepad.delete_note(note_id);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });
});

describe("notepad tags and notes", function() {
    let notepad = new Notepad(new VariableStorage());
    let tag_id1, tag_id2, tag_id3;
    let note_id1, note_id2;
    let tags_events = [];
    let notes_events = [];
    notepad.on("reset_tags", function(tags) {
        tags_events.push(tags);
    })
    notepad.on("reset_notes", function(notes) {
        notes_events.push(notes);
    });
    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    }
    notepad.create();

    it("create three tags", function() {
        reset_events();
        tag_id1 = notepad.create_tag("tag text1");
        tag_id2 = notepad.create_tag("tag text2");
        tag_id3 = notepad.create_tag("tag text3");

        let EXPECTED_TAGS = [
            [
                {id: tag_id1, name: "tag text1", count: 0},
            ],
            [
                {id: tag_id1, name: "tag text1", count: 0},
                {id: tag_id2, name: "tag text2", count: 0},
            ],
            [
                {id: tag_id1, name: "tag text1", count: 0},
                {id: tag_id2, name: "tag text2", count: 0},
                {id: tag_id3, name: "tag text3", count: 0},
            ]
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("create note with two tags", function() {
        reset_events();
        note_id1 = notepad.create_note("note text1", 1111, [tag_id1, tag_id2]);

        let EXPECTED_TAGS = [
            [
                {id: tag_id1, name: "tag text1", count: 1},
                {id: tag_id2, name: "tag text2", count: 1},
                {id: tag_id3, name: "tag text3", count: 0},
            ]
        ];
        let EXPECTED_NOTES = [
            [
                {
                    id: note_id1,
                    text: "note text1",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [tag_id1, tag_id2]}
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("add tag to note", function() {
        reset_events();
        notepad.edit_note(note_id1, "note text1", [tag_id1, tag_id2, tag_id3]);

        let EXPECTED_TAGS = [
            [
                {id: tag_id1, name: "tag text1", count: 1},
                {id: tag_id2, name: "tag text2", count: 1},
                {id: tag_id3, name: "tag text3", count: 1},
            ]
        ];
        let EXPECTED_NOTES = [
            [
                {
                    id: note_id1,
                    text: "note text1",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [tag_id1, tag_id2, tag_id3]}
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("delete tag from note", function() {
        reset_events();
        notepad.edit_note(note_id1, "note text1", [tag_id1, tag_id3]);

        let EXPECTED_TAGS = [
            [
                {id: tag_id1, name: "tag text1", count: 1},
                {id: tag_id2, name: "tag text2", count: 0},
                {id: tag_id3, name: "tag text3", count: 1},
            ]
        ];
        let EXPECTED_NOTES = [
            [
                {
                    id: note_id1,
                    text: "note text1",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [tag_id1, tag_id3]
                }
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("delete note with tags", function() {
        reset_events();
        notepad.delete_note(note_id1);

        let EXPECTED_TAGS = [
            [
                {id: tag_id1, name: "tag text1", count: 0},
                {id: tag_id2, name: "tag text2", count: 0},
                {id: tag_id3, name: "tag text3", count: 0},
            ]
        ];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("create two notes with tags", function() {
        reset_events();
        note_id1 = notepad.create_note("note text1", 1111, [tag_id1, tag_id2]);
        note_id2 = notepad.create_note("note text2", 1112, [tag_id2, tag_id3]);

        let EXPECTED_TAGS = [
            [
                {id: tag_id1, name: "tag text1", count: 1},
                {id: tag_id2, name: "tag text2", count: 1},
                {id: tag_id3, name: "tag text3", count: 0},
            ],
            [
                {id: tag_id1, name: "tag text1", count: 1},
                {id: tag_id2, name: "tag text2", count: 2},
                {id: tag_id3, name: "tag text3", count: 1},
            ]
        ];
        let EXPECTED_NOTES = [
            [
                {
                    id: note_id1,
                    text: "note text1",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [tag_id1, tag_id2]
                },
            ],
            [
                {
                    id: note_id2,
                    text: "note text2",
                    text_highlighted: undefined,
                    creation_time: 1112,
                    tags: [tag_id2, tag_id3]
                },
                {
                    id: note_id1,
                    text: "note text1",
                    text_highlighted: undefined,
                    creation_time: 1111,
                    tags: [tag_id1, tag_id2]
                },
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });
});
