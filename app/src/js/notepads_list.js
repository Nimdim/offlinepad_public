/* eslint no-fallthrough: "off" */
import Backbone from "backbone";
import _ from "lodash";
import IndexedDBStorage from "./indexeddb_storage.js";
import Notepad from './notepad.js'

if(global != null) {
    var window = global;
}

class NotepadsListStorage extends IndexedDBStorage {
    constructor() {
        super()
        this.DB_VERSION = 1;
    }
    
    _upgrade_needed(event) {
        let db = event.target.result;
        let store_options = { keyPath: "id", autoIncrement: true};
        // let index_options = {"unique": false};
        let unique_index = {"unique": true};
        switch(event.oldVersion) {
            case 0: {
                let notepads = db.createObjectStore("notepads", store_options);
                notepads;
                let pin_codes = db.createObjectStore("pin_codes", store_options);
                pin_codes.createIndex("notepad_id_idx", "notepad_id", unique_index);
            }
        }
    }
}

let NOTEPAD_DB_PREFIX = "a_";

class NotepadsList {
    constructor() {
        _.extend(this, Backbone.Events);
        this._storage = new NotepadsListStorage();
    }

    async init() {
        await this._storage.init("main");
        await this.reread_list();
    }

    async reread_list() {
        let databases = await indexedDB.databases();
        this.databases = {};
        _.forEach(
            databases,
            (database) => {
                this.databases[database.name] = database.version
            }
        );
        let notepads = await this._storage.get_items_from_store("notepads");
        notepads = _.orderBy(notepads, "name");
        this.notepads = notepads;
    }

    // list() {
    //     let list = []
    //     _.forEach(this.databases, (version, name) => {
    //         if(name.indexOf(NOTEPAD_DB_PREFIX) == 0) {
    //             list.push(name);
    //         }
    //     });
    //     list = _.orderBy(list);
    //     return list;
    // }

    async delete(notepad_id) {
        await this.reread_list();
        if(this.has(notepad_id)) {
            let pin_code_ids = await this._storage.get_item_ids_from_store_using_index(
                "pin_codes", "notepad_id_idx", notepad_id
            );
            for(let k = 0; k < pin_code_ids.length; k++) {
                let pin_code_id = pin_code_ids[k];
                await this._storage.delete_item_in_store("pin_codes", pin_code_id);
            }
            await this._storage.delete_item_in_store("notepads", notepad_id);
            let promise = new Promise((resolve, reject) => {
                let request = indexedDB.deleteDatabase(NOTEPAD_DB_PREFIX + notepad_id);
                request.addEventListener("success", () => {
                    resolve();
                });
                request.addEventListener("error", () => {
                    reject();
                });
            });
            await promise;
            await this.reread_list();
            return true;
        } else {
            return false;
        }
    }

    has(notepad_id) {
        let list = _.filter(this.notepads, (notepad) => {
            return notepad.id == notepad_id;
        });
        return list.length > 0;
    }

    async open(notepad_id) {
        if(this.has(notepad_id)) {
            let notepad = new Notepad();
            await notepad.sync(NOTEPAD_DB_PREFIX + notepad_id);
            return notepad;
        } else {
            return false;
        }
    }

    async _new_notepad_record(name, encrypted) {
        let notepad = {
            name: name,
            encrypted: encrypted,
        }
        let notepad_id = await this._storage.create_item_in_store(
            "notepads", notepad
        );
        return notepad_id;
    }

    async create(notepad_name, options) {
        let notepad_id = await this._new_notepad_record(
            notepad_name, options.encrypted
        );
        let notepad = new Notepad();
        await notepad.create(NOTEPAD_DB_PREFIX + notepad_id, notepad_name, options);
        // TODO вынести отсюда
        // await this.create_notepad_data(notepad);
        return {"id": notepad_id, "notepad": notepad};
    }

    async import(import_data) {
        let info;
        _.forEach(import_data, (item) => {
            if(item.name == "info") {
                info = item;
            }
        });
        if(info == null) {
            throw new Error("no info");
        }
        let notepad_id = await this._new_notepad_record(
            info.notepad_name,
            info.encrypted,
        );
        let notepad = new Notepad();
        let maps = await notepad.import(NOTEPAD_DB_PREFIX + notepad_id, import_data);
        return {"id": notepad_id, "notepad": notepad, "maps": maps};
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
