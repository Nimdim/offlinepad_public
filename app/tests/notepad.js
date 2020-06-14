import Notepad  from "./../src/js/notepad.js";

import { assert } from "chai";
import _ from "lodash";
import NotepadsList from "../src/js/notepads_list.js";
import { MockedBetaDataImporter, AlphaDataImporterFromDict,
         BetaDataImporterFromArray } from '../src/js/data_importer.js'

let import_alpha_data = async function(name, notepads_list, data, encrypted, secret) {
  if(encrypted == null) {
    encrypted = false;
  }
  let arg = {
    "name": name,
    "file": data,
    "notepads_list": notepads_list,
    "encrypted": encrypted,
    "secret": secret,
  };
  let importer = new AlphaDataImporterFromDict(arg);
  let import_result = await importer.execute();
  assert.equal(import_result.error, null);
  return import_result;
}

let import_beta_data = async function(name, notepads_list, data, encrypted, secret) {
    if(encrypted == null) {
        encrypted = false;
    }
    let arg = {
      "name": name,
      "file": data,
      "notepads_list": notepads_list,
      "encrypted": encrypted,
      "secret": secret,
    };
    let importer = new BetaDataImporterFromArray(arg);
    let import_result = await importer.execute();
    assert.equal(import_result.error, null);
    return import_result;
  }
  
let NOTEPAD_NAME = "test_notepad";
let NOTEPAD_OPTIONS = {
    "encrypted": false,
};

class NotepadTestEvents {
    constructor(notepad) {
        this.tags = [];
        this.notes = [];
        this.append = [];
        this.info = [];
        this.note_filters = [];
        notepad.on("reset_tags", (tags) => {
            this.tags.push(tags);
        })
        notepad.on("reset_notes", (notes) => {
            this.notes.push(notes);
        });
        notepad.on("reset_info", (info) => {
            this.info.push(info);
        });
        notepad.on("append_notes", (notes) => {
            this.append.push(notes);
        });
        notepad.on("reset_note_filters", (note_filters) => {
            this.note_filters.push(note_filters)
        });
    }

    reset() {
        this.tags.splice(0, this.tags.length);
        this.notes.splice(0, this.notes.length);
        this.append.splice(0, this.append.length);
        this.info.splice(0, this.info.length);
        this.note_filters.splice(0, this.note_filters.length);
    }

    assert_tags(EXPECTED) {
        assert.deepEqual(this.tags, EXPECTED);
    }

    assert_notes(EXPECTED) {
        assert.deepEqual(this.notes, EXPECTED);
    }

    assert_append(EXPECTED) {
        assert.deepEqual(this.append, EXPECTED);
    }

    assert_info(EXPECTED) {
        assert.deepEqual(this.info, EXPECTED);
    }

    assert_note_filters(EXPECTED) {
        assert.deepEqual(this.note_filters, EXPECTED);
    }
}

describe("notepad simple tests", function() {
    let notepads_list = new NotepadsList();
    let notepad_id;
    let notepad;
    let tag_id;
    let note_id;
    let events;

    it("create notepad", async function() {
        await notepads_list.init();
        let info = await notepads_list.create(NOTEPAD_NAME, NOTEPAD_OPTIONS);
        notepad_id = info.id;
        notepad = info.notepad;
        events = new NotepadTestEvents(notepad);

        await notepad._reset_state();
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("create tag with empty name must fail", async function() {
        events.reset();
        let error = false;
        try {
            await notepad.create_tag("");
        }
        catch(e) {
            error = true;
        }
        assert.equal(error, true);
    });

    it("create tag", async function() {
        events.reset();
        tag_id = await notepad.create_tag("test_tag");
        let EXPECTED_TAGS = [
            [{id: tag_id, name: "test_tag", count: 0}],
        ];
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("create tag with existing name must fail", async function() {
        events.reset();
        let error = false;
        try {
            await notepad.create_tag("test_tag");
        }
        catch(e) {
            error = true;
        }
        assert.equal(error, true);
    });

    it("edit tag", async function() {
        events.reset();
        await notepad.edit_tag(tag_id, "test_tag_new");
        let EXPECTED_TAGS = [
            [{id: tag_id, name: "test_tag_new", count: 0}],
        ];
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("delete tag", async function() {
        events.reset();
        await notepad.delete_tag(tag_id);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("create note with empty text must fail", async function() {
        events.reset();
        let error = false;
        try {
            await notepad.create_note("", 1111, []);
        }
        catch(e) {
            error = true;
        }
        assert.equal(error, true);

    });

    it("create note", async function() {
        events.reset();
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
        let EXPECTED_TAGS = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("edit note", async function() {
        events.reset();
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
        let EXPECTED_TAGS = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("delete note", async function() {
        events.reset();
        await notepad.delete_note(note_id);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [[]];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("close notepad", async function() {
        events.reset();
        let close_result = await notepad.close();
        assert.equal(close_result, true);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("second close notepad must fail", async function() {
        events.reset();
        let close_result = await notepad.close();
        assert.equal(close_result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("delete notepad", async function() {
        let result = await notepads_list.delete(notepad_id);
        assert.equal(result, true);
    });
});

describe("notepad alpha import export", function() {
    let IMPORT_DATA = {
        1: {
            "type": "notepad",
            "notepad_name": NOTEPAD_NAME,
        },
        2: {
            "type":"tag",
            "name":"один",
        },
        3: {
            "type":"tag",
            "name":"два",
        },
        13: {
            "type":"note",
            "text":"Запись без меток",
            "created_at":1586634372651,
        },
        16: {
            "type":"note",
            "text":"Запись с метками \"один\" и \"два\"",
            "created_at":1586634372656,
        },
        17: {
            "type":"tag_note",
            "tag_id": 2,
            "note_id": 16,
        },
        18: {
            "type":"tag_note",
            "tag_id": 3,
            "note_id": 16,
        },
        19: {
            "type":"note",
            "text":"Запись с меткой \"один\"",
            "created_at":1586634372660,
        },
        20: {
            "type":"tag_note",
            "tag_id": 2,
            "note_id": 19,
        },
        21: {
            "type": "note_filter",
            "name": "раздел1",
            "tags": [2],
        },
        22: {
            "type": "note_filter",
            "name": "раздел2",
            "tags": [2, 3],
        },
    };

    let notepads_list = new NotepadsList();
    let notepad_id;
    let notepad;
    let events;
    let maps;

    let map_import_data = function(import_data) {
        let sorted = {
            "settings": {},
            "tags": {},
            "notes": {},
            "tag_notes": {},
            "note_filters": {},
        }

        let keys = _.keys(import_data);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let object = _.cloneDeep(import_data[key]);
            let type = object.type;
            switch(type) {
                case "notepad":
                    object.type = "setting";
                    object.name = "info";
                    object.encrypted = false;
                    object.schema_type = "beta";
                    sorted.settings[key] = object;
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
                    sorted.note_filters[key] = object;
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
            "settings": {},
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
                case "setting":
                    sorted.settings[key] = object;
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
                    sorted.note_filters[key] = object;
                    break;
                default:
                    throw new Error("unknown type " + type);
                    break;
            }
        }
        return sorted;
    };

    it("import notepad", async function() {
        await notepads_list.init();
        let info = await import_alpha_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        notepad = info.notepad;
        notepad_id = info.notepad_id;
        events = new NotepadTestEvents(notepad);
        maps = info.maps;

        assert.notEqual(maps, false);
        await notepad._reset_state();
       
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

        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("export notepad", async function() {
        events.reset();
        let exported_data = await notepad.export();
        let mapped_import_data = map_import_data(IMPORT_DATA);
        let mapped_export_data = map_exported_data(exported_data);
        assert.deepEqual(mapped_export_data, mapped_import_data);
    });

    it("close notepad", async function() {
        events.reset();
        let close_result = await notepad.close();
        assert.equal(close_result, true);
        let EXPECTED_TAGS = [[]];
        let EXPECTED_NOTES = [[]];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("second close notepad must fail", async function() {
        events.reset();
        let close_result = await notepad.close();
        assert.equal(close_result, false);
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("delete notepad", async function() {
        let result = await notepads_list.delete(notepad_id);
        assert.equal(result, true);
    });
});


describe("notepad tags and notes and filters", function() {
    let notepads_list = new NotepadsList();
    let notepad_id;
    let notepad;
    let tag_id1, tag_id2, tag_id3;
    let note_id1, note_id2;
    let note_filter_id1, note_filter_id3;
    let events;

    it("create three tags", async function() {
        await notepads_list.init();
        let info = await notepads_list.create(NOTEPAD_NAME, NOTEPAD_OPTIONS)
        notepad = info.notepad;
        notepad_id = info.id;
        events = new NotepadTestEvents(notepad);

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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("create note with two tags", async function() {
        events.reset();
        note_id1 = await notepad.create_note("note text1", 1111, [tag_id1, tag_id2]);
        await notepad._reset_tags();

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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("add tag to note", async function() {
        events.reset();
        await notepad.edit_note(note_id1, "note text1", 1111, [tag_id1, tag_id2, tag_id3]);
        await notepad._reset_tags();

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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("delete tag from note", async function() {
        events.reset();
        await notepad.edit_note(note_id1, "note text1", 1111, [tag_id1, tag_id3]);
        await notepad._reset_tags();

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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("delete note with tags", async function() {
        events.reset();
        await notepad.delete_note(note_id1);
        await notepad._reset_tags();

        let EXPECTED_TAGS = [
            [
                {id: tag_id1, name: "tag text1", count: 0},
                {id: tag_id2, name: "tag text2", count: 0},
                {id: tag_id3, name: "tag text3", count: 0},
            ]
        ];
        let EXPECTED_NOTES = [[]];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("create two notes with tags", async function() {
        events.reset();
        note_id1 = await notepad.create_note("note text1", 1111, [tag_id1, tag_id2]);
        await notepad._reset_tags();
        note_id2 = await notepad.create_note("note text2", 1112, [tag_id2, tag_id3]);
        await notepad._reset_tags();

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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("create note_filter with empty name must fail", async function() {
        events.reset();
        let error = false;
        try {
            await notepad.create_note_filter("", [tag_id1]);
        }
        catch(e) {
            error = true;
        }
        assert.equal(error, true);
    });

    it("create note_filter with one tag", async function() {
        events.reset();
        note_filter_id1 = await notepad.create_note_filter("note filter1", [tag_id1]);

        let EXPECTED_NOTE_FILTERS = [
            [
                {
                    id: "internal_all",
                    name: "Все",
                    tags: [],
                    deletable: false,
                },
                {
                    id: note_filter_id1,
                    name: "note filter1",
                    tags: [tag_id1],
                    deletable: true,
                },
            ]
        ];
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);
    });

    it("create note_filter with three tags", async function() {
        events.reset();
        note_filter_id3 = await notepad.create_note_filter("note filter3", [tag_id1, tag_id2, tag_id3]);

        let EXPECTED_NOTE_FILTERS = [
            [
                {
                    id: "internal_all",
                    name: "Все",
                    tags: [],
                    deletable: false,
                },
                {
                    id: note_filter_id1,
                    name: "note filter1",
                    tags: [tag_id1],
                    deletable: true,
                },
                {
                    id: note_filter_id3,
                    name: "note filter3",
                    tags: [tag_id1, tag_id2, tag_id3],
                    deletable: true,
                },
            ]
        ];
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);
    });

    it("edit note_filter with three tags", async function() {
        events.reset();
        await notepad.edit_note_filter(note_filter_id3, "note filter3 edited");

        let EXPECTED_NOTE_FILTERS = [
            [
                {
                    id: "internal_all",
                    name: "Все",
                    tags: [],
                    deletable: false,
                },
                {
                    id: note_filter_id1,
                    name: "note filter1",
                    tags: [tag_id1],
                    deletable: true,
                },
                {
                    id: note_filter_id3,
                    name: "note filter3 edited",
                    tags: [tag_id1, tag_id2, tag_id3],
                    deletable: true,
                },
            ]
        ];
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);
    });

    it("delete note_filter with one tag", async function() {
        events.reset();
        await notepad.delete_note_filter(note_filter_id1);

        let EXPECTED_NOTE_FILTERS = [
            [
                {
                    id: "internal_all",
                    name: "Все",
                    tags: [],
                    deletable: false,
                },
                {
                    id: note_filter_id3,
                    name: "note filter3 edited",
                    tags: [tag_id1, tag_id2, tag_id3],
                    deletable: true,
                },
            ]
        ];
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);
    });

    it("close", async function() {
        let result = await notepad.close();
        assert.equal(result, true);
    });

    it("delete notepad", async function() {
        let result = await notepads_list.delete(notepad_id);
        assert.equal(result, true);
    });
});

describe("notepad filtering and sorting", function() {
    let IMPORT_DATA = [
        {
            "id": 1,
            "type": "setting",
            "name": "info",
            "notepad_name": NOTEPAD_NAME,
            "encypted": false,
            "schema_type": "beta",
        },
        {
            "id": 2,
            "type":"tag",
            "name":"один"
        },
        {
            "id": 3,
            "type":"tag",
            "name":"два"
        },
        {
            "id": 21,
            "type":"tag",
            "name":"одинцово"
        },
        {
            "id": 13,
            "type":"note",
            "text":"Запись без меток",
            "created_at":1586634372651
        },
        {
            "id": 19,
            "type":"note",
            "text":"Запись с меткой \"один\"",
            "created_at":1586634372660
        },
        {
            "id": 16,
            "type":"note",
            "text":"Запись с метками \"один\" и \"два\"",
            "created_at":1586634372656
        },
        {
            "id": 17,
            "type":"tag_note",
            "tag_id":2,
            "note_id":16
        },
        {
            "id": 18,
            "type":"tag_note",
            "tag_id":3,
            "note_id":16
        },
        {
            "id": 20,
            "type":"tag_note",
            "tag_id":2,
            "note_id":19
        },
    ];

    let notepads_list = new NotepadsList();
    let notepad_id;
    let notepad;
    let maps;
    let events;

    it("initial", async function() {
        await notepads_list.init();
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA);
        notepad = info.notepad;
        notepad_id = info.notepad_id;
        events = new NotepadTestEvents(notepad);
        maps = info.maps;
        assert.notEqual(maps, false);
    });

    it("sort notes desc", async function() {
        events.reset();

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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("sort notes asc", async function() {
        events.reset();
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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("sort tags desc", async function() {
        events.reset();
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
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("sort tags asc", async function() {
        events.reset();
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
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("filter notes by text desc", async function() {
        events.reset();
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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("filter notes by text asc", async function() {
        events.reset();
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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("filter notes by attached tag desc", async function() {
        events.reset();
        await notepad.set_notes_filter({"sorting_asc": false, "tags": [2]});
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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("filter notes by attached tag asc", async function() {
        events.reset();
        await notepad.set_notes_filter({"sorting_asc": true, "tags": [2]});
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
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("filter tags by name desc", async function() {
        events.reset();
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
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("filter tags by name asc", async function() {
        events.reset();
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
        let EXPECTED_NOTES = [];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("filter notes by not attached tag desc", async function() {
        events.reset();
        await notepad.set_notes_filter({"sorting_asc": false, "tags": [21]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [[]];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("filter notes by not attached tag asc", async function() {
        events.reset();
        await notepad.set_notes_filter({"sorting_asc": true, "tags": [21]});
        let EXPECTED_TAGS = [];
        let EXPECTED_NOTES = [[]];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
    });

    it("close", async function() {
        let result = await notepad.close();
        assert.equal(result, true);
    });

    it("delete notepad", async function() {
        let result =await notepads_list.delete(notepad_id);
        assert.equal(result, true);
    });
});

describe("notepad pagination", function() {
    let IMPORT_DATA_ZERO = [
        {
            "id": 1,
            "type": "setting",
            "name": "info",
            "notepad_name": NOTEPAD_NAME,
            "schema_type": "beta",
            "ecnrypted": false,
        },
    ];

    let IMPORT_DATA_ONE_PAGE = [
        {
            "id": 1,
            "type": "setting",
            "name": "info",
            "notepad_name": NOTEPAD_NAME,
            "schema_type": "beta",
            "ecnrypted": false,
        },
    ];
    for(let k = 0; k < 20; k++) {
        let id = k;
        IMPORT_DATA_ONE_PAGE.push({
            "id": id,
            "type":"note",
            "text":"Запись " + k,
            "created_at": 1586634372660 + k,
        });
    }

    let IMPORT_DATA_TWO_PAGES = [
        {
            "id": 1,
            "type": "setting",
            "name": "info",
            "notepad_name": NOTEPAD_NAME,
            "schema_type": "beta",
            "ecnrypted": false,
        },
    ];
    for(let k = 0; k < 60; k++) {
        let id = k;
        IMPORT_DATA_TWO_PAGES.push({
            "id": id,
            "type":"note",
            "text":"Запись " + k,
            "created_at": 1586634372660 + k,
        });
    }

    let notepads_list = new NotepadsList();

    it("init", async function() {
        await notepads_list.init();
    });

    it("no records initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA_ZERO)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);

        events.reset();

        await notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let notes = [];
        let EXPECTED_NOTES = [notes];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);    
        assert.equal(result, true);
    });

    it("records less than one page initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA_ONE_PAGE)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        let maps = info.maps;
        assert.notEqual(maps, false);

        events.reset();

        await notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let notes = [];
        for(let k = 0; k < 20; k++) {
            let id = k;
            notes.push({
                "id": id,
                "tags": [],
                "text_highlighted": undefined,
                "text":"Запись " + k,
                "creation_time": 1586634372660 + k,    
            });
        }
        let EXPECTED_NOTES = [notes];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });

    it("records less than two pages", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA_TWO_PAGES)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);

        events.reset();

        await notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];
        let notes = [];
        for(let k = 0; k < 40; k++) {
            let id = k;
            notes.push({
                "id": id,
                "tags": [],
                "text_highlighted": undefined,
                "text":"Запись " + k,
                "creation_time": 1586634372660 + k,    
            });
        }
        let EXPECTED_NOTES = [notes];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        await notepad.load_next_notes();
        notes = [];
        for(let k = 40; k < 60; k++) {
            let id = k;
            notes.push({
                "id": id,
                "tags": [],
                "text_highlighted": undefined,
                "text":"Запись " + k,
                "creation_time": 1586634372660 + k,    
            });
        }
        events.assert_append([notes]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });
});

describe("notepad pagination with filtering", function() {
    let IMPORT_DATA = [
        {
            "id": 1,
            "type": "setting",
            "name": "info",
            "notepad_name": NOTEPAD_NAME,
            "schema_type": "beta",
            "encrypted": false,
        },
    ];

    for(let k = 0; k < 2; k++) {
        let id = k + 2;
        IMPORT_DATA.push({
            "id": id,
            "type": "tag",
            "name": "тег " + k,
        });
    }

    let notepads_list = new NotepadsList();
    let notes = [];

    for(let k = 0; k < 240; k++) {
        let id = k + 2;
        let name = "альфа ";
        let tags = [2];
        if((k % 4) >= 2) {
            tags = [3];
        }
        if(k % 2) {
            name = "бета ";
        }
        IMPORT_DATA.push({
            "id": id,
            "type": "note",
            "text": name + k,
            "created_at": 1586634372660 + k,
        });
        notes.push({
            "id": id,
            "tags": tags,
            "text_highlighted": undefined,
            "text": name + k,
            "creation_time": 1586634372660 + k,    
        });
    }

    for(let k = 0; k < 240; k++) {
        let id = k;
        let tag_id = 2;
        if((k % 4) >= 2) {
            tag_id = 3;
        }
        IMPORT_DATA.push({
            "id": id,
            "type": "tag_note",
            "tag_id": tag_id,
            "note_id": k + 2,
        });
    }

    it("init", async function() {
        await notepads_list.init();
    });

    it("no filter asc initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        
        events.reset();

        await notepad.set_notes_filter({"sorting_asc": true});
        let EXPECTED_TAGS = [];

        let notes_part = _.cloneDeep(notes.slice(0, 40));
        let EXPECTED_NOTES = [notes_part];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        
        events.reset();
        notes_part = _.cloneDeep(notes.slice(40, 80));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes.slice(80, 120));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes.slice(120, 160));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes.slice(160, 200));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes.slice(200, 240));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });

    it("no filter desc initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        
        events.reset();

        await notepad.set_notes_filter({"sorting_asc": false});
        let EXPECTED_TAGS = [];

        let notes_set = _.cloneDeep(notes);
        notes_set.reverse();
        let notes_part = _.cloneDeep(notes_set.slice(0, 40));
        let EXPECTED_NOTES = [notes_part];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        
        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(40, 80));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(80, 120));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(120, 160));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(160, 200));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(200, 240));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });

    it("text filter asc initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        
        events.reset();

        await notepad.set_notes_filter({"text": "альфа", "sorting_asc": true});
        let EXPECTED_TAGS = [];

        let notes_set = _.cloneDeep(
            _.filter(notes, (note, index) => {return index % 2 == 0})
        );
        let notes_part = _.cloneDeep(notes_set.slice(0, 40));
        let EXPECTED_NOTES = [notes_part];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        
        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(40, 80));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(80, 120));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });

    it("text filter desc initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        
        events.reset();
        
        await notepad.set_notes_filter({"text": "альфа", "sorting_asc": false});
        let EXPECTED_TAGS = [];

        let notes_set = _.cloneDeep(
            _.filter(notes, (note, index) => {return index % 2 == 0})
        );
        notes_set.reverse();
        let notes_part = _.cloneDeep(notes_set.slice(0, 40));
        let EXPECTED_NOTES = [notes_part];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        
        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(40, 80));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(80, 120));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });

    it("tag filter asc initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        
        events.reset();

        await notepad.set_notes_filter({"tags": [2], "sorting_asc": true});
        let EXPECTED_TAGS = [];

        let notes_set = _.cloneDeep(
            _.filter(notes, (note, index) => {return (index % 4) < 2})
        );
        let notes_part = _.cloneDeep(notes_set.slice(0, 40));
        let EXPECTED_NOTES = [notes_part];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        
        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(40, 80));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(80, 120));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });

    it("tag filter desc initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        
        events.reset();

        await notepad.set_notes_filter({"tags": [2], "sorting_asc": false});
        let EXPECTED_TAGS = [];

        let notes_set = _.cloneDeep(
            _.filter(notes, (note, index) => {return (index % 4) < 2})
        );
        notes_set.reverse();
        let notes_part = _.cloneDeep(notes_set.slice(0, 40));
        let EXPECTED_NOTES = [notes_part];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        
        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(40, 80));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(80, 120));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });

    it("tag and text filter asc initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        
        events.reset();

        await notepad.set_notes_filter({"tags": [2], "text": "альфа", "sorting_asc": true});
        let EXPECTED_TAGS = [];

        let notes_set = _.cloneDeep(
            _.filter(notes, (note, index) => {return (index % 4) == 0})
        );
        let notes_part = _.cloneDeep(notes_set.slice(0, 40));
        let EXPECTED_NOTES = [notes_part];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        
        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(40, 60));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });

    it("tag and text filter asc initial", async function() {
        let info = await import_beta_data(NOTEPAD_NAME, notepads_list, IMPORT_DATA)
        let notepad = info.notepad;
        let events = new NotepadTestEvents(notepad);
        
        events.reset();

        await notepad.set_notes_filter({"tags": [2], "text": "альфа", "sorting_asc": false});
        let EXPECTED_TAGS = [];

        let notes_set = _.cloneDeep(
            _.filter(notes, (note, index) => {return (index % 4) == 0})
        );
        notes_set.reverse();
        let notes_part = _.cloneDeep(notes_set.slice(0, 40));
        let EXPECTED_NOTES = [notes_part];
        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        
        events.reset();
        notes_part = _.cloneDeep(notes_set.slice(40, 60));
        await notepad.load_next_notes();
        events.assert_append([notes_part]);

        events.reset();
        await notepad.load_next_notes();
        events.assert_append([]);

        await notepad.close();
        let result = await notepads_list.delete(info.notepad_id);
        assert.equal(result, true);
    });
});

describe("notepads_list tests", function() {
    let notepads_list = new NotepadsList();
    let notepad_id1;
    let notepad_id2;

    it("initial zero elements", async function() {
        await notepads_list.init();
        let EXPECTED = [];
        assert.deepEqual(notepads_list.notepads, EXPECTED);
    });

    it("first db created elements", async function() {
        let info = await notepads_list.create("np1", {encrypted: false});
        notepad_id1 = info.id;

        await info.notepad.close();
        await notepads_list.init();

        let list = notepads_list.notepads;
        let EXPECTED = [
            {
                id: notepad_id1,
                encrypted: false,
                name: "info",
                notepad_name: "np1",
                schema_type: "beta",
            },
        ];
        assert.deepEqual(list, EXPECTED);
    });

    it("second db created elements", async function() {
        let info = await notepads_list.create("np2", {encrypted: false});
        notepad_id2 = info.id;

        await info.notepad.close();
        await notepads_list.init();

        let list = notepads_list.notepads;
        let EXPECTED = [
            {
                id: notepad_id1,
                encrypted: false,
                name: "info",
                notepad_name: "np1",
                schema_type: "beta",
            },
            {
                id: notepad_id2,
                encrypted: false,
                name: "info",
                notepad_name: "np2",
                schema_type: "beta",
            },
        ];
        assert.deepEqual(list, EXPECTED);
    });

    it("first db deleted elements", async function() {
        let result = await notepads_list.delete(notepad_id1);
        assert.equal(result, true);

        let list = notepads_list.notepads;
        let EXPECTED = [
            {
                id: notepad_id2,
                encrypted: false,
                name: "info",
                notepad_name: "np2",
                schema_type: "beta",
            },
        ];
        assert.deepEqual(list, EXPECTED);
    });

    it("second db deleted elements", async function() {
        let result = await notepads_list.delete(notepad_id2);
        assert.equal(result, true);

        let list = notepads_list.notepads;
        let EXPECTED = [];
        assert.deepEqual(list, EXPECTED);
    });
});

describe("multi notepads tests", function() {
    let notepads_list = new NotepadsList();

    let IMPORT_DATA1 = [
        {
            "id": 1,
            "type": "setting",
            "name": "info",
            "notepad_name": "TEST_1",
            "encrypted": false,
            "schema_type": "beta",
        },
        {
            "id": 2,
            "type": "tag",
            "name": "Тег 1",
        },
        {
            "id": 3,
            "type": "tag",
            "name": "Тег 2",
        },
        {
            "id": 4,
            "type": "note",
            "text": "Запись 1",
            "created_at": 1,
        },
        {
            "id": 5,
            "type": "note",
            "text": "Запись 2",
            "created_at": 2,
        },
        {
            "id": 6,
            "type": "note",
            "text": "Запись 3",
            "created_at": 3,
        },
        {
            "id": 7,
            "type": "tag_note",
            "tag_id": 2,
            "note_id": 4,
        },
        {
            "id": 8,
            "type": "tag_note",
            "tag_id": 3,
            "note_id": 5,
        },
        {
            "id": 9,
            "type": "tag_note",
            "tag_id": 2,
            "note_id": 6,
        },
        {
            "id": 10,
            "type": "tag_note",
            "tag_id": 3,
            "note_id": 6,
        },
    ];

    let IMPORT_DATA2 = [
        {
            "id": 1,
            "type": "setting",
            "name": "info",
            "notepad_name": "TEST_2",
            "encrypted": false,
            "schema_type": "beta",
        },
        {
            "id": 2,
            "type": "tag",
            "name": "Тег 12",
        },
        {
            "id": 3,
            "type": "tag",
            "name": "Тег 22",
        },
        {
            "id": 4,
            "type": "note",
            "text": "Запись 12",
            "created_at": 1,
        },
        {
            "id": 5,
            "type": "note",
            "text": "Запись 22",
            "created_at": 2,
        },
        {
            "id": 6,
            "type": "note",
            "text": "Запись 32",
            "created_at": 3,
        },
        {
            "id": 7,
            "type": "tag_note",
            "tag_id": 2,
            "note_id": 4,
        },
        {
            "id": 8,
            "type": "tag_note",
            "tag_id": 3,
            "note_id": 5,
        },
        {
            "id": 9,
            "type": "tag_note",
            "tag_id": 2,
            "note_id": 6,
        },
        {
            "id": 10,
            "type": "tag_note",
            "tag_id": 3,
            "note_id": 6,
        },
    ];

    let notepad_id1;
    let notepad_id2;
    let maps1;
    let maps2;

    it("initial zero notepads", async function() {
        await notepads_list.init();
        let EXPECTED = [];
        assert.deepEqual(notepads_list.notepads, EXPECTED);
    });

    it("create two notepads", async function() {
        let info = await import_beta_data("TEST_1", notepads_list, IMPORT_DATA1)
        notepad_id1 = info.notepad_id;
        maps1 = info.maps;

        await info.notepad.close();
        await notepads_list.reread_list();

        let list = notepads_list.notepads;
        let EXPECTED = [
            {
                id: notepad_id1,
                encrypted: false,
                name: "info",
                notepad_name: "TEST_1",
                schema_type: "beta",
            },
        ];
        assert.deepEqual(list, EXPECTED);

        info = await import_beta_data("TEST_2", notepads_list, IMPORT_DATA2)
        notepad_id2 = info.notepad_id;
        maps2 = info.maps;

        await info.notepad.close();
        await notepads_list.reread_list();

        list = notepads_list.notepads;
        EXPECTED = [
            {
                id: notepad_id1,
                encrypted: false,
                name: "info",
                notepad_name: "TEST_1",
                schema_type: "beta",
            },
            {
                id: notepad_id2,
                encrypted: false,
                name: "info",
                notepad_name: "TEST_2",
                schema_type: "beta",
            },
        ];
        assert.deepEqual(list, EXPECTED);
    });

    it("test first notepad data", async function() {
        let notepad = await notepads_list.open(notepad_id1);
        assert.notEqual(notepad, false);

        let events = new NotepadTestEvents(notepad);
        await notepad._reset_notes();
        await notepad._reset_tags();
        await notepad._reset_info();

        let EXPECTED_NOTES = [[
            {
                "id": 6,
                "text": "Запись 3",
                "text_highlighted": undefined,
                "creation_time": 3,
                "tags": [2, 3],
            },    
            {
                "id": 5,
                "text": "Запись 2",
                "text_highlighted": undefined,
                "creation_time": 2,
                "tags": [3],
            },
            {
                "id": 4,
                "text": "Запись 1",
                "text_highlighted": undefined,
                "creation_time": 1,
                "tags": [2],
            },
        ]];
        let EXPECTED_TAGS = [[
            {
                "id": 2,
                "name": "Тег 1",
                "count": 2,
            },
            {
                "id": 3,
                "name": "Тег 2",
                "count": 2,
            },
        ]];
        let EXPECTED_INFO = [
            {
                "notepad_name": "TEST_1",
                "name": "info",
                "encrypted": false,
                "schema_type": "beta",
                "id": notepad_id1,
            }
        ];

        events.assert_notes(EXPECTED_NOTES);
        events.assert_tags(EXPECTED_TAGS);
        events.assert_info(EXPECTED_INFO);

        await notepad.close();
    });

    
    it("delete both notepads", async function() {
        let result = await notepads_list.delete(notepad_id1);
        assert.equal(result, true);
        result = await notepads_list.delete(notepad_id2);
        assert.equal(result, true);

        await notepads_list.reread_list();
        let list = notepads_list.notepads;
        let EXPECTED = [];
        assert.deepEqual(list, EXPECTED);
    });
});

describe("partial file reader import tests", function() {
    let notepads_list = new NotepadsList();

    let notepad_id;
    let notepad;
    let events;

    it("initial zero notepads", async function() {
        await notepads_list.init();
        let EXPECTED = [];
        assert.deepEqual(notepads_list.notepads, EXPECTED);
    });

    it("import notepad", async function() {
        this.timeout(60000);
        var fs = require('fs');
        var file_data = fs.readFileSync('./tests/beta_schema_data.txt', 'utf8');

        let arg = {
            notepads_list: notepads_list,
            file: file_data,
            name: "abc",
        }
        let importer = new MockedBetaDataImporter(arg);
        let import_result = await importer.execute();

        assert.equal(import_result.import_error, null);
        notepad_id = import_result.notepad_id;
        notepad = import_result.notepad;
        events = new NotepadTestEvents(notepad);
    });

    it("test tags", async function() {
        await notepad._reset_tags();

        let EXPECTED = [
            [
                {
                    "count": 800,
                    "id": 1,
                    "name": "метка 1",
                },
                {
                    "count": 0,
                    "id": 10,
                    "name": "метка 10",
                },
                {
                    "count": 600,
                    "id": 2,
                    "name": "метка 2",
                },
                {
                    "count": 400,
                    "id": 3,
                    "name": "метка 3",
                },
                {
                    "count": 200,
                    "id": 4,
                    "name": "метка 4",
                },
                {
                    "count": 0,
                    "id": 5,
                    "name": "метка 5",
                },
                {
                    "count": 0,
                    "id": 6,
                    "name": "метка 6",
                },
                {
                    "count": 0,
                    "id": 7,
                    "name": "метка 7",
                },
                {
                    "count": 0,
                    "id": 8,
                    "name": "метка 8",
                },
                {
                    "count": 0,
                    "id": 9,
                    "name": "метка 9",
                }
            ]
        ];
      
        events.assert_tags(EXPECTED);
    });

    it("test notes", async function() {
        await notepad.set_notes_filter({"sorting_asc": true});
        events.reset();
        await notepad._reset_notes();

        let all_tags = [1, 2, 3, 4];
        let notes = []
        let EXPECTED = [notes];
        for(let k = 0; k < 40; k++) {
            notes.push({
                id: k + 1,
                tags: all_tags.slice(0, (k + 4) % 5),
                creation_time: 1589737323802 + k,
                text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." + k,
                text_highlighted: undefined,
            });
        }
        events.assert_notes(EXPECTED);

        EXPECTED = [];
        for(let i = 0; i < 25; i++) {
            await notepad.load_next_notes();
            let notes = [];
            if(i < 24) {
                for(let k = 40 * (i + 1); k < 40 * (i + 2); k++) {
                    notes.push({
                        id: k + 1,
                        tags: all_tags.slice(0, (k + 4) % 5),
                        creation_time: 1589737323802 + k,
                        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." + k,
                        text_highlighted: undefined,
                    });
                }
                EXPECTED.push(notes);
            }
        }
        events.assert_append(EXPECTED);
    });

    it("test notes filter", async function() {
        await notepad._reset_note_filters();
        let EXPECTED = [
            [
                {
                    "deletable": false,
                    "id": "internal_all",
                    "name": "Все",
                    "tags": [],
                },
                {
                    "deletable": true,
                    "id": 1,
                    "name": "Раздел 1",
                    "tags": [
                        1,
                        2,
                    ],
                },
                {
                    "deletable": true,
                    "id": 2,
                    "name": "Раздел 2",
                    "tags": [
                        1,
                        2,
                        3,
                        4,
                    ],
                },
            ],
        ];

        events.assert_note_filters(EXPECTED);
    });
    
    it("delete notepad", async function() {
        await notepad.close();
        let result = await notepads_list.delete(notepad_id);
        assert.equal(result, true);

        await notepads_list.reread_list();
        let list = notepads_list.notepads;
        let EXPECTED = [];
        assert.deepEqual(list, EXPECTED);
    });
});

describe("encryption tests", function() {
    let notepads_list = new NotepadsList();

    let ENCRYPTED_NOTEPAD_OPTIONS;

    let notepad_id;
    let notepad;
    let events;

    let EXPECTED_TAGS;
    let EXPECTED_NOTES;
    let EXPECTED_NOTE_FILTERS;

    let exported_unencrypted_data;
    let exported_encrypted_data;

    it("initial zero notepads", async function() {
        await notepads_list.init();
        let EXPECTED = [];
        assert.deepEqual(notepads_list.notepads, EXPECTED);
    });

    it("create notepad and fill", async function() {
        ENCRYPTED_NOTEPAD_OPTIONS = {
            encrypted: true,
            secret: [0, 1, 2, 3, 4, 5, 6, 7,
                8, 9, 10, 11, 12, 13, 14, 15,
                16, 17, 18, 19, 20, 21, 22, 23,
                24, 25, 26, 27, 28, 29, 30, 31],
        };
        let info = await notepads_list.create(NOTEPAD_NAME, ENCRYPTED_NOTEPAD_OPTIONS);
        notepad_id = info.id;
        notepad = info.notepad;

        let tag_ids = [
            await notepad.create_tag("один"),
            await notepad.create_tag("два"),
            await notepad.create_tag("три"),
            await notepad.create_tag("четыре"),
        ];

        let note_ids = [
            await notepad.create_note("запись 1", 1000000000, tag_ids.slice(0, 2)),
            await notepad.create_note("запись 2", 1000000001, tag_ids.slice(1, 3)),
            await notepad.create_note("запись 3", 1000000002, tag_ids.slice(2, 4)),
        ];

        let notefilter_ids = [
            await notepad.create_note_filter("раздел 1", tag_ids.slice(0, 3)),
            await notepad.create_note_filter("раздел 2", tag_ids.slice(1, 4)),
        ];

        events = new NotepadTestEvents(notepad);
        await notepad._reset_tags();
        await notepad._reset_notes();
        await notepad._reset_note_filters();

        EXPECTED_TAGS = [
            [
                {
                  "count": 2,
                  "id": tag_ids[1],
                  "name": "два",
                },
                {
                  "count": 1,
                  "id": tag_ids[0],
                  "name": "один",
                },
                {
                  "count": 2,
                  "id": tag_ids[2],
                  "name": "три",
                },
                {
                  "count": 1,
                  "id": tag_ids[3],
                  "name": "четыре",
                },
            ],
        ];
        EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1000000002,
                    "id": note_ids[2],
                    "tags": [
                        tag_ids[2],
                        tag_ids[3],
                    ],
                    "text": "запись 3",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1000000001,
                    "id": note_ids[1],
                    "tags": [
                        tag_ids[1],
                        tag_ids[2],
                    ],
                    "text": "запись 2",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1000000000,
                    "id": note_ids[0],
                    "tags": [
                        tag_ids[1],
                        tag_ids[0],
                    ],
                    "text": "запись 1",
                    "text_highlighted": undefined,
                },
            ],     
        ];
        EXPECTED_NOTE_FILTERS = [
            [
                {
                    "deletable": false,
                    "id": "internal_all",
                    "name": "Все",
                    "tags": [],
                },
                {
                    "deletable": true,
                    "id": notefilter_ids[0],
                    "name": "раздел 1",
                    "tags": [
                        tag_ids[0],
                        tag_ids[1],
                        tag_ids[2],
                    ],
                },
                {
                    "deletable": true,
                    "id": notefilter_ids[1],
                    "name": "раздел 2",
                    "tags": [
                        tag_ids[1],
                        tag_ids[2],
                        tag_ids[3],
                    ],
                },
            ],
        ];

        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);

        exported_encrypted_data = await notepad.export(true);
        exported_unencrypted_data = await notepad.export(false);
        
        await notepad.close();
        await notepads_list.delete(notepad_id);
        notepad = null;
        notepad_id = null;
    });

    it("import unencrypted data", async function() {
        await notepads_list.reread_list();
        let EXPECTED = [];
        assert.deepEqual(notepads_list.notepads, EXPECTED);

        let info = await import_beta_data(
            NOTEPAD_NAME, notepads_list, exported_unencrypted_data,
            true, ENCRYPTED_NOTEPAD_OPTIONS.secret
        );

        notepad = info.notepad;
        notepad_id = info.notepad_id;

        events = new NotepadTestEvents(notepad);
        await notepad._reset_tags();
        await notepad._reset_notes();
        await notepad._reset_note_filters();

        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);

        await notepad.close();
        await notepads_list.delete(notepad_id);
        notepad = null;
        notepad_id = null;
    });

    it("import encrypted data", async function() {
        await notepads_list.reread_list();
        let EXPECTED = [];
        assert.deepEqual(notepads_list.notepads, EXPECTED);

        let info = await import_beta_data(
            NOTEPAD_NAME, notepads_list, exported_encrypted_data,
            true
        );
        await info.notepad.close();
        notepad_id = info.notepad_id;

        await notepads_list.reread_list();
        notepad = await notepads_list.open(
            notepad_id, ENCRYPTED_NOTEPAD_OPTIONS
        );

        events = new NotepadTestEvents(notepad);
        await notepad._reset_tags();
        await notepad._reset_notes();
        await notepad._reset_note_filters();

        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);

        await notepad.close();
        await notepads_list.delete(notepad_id);
        notepad = null;
        notepad_id = null;
    });
});

describe("password tests", function() {
    let notepads_list = new NotepadsList();

    let ENCRYPTED_NOTEPAD_OPTIONS;

    let notepad_id;
    let notepad;
    let events;

    let EXPECTED_TAGS;
    let EXPECTED_NOTES;
    let EXPECTED_NOTE_FILTERS;

    it("initial zero notepads", async function() {
        await notepads_list.init();
        let EXPECTED = [];
        assert.deepEqual(notepads_list.notepads, EXPECTED);
    });

    it("create notepad and fill", async function() {
        ENCRYPTED_NOTEPAD_OPTIONS = {
            encrypted: true,
            secret: [0, 1, 2, 3, 4, 5, 6, 7,
                     8, 9, 10, 11, 12, 13, 14, 15,
                     16, 17, 18, 19, 20, 21, 22, 23,
                     24, 25, 26, 27, 28, 29, 30, 31],
        };
        let info = await notepads_list.create(NOTEPAD_NAME, ENCRYPTED_NOTEPAD_OPTIONS);
        notepad_id = info.id;
        notepad = info.notepad;

        let tag_ids = [
            await notepad.create_tag("один"),
            await notepad.create_tag("два"),
            await notepad.create_tag("три"),
            await notepad.create_tag("четыре"),
        ];

        let note_ids = [
            await notepad.create_note("запись 1", 1000000000, tag_ids.slice(0, 2)),
            await notepad.create_note("запись 2", 1000000001, tag_ids.slice(1, 3)),
            await notepad.create_note("запись 3", 1000000002, tag_ids.slice(2, 4)),
        ];

        let notefilter_ids = [
            await notepad.create_note_filter("раздел 1", tag_ids.slice(0, 3)),
            await notepad.create_note_filter("раздел 2", tag_ids.slice(1, 4)),
        ];

        events = new NotepadTestEvents(notepad);
        await notepad._reset_tags();
        await notepad._reset_notes();
        await notepad._reset_note_filters();

        EXPECTED_TAGS = [
            [
                {
                  "count": 2,
                  "id": tag_ids[1],
                  "name": "два",
                },
                {
                  "count": 1,
                  "id": tag_ids[0],
                  "name": "один",
                },
                {
                  "count": 2,
                  "id": tag_ids[2],
                  "name": "три",
                },
                {
                  "count": 1,
                  "id": tag_ids[3],
                  "name": "четыре",
                },
            ],
        ];
        EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1000000002,
                    "id": note_ids[2],
                    "tags": [
                        tag_ids[2],
                        tag_ids[3],
                    ],
                    "text": "запись 3",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1000000001,
                    "id": note_ids[1],
                    "tags": [
                        tag_ids[1],
                        tag_ids[2],
                    ],
                    "text": "запись 2",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1000000000,
                    "id": note_ids[0],
                    "tags": [
                        tag_ids[1],
                        tag_ids[0],
                    ],
                    "text": "запись 1",
                    "text_highlighted": undefined,
                },
            ],     
        ];
        EXPECTED_NOTE_FILTERS = [
            [
                {
                    "deletable": false,
                    "id": "internal_all",
                    "name": "Все",
                    "tags": [],
                },
                {
                    "deletable": true,
                    "id": notefilter_ids[0],
                    "name": "раздел 1",
                    "tags": [
                        tag_ids[0],
                        tag_ids[1],
                        tag_ids[2],
                    ],
                },
                {
                    "deletable": true,
                    "id": notefilter_ids[1],
                    "name": "раздел 2",
                    "tags": [
                        tag_ids[1],
                        tag_ids[2],
                        tag_ids[3],
                    ],
                },
            ],
        ];

        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);

        await notepad.close();
        notepad = null;
    });

    it("password test", async function() {
        let result = await notepads_list.set_password_secret(
            notepad_id, "password123", ENCRYPTED_NOTEPAD_OPTIONS.secret
        );
        assert.equal(result, true);

        let secret_info = {
            method: "password",
            value: "password123",
        }
        let secret = await notepads_list.process_secret(secret_info, notepad_id);

        let options = {
            encrypted: true,
            secret: secret,
        }
        let info = await notepads_list.open(notepad_id, options);
        assert.notEqual(_.isString(info), true)
        notepad = info;

        events = new NotepadTestEvents(notepad);
        await notepad._reset_tags();
        await notepad._reset_notes();
        await notepad._reset_note_filters();

        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);

        await notepad.close();
    });

    it("delete notepad", async function() {
        await notepads_list.delete(notepad_id);
        notepad = null;
        notepad_id = null;
    });
});

describe("pin tests", function() {
    let notepads_list = new NotepadsList();

    let ENCRYPTED_NOTEPAD_OPTIONS;

    let notepad_id;
    let notepad;
    let events;

    let EXPECTED_TAGS;
    let EXPECTED_NOTES;
    let EXPECTED_NOTE_FILTERS;

    it("initial zero notepads", async function() {
        await notepads_list.init();
        let EXPECTED = [];
        assert.deepEqual(notepads_list.notepads, EXPECTED);
    });

    it("create notepad and fill", async function() {
        ENCRYPTED_NOTEPAD_OPTIONS = {
            encrypted: true,
            secret: [0, 1, 2, 3, 4, 5, 6, 7,
                     8, 9, 10, 11, 12, 13, 14, 15,
                     16, 17, 18, 19, 20, 21, 22, 23,
                     24, 25, 26, 27, 28, 29, 30, 31],
        };
        let info = await notepads_list.create(NOTEPAD_NAME, ENCRYPTED_NOTEPAD_OPTIONS);
        notepad_id = info.id;
        notepad = info.notepad;

        let tag_ids = [
            await notepad.create_tag("один"),
            await notepad.create_tag("два"),
            await notepad.create_tag("три"),
            await notepad.create_tag("четыре"),
        ];

        let note_ids = [
            await notepad.create_note("запись 1", 1000000000, tag_ids.slice(0, 2)),
            await notepad.create_note("запись 2", 1000000001, tag_ids.slice(1, 3)),
            await notepad.create_note("запись 3", 1000000002, tag_ids.slice(2, 4)),
        ];

        let notefilter_ids = [
            await notepad.create_note_filter("раздел 1", tag_ids.slice(0, 3)),
            await notepad.create_note_filter("раздел 2", tag_ids.slice(1, 4)),
        ];

        events = new NotepadTestEvents(notepad);
        await notepad._reset_tags();
        await notepad._reset_notes();
        await notepad._reset_note_filters();

        EXPECTED_TAGS = [
            [
                {
                  "count": 2,
                  "id": tag_ids[1],
                  "name": "два",
                },
                {
                  "count": 1,
                  "id": tag_ids[0],
                  "name": "один",
                },
                {
                  "count": 2,
                  "id": tag_ids[2],
                  "name": "три",
                },
                {
                  "count": 1,
                  "id": tag_ids[3],
                  "name": "четыре",
                },
            ],
        ];
        EXPECTED_NOTES = [
            [
                {
                    "creation_time": 1000000002,
                    "id": note_ids[2],
                    "tags": [
                        tag_ids[2],
                        tag_ids[3],
                    ],
                    "text": "запись 3",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1000000001,
                    "id": note_ids[1],
                    "tags": [
                        tag_ids[1],
                        tag_ids[2],
                    ],
                    "text": "запись 2",
                    "text_highlighted": undefined,
                },
                {
                    "creation_time": 1000000000,
                    "id": note_ids[0],
                    "tags": [
                        tag_ids[1],
                        tag_ids[0],
                    ],
                    "text": "запись 1",
                    "text_highlighted": undefined,
                },
            ],     
        ];
        EXPECTED_NOTE_FILTERS = [
            [
                {
                    "deletable": false,
                    "id": "internal_all",
                    "name": "Все",
                    "tags": [],
                },
                {
                    "deletable": true,
                    "id": notefilter_ids[0],
                    "name": "раздел 1",
                    "tags": [
                        tag_ids[0],
                        tag_ids[1],
                        tag_ids[2],
                    ],
                },
                {
                    "deletable": true,
                    "id": notefilter_ids[1],
                    "name": "раздел 2",
                    "tags": [
                        tag_ids[1],
                        tag_ids[2],
                        tag_ids[3],
                    ],
                },
            ],
        ];

        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);

        await notepad.close();
        notepad = null;
    });

    it("pin test", async function() {
        this.timeout(60000);
        let result = await notepads_list.set_pin_secret(
            notepad_id, "1234", ENCRYPTED_NOTEPAD_OPTIONS.secret
        );
        assert.equal(result, true);

        let secret_info = {
            method: "pin",
            value: "1234",
        };
        let secret = await notepads_list.process_secret(secret_info, notepad_id);

        let options = {
            encrypted: true,
            secret: secret,
        }
        let info = await notepads_list.open(notepad_id, options);
        assert.notEqual(_.isString(info), true)
        notepad = info;

        events = new NotepadTestEvents(notepad);
        await notepad._reset_tags();
        await notepad._reset_notes();
        await notepad._reset_note_filters();

        events.assert_tags(EXPECTED_TAGS);
        events.assert_notes(EXPECTED_NOTES);
        events.assert_note_filters(EXPECTED_NOTE_FILTERS);

        await notepad.close();
    });

    it("delete notepad", async function() {
        await notepads_list.delete(notepad_id);
        notepad = null;
        notepad_id = null;
    });
});
