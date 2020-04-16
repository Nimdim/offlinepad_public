import Backbone from "backbone";
import _ from "lodash";

class Notepad {
    constructor(storage) {
        this._schedule_tags_update = false;
        this._schedule_notes_update = false;
        this._schedule_note_filters_update = false;
        this._updates_state = null;

        _.extend(this, Backbone.Events);
        this._configuration = {
            "tags_per_page": 99999,
            "notes_per_page": 40,
        };
        this._storage = storage;
        this._reset_internal_state();
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
        this._data = {
            "notepad": null,
            "notes": {},
            "tags": {},
            "notes_of_tag": {},
            "tags_of_note": {},
            "tag_notes": {},
            "note_filters": {},
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

    create() {
        if(!this._working) {
            let options = {
                with_password: false,
                password: null,
            };
            this._storage.set_options(options);
            this._reset_filter();
            this._load_data();
            this._reset_state();
            this._set_working(true);
            // this.unlock(password);
            return true;
        } else {
            return false;
        }
    }

    sync() {
        this._reset_filter();
        this._load_data();
        this._reset_state();
        this._set_working(this._working);
    }

    _set_working(state) {
        this._working = state;
        this.trigger("working", this._working);
    }

    _load_data() {
        let reader = function(object) {
            switch(object.type) {
                case "notepad":
                    this.register_notepad(object);
                    break;
                case "tag":
                    this.register_tag(object);
                    break;
                case "note":
                    this.register_note(object);
                    break;
                case "tag_note":
                    this.register_tag_note(object);
                    break;
                case "note_filter":
                    this.register_note_filter(object);
                    break;
                default:
                    // console.error("неизвестный тип объекта", object);
                    break;
            }
        }.bind(this);
        this._storage.iterate(reader);
    }

    register_notepad(object) {
        if(this._data.notepad == null) {
            this._data.notepad = object;
        } else {
            throw new Error("найден еще один объект notepad");
        }
        this._working = true;
    }

    register_tag(object) {
        let key = object.id;
        this._data.tags[key] = object;
        // при начальной регистрации информация о взаимосвязи может прийти
        // раньше и тогда перетрется ее кеш
        if (this._data.notes_of_tag[key] == null) {
            this._data.notes_of_tag[key] = {};
        }
    }

    register_note(object) {
        let key = object.id;
        this._data.notes[key] = object;
        // при начальной регистрации информация о взаимосвязи может прийти
        // раньше и тогда перетрется ее кеш
        if (this._data.tags_of_note[key] == null) {
            this._data.tags_of_note[key] = {};
        }

    }

    tag_note_key(tag_id, note_id) {
        return tag_id + "_" + note_id;
    }

    register_tag_note(object) {
        let tag_note_key = this.tag_note_key(object.tag_id, object.note_id);
        let note_ids, tag_ids;

        this._data.tag_notes[tag_note_key] = object;

        note_ids = this._data.notes_of_tag[object.tag_id];
        if(note_ids == null) {
            note_ids = {};
            this._data.notes_of_tag[object.tag_id] = note_ids;
        }
        note_ids[object.note_id] = true;

        tag_ids = this._data.tags_of_note[object.note_id];
        if(tag_ids == null) {
            tag_ids = {};
            this._data.tags_of_note[object.note_id] = tag_ids;
        }
        tag_ids[object.tag_id] = true;
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

    _reset_state() {
        this._reset_tags();
        this._reset_notes();
        this._reset_note_filters();
    }

    _reset_tags() {
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
        this._state.tags.items = this._filter_tags();
        if(items_for_show_count < this._state.tags.length) {
            items_for_show_count = this._state.tags.length;
        }
        this._state.tags.items_shown_count = items_for_show_count;
        items_for_show = this._state.tags.items.slice(0, items_for_show_count);
        this.trigger("reset_tags", this._wrap_tags(items_for_show));
        this.trigger("all_tags", _.sortBy(_.values(this._data.tags), "name"));
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

    _wrap_tags(items) {
        let result = [];
        for(let index = 0; index < items.length; index++) {
            let item = items[index];
            result.push({
                id: item.id,
                name: item.name,
                count: _.keys(this._data.notes_of_tag[item.id]).length,
            });
        }
        return result;
    }

    _reset_notes() {
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
        this._state.notes.items = this._filter_notes();
        if(this._state.notes.items.length < items_for_show_count) {
            items_for_show_count = this._state.notes.items.length;
        }
        this._state.notes.items_shown_count = items_for_show_count;
        items_for_show = this._state.notes.items.slice(0, items_for_show_count);
        this.trigger("reset_notes", this._wrap_notes(items_for_show));
        this.trigger("reset_notes_count", this._state.notes.items.length);
    }

    load_next_notes() {
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
            this.trigger("append_notes", this._wrap_notes(items_for_show));
        }
    }

    _wrap_notes(items) {
        let result = [];
        for(let index = 0; index < items.length; index++) {
            let item = items[index];
            let tags = _.keys(this._data.tags_of_note[item.id]);
            tags = _.map(
                tags,
                function(id) {
                    return _.cloneDeep(this._data.tags[id])
                }.bind(this)
            );
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

    _filter_tags() {
        let tags = _.values(this._data.tags);

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

    _filter_notes() {
        let notes = _.cloneDeep(_.values(this._data.notes));

        // TODO сделать тесты и выделить в функцию
        if(this._filter.notes.text != "") {
            notes = _.filter(
                notes,
                function(note) {
                    return note.text.indexOf(this._filter.notes.text) >= 0
                }.bind(this)
            )
        }

        // TODO сделать тесты и выделить в функцию
        if(this._filter.notes.tags.length > 0) {
            for(let k = 0; k < this._filter.notes.tags.length; k++) {
                let tag = this._filter.notes.tags[k];
                if(tag) {
                    let note_ids = this._data.notes_of_tag[tag];
                    notes = _.filter(
                        notes,
                        function(note) {
                            return note_ids[note.id] === true
                        }
                    );
                }
            }
        }

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

    close() {
        if(this._working) {
            this._reset_internal_state();
            this._reset_state();
            this._storage.clear();
            return true;    
        } else {
            return false;
        }
    }

    // open_notepad() {

    // }

    import(objects) {
        if(!this._working) {
            this._storage.import(objects);
            this.sync();
            return true;
        } else {
            return false;
        }
    }

    export() {
        return this._storage.export();
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

    is_tag_with_name_exists(name, current_tag_id) {
        let tag_id, tag;
        for(tag_id in this._data.tags) {
            if(current_tag_id == tag_id) {
                continue;
            }
            tag = this._data.tags[tag_id];
            if(tag.name == name) {
                return true;
            }
        }
        return false;
    }

    create_tag(name) {
        if(this.is_tag_with_name_exists(name)) {
            throw new Error("tag with name '" + name + "' exists");
        }
        let tag_id = this._storage.create({
            "type": "tag",
            "name": name,
        });
        this.register_tag(this._storage.get(tag_id));
        this._reset_tags();
        return tag_id;
    }

    edit_tag(id, name) {
        if(this.is_tag_with_name_exists(name, id)) {
            throw new Error("tag with name '" + name + "' exists");
        }
        let tag = this._data.tags[id];
        tag.name = name;
        this._storage.set(id, tag);

        this._reset_tags();
    }

    delete_tag(id) {
        this._storage.delete(id);
        delete this._data.tags[id];
        let note_ids = _.keys(this._data.notes_of_tag[id]);
        for(let index = 0; index < note_ids.length; index++) {
            let note_id = note_ids[index];
            this.delete_tag_note(id, note_id);
        }
        delete this._data.notes_of_tag[id];
        this._reset_notes();
        this._reset_tags();
    }

    delete_tag_note(tag_id, note_id) {
        let tag_note_key = this.tag_note_key(tag_id, note_id);
        let tag_note_id = this._data.tag_notes[tag_note_key].id;

        this._storage.delete(tag_note_id);
        delete this._data.tag_notes[tag_note_key];
        delete this._data.tags_of_note[note_id][tag_id];
        delete this._data.notes_of_tag[tag_id][note_id];
    }

    // list_tags(from, count) {

    // }

    create_note_filter(name, tags) {
        let filter_id = this._storage.create({
            "type": "note_filter",
            "name": name,
            "tags": _.cloneDeep(tags),
        });
        this.register_note_filter(this._storage.get(filter_id));
        return filter_id;
    }

    delete_note_filter(note_filter_id) {
        this._storage.delete(note_filter_id);
        delete this._data.note_filters[note_filter_id];
        this._reset_note_filters();
    }

    edit_note_filter(note_filter_id, new_name) {
        let data = this._data.note_filters[note_filter_id];
        data.name = new_name;
        this._storage.set(note_filter_id, data);
        this._reset_note_filters();
    }

    register_note_filter(note_filter) {
        this._data.note_filters[note_filter.id] = note_filter;
        this._reset_note_filters();
        return note_filter.id;
    }

    _reset_note_filters() {
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
        let items = _.values(this._data.note_filters);
        items = _.cloneDeep(items)
        items = _.sortBy(items, "name");
        _.forEach(items, (item) => item.deletable = true)
        items.unshift(all_items);
        this.trigger("reset_note_filters", items);
    }

    is_note_filter_with_name_exists(name, current_id) {
        let id, item;
        for(id in this._data.note_filters) {
            if(current_id == id) {
                continue;
            }
            item = this._data.note_filters[id];
            if(item.name == name) {
                return true;
            }
        }
        return false;
    }

    create_note(text, stamp, tags) {
        let note_id = this._storage.create({
            "type": "note",
            "text": text,
            "created_at": stamp,
        });
        this.register_note(this._storage.get(note_id));
        this.apply_note_tags(note_id, tags);

        this._reset_notes();
        this._reset_tags();
        return note_id;
    }

    create_tag_note(tag_id, note_id) {
        let tag_note_id = this._storage.create({
            "type": "tag_note",
            "tag_id": tag_id,
            "note_id": note_id,
        });
        let tag_note = this._storage.get(tag_note_id);
        this.register_tag_note(tag_note);
    }

    edit_note(id, text, stamp, tags) {
        let note = this._data.notes[id];
        note.text = text;
        note.created_at = stamp;
        this._storage.set(id, note);

        this.apply_note_tags(id, tags);
        this._reset_notes();
        this._reset_tags();
    }

    apply_note_tags(note_id, tag_ids) {
        let old_tag_ids = _.keys(this._data.tags_of_note[note_id]);

        let new_tag_ids = _.difference(tag_ids, old_tag_ids);
        let deleted_tag_ids = _.difference(old_tag_ids, tag_ids);

        let k, tag_id;
        for(k = 0; k < new_tag_ids.length; k++) {
            tag_id = new_tag_ids[k];
            this.create_tag_note(tag_id, note_id);
        }
        for(k = 0; k < deleted_tag_ids.length; k++) {
            tag_id = deleted_tag_ids[k];
            this.delete_tag_note(tag_id, note_id);
        }
    }

    delete_note(id) {
        this._storage.delete(id);
        delete this._data.notes[id];
        this.apply_note_tags(id, []);
        delete this._data.tags_of_note[id];
        this._reset_notes();
        this._reset_tags();
    }

    // list_notes(from, count) {

    // }
}

export default Notepad;
