/* eslint no-fallthrough: "off" */
import Backbone from "backbone";
import _ from "lodash";
// import IndexedDBStorage from "./indexeddb_storage.js";
import Notepad from './notepad.js'


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

    has(db_name) {
        return this.databases[db_name] != null;
    }

    async open(db_name) {
        if(this.has(db_name)) {
            let notepad = new Notepad();
            await notepad.sync("a_1");
            return notepad;
        } else {
            return false;
        }
    }

    async create(db_name, notepad_name, options) {
        if(!this.has(db_name)) {
            let notepad = new Notepad();
            await notepad.create("a_1", notepad_name, options);
            await this.create_notepad_data(notepad);
            return notepad;
        } else {
            return false;
        }
    }

    async import(db_name, import_data) {
        if(!this.has(db_name)) {
            let notepad = new Notepad();
            await notepad.import("a_1", import_data);
            return notepad;    
        } else {
            return false;
        }
    }

    async create_notepad_data(notepad) {
        notepad.start_updates();
        let welcome_tag = await notepad.create_tag("добро пожаловать");
        let lesson_tag = await notepad.create_tag("обучение");
        await notepad.create_note(
          "Теперь вы знаете все необходимое. Не забывайте, что приложение все еще находится в разработке и при закрытии страницы все введенные данные не сохранятся.",
          + new Date(),
          [welcome_tag, lesson_tag]
        );
        await notepad.create_note(
            "Для добавления новой записи или метки нажмите красную круглую кнопку в правом нижнем углу. Редактирование и удаление выполняется нажатием на соответствующие кнопки в самих записях или метках.",
            + new Date() + 1,
            [welcome_tag, lesson_tag]
        );
        await notepad.create_note(
            "Еще правее находятся кнопки переключения разделов: Записи и Метки. Если вы открыли сайт с мобильного телефона, то не увидите этих кнопок - они доступны в меню в левой части экрана, которое открывается при проведении пальцем слева направо.",
            + new Date() + 2,
            [welcome_tag, lesson_tag]
        );
        await notepad.create_note(
            "Правее находится кнопка сортировки. Для записей сортировка выполняется по дате создания, а для меток - по названию.",
            + new Date() + 3,
            [welcome_tag, lesson_tag]
        );
        await notepad.create_note(
            "Наверху вы видите строку быстрого поиска по содержимому. При помощи нее вы можете отфильтровать элементы, которые содержат введенный текст.",
            + new Date() + 4,
            [welcome_tag, lesson_tag]
        );
        await notepad.create_note(
            "Добро пожаловать, это первая запись вашего дневника.",
            + new Date() + 5,
            [welcome_tag]
        );
        await notepad.end_updates();
    }
  
}

export default NotepadsList;
