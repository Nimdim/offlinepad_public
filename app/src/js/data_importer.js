/* eslint no-fallthrough: "off" */
// import Backbone from "backbone";
import _ from "lodash";
import PartialFileReader from './partial_file_reader.js'
// import IndexedDBStorage from "./indexeddb_storage.js";

// if(global != null) {
//     var window = global;
//     window;
// }

let TYPES = [
  ["settings", "setting"],
  ["tags", "tag"],
  ["notes", "note"],
  ["tag_notes", "tag_note"],
  ["note_filters", "note_filter"],
];

class DataImporter {
  constructor(data) {
    this.name = data.name;
    this.file = data.file;
    this.notepads_list = data.notepads_list;
    // this.import_abort = false;
    this.import_progress = 0;
  }

  abort() {
    // this.import_abort = true;
    this._reader.abort();
  }

  async execute() {
    let info = await this.notepads_list.create_empty();
    let notepad = info.notepad;
    let notepad_id = info.id;

    let import_error = null;

    let accumulator = [];
    let old_ids = [];
    let type_selector = 0;
    let current_type = TYPES[type_selector];
    let maps = {
      settings: {},
      tags: {},
      notes: {},
      tag_notes: {},
      note_filters: {},
    };
    let info_object_recved = false;

    let write_accumulator = async () => {
      let ids = await notepad._storage.create_items_in_store(
        current_type[0], accumulator
      );
      for(let k = 0; k < old_ids.length; k++) {
        maps[current_type[0]][old_ids[k]] = ids[k];
      }
      old_ids = [];
      accumulator = [];
    };
    let add_to_accumulator = (id, object) => {
      accumulator.push(object);
      old_ids.push(id);
    };
    let object_recved = async (object, progress) => {
      // if(this.import_abort) {
      //   import_error = "Прервано";
      //   reader.abort();
      //   return;
      // }
      this.import_progress = Math.floor(progress * 100);
      let id = object.id;
      let type = object.type;
      object = _.cloneDeep(object);
      if(!info_object_recved) {
        if((type == "setting") &&
           (object.name == "info") &&
           (object.schema_type == "beta")) {
          object.notepad_name = this.name;
          info_object_recved = true;
        }
        // Не пришел объект с настройками блокнота, или не там схема
        if(!info_object_recved) {
          import_error = "Неверная схема данных";
          reader.abort();
        }
      }
      if(type == "tag_note") {
        object.tag_id = maps.tags[object.tag_id];
        object.note_id = maps.notes[object.note_id];
      }
      if(type == "note_filter") {
        object.tags = _.map(object.tags, (tag_id) => maps.tags[tag_id]);
      }
      delete object.id;
      delete object.type;
      if(type == current_type[1]) {
        add_to_accumulator(id, object);
        if(accumulator.length >= 100) {
          await write_accumulator();
        }
      } else {
        await write_accumulator();
        while(type_selector < TYPES.length) {
          type_selector += 1;
          current_type = TYPES[type_selector];
          if(type == current_type[1]) {
            add_to_accumulator(id, object);
            break;
          }
        }
      }
    };
    let reader = new PartialFileReader(this.file, object_recved);
    this._reader = reader;
    let done = await reader.start();
    if(done) {
      write_accumulator();
    } else {
      import_error = "Прервано";
    }
    let result;
    if(import_error == null) {
      result = {
        error: import_error,
        notepad: notepad,
        notepad_id: notepad_id,
      };
    } else {
      await notepad.close();
      await this.notepads_list.delete(notepad_id);
      result = {
        error: import_error,
      }
    }
    return result;
  }
}
  
export default DataImporter;
