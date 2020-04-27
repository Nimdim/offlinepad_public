/* eslint no-fallthrough: "off" */
import Backbone from "backbone";
import _ from "lodash";
// import IndexedDBStorage from "./indexeddb_storage.js";

let indexedDB;
if(global == null) {
    indexedDB = window.indexedDB;
} else {
    indexedDB = global.indexedDB;
    var window = global;
}

// class NotepadStorage extends IndexedDBStorage {
//     _upgrade_needed(event) {
//         let db = event.target.result;
//         let store_options = { keyPath: "id", autoIncrement: true};
//         let index_options = {"unique": false};
//         let unique_index = {"unique": true};
//         switch(event.oldVersion) {
//             case 0: {
//                 let notes = db.createObjectStore("notes", store_options);
//                 notes.createIndex("created_at_idx", "created_at", index_options);
//                 let tags = db.createObjectStore("tags", store_options);
//                 tags;
//                 let tag_notes = db.createObjectStore("tag_notes", store_options);
//                 tag_notes.createIndex("tag_id_idx", "tag_id", index_options);
//                 tag_notes.createIndex("note_id_idx", "note_id", index_options);
//                 let settings = db.createObjectStore("settings", store_options);
//                 settings.createIndex("name_idx", "name", unique_index);
//                 let note_filters = db.createObjectStore("note_filters", store_options);
//                 note_filters;
//             }
//         }
//     }
// }

class NotepadsList {
    constructor() {
        _.extend(this, Backbone.Events);
    }

    async init() {
        let databases = await indexedDB.databases();
        this.databases = {};
        _.forEach(
            databases,
            (database) => {
                this.databases[database.name] = database.version
            }
        );
    }

    async delete(db_name) {
        let promise = new Promise((resolve, reject) => {
            let request = indexedDB.deleteDatabase(db_name);
            request.addEventListener("success", () => {
                resolve();
            });
            request.addEventListener("error", () => {
                reject();
            });
        });
        await promise;
        await this.init();
    }
}

export default NotepadsList;
