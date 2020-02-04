import Backbone from "backbone";
import _ from "lodash";

class Notepad {
    constructor(storage_class) {
        _.extend(this, Backbone.Events);
        this._storage_class = storage_class;
        this._configuration = {
            "tags_per_page": 15,
            "notes_per_page": 10,
        };
        this._storage = null;
        this._password = null;
        this._state = {
            "notes": [],
            "tags": [],
        };
        this._filter = {
            "tags": {
                sorting_asc: true,
            },
            "notes": {
                sorting_asc: true,
            },
        }
        this._data = {
            "notepad": null,
            "notes": {},
            "tags": {},
            "notes_of_tag": {},
            "tags_of_note": {},
        };
    }

    create() {
        // создать базовые объекты, описывающие блокнот
        // переход в состояние "с блокнотом"
        if(this._storage == null) {
            let options = {
                with_password: false,
                password: null,
            };
            this._storage = new this._storage_class(options);
            this._create_initial_data();
            this._reset_filter();
            this._load_data();
            this._reset_state();
            // this.unlock(password);
            return true;
        } else {
            return false;
        }
    }

    _create_initial_data() {
        this._storage.create({
            type: "notepad",
            name: "вдохновение",
        });
        let first_steps_tag = this._storage.create({
            type: "tag",
            name: "первые шаги",
        });
        let welcome_note = this._storage.create({
            type: "note",
            text: "Добро пожаловать, ваш путь начинается здесь",
            created_at: + new Date(),
        });
        this._storage.create({
            type: "tag_note",
            tag_id: first_steps_tag,
            note_id: welcome_note,
        });
    }

    _load_data() {
        let reader = function(object) {
            let key = object.id;
            let list;
            switch(object.type) {
                case "notepad":
                    this._data.notepad = object;
                    break;
                case "tag":
                    this._data.tags[key] = object;
                    break;
                case "note":
                    this._data.notes[key] = object;
                    break;
                case "tag_note":
                    list = this._data.notes_of_tag[object.tag_id];
                    if(list == null) {
                        list = [];
                        this._data.notes_of_tag[object.tag_id] = list;
                    }
                    list.push(object.note_id);

                    list = this._data.tags_of_note[object.note_id];
                    if(list == null) {
                        list = [];
                        this._data.tags_of_note[object.note_id] = list;
                    }
                    list.push(object.tag_id);
                    break;
                default:
                    console.warn("неизвестный тип объекта", object);
                    break;
            }
        }.bind(this);
        this._storage.iterate(reader);
    }

    _reset_filter() {
        this._filter.tags.sorting_asc = true;
        this._filter.notes.sorting_asc = true;
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
    }

    _wrap_tags(items) {
        let result = [];
        for(let index = 0; index < items.length; index++) {
            let item = items[index];
            result.push({
                id: item.id,
                checked: false,
                name: item.name,
                count: this._data.notes_of_tag[item.id].length,
                hidden: false,
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
            let tags = this._data.tags_of_note[item.id];
            tags = _.map(
                tags,
                function(id) {return this._data.tags[id]}.bind(this)
            );
            tags = _.orderBy(tags, "name");
            result.push({
                id: item.id,
                tags: tags,
                checked: false,
                text: item.text,
                creation_time: item.created_at,
                hidden: false,
            });
        }
        return result;
    }

    _filter_tags() {
        let tags = _.values(this._data.tags);
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
        let notes = _.values(this._data.notes);
        let order;
        if(this._filter.notes.sorting_asc) {
            order = ["asc"];
        } else {
            order = ["desc"];
        }
        notes = _.orderBy(notes, ["name"], order);
        return notes;
    }

    close() {
        this.lock();

        // очистка хранилища
        // переход в состояние "без блокнота"
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

    // create_tag(name) {

    // }

    // edit_tag(id, name) {

    // }

    // delete_tag(id, name) {

    // }

    // list_tags(from, count) {

    // }

    // create_note(text, stamp, tags) {

    // }

    // edit_note(id, text, stamp, tags) {

    // }

    // delete_note(id) {

    // }

    // list_notes(from, count) {

    // }
}

export default Notepad;
