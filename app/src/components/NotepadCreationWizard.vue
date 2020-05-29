<template>
  <full-screen-box :top="true" :fullscreen="true">
    <span class="">
      <ul
        class="collection notepads-selector"
      >
        <input
          type="file"
          ref="import_file"
          style="display: none;"
          @change="file_selected"
        /> 
        <li class="collection-item"
        >
          <span>
          <form class="col s12">
            <div v-if="step == STEPS.NEW_OR_OPEN_FILE">
              Создание блокнота
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <a class="waves-effect waves-light btn"
                    @click="step = STEPS.NOTEPAD_TYPE"
                  >
                    <font-awesome-icon icon="plus"/>
                    Новый
                  </a>
                </div>
              </div>
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <a class="waves-effect waves-light btn"
                    @click="$refs.import_file.click()"
                  >
                    <font-awesome-icon icon="file-upload"/>
                    Открыть файл
                  </a>
                  <span v-if="import_file_error">
                    {{import_file_error}}
                  </span>
                </div>
              </div>
            </div>

            <div v-else-if="step == STEPS.NOTEPAD_TYPE">
              Тип блокнота
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <a class="waves-effect waves-light btn"
                    @click="encrypted_notepad_selected"
                  >
                    <font-awesome-icon icon="lock"/>
                    С шифрованием
                  </a>
                </div>
              </div>
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <a class="waves-effect waves-light btn"
                    @click="plain_notepad_selected"
                  >
                    <!-- <font-awesome-icon icon=""/> -->
                    Без шифрования
                  </a>
                </div>
              </div>
            </div>

            <div v-else-if="step == STEPS.NOTEPAD_NAME">
              Название блокнота
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <input
                    ref="add_name_input"
                    placeholder="Название блокнота"
                    type="text"
                    class="validate"
                    v-model="creation_info.notepad_name"
                  >
                  <span v-if="error_text"
                    class="left red-text" style=""
                  >
                    {{error_text}}
                  </span>
                </div>
              </div>
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <a class="waves-effect waves-light btn left"
                    @click="cancel_wizard"
                  >
                    <!-- <font-awesome-icon icon=""/> -->
                    Отмена
                  </a>
                  <a class="waves-effect waves-light btn right"
                    @click="finish_wizard"
                  >
                    <!-- <font-awesome-icon icon=""/> -->
                    Создать
                  </a>
                </div>
              </div>
            </div>

            <div v-else-if="step == STEPS.SECRET">
              Секретная фраза
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <textarea id="secret" class="materialize-textarea">lorem ipsum dolor amet a vesla in a tesla</textarea>
                  <label for="secret">Textarea</label>
                </div>
              </div>
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <a class="waves-effect waves-light btn left"
                    @click="cancel_wizard"
                  >
                    <!-- <font-awesome-icon icon=""/> -->
                    Отмена
                  </a>
                  <a class="waves-effect waves-light btn right"
                    @click="step = STEPS.NOTEPAD_NAME"
                  >
                    <!-- <font-awesome-icon icon=""/> -->
                    Далее
                  </a>
                </div>
              </div>
            </div>
            <div v-else>
              Произогла ошибка, перезагрузите страницу
            </div>
          </form>
          </span>
        </li>
      </ul>
    </span>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
//   import NotepadsSelectorItem from "./NotepadsSelectorItem.vue";
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

  let STEPS = {
    NEW_OR_OPEN_FILE: "NEW_OR_OPEN_FILE",
    NOTEPAD_TYPE: "NOTEPAD_TYPE",
    NOTEPAD_NAME: "NOTEPAD_NAME",
    SECRET: "SECRET",
  }

  export default {
    props: {
    },
    
    components: {
      FullScreenBox,
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
        STEPS: STEPS,
        creation_info: {
          encrypted: null,
          notepad_name: "",
          secret: null,
          file: null,
        },
        step: "",
        add_name: "",
        error: null,
        import_file_error: null,
      };
      return data;
    },

    mounted: function() {
      this.step = STEPS.NEW_OR_OPEN_FILE;
    },

    watch: {
      'add_name': function() {
        this.error = null;
      },
    },

    methods: {
      cancel_wizard: function() {
        this.$emit("cancel")
      },

      finish_wizard: function() {
        this.$emit("finish", this.creation_info);
      },

      generate_secret: function() {
        return "lorem ipsum have s secret";
      },

      encrypted_notepad_selected: function() {
        this.creation_info.encrypted = true;
        this.creation_info.secret = this.generate_secret();
        this.step = STEPS.SECRET;
      },

      plain_notepad_selected: function() {
        this.creation_info.encrypted = false;
        this.step = STEPS.NOTEPAD_NAME;
      },

      file_selected: async function() {
        let file = this.$refs.import_file.files[0];
        let result = await this.validate(file);
        if(result != null) {
          this.creation_info.file = file;
          this.creation_info.schema = result;
          this.step = STEPS.NOTEPAD_NAME;
        } else {
          this.$refs.import_file.value = "";
        }
      },

      async validate(file) {
        let validator = new Validator(file);
        let result;
        try {
          result = await validator.validate();
        } catch (e) {
          result = {error: "wrong file"};
        }
        this.import_file_schema = null;
        let validate_result = null;
        switch(result.error) {
          case "ok":
            this.import_file_error = null;
            validate_result = result.schema;
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
        return validate_result;
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

  /* .one-notepad-center {
      position: relative;
      display: inline-block;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
  } */

</style>
