import Backbone from "backbone";
import _ from "lodash";

let indexedDB;
if(global == null) {
    indexedDB = window.indexedDB;
} else {
    indexedDB = global.indexedDB;
}

class IndexedDBStorage {
    constructor() {

    }

    set_options() {

    }

    clear() {
        let promise = new Promise((resolve, reject) => {
            let store_names = [
                "tags",
                "notes",
                "tag_notes",
                "notepads",
                "note_filters",
                "pin_codes",
            ];
            let transaction = this.db.transaction(store_names, "readwrite");
            for(let k = 0; k < store_names.length; k++) {
                let store_name = store_names[k];
                let store = transaction.objectStore(store_name);
                store.clear();
            }
            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;

    }

    init() {
        let promise = new Promise((resolve, reject) => {
            let request = indexedDB.open("notes_db", 1);
            request.onerror = (event) => {
                reject(event);
            };
            // request.onversionchange = ;
            // request.onblocked = ;
            request.onupgradeneeded = function(event) { 
                let db = event.target.result;
                switch(event.oldVersion) {
                    case 0: {
                        let store_options = { keyPath: "id", autoIncrement: true};
                        let index_options = {"unique": false};
                        let notes = db.createObjectStore("notes", store_options);
                        notes.createIndex("notepad_id_idx", "notepad_id", index_options);
                        let tags = db.createObjectStore("tags", store_options);
                        tags.createIndex("notepad_id_idx", "notepad_id", index_options);
                        let tag_notes = db.createObjectStore("tag_notes", store_options);
                        tag_notes.createIndex("tag_id_idx", "tag_id", index_options);
                        tag_notes.createIndex("note_id_idx", "note_id", index_options);
                        tag_notes.createIndex("notepad_id_idx", "notepad_id", index_options);
                        let notepads = db.createObjectStore("notepads", store_options);
                        notepads;
                        let pin_codes = db.createObjectStore("pin_codes", store_options);
                        pin_codes.createIndex("notepad_id_idx", "notepad_id", index_options);
                        let note_filters = db.createObjectStore("note_filters", store_options);
                        note_filters.createIndex("notepad_id_idx", "notepad_id", index_options);
                    }
                }
            };
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };    
        });
        return promise;
    }

    create_item_in_store(store_name, item) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readwrite");
            let store = transaction.objectStore(store_name);
            let new_id;
            let request = store.add(item);
            request.onsuccess = function() {
                new_id = request.result;
            };
            transaction.oncomplete = () => {
                resolve(new_id);
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
    }

    async create_notepad(name) {
        let notepad = {
            name: name,
        };
        return await this.create_item_in_store("notepads", notepad);
    }

    get_item_from_store(store_name, id) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let item = null;
            let request = store.get(id);
            request.onsuccess = function() {
                item = request.result;
            };
            transaction.oncomplete = () => {
                resolve(item);
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
    }

    edit_item_in_store(store_name, id, new_values) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readwrite");
            let store = transaction.objectStore(store_name);
            let item;
            let request = store.get(id);
            request.onsuccess = function() {
                item = request.result;
                _.extend(item, new_values);
                store.put(item);
            };
            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
    }

    is_item_with_name_exists_in_store(store_name, name, id) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let request = store.openCursor();
            let exists = false;

            request.onsuccess = () => {
                let cursor = request.result;
                if(cursor) {
                    let key = cursor.key;
                    let value = cursor.value;
                    if(key != id) {
                        if(value.name == name) {
                            exists = true;
                        } else {
                            cursor.continue();
                        }
                    }
                }
            };

            transaction.oncomplete = () => {
                resolve(exists);
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
    }

    delete_item_in_store(store_name, id) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readwrite");
            let store = transaction.objectStore(store_name);
            store.delete(id);
            transaction.oncomplete = () => {
                resolve();
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
    }

    create_note_filter(name, tags, notepad_id) {
        let note_filter = {
            "notepad_id": notepad_id,
            "name": name,
            "tags": _.cloneDeep(tags),
        };
        return this.create_item_in_store("note_filters", note_filter)
    }

    edit_note_filter(id, name) {
        let new_values = {"name": name};
        return this.edit_item_in_store("note_filters", id, new_values);
    }

    delete_note_filter(id) {
        return this.delete_item_in_store("note_filters", id);
    }

    get_note_filters() {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction("note_filters", "readonly");
            let note_filters = transaction.objectStore("note_filters");

            let request = note_filters.getAll();
            request.onsuccess = function() {
                if(request.result != null) {
                    resolve(request.result);
                } else {
                    reject();
                }
            };
        });
        return promise;
    }

    is_note_filter_with_name_exists(name, id) {
        return this.is_item_with_name_exists_in_store("note_filters", name, id);
    }

    create_tag(name, notepad_id) {
        let tag = {
            "notepad_id": notepad_id,
            "name": name,
        };
        return this.create_item_in_store("tags", tag);
    }

    edit_tag(id, name) {
        let new_values = {"name": name};
        return this.edit_item_in_store("tags", id, new_values);
    }

    delete_tag(id) {
        return this.delete_item_in_store("tags", id);
    }

    get_items_from_store(storage_name) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(storage_name, "readonly");
            let store = transaction.objectStore(storage_name);

            let request = store.getAll();
            request.onsuccess = function() {
                if(request.result != null) {
                    let items = request.result;
                    resolve(items);
                } else {
                    reject();
                }
            };
        });
        return promise;
    }

    get_tags() {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction("tags", "readonly");
            let store = transaction.objectStore("tags");

            let request = store.getAll();
            request.onsuccess = function() {
                if(request.result != null) {
                    let tags = request.result;
                    resolve(tags);
                } else {
                    reject();
                }
            };
        });
        return promise;
    }

    is_tag_with_name_exists(name, id) {
        return this.is_item_with_name_exists_in_store("tags", name, id);
    }

    create_note(text, stamp, notepad_id) {
        let note = {
            "text": text,
            "created_at": stamp,
            "notepad_id": notepad_id,
        };    
        return this.create_item_in_store("notes", note);
    }

    edit_note(id, text, stamp) {
        let new_values = {
            "text": text,
            "created_at": stamp
        };
        return this.edit_item_in_store("notes", id, new_values);
    }

    delete_note(id) {
        return this.delete_item_in_store("notes", id);
    }

    get_notes() {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction("notes", "readonly");
            let store = transaction.objectStore("notes");

            let request = store.getAll();
            request.onsuccess = function() {
                if(request.result != null) {
                    resolve(request.result);
                } else {
                    reject();
                }
            };
        });
        return promise;
    }

    async get_tags_of_note(note_id) {
        let result = []
        let tag_ids = await this.get_tag_ids_of_note(note_id);
        for(let k = 0; k < tag_ids.length; k++) {
            let tag_id = tag_ids[k];
            let tag = await this.get_tag_by_id(tag_id);
            result.push(tag);
        }
        return result;
    }

    get_tag_by_id(tag_id) {
        return this.get_item_from_store("tags", tag_id);
    }

    async get_tag_ids_of_note(note_id) {
        let tag_notes = await this.get_items_from_store_using_index(
            "tag_notes", "note_id_idx", note_id
        );
        return _.map(tag_notes, (item) => item.tag_id);
    }

    // get_note_ids_of_tag(tag_id) {
    //     return this.get_item_ids_from_store_using_index(
    //         "tag_notes", "tag_id_idx", tag_id
    //     );
    // }

    get_items_from_store_using_index(store_name, index_name, value) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let index = store.index(index_name);
            let request = index.getAll(value);
            request.addEventListener("success", function (event) {
                // console.log("From index:", event.target.result);
                resolve(event.target.result);
            });
            request.addEventListener("error", () => {
                reject();
            });
        });
        return promise;
    }

    get_item_ids_from_store_using_index(store_name, index_name, value) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let index = store.index(index_name);
            let request = index.getAllKeys(value);
            request.addEventListener("success", function (event) {
                resolve(event.target.result);
            });
            request.addEventListener("error", () => {
                reject();
            });

        });
        return promise;
    }

    create_tag_note(tag_id, note_id, notepad_id) {
        let tag_note = {
            "tag_id": tag_id,
            "note_id": note_id,
            "notepad_id": notepad_id,
        };
        return this.create_item_in_store("tag_notes", tag_note);
    }

    delete_tag_note(tag_note_id) {
        return this.delete_item_in_store("tag_notes", tag_note_id);
    }

    async get_tag_note_id(tag_id, note_id) {
        // TODO композитные ключи?
        let by_tag_id = await this.get_item_ids_from_store_using_index(
            "tag_notes", "tag_id_idx", tag_id
        );
        let by_note_id = await this.get_item_ids_from_store_using_index(
            "tag_notes", "note_id_idx", note_id
        );
        // console.log("by_tag_id", by_tag_id);
        // console.log("by_note_id", by_note_id);

        let intersection = _.intersection(by_tag_id, by_note_id);
        // console.log("intersection", intersection);
        if(intersection.length == 1) {
            return intersection[0];
        } else {
            throw new Error("get tag_note_id error");
        }
    }
}

class Notepad {
    constructor() {
        _.extend(this, Backbone.Events);
        this._schedule_tags_update = false;
        this._schedule_notes_update = false;
        this._schedule_note_filters_update = false;
        this._updates_state = null;
        this._configuration = {
            "tags_per_page": 99999,
            "notes_per_page": 40,
        };
        this._storage = new IndexedDBStorage();
        this._reset_internal_state();
    }

    async init() {
        await this._storage.init();
    }

    _reset_internal_state() {
        this._set_working(false);
        this._password = null;
        this._state = {
            "notes": [],
            "tags": [],
        };
        this._filter = {
            "tags": {
                sorting_asc: true,
                name: "",
            },
            "notes": {
                sorting_asc: false,
                text: "",
                tags: [],
            },
        }
        this._decrypted_cache = {
            "notes": {},
            "tags": {},
        };
        // TODO проверить что все поля нужны
        this._data = {
            "notepad": null,
            "notes": {},
            "tags": {},
            "notes_of_tag": {},
            "tags_of_note": {},
            "tag_notes": {},
        };
    }

    set_tags_filter(options) {
        let keys = ["sorting_asc", "name"];
        let k, key, value;
        for(k = 0; k < keys.length; k++) {
            key = keys[k];
            value = options[key];
            if(value != null) {
                this._filter.tags[key] = value;
            }
        }
        this._reset_tags();
    }

    set_notes_filter(options) {
        let keys = ["sorting_asc", "text", "tags"];
        let k, key, value;
        for(k = 0; k < keys.length; k++) {
            key = keys[k];
            value = options[key];
            if(value != null) {
                this._filter.notes[key] = value;
            }
        }
        this._reset_notes();
    }

    get_tags_filter() {
        return _.cloneDeep(this._filter.tags);
    }

    get_notes_filter() {
        return _.cloneDeep(this._filter.notes);
    }

    async create(name) {
        if(!this._working) {
            let options = {
                with_password: false,
                password: null,
            };
            this._storage.set_options(options);
            this._reset_filter();
            this._notepad_id = await this._storage.create_notepad(name);
            // this._load_data();
            await this._reset_state();
            this._set_working(true);
            // this.unlock(password);
            return true;
        } else {
            return false;
        }
    }

    async sync(notepad_id) {
        this._notepad_id = notepad_id;
        this._reset_filter();
        await this._load_data();
        await this._reset_state();
        this._set_working(this._working);
    }

    _set_working(state) {
        this._working = state;
        this.trigger("working", this._working);
    }

    async _load_data(notepad_id) {
        let notepads = await this._storage.get_items_from_store("notepads");
        if(notepads.length > 0) {
            let notepad = notepads[0];
            this._notepad_id = notepad.id;
            this._working = true;
        }
        notepad_id;
    }

    register_notepad(object) {
        if(this._data.notepad == null) {
            this._data.notepad = object;
        } else {
            throw new Error("найден еще один объект notepad");
        }
        this._working = true;
    }

    // register_tag(object) {
    //     let key = object.id;
    //     this._data.tags[key] = object;
    //     // при начальной регистрации информация о взаимосвязи может прийти
    //     // раньше и тогда перетрется ее кеш
    //     if (this._data.notes_of_tag[key] == null) {
    //         this._data.notes_of_tag[key] = {};
    //     }
    // }

    // register_note(object) {
    //     let key = object.id;
    //     this._data.notes[key] = object;
    //     // при начальной регистрации информация о взаимосвязи может прийти
    //     // раньше и тогда перетрется ее кеш
    //     if (this._data.tags_of_note[key] == null) {
    //         this._data.tags_of_note[key] = {};
    //     }
    // }

    tag_note_key(tag_id, note_id) {
        return tag_id + "_" + note_id;
    }

    // register_tag_note(object) {
    //     let tag_note_key = this.tag_note_key(object.tag_id, object.note_id);
    //     let note_ids, tag_ids;

    //     this._data.tag_notes[tag_note_key] = object;

    //     note_ids = this._data.notes_of_tag[object.tag_id];
    //     if(note_ids == null) {
    //         note_ids = {};
    //         this._data.notes_of_tag[object.tag_id] = note_ids;
    //     }
    //     note_ids[object.note_id] = true;

    //     tag_ids = this._data.tags_of_note[object.note_id];
    //     if(tag_ids == null) {
    //         tag_ids = {};
    //         this._data.tags_of_note[object.note_id] = tag_ids;
    //     }
    //     tag_ids[object.tag_id] = true;
    // }
    
    _reset_filter() {
        this._filter.tags.sorting_asc = true;
        this._filter.tags.name = "";
        this._filter.notes.sorting_asc = false;
        this._filter.notes.text = "";
        this._filter.notes.tags.splice(0, this._filter.notes.tags.length);
        let data = _.cloneDeep(this._filter);
        this.trigger("reset_filter", data);
    }

    async _reset_state() {
        await this._reset_tags();
        await this._reset_notes();
        await this._reset_note_filters();
    }

    async _reset_tags() {
        if(this._updates_state == "pending") {
            this._schedule_tags_update = true;
            return
        } else if(this._updates_state == "execute") {
            if(this._schedule_tags_update) {
                this._schedule_tags_update = false;
            } else {
                return;
            }
        }

        let items_for_show_count = this._configuration.tags_per_page;
        let items_for_show;
        this._state.tags.items = await this._filter_tags();
        if(items_for_show_count < this._state.tags.length) {
            items_for_show_count = this._state.tags.length;
        }
        this._state.tags.items_shown_count = items_for_show_count;
        items_for_show = this._state.tags.items.slice(0, items_for_show_count);
        this.trigger("reset_tags", await this._wrap_tags(items_for_show));
        this.trigger("all_tags", _.sortBy(_.values(this._state.tags.items), "name"));
    }

    start_updates() {
        this._schedule_tags_update = false;
        this._schedule_notes_update = false;
        this._schedule_note_filters_update = false;
        this._updates_state = "pending";
    }

    end_updates() {
        this._updates_state = "execute";
        this._reset_state();
        this._updates_state = null;
    }

    async _wrap_tags(items) {
        let result = [];
        for(let index = 0; index < items.length; index++) {
            let item = items[index];
            let notes_of_tag = await this._storage.get_items_from_store_using_index(
                "tag_notes", "tag_id_idx", item.id
            );
            result.push({
                id: item.id,
                name: item.name,
                count: notes_of_tag.length,
            });
        }
        return result;
    }

    async _reset_notes() {
        if(this._updates_state == "pending") {
            this._schedule_notes_update = true;
            return
        } else if(this._updates_state == "execute") {
            if(this._schedule_notes_update) {
                this._schedule_notes_update = false;
            } else {
                return;
            }
        }
        
        let items_for_show_count = this._configuration.notes_per_page;
        let items_for_show;
        this._state.notes.items = await this._filter_notes();
        if(this._state.notes.items.length < items_for_show_count) {
            items_for_show_count = this._state.notes.items.length;
        }
        this._state.notes.items_shown_count = items_for_show_count;
        items_for_show = this._state.notes.items.slice(0, items_for_show_count);
        this.trigger("reset_notes", await this._wrap_notes(items_for_show));
        this.trigger("reset_notes_count", this._state.notes.items.length);
    }

    async load_next_notes() {
        let available_notes_count = this._state.notes.items.length - this._state.notes.items_shown_count;
        if(available_notes_count > this._configuration.notes_per_page) {
            available_notes_count = this._configuration.notes_per_page;
        }
        if(available_notes_count > 0) {
            let items_for_show;
            items_for_show = this._state.notes.items.slice(
                this._state.notes.items_shown_count, 
                this._state.notes.items_shown_count + available_notes_count
            );
            this._state.notes.items_shown_count += available_notes_count;
            this.trigger("append_notes", await this._wrap_notes(items_for_show));
        }
    }

    async _wrap_notes(items) {
        let result = [];
        for(let index = 0; index < items.length; index++) {
            let item = items[index];

            let tags = await this._storage.get_tags_of_note(item.id);
            tags = _.orderBy(tags, "name");
            result.push({
                id: item.id,
                tags: _.map(tags, function(item) {return item.id;}),
                text: item.text,
                text_highlighted: item.text_highlighted,
                creation_time: item.created_at,
            });
        }
        return result;
    }

    async _filter_tags() {
        let tags = await this._storage.get_tags();

        // TODO сделать тесты и выделить в функцию
        if(this._filter.tags.name != "") {
            tags = _.filter(
                tags,
                function(tag) {
                    return tag.name.indexOf(this._filter.tags.name) >= 0
                }.bind(this)
            );
        }

        // TODO сделать тесты и выделить в функцию
        let order;
        if(this._filter.tags.sorting_asc) {
            order = ["asc"];
        } else {
            order = ["desc"];
        }
        tags = _.orderBy(tags, ["name"], order);

        return tags;
    }

    async _filter_notes() {
        let notes = await this._storage.get_notes();

        // TODO сделать тесты и выделить в функцию
        if(this._filter.notes.text != "") {
            notes = _.filter(
                notes,
                function(note) {
                    return note.text.indexOf(this._filter.notes.text) >= 0
                }.bind(this)
            )
        }

        // TODO сделать фильтр при помощи storage
        // if(this._filter.notes.tags.length > 0) {
        //     for(let k = 0; k < this._filter.notes.tags.length; k++) {
        //         let tag = this._filter.notes.tags[k];
        //         if(tag) {
        //             let note_ids = this._data.notes_of_tag[tag];
        //             notes = _.filter(
        //                 notes,
        //                 function(note) {
        //                     return note_ids[note.id] === true
        //                 }
        //             );
        //         }
        //     }
        // }

        // TODO сделать тесты и выделить в функцию
        let order;
        if(this._filter.notes.sorting_asc) {
            order = ["asc"];
        } else {
            order = ["desc"];
        }
        notes = _.orderBy(notes, ["created_at"], order);

        return notes;
    }

    async close() {
        if(this._working) {
            this._reset_internal_state();
            await this._storage.clear();
            await this._reset_state();
            return true;    
        } else {
            return false;
        }
    }

    // open_notepad() {

    // }

    async import(objects) {
        if(!this._working) {
            let sorted = this.sort_import_objects(objects);
            // TODO validate
            let maps = await this.create_objects(sorted);
            await this.sync(sorted.notepad);
            return maps;
        } else {
            return false;
        }
    }

    sort_import_objects(objects) {
        let sorted = {
            notepad: null,
            notes: {},
            tags: {},
            tag_notes: {},
            note_filters: [],
        }
        let keys = _.keys(objects);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let object = _.cloneDeep(objects[key]);
            let object_type = object.type;
            delete object.type;
            switch(object_type) {
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
                    sorted.note_filters.push(object);
                    break;
                default:
                    // console.error("неизвестный тип объекта", object);
                    break;
            }
        }
        return sorted;
    }

    async create_objects(sorted) {
        let maps = {
            notepad: null,
            notes: {},
            tags: {},
            tag_notes: {},
        };
        maps.notepad = await this._storage.create_notepad(sorted.notepad.name);
        let keys;
        keys = _.keys(sorted.notes);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let note = sorted.notes[key];
            maps.notes[key] = await this._storage.create_note(note.text, note.created_at, maps.notepad);
        }
        keys = _.keys(sorted.tags);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let tag = sorted.tags[key];
            maps.tags[key] = await this._storage.create_tag(tag.name, maps.notepad);
        }
        keys = _.keys(sorted.tag_notes);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let tag_note = sorted.tag_notes[key];
            maps.tag_notes[key] = await this._storage.create_tag_note(
                maps.tags[tag_note.tag_id],
                maps.notes[tag_note.note_id],
                maps.notepad
            );
        }
        for(let k = 0; k < sorted.note_filters.length; k++) {
            let note_filter = sorted.note_filters[k];
            await this._storage.create_note_filter(
                note_filter.name,
                _.map(note_filter.tags, (id) => maps.tags[id]),
                maps.notepad
            );
        }
        return maps;
    }

    async export() {
        let result = [];
        let STORE_NAMES = [
            ["notepads", "notepad"],
            ["tags", "tag"],
            ["notes", "note"],
            ["tag_notes", "tag_note"],
            ["note_filters", "note_filter"],
        ];
        for(let i = 0; i < STORE_NAMES.length; i++) {
            let store_name = STORE_NAMES[i][0];
            let type = STORE_NAMES[i][1];
            let items = await this._storage.get_items_from_store(store_name);
            for(let k = 0; k < items.length; k++) {
                let item = items[k];
                item.type = type;
                result.push(item);
            }
        }
        return result;
    }

    // save_notepad() {

    // }

    lock() {
        this._password = null;
        // удаляем все расшифрованные данные и удаляем ключ
    }

    unlock(password) {
        // сохраняем ключ, выполняем расшифровку необходимых данных
        // и формируем начальное состоянин

        this._password = password;
    }

    async is_tag_with_name_exists(name, current_tag_id) {
        let exists = await this._storage.is_tag_with_name_exists(name, current_tag_id);
        return exists;
    }

    async create_tag(name) {
        let is_exists = await this.is_tag_with_name_exists(name);
        if(is_exists) {
            throw new Error("tag with name '" + name + "' exists");
        }
        let tag_id = await this._storage.create_tag(name, this._notepad_id);
        await this._reset_tags();
        return tag_id;
    }

    async edit_tag(id, name) {
        let is_exists = await this.is_tag_with_name_exists(name, id);
        if(is_exists) {
            throw new Error("tag with name '" + name + "' exists");
        }
        await this._storage.edit_tag(id, name);
        await this._reset_tags();
    }

    async delete_tag(id) {
        await this._storage.delete_tag(id);
        // TODO в единую транзаецию
        let tag_note_ids = await this._storage.get_item_ids_from_store_using_index(
            "tag_notes", "tag_id_idx", id
        );
        for(let k = 0; k < tag_note_ids.length; k++) {
            let tag_note_id = tag_note_ids[k];
            await this._storage.delete_item_in_store("tag_notes", tag_note_id);
        }

        await this._reset_tags();
        await this._reset_notes();
    }

    async delete_tag_note(tag_id, note_id) {
        let tag_note_id = await this._storage.get_tag_note_id(tag_id, note_id);
        await this._storage.delete_tag_note(tag_note_id);
    }

    // list_tags(from, count) {

    // }

    async create_note_filter(name, tags) {
        let filter_id = await this._storage.create_note_filter(
            name, tags, this._notepad_id
        );
        await this._reset_note_filters();
        return filter_id;
    }

    async delete_note_filter(note_filter_id) {
        await this._storage.delete_note_filter(note_filter_id);
        await this._reset_note_filters();
    }

    async edit_note_filter(note_filter_id, new_name) {
        await this._storage.edit_note_filter(note_filter_id, new_name);
        await this._reset_note_filters();
    }

    async _reset_note_filters() {
        if(this._updates_state == "pending") {
            this._schedule_note_filters_update = true;
            return
        } else if(this._updates_state == "execute") {
            if(this._schedule_note_filters_update) {
                this._schedule_note_filters_update = false;
            } else {
                return;
            }
        }        

        let all_items = {
            id: "internal_all",
            name: "Все",
            deletable: false,
            tags: [],
        };
        let items = await this._storage.get_note_filters();
        _.forEach(items, (item) => {
            item.deletable = true;
        })
        items.unshift(all_items);
        this.trigger("reset_note_filters", items);
    }

    async is_note_filter_with_name_exists(name, current_id) {
        let exists = await this._storage.is_note_filter_with_name_exists(
            name, current_id
        );
        return exists;
    }

    async create_note(text, stamp, tags) {
        let note_id = await this._storage.create_note(text, stamp, this._notepad_id);
        await this.apply_note_tags(note_id, tags);

        await this._reset_notes();
        await this._reset_tags();
        return note_id;
    }

    async create_tag_note(tag_id, note_id, notepad_id) {
        await this._storage.create_tag_note(tag_id, note_id, notepad_id);
    }

    async edit_note(id, text, stamp, tags) {
        await this._storage.edit_note(id, text, stamp);
        await this.apply_note_tags(id, tags);
        await this._reset_notes();
        await this._reset_tags();
    }

    async apply_note_tags(note_id, tag_ids) {
        let old_tag_ids = await this._storage.get_tag_ids_of_note(note_id);

        let new_tag_ids = _.difference(tag_ids, old_tag_ids);
        let deleted_tag_ids = _.difference(old_tag_ids, tag_ids);

        let k, tag_id;
        for(k = 0; k < new_tag_ids.length; k++) {
            tag_id = new_tag_ids[k];
            await this.create_tag_note(tag_id, note_id, this._notepad_id);
        }
        for(k = 0; k < deleted_tag_ids.length; k++) {
            tag_id = deleted_tag_ids[k];
            await this.delete_tag_note(tag_id, note_id);
        }
    }

    async delete_note(id) {
        await this._storage.delete_note(id);
        await this.apply_note_tags(id, []);
        await this._reset_notes();
        await this._reset_tags();
    }

    // list_notes(from, count) {

    // }
}

export default Notepad;
