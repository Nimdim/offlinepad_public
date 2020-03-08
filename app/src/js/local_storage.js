import StorageInterface from "./storage_interface.js";
let PREFIX = "z_";
let PREFIX2 = "x_";

class LocalStorage extends StorageInterface{
    _init_storage() {
        if(window.localStorage == null) {
            throw new Error("локальное хранилище недоступно");
        }
    }

    _reset_internal_state() {
        this._autoincrement_id = window.localStorage[PREFIX2 + "ai"];
        if(this._autoincrement_id == null) {
            this._autoincrement_id = 0;
        } else {
            this._autoincrement_id = parseInt(this._autoincrement_id);
        }
        super._reset_internal_state();
    }

    _get_item_copy(id) {
        return JSON.parse(window.localStorage[PREFIX + id]);
    }

    _create_item(object) {
        let id = this._get_next_id();
        if(window.localStorage[PREFIX + id] != null) {
            throw new Error("Элемент с id=" + id + " уже сущестует в хранилище");
        }
        window.localStorage[PREFIX + id] = JSON.stringify(object);
        return id;
    }

    _get_next_id() {
        this._autoincrement_id += 1;
        window.localStorage[PREFIX2 + "ai"] = this._autoincrement_id;
        return this._autoincrement_id.toString();
    }

    _has_item(id) {
        return window.localStorage.hasOwnProperty(PREFIX + id);
    }

    _set_item(id, object) {
        window.localStorage[PREFIX + id] = JSON.stringify(object);
    }

    _delete_item(id) {
        window.localStorage.removeItem(PREFIX + id);
    }

    _iterate_keys(callback) {
        for(let key in window.localStorage) {
            if(window.localStorage.hasOwnProperty(key) && key.indexOf(PREFIX) == 0) {
                callback(key.replace(PREFIX, ""));
            }
        }
    }
}

export default LocalStorage;
