
import _ from "lodash";

class VariableStorage {
    constructor() {
        this._storage = {};
        this._file_data = {};
    }

    get(id) {
        return this._storage[id];
    }

    create(object) {
        let id = _.uniqueId();
        this._storage[id] = object;
        return id;
    }

    set(id, object) {
        if(this._storage.hasOwnProperty(id)) {
            this._storage[id] = _.cloneDeep(object);
            return true;
        } else {
            return false;
        }
    }

    delete(id) {
        if(this._storage.hasOwnProperty(id)) {
            delete this._storage[id];
            return true;
        } else {
            return false;
        }
    }

    iterate(callback) {
        for(let key in this._storage) {
            let value = _.cloneDeep(this._storage[key]);
            value.id = key;
            callback(value);
        }
    }
}

export default VariableStorage;
