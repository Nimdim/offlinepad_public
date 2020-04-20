import Notepad  from "./../src/js/notepad.js";

import { assert } from "chai";
import _ from "lodash";

let map_tag = function(tag, maps) {
    tag.id = maps.tags[tag.id];
};

let map_tags = function(tags, maps) {
    _.forEach(tags, (item) => map_tag(item, maps));
};

let map_note = function(note, maps) {
    note.id = maps.notes[note.id];
    for(let k = 0; k < note.tags.length; k++) {
        note.tags[k] = maps.tags[note.tags[k]];
    }
};

let map_notes = function(notes, maps) {
    _.forEach(notes, (item) => map_note(item, maps));
};


describe("notepad simple tests", function() {
    let notepad;
    let tag_id;
    let note_id;
    let tags_events = [];
    let notes_events = [];
    let working_events = [];
    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
        working_events.splice(0, working_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    }

    it("init", async function() {
        notepad = new Notepad();
        await notepad.init();

        notepad.on("reset_tags", function(tags) {
            tags_events.push(tags);
        })
        notepad.on("reset_notes", function(notes) {
            notes_events.push(notes);
        });
        notepad.on("working", function(working) {
            working_events.push(working);
        });        
    });

    it("create notepad", async function() {
        reset_events();
        let create_result = await notepad.create();
        assert.equal(create_result, true);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        let EXPECTED_WORKING = [true];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("second create notepad must fail", async function() {
        reset_events();
        let create_result = await notepad.create();
        assert.equal(create_result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        let EXPECTED_WORKING = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("create tag", async function() {
        reset_events();
        tag_id = await notepad.create_tag("test_tag");
        let EXPECTED_TAGS = [
            [{id: tag_id, name: "test_tag", count: 0}],
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("edit tag", async function() {
        reset_events();
        await notepad.edit_tag(tag_id, "test_tag_new");
        let EXPECTED_TAGS = [
            [{id: tag_id, name: "test_tag_new", count: 0}],
        ];
        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("delete tag", async function() {
        reset_events();
        await notepad.delete_tag(tag_id);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("create note", async function() {
        reset_events()
        note_id = await notepad.create_note("test note text", 1111, []);
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

    it("edit tag",async  function() {
        reset_events()
        await notepad.edit_note(note_id, "test note new text", 1111, []);
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

    it("delete tag", async function() {
        reset_events()
        await notepad.delete_note(note_id);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("close notepad", async function() {
        reset_events();
        let close_result = await notepad.close();
        assert.equal(close_result, true);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        let EXPECTED_WORKING = [false];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("second close notepad must fail", async function() {
        reset_events();
        let close_result = await notepad.close();
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
        1: {
            "type":"notepad",
            "name":"Дневник"
        },
        2: {
            "type":"tag",
            "name":"один",
            "notepad_id": 1,
        },
        3: {
            "type":"tag",
            "name":"два",
            "notepad_id": 1,
        },
        13: {
            "type":"note",
            "text":"Запись без меток",
            "created_at":1586634372651,
            "notepad_id": 1,
        },
        16: {
            "type":"note",
            "text":"Запись с метками \"один\" и \"два\"",
            "created_at":1586634372656,
            "notepad_id": 1,
        },
        17: {
            "type":"tag_note",
            "tag_id": 2,
            "note_id": 16,
            "notepad_id": 1,
        },
        18: {
            "type":"tag_note",
            "tag_id": 3,
            "note_id": 16,
            "notepad_id": 1,
        },
        19: {
            "type":"note",
            "text":"Запись с меткой \"один\"",
            "created_at":1586634372660,
            "notepad_id": 1,
        },
        20: {
            "type":"tag_note",
            "tag_id": 2,
            "note_id": 19,
            "notepad_id": 1,
        }
    };

    let notepad;
    let tags_events = [];
    let notes_events = [];
    let working_events = [];
    let maps;

    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
        working_events.splice(0, working_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    };

    let map_import_data = function(import_data, maps) {
        let sorted = {
            "notepad": null,
            "tags": {},
            "notes": {},
            "tag_notes": {},
            "note_filters": {},
        }
        // let result = [];
        let keys = _.keys(import_data);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let object = _.cloneDeep(import_data[key]);
            let type = object.type;
            switch(type) {
                case "notepad":
                    sorted.notepad = object;
                    break;
                case "tag":
                    object.notepad_id = maps.notepad;
                    sorted.tags[maps.tags[key]] = object;
                    break;
                case "note":
                    object.notepad_id = maps.notepad;
                    sorted.notes[maps.notes[key]] = object;
                    break;
                case "tag_note":
                    object.notepad_id = maps.notepad;
                    object.tag_id = maps.tags[object.tag_id];
                    object.note_id = maps.notes[object.note_id];
                    sorted.tag_notes[maps.tag_notes[key]] = object;
                    break;
                case "note_filter":
                    throw new Error("not implemented");
                    break;
                default:
                    throw new Error("unknown type " + type);
                    break;
            }
        }
        return sorted;
    };

    let map_exported_data = function(export_data) {
        let sorted = {
            "notepad": null,
            "tags": {},
            "notes": {},
            "tag_notes": {},
            "note_filters": {},
        }
        for(let k = 0; k < export_data.length; k++) {
            let object = _.cloneDeep(export_data[k]);
            let key = object.id;
            let type = object.type;
            delete object.id;
            switch(type) {
                case "notepad":
                    sorted.notepad = object;
                    break;
                case "tag":
                    sorted.tags[key] = object;
                    break;
                case "note":
                    sorted.notes[key] = object;
                    break;
                case "tag_note":
                    sorted.tag_notes[key] = object;
                    break;
                case "note_filter":
                    throw new Error("not implemented");
                    break;
                default:
                    throw new Error("unknown type " + type);
                    break;
            }
        }
        return sorted;
    };

    it("init", async function() {
        notepad = new Notepad();
        await notepad.init();    
        notepad.on("reset_tags", function(tags) {
            tags_events.push(tags);
        })
        notepad.on("reset_notes", function(notes) {
            notes_events.push(notes);
        });
        notepad.on("working", function(working) {
            working_events.push(working);
        });
    });

    it("import notepad", async function() {
        reset_events();
        maps = await notepad.import(IMPORT_DATA);
        assert.notEqual(maps, false);
       
        let EXPECTED_TAGS = [
            [
                {
                    "count": 1,
                    "id": 3,
                    "name": "два",
                },
                {
                    "count": 2,
                    "id": 2,
                    "name": "один",
                },
            ],
        ];
        map_tags(EXPECTED_TAGS[0], maps);

        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372660,
                    "id": 19,
                    "tags": [
                        2,
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": 16,
                    "tags": [
                        3,
                        2,
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372651,
                    "id": 13,
                    "tags": [],
                    "text": "Запись без меток",
                    "text_highlighted": undefined,
                },
            ]
        ];
        map_notes(EXPECTED_NOTES[0], maps);

        let EXPECTED_WORKING = [true];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("second import notepad must fail", async function() {
        reset_events();
        let result = await notepad.import(IMPORT_DATA);
        assert.equal(result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        let EXPECTED_WORKING = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("export notepad", async function() {
        reset_events();
        let exported_data = await notepad.export();
        let mapped_import_data = map_import_data(IMPORT_DATA, maps);
        let mapped_export_data = map_exported_data(exported_data);
        assert.deepEqual(mapped_export_data, mapped_import_data);
    });

    it("close notepad", async function() {
        reset_events();
        let close_result = await notepad.close();
        assert.equal(close_result, true);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        let EXPECTED_WORKING = [false];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });

    it("second close notepad must fail", async function() {
        reset_events();
        let close_result = await notepad.close();
        assert.equal(close_result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        let EXPECTED_WORKING = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        assert.deepEqual(working_events, EXPECTED_WORKING);
    });
});

describe("notepad tags and notes", function() {
    let notepad;
    let tag_id1, tag_id2, tag_id3;
    let note_id1, note_id2;
    let tags_events = [];
    let notes_events = [];

    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    }

    it("init", async function() {
        notepad = new Notepad();
        await notepad.init();
        await notepad.create();
        notepad.on("reset_tags", function(tags) {
            tags_events.push(tags);
        })
        notepad.on("reset_notes", function(notes) {
            notes_events.push(notes);
        });        
    });

    it("create three tags", async function() {
        reset_events();
        tag_id1 = await notepad.create_tag("tag text1");
        tag_id2 = await notepad.create_tag("tag text2");
        tag_id3 = await notepad.create_tag("tag text3");

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

    it("create note with two tags", async function() {
        reset_events();
        note_id1 = await notepad.create_note("note text1", 1111, [tag_id1, tag_id2]);

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
                    tags: [tag_id1, tag_id2]
                }
            ]
        ];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("add tag to note", async function() {
        reset_events();
        await notepad.edit_note(note_id1, "note text1", 1111, [tag_id1, tag_id2, tag_id3]);

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

    it("delete tag from note", async function() {
        reset_events();
        await notepad.edit_note(note_id1, "note text1", 1111, [tag_id1, tag_id3]);

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

    it("delete note with tags", async function() {
        reset_events();
        await notepad.delete_note(note_id1);

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

    it("create two notes with tags", async function() {
        reset_events();
        note_id1 = await notepad.create_note("note text1", 1111, [tag_id1, tag_id2]);
        note_id2 = await notepad.create_note("note text2", 1112, [tag_id2, tag_id3]);

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

    it("close", async function() {
        let result = await notepad.close();
        assert.equal(result, true);
    });
});

describe("notepad parse initial data", function() {
     it("parse empty storage", async function() {
        let notepad = new Notepad();
        await notepad.init();
        let working = false;
        notepad.on("working", function(value) {
            working = value;
        });
        await notepad.sync();
        assert.equal(working, false);
    });

    it("parse storage with one notepad", async function() {
        let notepad = new Notepad();
        await notepad.init();
        await notepad._storage.create_notepad("123")
        let working = false;
        notepad.on("working", function(value) {
            working = value;
        });
        await notepad.sync();
        assert.equal(working, true);

        let result = await notepad.close();
        assert.equal(result, true);
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

    let notepad;
    let maps;
    let tags_events = [];
    let notes_events = [];
    let working_events = [];
    let reset_events = function() {
        tags_events.splice(0, tags_events.length);
        notes_events.splice(0, notes_events.length);
        working_events.splice(0, working_events.length);
    };
    let assert_events = function(expected_tags, expected_notes) {
        assert.deepEqual(tags_events, expected_tags);
        assert.deepEqual(notes_events, expected_notes);
    };

    it("init", async function() {
        notepad = new Notepad();
        await notepad.init();    
        maps = await notepad.import(IMPORT_DATA);
        assert.notEqual(maps, false);
        notepad.on("reset_tags", function(tags) {
            tags_events.push(tags);
        })
        notepad.on("reset_notes", function(notes) {
            notes_events.push(notes);
        });
        notepad.on("working", function(working) {
            working_events.push(working);
        });
    });

    it("sort notes desc", async function() {
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": false});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372660,
                    "id": 19,
                    "tags": [
                        2,
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": 16,
                    "tags": [
                        3,
                        2,
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372651,
                    "id": 13,
                    "tags": [],
                    "text": "Запись без меток",
                    "text_highlighted": undefined,
                },
            ]
        ];
        map_notes(EXPECTED_NOTES[0], maps);

        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("sort notes asc", async function() {
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372651,
                    "id": 13,
                    "tags": [],
                    "text": "Запись без меток",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": 16,
                    "tags": [
                        3,
                        2,
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372660,
                    "id": 19,
                    "tags": [
                        2,
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        map_notes(EXPECTED_NOTES[0], maps);

        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("sort tags desc", async function() {
        reset_events();
        await notepad.set_tags_filter({"sorting_asc": false});
        let EXPECTED_TAGS = [
            [
                {
                    "id": 21,
                    "count": 0,
                    "name":"одинцово"
                },
                {
                    "count": 2,
                    "id": 2,
                    "name": "один",
                },
                {
                    "count": 1,
                    "id": 3,
                    "name": "два",
                },
            ],
        ];
        map_tags(EXPECTED_TAGS[0], maps);

        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("sort tags asc", async function() {
        reset_events();
        await notepad.set_tags_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [
            [
                {
                    "count": 1,
                    "id": 3,
                    "name": "два",
                },
                {
                    "count": 2,
                    "id": 2,
                    "name": "один",
                },
                {
                    "id": 21,
                    "count": 0,
                    "name":"одинцово"
                },
            ],
        ];
        map_tags(EXPECTED_TAGS[0], maps);

        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by text desc", async function() {
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": false, "text": "один"});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372660,
                    "id": 19,
                    "tags": [
                        2,
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": 16,
                    "tags": [
                        3,
                        2,
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        map_notes(EXPECTED_NOTES[0], maps);

        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by text asc", async function() {
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": true, "text": "один"});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372656,
                    "id": 16,
                    "tags": [
                        3,
                        2,
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372660,
                    "id": 19,
                    "tags": [
                        2,
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        map_notes(EXPECTED_NOTES[0], maps);

        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by attached tag desc", async function() {
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": false, "tags": [maps.tags[2]]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372660,
                    "id": 19,
                    "tags": [
                        2,
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372656,
                    "id": 16,
                    "tags": [
                        3,
                        2,
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        map_notes(EXPECTED_NOTES[0], maps);

        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by attached tag asc", async function() {
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": true, "tags": [maps.tags[2]]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1586634372656,
                    "id": 16,
                    "tags": [
                        3,
                        2,
                    ],
                    "text": "Запись с метками \"один\" и \"два\"",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1586634372660,
                    "id": 19,
                    "tags": [
                        2,
                    ],
                    "text": "Запись с меткой \"один\"",
                    "text_highlighted": undefined,
                },
            ]
        ];
        map_notes(EXPECTED_NOTES[0], maps);

        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter tags by name desc", async function() {
        reset_events();
        await notepad.set_tags_filter({"sorting_asc": false, "name": "один"});
        let EXPECTED_TAGS = [
            [
                {
                    "count": 0,
                    "id": 21,
                    "name": "одинцово",
                },
                {
                    "count": 2,
                    "id": 2,
                    "name": "один",
                },
            ],
        ];
        map_tags(EXPECTED_TAGS[0], maps);

        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter tags by name asc", async function() {
        reset_events();
        await notepad.set_tags_filter({"sorting_asc": true, "name": "один"});
        let EXPECTED_TAGS = [
            [
                {
                    "count": 2,
                    "id": 2,
                    "name": "один",
                },
                {
                    "count": 0,
                    "id": 21,
                    "name": "одинцово",
                },
            ],
        ];
        map_tags(EXPECTED_TAGS[0], maps);

        let EXPECTED_NOTES = [];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by not attached tag desc", async function() {
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": false, "tags": [maps.tags[21]]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("filter notes by not attached tag asc", async function() {
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": true, "tags": [maps.tags[21] ]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [[]];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
    });

    it("close", async function() {
        let result = await notepad.close();
        assert.equal(result, true);
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

    let notepad;
    let tags_events = [];
    let notes_events = [];
    let working_events = [];
    let append_events = []

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

    it("init", async function() {
        notepad = new Notepad();
        await notepad.init();
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
    });

    it("no records initial", async function() {
        let maps = await notepad.import(IMPORT_DATA_ZERO);
        assert.notEqual(maps, false);
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let notes = [];
        let EXPECTED_NOTES = [notes];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        await notepad.load_next_notes();
        assert.deepEqual(append_events, []);
        await notepad.close();
    });

    it("records less than one page initial", async function() {
        let maps = await notepad.import(IMPORT_DATA_ONE_PAGE);
        assert.notEqual(maps, false);
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": true});
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
        map_notes(notes, maps);
        let EXPECTED_NOTES = [notes];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        await notepad.load_next_notes();
        assert.deepEqual(append_events, []);
        await notepad.close();
    });

    it("records less than two pages", async function() {
        let maps = await notepad.import(IMPORT_DATA_TWO_PAGES);
        assert.notEqual(maps, false);
        reset_events();
        await notepad.set_notes_filter({"sorting_asc": true});
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
        map_notes(notes, maps);
        let EXPECTED_NOTES = [notes];
        assert_events(EXPECTED_TAGS, EXPECTED_NOTES);
        await notepad.load_next_notes();
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
        map_notes(notes, maps);
        assert.deepEqual(append_events, [notes]);
        await notepad.close();
    });
});

