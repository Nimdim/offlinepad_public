import StorageInterface from "./storage_interface.js"
import _ from "lodash";

class VariableStorage extends StorageInterface {
    _init_storage() {
        this._storage = {};
    }

    _reset_internal_state() {
        this._autoincrement_id = 0;
        super._reset_internal_state();
    }

    _get_item_copy(id) {
        return _.cloneDeep(this._storage[id]);
    }

    _create_item(object) {
        let id = this._get_next_id();
        if(this._storage[id] != null) {
            throw new Error("Элемент с id=#{id} уже сущестует в хранилище");
        }
        this._storage[id] = object;
        return id;
    }

    _get_next_id() {
        this._autoincrement_id += 1;
        return this._autoincrement_id.toString();
    }

    _has_item(id) {
        return this._storage.hasOwnProperty(id);
    }

    _set_item(id, object) {
        this._storage[id] = _.cloneDeep(object);
    }

    _delete_item(id) {
        delete this._storage[id];
    }

    _iterate_keys(callback) {
        for(let key in this._storage) {
            callback(key);
        }
    }

    _import_item(id, object) {
        let id_int = parseInt(id);
        this._autoincrement_id = Math.max(this._autoincrement_id, id_int);
        if(this._storage[id] != null) {
            throw new Error("Элемент с id=" + id + " уже сущестует в хранилище");
        }
        this._set_item(id, object);
    }
}

export default VariableStorage;
