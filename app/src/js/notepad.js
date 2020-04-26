/* eslint no-fallthrough: "off" */
import Backbone from "backbone";
import _ from "lodash";

let indexedDB;
if(global == null) {
    indexedDB = window.indexedDB;
} else {
    indexedDB = global.indexedDB;
    var window = global;
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
                "settings",
                "note_filters",
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
            let request = indexedDB.open("a_1", 1);
            request.onerror = (event) => {
                reject(event);
            };
            // request.onversionchange = ;
            // request.onblocked = ;
            request.onupgradeneeded = function(event) { 
                let db = event.target.result;
                let store_options = { keyPath: "id", autoIncrement: true};
                let index_options = {"unique": false};
                let unique_index = {"unique": true};
                switch(event.oldVersion) {
                    case 0: {
                        let notes = db.createObjectStore("notes", store_options);
                        notes.createIndex("created_at_idx", "created_at", index_options);
                        let tags = db.createObjectStore("tags", store_options);
                        tags;
                        let tag_notes = db.createObjectStore("tag_notes", store_options);
                        tag_notes.createIndex("tag_id_idx", "tag_id", index_options);
                        tag_notes.createIndex("note_id_idx", "note_id", index_options);
                        let settings = db.createObjectStore("settings", store_options);
                        settings.createIndex("name_idx", "name", unique_index);
                        let note_filters = db.createObjectStore("note_filters", store_options);
                        note_filters;
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

    create_items_in_store(store_name, items) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readwrite");
            let store = transaction.objectStore(store_name);
            let result = [];
            for(let k = 0; k < items.length; k++) {
                let item = items[k];
                let request = store.add(item);
                request.onsuccess = function() {
                    result[k] = request.result;
                };
            }
            transaction.oncomplete = () => {
                resolve(result);
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
    }

    get_store_items_count(store_name) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let count = null;
            let request = store.count();
            request.onsuccess = function() {
                count = request.result;
            };
            transaction.oncomplete = () => {
                resolve(count);
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
    }

    get_store_items_count_using_index(store_name, index_name, value) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let index = store.index(index_name);
            let count = null;
            let request = index.count(value);
            request.onsuccess = function() {
                count = request.result;
            };
            transaction.oncomplete = () => {
                resolve(count);
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
    }

    get_store_items_count_using_index_series(store_name, index_name, values) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let index = store.index(index_name);
            let result = {};
            for(let k = 0; k < values.length; k++) {
                let value = values[k];
                (function(value) {
                    let request = index.count(value);
                    request.onsuccess = function() {
                        result[value] = request.result;
                    };        
                })(value);
            }
            transaction.oncomplete = () => {
                resolve(result);
            };
            transaction.onerror = () => {
                reject();
            }
        });
        return promise;
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

    get_item_from_store_using_index(store_name, index_name, value) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let index = store.index(index_name);
            let item = null;
            let request = index.get(value);
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

    async get_items_by_id_list(store_name, ids) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let result = [];
            for(let k = 0; k < ids.length; k++) {
                let id = ids[k];
                let request = store.get(id);
                request.onsuccess = function() {
                    result[k] = request.result;
                };
            }
            transaction.oncomplete = () => {
                resolve(result);
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

    is_note_filter_with_name_exists(name, id) {
        return this.is_item_with_name_exists_in_store("note_filters", name, id);
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

    is_tag_with_name_exists(name, id) {
        return this.is_item_with_name_exists_in_store("tags", name, id);
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

    async get_note_ids_of_tag(tag_id) {
        let tag_notes = await this.get_items_from_store_using_index(
            "tag_notes", "tag_id_idx", tag_id
        );
        return _.map(tag_notes, (item) => item.note_id);
    }

    get_items_from_store_using_index(store_name, index_name, value, count) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let index = store.index(index_name);
            let request = index.getAll(value, count);
            request.addEventListener("success", function (event) {
                resolve(event.target.result);
            });
            request.addEventListener("error", () => {
                reject();
            });
        });
        return promise;
    }

    get_item_ids_from_store(store_name) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let request = store.getAllKeys();
            request.addEventListener("success", function (event) {
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

    get_item_ids_from_store_using_index_ordered(store_name, index_name, value, asc, offset, limit) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let index = store.index(index_name);
            let order = "next";
            if(!asc) {
                order = "prev";
            }
            let result = [];
            let request = index.openCursor(value, order);
            
            let is_offset_applied = false;
            let limit_count = 0;

            request.addEventListener("success", function (event) {
                let cursor = event.target.result;
                if (cursor) {
                    if(offset != null) {
                        if(!is_offset_applied) {
                            is_offset_applied = true;
                            if(offset > 0) {
                                cursor.advance(offset);
                                return;
                            }
                        }
                    }
                    result.push(cursor.value.id);
                    if(limit != null) {
                        limit_count += 1;
                        if(limit_count >= limit) {
                            resolve(result);
                            return;
                        }
                    }
                    cursor.continue();
                }
                else {
                    resolve(result);
                }
            });
            request.addEventListener("error", () => {
                reject();
            });

        });
        return promise;
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
        this._cache = {};
    }

    async set_tags_filter(options) {
        let keys = ["sorting_asc", "name"];
        let k, key, value;
        for(k = 0; k < keys.length; k++) {
            key = keys[k];
            value = options[key];
            if(value != null) {
                this._filter.tags[key] = value;
            }
        }
        await this._reset_tags();
    }

    async set_notes_filter(options) {
        let keys = ["sorting_asc", "text", "tags"];
        let k, key, value;
        for(k = 0; k < keys.length; k++) {
            key = keys[k];
            value = options[key];
            if(value != null) {
                this._filter.notes[key] = value;
            }
        }
        await this._reset_notes();
    }

    get_tags_filter() {
        return _.cloneDeep(this._filter.tags);
    }

    get_notes_filter() {
        return _.cloneDeep(this._filter.notes);
    }

    async create() {
        if(!this._working) {
            let options = {
                with_password: false,
                password: null,
            };
            this._storage.set_options(options);
            this._reset_filter();
            await this._reset_state();
            this._set_working(true);
            return true;
        } else {
            return false;
        }
    }

    async sync() {
        this._reset_filter();
        await this._load_data();
        await this._reset_state();
        this._set_working(this._working);
    }

    _set_working(state) {
        this._working = state;
        this.trigger("working", this._working);
    }

    async _load_data() {
        let info = await this._storage.get_item_from_store_using_index(
            "settings", "name_idx", "info"
        );
        if(info == null) {
            this._working = false;
        } else{
            this._state.info = info;
            this._working = true;    
        }
    }

    tag_note_key(tag_id, note_id) {
        return tag_id + "_" + note_id;
    }

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

        this._state.tags.items = await this._filter_tags();
        this.trigger("reset_tags", await this._wrap_tags(this._state.tags.items));
        this.trigger("all_tags", _.sortBy(_.values(this._state.tags.all_items), "name"));
    }

    async _filter_tags() {
        let tags = await this.get_tags_from_cache();
        this._state.tags.all_items = tags;

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

    async get_tags_from_cache() {
        await this.refresh_tags_cache();
        return this._cache.tags.list;
    }

    async get_tags_map_from_cache() {
        await this.refresh_tags_cache();
        return this._cache.tags.items_map;
    }

    async refresh_tags_cache() {
        if(this._cache.tags == null) {
            let list = await this._storage.get_items_from_store("tags");
            let map = {};
            _.forEach(list, (item) => {map[item.id] = item;});
            this._cache.tags = {
                list: list,
                items_map: map,
            }
        }
    }

    invalidate_tags_cache() {
        this._cache.tags = null;
    }

    async _wrap_tags(items) {
        window.console.time("_wrap_tags");
        let result = [];
        for(let index = 0; index < items.length; index++) {
            let item = items[index];
            let count = await this._storage.get_store_items_count_using_index(
                "tag_notes", "tag_id_idx", item.id
            )
            result.push({
                id: item.id,
                name: item.name,
                count: count,
            });
        }
        window.console.timeEnd("_wrap_tags");
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
        await this._filter_notes();
    }

    async _filter_notes() {
        window.console.time("_filter_notes");
        let note_ids = await this.get_notes_sorted_ids_from_cache();
        let notes_map = await this.get_notes_map_from_cache();

        if(!this._filter.notes.sorting_asc) {
            note_ids.reverse();
        }

        if(this._filter.notes.tags.length > 0) {
            let promises = [];
            for(let k = 0; k < this._filter.notes.tags.length; k++) {
                let tag = this._filter.notes.tags[k];
                promises.push(this._storage.get_note_ids_of_tag(tag));
            }
            let list_of_note_ids = await Promise.all(promises);
            for(let k = 0; k < list_of_note_ids.length; k++) {
                let filter_note_ids = list_of_note_ids[k];
                note_ids = _.intersection(note_ids, filter_note_ids);
            }
        }

        if(this._filter.notes.text != "") {
            note_ids = _.filter(note_ids, (note_id) => {
                let note = notes_map[note_id];
                return note.text.indexOf(this._filter.notes.text) >= 0;
            });
        }

        let notes_total_count;
        let note_ids_for_show;
        notes_total_count = await note_ids.length;

        let notes_show_count = this._configuration.notes_per_page;
        if(notes_total_count < notes_show_count) {
            notes_show_count = notes_total_count;
        }

        note_ids_for_show = note_ids.slice(0, notes_show_count);

        this._state.notes.ids = note_ids;
        this._state.notes.items_map = notes_map;
        this._state.notes.total_count = notes_total_count;
        this._state.notes.items_shown_count = notes_show_count;

        let notes_for_show = _.map(note_ids_for_show, (note_id) => {
            return notes_map[note_id];
        });
        window.console.timeEnd("_filter_notes");

        this.trigger("reset_notes", await this._wrap_notes(notes_for_show));
        this.trigger("reset_notes_count", notes_total_count);
    }

    async get_notes_sorted_ids_from_cache() {
        await this.refresh_notes_cache();
        return _.clone(this._cache.notes.ids);
    }

    async get_notes_map_from_cache() {
        await this.refresh_notes_cache();
        return this._cache.notes.map;
    }

    async refresh_notes_cache() {
        if(this._cache.notes == null) {
            let data = await Promise.all([
                this._storage.get_items_from_store("notes"),
                this._storage.get_item_ids_from_store_using_index(
                    "notes", "created_at_idx"
                )
            ])
            let notes = data[0];
            let note_ids = data[1];
            let notes_map = {};
            _.forEach(notes, (note) => {
                notes_map[note.id] = note;
            });

            this._cache.notes = {
                ids: note_ids,
                map: notes_map,
            };
        }
    }

    invalidate_cache() {
        this._cache = {};
    }

    invalidate_notes_cache() {
        this._cache.notes = null;
    }

    async load_next_notes() {
        let available_notes_count = this._state.notes.total_count - this._state.notes.items_shown_count;
        if(available_notes_count > this._configuration.notes_per_page) {
            available_notes_count = this._configuration.notes_per_page;
        }
        if(available_notes_count > 0) {
            window.console.time("load_next_notes");
            let note_ids_for_show = this._state.notes.ids.slice(
                this._state.notes.items_shown_count,
                this._state.notes.items_shown_count + available_notes_count
            );

            let notes_for_show = _.map(note_ids_for_show, (note_id) => {
                return this._state.notes.items_map[note_id];
            });
            window.console.timeEnd("load_next_notes");
    
            this._state.notes.items_shown_count += available_notes_count;
            this.trigger("append_notes", await this._wrap_notes(notes_for_show));
        }
    }

    async _wrap_notes(items) {
        window.console.time("_wrap_notes");
        let result = [];
        for(let index = 0; index < items.length; index++) {
            let item = items[index];

            let tags_map = await this.get_tags_map_from_cache();
            let tag_ids = await this._storage.get_tag_ids_of_note(item.id);
            let tags = [];
            for(let k = 0; k < tag_ids.length; k++) {
                let tag_id = tag_ids[k];
                tags.push(tags_map[tag_id]);
            }
            tags = _.orderBy(tags, "name");
            result.push({
                id: item.id,
                tags: _.map(tags, function(item) {return item.id;}),
                text: item.text,
                text_highlighted: item.text_highlighted,
                creation_time: item.created_at,
            });
        }
        window.console.timeEnd("_wrap_notes");
        return result;
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

    start_updates() {
        this._schedule_tags_update = false;
        this._schedule_notes_update = false;
        this._schedule_note_filters_update = false;
        this._updates_state = "pending";
    }

    async end_updates() {
        this._updates_state = "execute";
        await this._reset_state();
        this._updates_state = null;
    }

    async import(objects) {
        if(!this._working) {
            this.invalidate_cache();
            let sorted = this.sort_import_objects(objects);
            // TODO validate
            let maps = await this.create_objects(sorted);
            await this.sync();
            return maps;
        } else {
            return false;
        }
    }

    sort_import_objects(objects) {
        let sorted = {
            settings: {},
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
            settings: {},
            notes: {},
            tags: {},
            tag_notes: {},
        };
        // TODO create INFO
        let keys;
        keys = _.keys(sorted.settings);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let setting = sorted.settings[key];
            maps.settings[key] = await this._storage.create_item_in_store("settings", setting);
        }
        keys = _.keys(sorted.notes);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let note = sorted.notes[key];
            maps.notes[key] = await this._storage.create_item_in_store("notes", note);
        }
        keys = _.keys(sorted.tags);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let tag = sorted.tags[key];
            maps.tags[key] = await this._storage.create_item_in_store("tags", tag);
        }
        keys = _.keys(sorted.tag_notes);
        for(let k = 0; k < keys.length; k++) {
            let key = keys[k];
            let tag_note = sorted.tag_notes[key];
            tag_note = {
                "tag_id": maps.tags[tag_note.tag_id],
                "note_id": maps.notes[tag_note.note_id],
            };
            maps.tag_notes[key] = await this._storage.create_item_in_store(
                "tag_notes", tag_note
            );
        }
        for(let k = 0; k < sorted.note_filters.length; k++) {
            let note_filter = sorted.note_filters[k];
            let mapped_tag_ids = _.map(note_filter.tags, (id) => maps.tags[id]);
            note_filter = {
                name: note_filter.name,
                tags: mapped_tag_ids,
            };
            await this.create_item_in_store("note_filters", note_filter);
        }
        return maps;
    }

    async export() {
        let result = [];
        // TODO export info
        let STORE_NAMES = [
            ["settings", "setting"],
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

    async is_tag_with_name_exists(name, current_tag_id) {
        let exists = await this._storage.is_tag_with_name_exists(name, current_tag_id);
        return exists;
    }

    async create_tag(name) {
        this.invalidate_tags_cache();
        let is_exists = await this.is_tag_with_name_exists(name);
        if(is_exists) {
            throw new Error("tag with name '" + name + "' exists");
        }

        let tag = {
            "name": name,
        };
        let tag_id = await this._storage.create_item_in_store("tags", tag);
        await this._reset_tags();
        return tag_id;
    }

    async edit_tag(id, name) {
        this.invalidate_tags_cache();
        let is_exists = await this.is_tag_with_name_exists(name, id);
        if(is_exists) {
            throw new Error("tag with name '" + name + "' exists");
        }
        
        let new_values = {"name": name};
        await this._storage.edit_item_in_store("tags", id, new_values);
        await this._reset_tags();
    }

    async delete_tag(id) {
        this.invalidate_tags_cache();
        await this._storage.delete_item_in_store("tags", id);
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
        await this._storage.delete_item_in_store("tag_notes", tag_note_id);
    }

    async create_note_filter(name, tags) {
        let note_filter = {
            "name": name,
            "tags": _.cloneDeep(tags),
        };
        let filter_id = await this._storage.create_item_in_store("note_filters", note_filter);
        await this._reset_note_filters();
        return filter_id;
    }

    async delete_note_filter(note_filter_id) {
        await this._storage.delete_item_in_store("note_filters", note_filter_id);
        await this._reset_note_filters();
    }

    async edit_note_filter(note_filter_id, new_name) {
        let new_values = {"name": new_name};
        await this._storage.edit_item_in_store("note_filters", note_filter_id, new_values);
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
        let items = await this._storage.get_items_from_store("note_filters");
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
        this.invalidate_notes_cache();
        let note = {
            "text": text,
            "created_at": stamp,
        };
        let note_id = await this._storage.create_item_in_store("notes", note);
        await this.apply_note_tags(note_id, tags);

        await this._reset_notes();
        await this._reset_tags();
        return note_id;
    }

    async create_tag_note(tag_id, note_id) {
        let tag_note = {
            "tag_id": tag_id,
            "note_id": note_id,
        };
        return await this._storage.create_item_in_store("tag_notes", tag_note);
    }

    async edit_note(id, text, stamp, tags) {
        this.invalidate_notes_cache();

        let new_values = {
            "text": text,
            "created_at": stamp
        };
        await this._storage.edit_item_in_store("notes", id, new_values);
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
            await this.create_tag_note(tag_id, note_id);
        }
        for(k = 0; k < deleted_tag_ids.length; k++) {
            tag_id = deleted_tag_ids[k];
            await this.delete_tag_note(tag_id, note_id);
        }
    }

    async delete_note(id) {
        this.invalidate_notes_cache();
        await this._storage.delete_item_in_store("notes", id);
        await this.apply_note_tags(id, []);
        await this._reset_notes();
        await this._reset_tags();
    }
}

export default Notepad;
