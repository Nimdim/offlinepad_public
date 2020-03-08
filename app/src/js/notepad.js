import Backbone from "backbone";
import _ from "lodash";

class Notepad {
    constructor(storage) {
        _.extend(this, Backbone.Events);
        this._configuration = {
            "tags_per_page": 999,//15,
            "notes_per_page": 999,//10,
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
            let key = object.id;
            switch(object.type) {
                case "notepad":
                    this._data.notepad = object;
                    this._working = true;
                    break;
                case "tag":
                    this._data.tags[key] = object;
                    break;
                case "note":
                    this._data.notes[key] = object;
                    break;
                case "tag_note":
                    this.register_tag_note(object);
                    break;
                default:
                    console.error("неизвестный тип объекта", object);
                    break;
            }
        }.bind(this);
        this._storage.iterate(reader);
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
    }

    _reset_tags() {
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
        let items_for_show_count = this._configuration.notes_per_page;
        let items_for_show;
        this._state.notes.items = this._filter_notes();
        if(items_for_show_count < this._state.notes.length) {
            items_for_show_count = this._state.notes.length;
        }
        this._state.notes.items_shown_count = items_for_show_count;
        items_for_show = this._state.notes.items.slice(0, items_for_show_count);
        this.trigger("reset_notes", this._wrap_notes(items_for_show));
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
        if(this._filter.tags.name != "") {
            tags = _.filter(
                tags,
                function(tag) {
                    return tag.name.indexOf(this._filter.tags.name) >= 0
                }.bind(this)
            );
        }
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
        if(this._filter.notes.text != "") {
            notes = _.filter(
                notes,
                function(note) {
                    return note.text.indexOf(this._filter.notes.text) >= 0
                }.bind(this)
            )
        }

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
        this._reset_internal_state();
        this._reset_state();
        this._storage.clear();
    }

    // open_notepad() {

    // }

    // import_notepad() {

    // }

    // export_notepad() {

    // }

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

    create_tag(name) {
        let tag_id = this._storage.create({
            "type": "tag",
            "name": name,
        });
        this._data.notes_of_tag[tag_id] = {};
        this._data.tags[tag_id] = this._storage.get(tag_id);
        this._reset_tags();
        return tag_id;
    }

    edit_tag(id, name) {
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

    create_note(text, stamp, tags) {
        let note_id = this._storage.create({
            "type": "note",
            "text": text,
            "created_at": stamp,
        });
        this._data.tags_of_note[note_id] = {};
        this._data.notes[note_id] = this._storage.get(note_id);
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

    edit_note(id, text, tags) {
        let note = this._data.notes[id];
        note.text = text;
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
