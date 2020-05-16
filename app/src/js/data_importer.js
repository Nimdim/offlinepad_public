import _ from "lodash";
import PartialFileReader from './partial_file_reader.js'

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
    this.import_progress = 0;

    this.accumulator = [];
    this.old_ids = [];

    this.type_selector = 0;
    this.current_type = TYPES[this.type_selector];
    this.maps = {
      settings: {},
      tags: {},
      notes: {},
      tag_notes: {},
      note_filters: {},
    };
  }

  abort() {
    this._reader.abort();
  }

  async add_to_accumulator(id, object) {
    this.accumulator.push(object);
    this.old_ids.push(id);

    if(this.accumulator.length >= 100) {
      await this.write_accumulator();
    }
  }

  async write_accumulator() {
    let ids = await this.notepad._storage.create_items_in_store(
      this.current_type[0], this.accumulator
    );
    for(let k = 0; k < this.old_ids.length; k++) {
      this.maps[this.current_type[0]][this.old_ids[k]] = ids[k];
    }
    this.old_ids = [];
    this.accumulator = [];
  }

  map_object_links(object, type) {
    switch(type) {
      case "tag_note":
        object.tag_id = this.maps.tags[object.tag_id];
        object.note_id = this.maps.notes[object.note_id];
        break;
      case "note_filter":
        object.tags = _.map(object.tags, (tag_id) => this.maps.tags[tag_id]);
        break;
    }
  }

  async execute() {
    let info = await this.notepads_list.create_empty();
    let notepad = info.notepad;
    let notepad_id = info.id;

    let import_error = null;
    let info_object_recved = false;

    this.notepad = notepad;

    let object_recved = async (object, progress) => {
      this.import_progress = Math.floor(progress * 100);

      let id = object.id;
      let type = object.type;
      object = _.cloneDeep(object);
      delete object.id;
      delete object.type;

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

      this.map_object_links(object, type);

      if(type == this.current_type[1]) {
        await this.add_to_accumulator(id, object);
      } else {
        await this.write_accumulator();
        while(this.type_selector < TYPES.length) {
          this.type_selector += 1;
          this.current_type = TYPES[this.type_selector];
          if(type == this.current_type[1]) {
            await this.add_to_accumulator(id, object);
            break;
          }
        }
      }
    };

    let reader = new PartialFileReader(this.file, object_recved);
    this._reader = reader;
    let done = await reader.start();
    if(done) {
      await this.write_accumulator();
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
