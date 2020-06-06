import _ from "lodash";
import aesjs from "aes-js";

let indexedDB;
let random_numbers_generator;

if(global == null) {
    indexedDB = window.indexedDB;
    random_numbers_generator = window.crypto.getRandomValues;
} else {
    indexedDB = global.indexedDB;
    let crypto = require('crypto');
    random_numbers_generator = (buf) => {
        let crypto_buf = crypto.randomBytes(buf.length);
        let typed_buf = new Uint8Array(crypto_buf);
        buf.set(typed_buf);
    }
    var window = global;
}

let create_aes = function(key, iv) {
    return new aesjs.ModeOfOperation.cbc(key, iv);
}

let add_padding = function(bytes) {
    let filled = bytes.length % 16;
    let needed = 16 - filled;
    let result = new Uint8Array(bytes.length + needed);
    result.set(bytes);
    let zeros = (new Array(needed)).fill(0);
    result.set(zeros, bytes.length);
    return result;
};

let remove_padding = function(bytes) {
    let last_index = bytes.length - 1;
    while(last_index > 0) {
        if(bytes[last_index] != 0) {
            break;
        }
        last_index -= 1;
    }
    let result = bytes.slice(0, last_index + 1);
    return result;
}

let encrypt = function(open_text, key) {
    var iv = new Uint8Array(16);
    random_numbers_generator(iv);
    let aes = create_aes(key, iv);

    var open_bytes = aesjs.utils.utf8.toBytes(open_text);
    open_bytes = add_padding(open_bytes);
    let encrypted_bytes = aes.encrypt(open_bytes);
    let encrypted_text = aesjs.utils.hex.fromBytes(iv) +
                         aesjs.utils.hex.fromBytes(encrypted_bytes);
    return encrypted_text;
}

let decrypt = function(encrypted_text, key) {
    let encrypted_bytes = aesjs.utils.hex.toBytes(encrypted_text);

    let iv = encrypted_bytes.slice(0, 16);
    let aes = create_aes(key, iv);
    encrypted_bytes = encrypted_bytes.slice(16);

    let open_bytes = aes.decrypt(encrypted_bytes);
    open_bytes = remove_padding(open_bytes);
    let open_text = aesjs.utils.utf8.fromBytes(open_bytes);
    return open_text;
}

class IndexedDBStorage {
    constructor() {
        this._options = {
            encrypted: false,
        }
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

    close() {
        this.db.close();
    }

    init(db_name, options) {
        if(options) {
            this._options = _.cloneDeep(options);
        }
        this._db_name = db_name;
        if(this.DB_VERSION == null) {
            throw new Error("no DB_VERSION constant");
        }
        if(this._upgrade_needed == null) {
            throw new Error("no _upgrade_needed function");
        }
        let promise = new Promise((resolve, reject) => {
            let request = indexedDB.open(db_name, this.DB_VERSION);
            request.onerror = (event) => {
                reject(event);
            };
            // request.onversionchange = ;
            // request.onblocked = ;
            request.onupgradeneeded = this._upgrade_needed;
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };    
        });
        return promise;
    }

    encrypt_item(item, store) {
        let result = item;
        if(this._options.encrypted) {
            result = _.cloneDeep(item);
            switch(store) {
                case 'tags':
                    result.name = encrypt(result.name, this._options.secret);
                    break;
                case 'notes':
                    result.text = encrypt(result.text, this._options.secret);
                    break;
                case 'note_filters':
                    result.name = encrypt(result.name, this._options.secret);
                    break;
                case 'settings':
                    if(result.name == "info") {
                        if(result.secret_check != null) {
                            result.secret_check = encrypt(result.secret_check, this._options.secret);
                        }
                    }
                    break;
            }
        }
        return result;
    }

    decrypt_item(item, store) {
        let result = item;
        if(this._options.encrypted) {
            result = _.cloneDeep(item);
            switch(store) {
                case 'tags':
                    result.name = decrypt(result.name, this._options.secret);
                    break;
                case 'notes':
                    result.text = decrypt(result.text, this._options.secret);
                    break;
                case 'note_filters':
                    result.name = decrypt(result.name, this._options.secret);
                    break;
                case 'settings':
                    if(result.name == "info") {
                        if(result.secret_check != null) {
                            result.secret_check = decrypt(result.secret_check, this._options.secret);
                        }
                    }
                    break;
            }
        }
        return result;
    }

    create_item_in_store(store_name, item) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readwrite");
            let store = transaction.objectStore(store_name);
            let new_id;

            item = this.encrypt_item(item, store_name);

            let request = store.add(item);
            request.onsuccess = function() {
                new_id = request.result;
            };
            transaction.oncomplete = () => {
                resolve(new_id);
            };
            transaction.onerror = (event) => {
                // TODO при нарушении ограничений уникальности ошибка - сложно понять
                reject(event.target._error);
            }
        });
        return promise;
    }

    create_items_in_store(store_name, items, disable_encryption) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readwrite");
            let store = transaction.objectStore(store_name);
            let result = [];
            for(let k = 0; k < items.length; k++) {
                let item = items[k];
                if(!disable_encryption) {
                    item = this.encrypt_item(item, store_name);
                }
                let request = store.add(item);
                request.onsuccess = function() {
                    result[k] = request.result;
                };
            }
            transaction.oncomplete = () => {
                resolve(result);
            };
            transaction.onerror = (event) => {
                reject(event.target.error);
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
            request.onsuccess = () => {
                item = request.result;
                item = this.decrypt_item(item, store_name);
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
            request.onsuccess = () => {
                item = request.result;
                item = this.decrypt_item(item, store_name);
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
                request.onsuccess = () => {
                    result[k] = request.result;
                    result[k] = this.decrypt_item(result[k], store_name);
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
            request.onsuccess = () => {
                item = request.result;
                item = this.decrypt_item(item, store_name);
                _.extend(item, new_values);
                item = this.encrypt_item(item, store_name);
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
                        value = this.decrypt_item(value, store_name);
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

    get_items_from_store(store_name, disable_decryption) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);

            let request = store.getAll();
            request.onsuccess = () => {
                if(request.result != null) {
                    let items = request.result;
                    if(!disable_decryption) {
                        _.forEach(items, (item, index) => {
                            items[index] = this.decrypt_item(item, store_name);
                        });
                    }
                    resolve(items);
                } else {
                    reject();
                }
            };
        });
        return promise;
    }

    get_items_from_store_using_index(store_name, index_name, value, count) {
        let promise = new Promise((resolve, reject) => {
            let transaction = this.db.transaction(store_name, "readonly");
            let store = transaction.objectStore(store_name);
            let index = store.index(index_name);
            let request = index.getAll(value, count);
            request.addEventListener("success", (event) => {
                let items = event.target.result;
                _.forEach(items, (item, index) => {
                    items[index] = this.decrypt_item(item, store_name);
                });
                resolve(items);
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
}

export default IndexedDBStorage;
