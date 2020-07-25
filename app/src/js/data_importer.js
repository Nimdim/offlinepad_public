import _ from "lodash";
import { PartialFileReader } from './partial_file_reader.js'

let TYPES = [
  ["settings", "setting"],
  ["tags", "tag"],
  ["notes", "note"],
  ["tag_notes", "tag_note"],
  ["note_filters", "note_filter"],
];

class BetaDataImporterBase {
  constructor(data) {
    this.name = data.name;
    this.file = data.file;

    this.options = {
      encrypted: data.encrypted,
    };
    if(data.secret != null) {
      this.options.secret = data.secret;
    }

    this.notepads_list = data.notepads_list;
    this.import_progress = 0;

    this.accumulator = [];

    this.type_selector = 0;
    this.current_type = TYPES[this.type_selector];
    this.already_encrypted = false;
  }

  abort() {
    this._reader.abort();
  }

  async add_to_accumulator(object) {
    this.accumulator.push(object);

    if(this.accumulator.length >= 100) {
      await this.write_accumulator();
    }
  }

  async write_accumulator() {
    await this.notepad._storage.create_items_in_store(
      this.current_type[0], this.accumulator, this.already_encrypted
    );
    this.accumulator = [];
  }

  async process_info_object(object) {
    // сохраняем состояния импортированных данных
    this.already_encrypted = object.encrypted;
    // подменяем имя, введенное пользователем
    object.notepad_name = this.name;
    // такой ситуация не бывает
    if(object.encrypted && !this.options.encrypted) {
      throw new Error("encrypted -> unencrypted import");
    }
    // если был незашифрованных блокнот, а стал зашифрованный - выставляем данные для шифрованного блокнота
    if(!object.encrypted && this.options.encrypted) {
      object.encrypted = this.options.encrypted;
      object.secret_check = "secret check";
    }
  }

  async execute() {
    let info = await this.notepads_list.create_empty(this.options);
    let notepad = info.notepad;
    let notepad_id = info.id;

    let import_error = null;
    let info_object_recved = false;

    this.notepad = notepad;

    let object_recved = async (object, progress) => {
      this.import_progress = Math.floor(progress * 100);

      let type = object.type;
      object = _.cloneDeep(object);
      delete object.type;

      if(!info_object_recved) {
        if((type == "setting") &&
           (object.name == "info") &&
           (object.schema_type == "beta")) {
          this.process_info_object(object);
          info_object_recved = true;
        }
        // Не пришел объект с настройками блокнота, или не там схема
        if(!info_object_recved) {
          import_error = "data schema error";
          reader.abort();
        }
      }

      if(type == this.current_type[1]) {
        await this.add_to_accumulator(object);
      } else {
        await this.write_accumulator();
        while(this.type_selector < TYPES.length) {
          this.type_selector += 1;
          this.current_type = TYPES[this.type_selector];
          if(type == this.current_type[1]) {
            await this.add_to_accumulator(object);
            break;
          }
        }
      }
    };

    // let reader = new PartialFileReader(this.file, object_recved);
    let reader = this._create_file_reader(this.file, object_recved);
    this._reader = reader;
    let done;
    done = await reader.start();
    if(done) {
      await this.write_accumulator();
    } else {
      import_error = "aborted";
    }
    let result = {
      error: import_error,
    };
    if(import_error == null) {
      await notepad.close();
      await this.notepads_list.reread_list();
      result.notepad_id = notepad_id;
    } else {
      await notepad.close();
      await this.notepads_list.delete(notepad_id);
    }
    return result;
  }
}

export class BetaDataImporter extends BetaDataImporterBase {
  _create_file_reader(file, callback) {
    return new PartialFileReader(file, callback);
  }
}

export class BetaDataImporter_upd1 extends BetaDataImporter {
  constructor(data) {
    super(data)
    this.options.secret_salt = data.secret_salt;

  }
  
  async process_info_object(object) {
    // сохраняем состояния импортированных данных
    this.already_encrypted = object.encrypted;
    // подменяем имя, введенное пользователем
    object.notepad_name = this.name;
    // такой ситуация не бывает
    if(object.encrypted && !this.options.encrypted) {
      throw new Error("encrypted -> unencrypted import");
    }
    // если был незашифрованных блокнот, а стал зашифрованный - выставляем данные для шифрованного блокнота
    if(!object.encrypted && this.options.encrypted) {
      object.encrypted = this.options.encrypted;
      object.secret_check = "secret check";
      object.secret_salt = this.options.secret_salt;
      object.secret_schema = "upd1";
    }
  }
}

export class MockedBetaDataImporter_upd1 extends BetaDataImporter_upd1 {
  _create_file_reader(file, callback) {
    return new BetaDataArrayReader(file, callback);
  }
}


class PartialAlphaDataReader {
  constructor(file, callback) {
    this.file = file;
    this.callback = callback;
  }

  async _read_file() {
    let result;
    let reader = new PartialFileReader(
      this.file, async (data) => {
        result = data;
      }
    );
    await reader.start();
    return result;
  }

  _migrate_data(import_data) {
    _.forEach(import_data, (item) => {
      if(item.type == "notepad") {
        item.type = "setting";
        item.name = "info";
        item.encrypted = false;
        item.schema_type = "beta";
      }
    });
  }

  async start() {
    let import_data = await this._read_file();
    this._migrate_data(import_data);

    let sorted = this.sort_import_objects(import_data);
    
    let total = 0, current = 0;
    let k, i;
    for(k = 0; k < TYPES.length; k++) {
      let type = TYPES[k][0];
      let objects = sorted[type];
      total += objects.length;
    }

    for(k = 0; k < TYPES.length; k++) {
      let type = TYPES[k][0];
      let objects = sorted[type];
      for(i = 0; i < objects.length; i++) {
        if(this._abort) {
          return false;
        }
        let object = objects[i];
        await this.callback(object, current / total);
        current += 1;
      }
    }
    return true;
  }

  sort_import_objects(objects) {
    let sorted = {
        settings: [],
        notes: [],
        tags: [],
        tag_notes: [],
        note_filters: [],
    }
    let keys = _.keys(objects);
    for(let k = 0; k < keys.length; k++) {
        let key = keys[k];
        let object = _.cloneDeep(objects[key]);
        let object_type = object.type;
        switch(object_type) {
            case "setting":
                sorted.settings.push(object);
                break;
            case "tag":
                sorted.tags.push(object);
                break;
            case "note":
                sorted.notes.push(object);
                break;
            case "tag_note":
                sorted.tag_notes.push(object);
                break;
            case "note_filter":
                sorted.note_filters.push(object);
                break;
            default:
                // console.error("неизвестный тип объекта", object);
                break;
        }
    }
    return sorted;
  }
}

export class AlphaDataImporter extends BetaDataImporterBase {
  _create_file_reader(file, callback) {
    return new PartialAlphaDataReader(file, callback);
  }
}

export class AlphaDataImporter_upd1 extends BetaDataImporter_upd1 {
  _create_file_reader(file, callback) {
    return new PartialAlphaDataReader(file, callback);
  }
}

export class MockedAlphaDataImporter_upd1 extends AlphaDataImporter_upd1 {
  _create_file_reader(file, callback) {
    return new PartialAlphaDataReaderFromDict(file, callback);
  }
}


class PartialAlphaDataReaderFromDict {
  constructor(dict, callback) {
    this.dict = _.cloneDeep(dict);
    this.callback = callback;
    this._abort = false;
  }

  _migrate_data(import_data) {
    _.forEach(import_data, (item) => {
      if(item.type == "notepad") {
        item.type = "setting";
        item.name = "info";
        item.encrypted = false;
        item.schema_type = "beta";
      }
    });
  }

  abort() {
    this._abort = true;
  }

  async start() {
    let import_data = this.dict;
    this._migrate_data(import_data);

    let sorted = this.sort_import_objects(import_data);
    
    let total = 0, current = 0;
    let k, i;
    for(k = 0; k < TYPES.length; k++) {
      let type = TYPES[k][0];
      let objects = sorted[type];
      total += objects.length;
    }

    for(k = 0; k < TYPES.length; k++) {
      let type = TYPES[k][0];
      let objects = sorted[type];
      for(i = 0; i < objects.length; i++) {
        if(this._abort) {
          return false;
        }
        let object = objects[i];
        await this.callback(object, current / total);
        current += 1;
      }
    }
    return true;
  }

  sort_import_objects(objects) {
    let sorted = {
        settings: [],
        notes: [],
        tags: [],
        tag_notes: [],
        note_filters: [],
    }
    let keys = _.keys(objects);
    for(let k = 0; k < keys.length; k++) {
        let key = keys[k];
        let object = _.cloneDeep(objects[key]);
        object.id = parseInt(key);
        let object_type = object.type;
        switch(object_type) {
            case "setting":
                sorted.settings.push(object);
                break;
            case "tag":
                sorted.tags.push(object);
                break;
            case "note":
                sorted.notes.push(object);
                break;
            case "tag_note":
                sorted.tag_notes.push(object);
                break;
            case "note_filter":
                sorted.note_filters.push(object);
                break;
            default:
                // console.error("неизвестный тип объекта", object);
                break;
        }
    }
    return sorted;
  }
}

export class AlphaDataImporterFromDict extends BetaDataImporterBase {
  _create_file_reader(file, callback) {
    return new PartialAlphaDataReaderFromDict(file, callback);
  }
}

class PartialFileReaderMock {
  constructor(data, callback) {
    this.data = data;
    this.callback = callback;
    this.length = data.length;
  }

  async start() {
    this.block_start = 0;
    while(this.block_start < this.length) {
      let obj = this.read_object();
      await this.callback(obj);
    }
    return true;
  }

  read_object() {
    let parentees = 0;
    for(let k = this.block_start; k < this.length; k++) {
      if(this.data[k] == "{") {
        parentees += 1;
      }
      if(this.data[k] == "}") {
        parentees -= 1;
        if(parentees == 0) {
          let end = k + 1;
          let obj_str = this.data.slice(this.block_start, end);
          let obj = JSON.parse(obj_str);
          this.block_start = end;
          return obj;
        }
      }
    }
  }
}

export class MockedBetaDataImporter extends BetaDataImporterBase {
  _create_file_reader(file, callback) {
    return new PartialFileReaderMock(file, callback);
  }
}

class BetaDataArrayReader {
  constructor(array, callback) {
    this.array = _.cloneDeep(array);
    this.callback = callback;
    this._abort = false;
  }

  abort() {
    this._abort = true;
  }

  async start() {
    for(let k = 0; k < this.array.length; k++) {
      if(this._abort) {
        return false;
      }
      let object = this.array[k];
      await this.callback(object, k / this.array.length);
    }
    return true;
  }
}

export class BetaDataImporterFromArray extends BetaDataImporterBase {
  _create_file_reader(file, callback) {
    return new BetaDataArrayReader(file, callback);
  }
}
