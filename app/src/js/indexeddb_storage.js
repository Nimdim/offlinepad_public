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

    close() {
        this.db.close();
    }

    init(db_name) {
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
            transaction.onerror = (event) => {
                // TODO при нарушении ограничений уникальности ошибка - сложно понять
                reject(event.target._error);
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
}

export default IndexedDBStorage;