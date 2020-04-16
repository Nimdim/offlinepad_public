import VariableStorage from "./../src/js/variable_storage.js"
import Notepad  from "./../src/js/notepad.js";

import { assert } from "chai";


describe("notepad simple tests", function() {
    let notepad = new Notepad(new VariableStorage());
    let tag_id;
    let note_id;
    let tags_events = [];
    let notes_events = [];
    let working_events = [];
    notepad.on("reset_tags", function(tags) {
        tags_events.push(tags);
    })
    notepad.on("reset_notes", function(notes) {
        notes_events.push(notes);
    });
    notepad.on("working", function(working) {
        working_events.push(working);
    });
    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
        working_events.splice(0, working_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    }

    it("create notepad", function() {
        reset_events();
        let create_result = notepad.create();
        assert.equal(create_result, true);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        let EXPECTED_WORKING = [true];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("second create notepad must fail", function() {
        reset_events();
        let create_result = notepad.create();
        assert.equal(create_result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        let EXPECTED_WORKING = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
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
        notepad.edit_note(note_id, "test note new text", 1111, []);
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

    it("close notepad", function() {
        reset_events();
        let close_result = notepad.close();
        assert.equal(close_result, true);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        let EXPECTED_WORKING = [false];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("second close notepad must fail", function() {
        reset_events();
        let close_result = notepad.close();
        assert.equal(close_result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        let EXPECTED_WORKING = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });
});

describe("notepad import export", function() {
    let IMPORT_DATA = {
        "1": {
            "type":"notepad",
            "name":"Дневник"
        },
        "2": {
            "type":"tag",
            "name":"один"
        },
        "3": {
            "type":"tag",
            "name":"два"
        },
        "13": {
            "type":"note",
            "text":"Запись без меток",
            "created_at":1586634372651
        },
        "16": {
            "type":"note",
            "text":"Запись с метками \"один\" и \"два\"",
            "created_at":1586634372656
        },
        "17": {
            "type":"tag_note",
            "tag_id":"2",
            "note_id":"16"
        },
        "18": {
            "type":"tag_note",
            "tag_id":"3",
            "note_id":"16"
        },
        "19": {
            "type":"note",
            "text":"Запись с меткой \"один\"",
            "created_at":1586634372660
        },
        "20": {
            "type":"tag_note",
            "tag_id":"2",
            "note_id":"19"
        }
    };

    let notepad = new Notepad(new VariableStorage());
    let tag_id;
    let note_id;
    let tags_events = [];
    let notes_events = [];
    let working_events = [];
    notepad.on("reset_tags", function(tags) {
        tags_events.push(tags);
    })
    notepad.on("reset_notes", function(notes) {
        notes_events.push(notes);
    });
    notepad.on("working", function(working) {
        working_events.push(working);
    });
    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
        working_events.splice(0, working_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    }

    it("import notepad", function() {
        reset_events();
        let result = notepad.import(IMPORT_DATA);
        assert.equal(result, true);
        let EXPECTED_TAGS = [
            [
                {
                    "count": 1,
                    "id": "3",
                    "name": "два",
                },
                {
                    "count": 2,
                    "id": "2",
                    "name": "один",
                },
            ],
        ];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372660,
                    "id": "19",
                    "tags": [
                        "2",
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": "16",
                    "tags": [
                        "3",
                        "2",
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372651,
                    "id": "13",
                    "tags": [],
                    "text": "Запись без меток",
                    "text_highlighted": undefined,
                },
            ]
        ];
        let EXPECTED_WORKING = [true];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("second import notepad must fail", function() {
        reset_events();
        let result = notepad.import(IMPORT_DATA);
        assert.equal(result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        let EXPECTED_WORKING = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("export notepad", function() {
        reset_events();
        let exported_data = notepad.export();
        assert.deepEqual(exported_data, IMPORT_DATA);
    });

    it("close notepad", function() {
        reset_events();
        let close_result = notepad.close();
        assert.equal(close_result, true);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        let EXPECTED_WORKING = [false];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("second close notepad must fail", function() {
        reset_events();
        let close_result = notepad.close();
        assert.equal(close_result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        let EXPECTED_WORKING = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
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
        notepad.edit_note(note_id1, "note text1", 1111, [tag_id1, tag_id2, tag_id3]);

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
        notepad.edit_note(note_id1, "note text1", 1111, [tag_id1, tag_id3]);

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

describe("notepad parse initial data", function() {
     it("parse empty storage", function() {
        let storage = new VariableStorage();
        let notepad = new Notepad(storage);
        let working = false;
        notepad.on("working", function(value) {
            working = value;
        });
        notepad.sync();
        assert.equal(working, false);
    });

    it("parse storage with one notepad", function() {
        let storage = new VariableStorage();
        storage.create({
            "type": "notepad",
            "name": "123",
        });
        let notepad = new Notepad(storage);
        let working = false;
        notepad.on("working", function(value) {
            working = value;
        });
        notepad.sync();
        assert.equal(working, true);
    });

    it("parse storage with two notepads", function() {
        let storage = new VariableStorage();
        storage.create({
            "type": "notepad",
            "name": "123",
        });
        storage.create({
            "type": "notepad",
            "name": "1234",
        });
        let notepad = new Notepad(storage);
        assert.throws(function() { notepad.sync(); }, Error);
    });
});

describe("notepad filtering and sorting", function() {
    let IMPORT_DATA = {
        "1": {
            "type":"notepad",
            "name":"Дневник"
        },
        "2": {
            "type":"tag",
            "name":"один"
        },
        "3": {
            "type":"tag",
            "name":"два"
        },
        "13": {
            "type":"note",
            "text":"Запись без меток",
            "created_at":1586634372651
        },
        "16": {
            "type":"note",
            "text":"Запись с метками \"один\" и \"два\"",
            "created_at":1586634372656
        },
        "17": {
            "type":"tag_note",
            "tag_id":"2",
            "note_id":"16"
        },
        "18": {
            "type":"tag_note",
            "tag_id":"3",
            "note_id":"16"
        },
        "19": {
            "type":"note",
            "text":"Запись с меткой \"один\"",
            "created_at":1586634372660
        },
        "20": {
            "type":"tag_note",
            "tag_id":"2",
            "note_id":"19"
        },
        "21": {
            "type":"tag",
            "name":"одинцово"
        },
    };

    let notepad = new Notepad(new VariableStorage());
    let tag_id;
    let note_id;
    let tags_events = [];
    let notes_events = [];
    let working_events = [];
    notepad.on("reset_tags", function(tags) {
        tags_events.push(tags);
    })
    notepad.on("reset_notes", function(notes) {
        notes_events.push(notes);
    });
    notepad.on("working", function(working) {
        working_events.push(working);
    });
    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
        working_events.splice(0, working_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    };
    notepad.import(IMPORT_DATA);

    it("sort notes desc", function() {
        reset_events();
        notepad.set_notes_filter({"sorting_asc": false});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372660,
                    "id": "19",
                    "tags": [
                        "2",
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": "16",
                    "tags": [
                        "3",
                        "2",
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372651,
                    "id": "13",
                    "tags": [],
                    "text": "Запись без меток",
                    "text_highlighted": undefined,
                },
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("sort notes asc", function() {
        reset_events();
        notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372651,
                    "id": "13",
                    "tags": [],
                    "text": "Запись без меток",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": "16",
                    "tags": [
                        "3",
                        "2",
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372660,
                    "id": "19",
                    "tags": [
                        "2",
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("sort tags desc", function() {
        reset_events();
        notepad.set_tags_filter({"sorting_asc": false});
        let EXPECTED_TAGS = [
            [
                {
                    "id": "21",
                    "count": 0,
                    "name":"одинцово"
                },
                {
                    "count": 2,
                    "id": "2",
                    "name": "один",
                },
                {
                    "count": 1,
                    "id": "3",
                    "name": "два",
                },
            ],
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("sort tags asc", function() {
        reset_events();
        notepad.set_tags_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [
            [
                {
                    "count": 1,
                    "id": "3",
                    "name": "два",
                },
                {
                    "count": 2,
                    "id": "2",
                    "name": "один",
                },
                {
                    "id": "21",
                    "count": 0,
                    "name":"одинцово"
                },
            ],
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by text desc", function() {
        reset_events();
        notepad.set_notes_filter({"sorting_asc": false, "text": "один"});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372660,
                    "id": "19",
                    "tags": [
                        "2",
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": "16",
                    "tags": [
                        "3",
                        "2",
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by text asc", function() {
        reset_events();
        notepad.set_notes_filter({"sorting_asc": true, "text": "один"});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372656,
                    "id": "16",
                    "tags": [
                        "3",
                        "2",
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372660,
                    "id": "19",
                    "tags": [
                        "2",
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by not attached tag desc", function() {
        reset_events();
        notepad.set_notes_filter({"sorting_asc": false, "tags": ["2"]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372660,
                    "id": "19",
                    "tags": [
                        "2",
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": "16",
                    "tags": [
                        "3",
                        "2",
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by not attached tag asc", function() {
        reset_events();
        notepad.set_notes_filter({"sorting_asc": true, "tags": ["2"]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372656,
                    "id": "16",
                    "tags": [
                        "3",
                        "2",
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372660,
                    "id": "19",
                    "tags": [
                        "2",
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter tags by name desc", function() {
        reset_events();
        notepad.set_tags_filter({"sorting_asc": false, "name": "один"});
        let EXPECTED_TAGS = [
            [
                {
                    "count": 0,
                    "id": "21",
                    "name": "одинцово",
                },
                {
                    "count": 2,
                    "id": "2",
                    "name": "один",
                },
            ],
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter tags by name asc", function() {
        reset_events();
        notepad.set_tags_filter({"sorting_asc": true, "name": "один"});
        let EXPECTED_TAGS = [
            [
                {
                    "count": 2,
                    "id": "2",
                    "name": "один",
                },
                {
                    "count": 0,
                    "id": "21",
                    "name": "одинцово",
                },
            ],
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by not attached tag desc", function() {
        reset_events();
        notepad.set_notes_filter({"sorting_asc": false, "tags": ["21"]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by not attached tag asc", function() {
        reset_events();
        notepad.set_notes_filter({"sorting_asc": true, "tags": ["21"]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });
});

describe("notepad pagination", function() {
    let IMPORT_DATA_ZERO = {
        "1": {
            "type":"notepad",
            "name":"Дневник"
        },
    };

    let IMPORT_DATA_ONE_PAGE = {
        "1": {
            "type":"notepad",
            "name":"Дневник"
        },
    };
    for(let k = 0; k < 20; k++) {
        let id = (k + 2).toString();
        IMPORT_DATA_ONE_PAGE[id] = {
            "type":"note",
            "text":"Запись " + k,
            "created_at": 1586634372660 + k,
        };
    }

    let IMPORT_DATA_TWO_PAGES = {
        "1": {
            "type":"notepad",
            "name":"Дневник"
        },
    };
    for(let k = 0; k < 60; k++) {
        let id = (k + 2).toString();
        IMPORT_DATA_TWO_PAGES[id] = {
            "type":"note",
            "text":"Запись " + k,
            "created_at": 1586634372660 + k,
        };
    }

    let notepad = new Notepad(new VariableStorage());
    let tag_id;
    let note_id;
    let tags_events = [];
    let notes_events = [];
    let working_events = [];
    let append_events = []
    notepad.on("reset_tags", function(tags) {
        tags_events.push(tags);
    })
    notepad.on("reset_notes", function(notes) {
        notes_events.push(notes);
    });
    notepad.on("working", function(working) {
        working_events.push(working);
    });
    notepad.on("append_notes", function(notes) {
        append_events.push(notes);
    });
    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
        working_events.splice(0, working_events.length);
        append_events.splice(0, working_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    };

    it("no records initial", function() {
        notepad.close();
        notepad.import(IMPORT_DATA_ZERO);
        reset_events();
        notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let notes = [];
        let EXPECTED_NOTES = [notes];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        notepad.load_next_notes();
        assert.deepEqual(append_events, []);
    });

    it("records less than one page initial", function() {
        notepad.close();
        notepad.import(IMPORT_DATA_ONE_PAGE);
        reset_events();
        notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let notes = [];
        for(let k = 0; k < 20; k++) {
            let id = (k + 2).toString();
            notes.push({
                "id": id,
                "tags": [],
                "text_highlighted": undefined,
                "text":"Запись " + k,
                "creation_time": 1586634372660 + k,    
            });
        }
        let EXPECTED_NOTES = [notes];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        notepad.load_next_notes();
        assert.deepEqual(append_events, []);
    });

    it("records less than two pages", function() {
        notepad.close();
        notepad.import(IMPORT_DATA_TWO_PAGES);
        reset_events();
        notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let notes = [];
        for(let k = 0; k < 40; k++) {
            let id = (k + 2).toString();
            notes.push({
                "id": id,
                "tags": [],
                "text_highlighted": undefined,
                "text":"Запись " + k,
                "creation_time": 1586634372660 + k,    
            });
        }
        let EXPECTED_NOTES = [notes];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        notepad.load_next_notes();
        notes = [];
        for(let k = 40; k < 60; k++) {
            let id = (k + 2).toString();
            notes.push({
                "id": id,
                "tags": [],
                "text_highlighted": undefined,
                "text":"Запись " + k,
                "creation_time": 1586634372660 + k,    
            });
        }
        assert.deepEqual(append_events, [notes]);
    });
});

