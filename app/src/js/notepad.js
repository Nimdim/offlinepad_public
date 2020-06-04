/* eslint no-fallthrough: "off" */
import Backbone from "backbone";
import _ from "lodash";
import IndexedDBStorage from "./indexeddb_storage.js";

if(global != null) {
    var window = global;
    window;
}

class NotepadStorage extends IndexedDBStorage {
    constructor() {
        super()
        this.DB_VERSION = 1;
    }
    
    _upgrade_needed(event) {
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
    }
}

class Notepad {
    constructor() {
        _.extend(this, Backbone.Events);
        this._configuration = {
            "notes_per_page": 40,
        };
        this._reset_internal_state();
    }

    _reset_internal_state() {
        this._storage = null;

        this._working = false;
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

    async create(db_name, name, options) {
        //  Аргументы:
        //  db_name - название БД
        //  name - название блокнота
        //  options - настройки блокнота
        //    encrypted - зашифрован true/false
        //    secret - ключ шифрования (если зашифрован)
        
        if(!this._working) {
            this._storage = new NotepadStorage();
            await this._storage.init(db_name, options);
            await this.create_notepad_info(name, options.encrypted);
            this._reset_info();
            this._reset_filter();
            // await this._reset_state();
            this._working = true;
            return true;
        } else {
            return false;
        }
    }

    async create_empty(db_name, options) {
        /* Аргументы
           db_name - название БД
           name - название блокнота
           options - настройки блокнота
             encrypted - зашифрован true/false
             key - ключ шифрования (если зашифрован)
        */
        if(!this._working) {
            this._storage = new NotepadStorage();
            await this._storage.init(db_name, options);
            this._working = true;
            // return true;
        }
        //  else {
        //     // return false;
        // }
    }

    async create_notepad_info(name, encrypted) {
        let info = {
            name: "info",
            notepad_name: name,
            encrypted: encrypted,
            schema_type: "beta",
        };
        if(encrypted) {
            info.secret_check = "secret check";
        }
        await this._storage.create_item_in_store("settings", info);
        this._state.info = info;
    }


    async sync(db_name, options) {
        if(!this._working) {
            this._storage = new NotepadStorage();
            await this._storage.init(db_name, options);

            let info = await this._storage.get_item_from_store_using_index(
                "settings", "name_idx", "info"
            );
            if(info != null) {
                if(info.encrypted) {
                    if(options.secret == null) {
                        return "secret required";
                    }
                    if(info.secret_check != "secret check") {
                        return "wrong secret";
                    }
                }
                this._state.info = info;
                this._reset_info();
                this._reset_filter();
                this._working = true;    
                return true;
            } else {
                return "no notepad info";
            }
        } else {
            return "already working";
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

    _reset_info() {
        this.trigger("reset_info", this._state.info);
    }

    _clear() {
        this.trigger("reset_tags", []);
        this.trigger("reset_notes", []);
        this.trigger("reset_note_filters", []);
    }

    async _reset_tags() {
        this._state.tags.items = await this._filter_tags();
        this.trigger("reset_tags", await this._wrap_tags(this._state.tags.items));
    }

    async _filter_tags() {
        let tags = await this.get_tags_from_cache();

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
        return result;
    }

    async _reset_notes() {
        await this._filter_notes();
    }

    async _filter_notes() {
        let tags = await this.get_tags_from_cache();
        this.trigger("all_tags", _.sortBy(_.values(tags), "name"));
    
        let note_ids = await this.get_notes_sorted_ids_from_cache();
        let notes_map = await this.get_notes_map_from_cache();

        if(!this._filter.notes.sorting_asc) {
            note_ids.reverse();
        }

        if(this._filter.notes.tags.length > 0) {
            let promises = [];
            for(let k = 0; k < this._filter.notes.tags.length; k++) {
                let tag = this._filter.notes.tags[k];
                promises.push(this.get_note_ids_of_tag(tag));
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

        this.trigger("reset_notes", await this._wrap_notes(notes_for_show));
        this.trigger("reset_notes_count", notes_total_count);
    }

    async get_note_ids_of_tag(tag_id) {
        let tag_notes = await this._storage.get_items_from_store_using_index(
            "tag_notes", "tag_id_idx", tag_id
        );
        return _.map(tag_notes, (item) => item.note_id);
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
            let note_ids_for_show = this._state.notes.ids.slice(
                this._state.notes.items_shown_count,
                this._state.notes.items_shown_count + available_notes_count
            );

            let notes_for_show = _.map(note_ids_for_show, (note_id) => {
                return this._state.notes.items_map[note_id];
            });
    
            this._state.notes.items_shown_count += available_notes_count;
            this.trigger("append_notes", await this._wrap_notes(notes_for_show));
        }
    }

    async _wrap_notes(items) {
        let result = [];
        let tags_map = await this.get_tags_map_from_cache();
        for(let index = 0; index < items.length; index++) {
            let item = items[index];

            let tag_ids = await this.get_tag_ids_of_note(item.id);
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
        return result;
    }

    async close() {
        if(this._working) {
            this._storage.close();
            this._reset_internal_state();
            this._clear();
            this._working = false;
            return true;    
        } else {
            return false;
        }
    }

    async export(disable_decryption) {
        let result = [];
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
            let items = await this._storage.get_items_from_store(store_name, disable_decryption);
            for(let k = 0; k < items.length; k++) {
                let item = items[k];
                item.type = type;
                if(item.type == "setting" && item.name == "info") {
                    if(item.encrypted) {
                        if(!disable_decryption) {
                            item.encrypted = false;
                        }
                    }
                }
                result.push(item);
            }
        }
        return result;
    }

    async is_tag_with_name_exists(name, current_tag_id) {
        let exists = await this._storage.is_item_with_name_exists_in_store(
            "tags", name, current_tag_id
        );
        return exists;
    }

    async create_tag(name) {
        if(name == "") {
            throw new Error("tag must have name");
        }
        let is_exists = await this.is_tag_with_name_exists(name);
        if(is_exists) {
            throw new Error("tag with name '" + name + "' exists");
        }

        this.invalidate_tags_cache();

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
    }

    async delete_tag_note(tag_id, note_id) {
        let tag_note_id = await this.get_tag_note_id(tag_id, note_id);
        await this._storage.delete_item_in_store("tag_notes", tag_note_id);
    }

    async get_tag_note_id(tag_id, note_id) {
        // TODO композитные ключи?
        let by_tag_id = await this._storage.get_item_ids_from_store_using_index(
            "tag_notes", "tag_id_idx", tag_id
        );
        let by_note_id = await this._storage.get_item_ids_from_store_using_index(
            "tag_notes", "note_id_idx", note_id
        );

        let intersection = _.intersection(by_tag_id, by_note_id);
        if(intersection.length == 1) {
            return intersection[0];
        } else {
            throw new Error("get tag_note_id error");
        }
    }


    async create_note_filter(name, tags) {
        if(name == "") {
            throw new Error("name must not be empty");
        }

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
        let exists = await this._storage.is_item_with_name_exists_in_store(
            "note_filters", name, current_id
        );
        return exists;
    }

    async create_note(text, stamp, tags) {
        if(text == "") {
            throw new Error("Note text must not be empty");
        }

        this.invalidate_notes_cache();

        let note = {
            "text": text,
            "created_at": stamp,
        };
        let note_id = await this._storage.create_item_in_store("notes", note);
        await this.apply_note_tags(note_id, tags);

        await this._reset_notes();
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
    }

    async apply_note_tags(note_id, tag_ids) {
        let old_tag_ids = await this.get_tag_ids_of_note(note_id);

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
    }

    async get_tag_ids_of_note(note_id) {
        let tag_notes = await this._storage.get_items_from_store_using_index(
            "tag_notes", "note_id_idx", note_id
        );
        return _.map(tag_notes, (item) => item.tag_id);
    }
}

export default Notepad;
