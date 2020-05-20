<template>
  <full-screen-box :top="true" :fullscreen="true">
    <span v-if="items.length > 0"
      class="notepads-selector"
      style="display: block; margin: 0 auto;"
    >
      Блокноты
    </span>
    <span v-else
      class="notepads-selector"
      style="display: block; margin: 0 auto; margin-bottom: 10px;"
    >
      У вас пока еще не создано ни одного блокнота. Создайте новый, при помощи формы ниже.
    </span>
    <ul
      class="collection notepads-selector"
    >
      <notepads-selector-item
        v-for="item in items" :key="item.id"
        :item="item"
        :active="active == item.id"
        @click="active = item.id"
        @open="$emit('open', item.id)"
        @save="$emit('save', item.id)"
        @remove="$emit('remove', item.id)"
      />
      <li class="collection-item"
        @click="active = 'add'"
      >
        <span v-if="active == 'add'">
          <form class="col s12">
            <div class="row" style="margin-bottom: 0px;">
              <div class="input-field col s12">
                <span class="new-notepad-mode"
                  :class="{'active': add_mode == 'create'}"
                  @click="add_mode = 'create'"
                >
                  Создать
                </span>
                <span class="new-notepad-mode"
                  :class="{'active': add_mode == 'import'}"
                  @click="add_mode = 'import'"
                >
                  Импорт
                </span>
              </div>
            </div>
            <div class="row" style="margin-bottom: 0px;">
              <div class="input-field col s12">
                <input
                  ref="add_name_input"
                  placeholder="Название блокнота"
                  type="text"
                  class="validate"
                  v-model="add_name"
                >
                <span v-if="error_text"
                  class="left red-text" style=""
                >
                  {{error_text}}
                </span>
              </div>
              <div class="input-field col s12">
                <select ref="selects">
                  <option value="1" selected>Не шифрованный</option>
                  <option value="2" disabled>Зашифрованный</option>
                </select>
                <label>Тип блокнота</label>
              </div>
              <div v-if="add_mode == 'import'"
                class="file-field input-field col s12"
              >
                <div class="btn-small" style="height: 32px;">
                  <span style="line-height: unset;">
                    файл
                  </span>
                  <input ref="import_file" type="file" @change="validate">
                </div>
                <div class="file-path-wrapper">
                  <input class="file-path validate" type="text">
                </div>
                <span v-if="import_file_error" style="color: red;">
                  {{import_file_error}}
                </span>
              </div>
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn"
                  @click="create_notepad"
                >
                  <font-awesome-icon icon="plus"/>
                  Создать блокнот
                </a>
              </div>
            </div>
          </form>
        </span>
        <span v-else>
          <font-awesome-icon icon="plus"/>
        </span>
      </li>
    </ul>

  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import NotepadsSelectorItem from "./NotepadsSelectorItem.vue";
  import PartialFileReader from './../js/partial_file_reader.js'
  import _ from "lodash";

  class Validator {
    constructor(file) {
      this._file = file
    }

    async validate() {
      let result = {
        error: "wrong file",
      };

      let reader = new PartialFileReader(
        this._file, async (import_data) => {
          if(this.is_beta_schema_type(import_data)) {
            result = {
              error: "ok",
              schema: "beta",
            };
          } else if(this.is_alpha_schema_type(import_data)) {
            result = {
              error: "ok",
              schema: "alpha",
            };
          } else {
            result = {
              error: "unknown schema",
            };
          }
          reader.abort();
        }
      );
      await reader.start();
      return result;
    }

    is_beta_schema_type(object) {
      if((object.type == "setting") &&
         (object.name == "info") &&
         (object.schema_type == "beta") &&
         (object.notepad_name != null) &&
         (object.encrypted != null)
        ) {
        return true;
      } else {
        return false;
      }
    }

    is_alpha_schema_type(container) {
      let keys = _.keys(container);
      for(let k = 0; k < keys.length; k++) {
        let key = keys[k];
        let object = container[key];
        if(!this.is_alpha_schema_object(object)) {
          return false;
        }
      }
      return true;
    }

    is_alpha_schema_object(object) {
      let ALPHA_OBJECT_TYPES = [
        "notepad",
        "note",
        "tag",
        "tag_note",
        "note_filter",
      ];
      return ALPHA_OBJECT_TYPES.indexOf(object.type) >= 0;
    }
  }

  export default {
    props: {
      "items": Array,
    },
    
    components: {
      FullScreenBox,
      NotepadsSelectorItem,
    },

    computed: {
      "error_text": function() {
        if(this.error == "empty") {
          return "Название не может быть пустым";
        }
        return null;
      },
    },

    data: function() {
      let data = {
        active: null,
        add_name: "",
        add_mode: "create",
        error: null,
        import_file_error: null,
      };
      return data;
    },

    mounted: function() {
      this.add_select_instances = null;
      this.update_active();
    },

    watch: {
      "items": function() {
        this.update_active();
      },

      'add_name': function() {
        this.error = null;
      },

      'active': async function(value) {
        if(value == "add") {
          this.add_name = "";
          await this.$nextTick()
          this.$refs.add_name_input.focus();
          let elems = this.$refs.selects;
          this.add_select_instances = window.M.FormSelect.init(elems);
        } else {
          if(this.add_select_instances != null) {
            for(let k = 0; k < this.add_select_instances.length; k++) {
              let instance = this.add_select_instances[k];
              instance.destroy();
            }
            this.add_select_instances = null;
          }
        }
      },
    },

    methods: {
      async validate () {
        let file = this.$refs.import_file.files[0];
        let validator = new Validator(file);
        let result = await validator.validate();
        this.import_file_schema = null;
        switch(result.error) {
          case "ok":
            this.import_file_schema = result.schema;
            this.import_file_error = null;
            break;
          case "unknown schema":
            this.import_file_error = "Неизвестный формат";
            break;
          case "wrong file":
            this.import_file_error = "Некорректный файл";
            break;
          default:
            this.import_file_error = "Неизвестная ошибка";
            break;
        }
      },

      update_active: function() {
        this.active = null;
        if(this.items.length == 0) {
          this.active = "add";
        }
        if(this.items.length == 1) {
          this.active = this.items[0].id;
        }
      },

      create_notepad: function() {
        if(this.add_name == "") {
          this.error = "empty";
          this.$refs.add_name_input.focus();
          return;
        }
        if(this.add_mode == "import") {
          let files = this.$refs.import_file.files;
          if(files.length == 0) {
            return
          }
          let data = {
            "name": this.add_name,
            "file": files[0],
            "schema": this.import_file_schema,
          };
          this.$emit('import', data);
        } else {
          this.$emit('create', this.add_name);
        }
      },
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .collection.notepads-selector .collection-item {
    padding: 10px;
  }

  .new-notepad-mode {
    margin-left: 20px;
    margin-right: 20px;
    cursor: pointer;
  }

  .new-notepad-mode.active {
    text-decoration: underline;
    font-weight: bold;
  }
</style>
