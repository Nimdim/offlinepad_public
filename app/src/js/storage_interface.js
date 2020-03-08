
class StorageInterface {
    constructor() {
        this._init_storage();
        this._reset_internal_state();
    }

    _reset_internal_state() {
        this._options = {};
    }

    set_options(options) {
        this._options = options;
    }

    get(id) {
        let value = this._get_item_copy(id);
        value.id = id;
        return value;
    }

    create(object) {
        return this._create_item(object);
    }

    set(id, object) {
        if(this._has_item(id)) {
            this._set_item(id, object);
            return true;
        } else {
            return false;
        }
    }

    delete(id) {
        if(this._has_item(id)) {
            this._delete_item(id);
            return true;
        } else {
            return false;
        }
    }

    iterate(callback) {
        let return_callback = function(key) {
            callback(this.get(key));
        }.bind(this);
        this._iterate_keys(return_callback);
    }

    clear() {
        let delete_callback = function(key) {
            this._delete_item(key);
        }.bind(this);
        this._iterate_keys(delete_callback)
        this._reset_internal_state();
    }
}

export default StorageInterface;
