<template>
  <full-screen-box :top="true" :fullscreen="true">
    <ul
      class="collection notepads-selector block-center"
      style="border: unset;"
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
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn wizard-selector-btn"
                  @click="step = STEPS.NOTEPAD_TYPE"
                >
                  <font-awesome-icon icon="plus"/>
                  Создать новый блокнот
                </a>
                <span class="wizard-hinttext">
                  Будет создан пустой блокнот
                </span>
              </div>
            </div>
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn wizard-selector-btn"
                  @click="$refs.import_file.click()"
                >
                  <font-awesome-icon icon="file-upload"/>
                  Открыть резервную копию
                </a>
                <span v-if="import_file_error"
                  class="red-text"
                  style="display: block;"
                >
                  {{import_file_error}}
                </span>
                <span class="wizard-hinttext">
                  Создайте блокнот из ранее созданной резервной копии
                </span>
              </div>
            </div>
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn"
                  @click="cancel_wizard"
                >
                  Отмена
                </a>
              </div>
            </div>
          </div>

          <div v-else-if="step == STEPS.NOTEPAD_TYPE">
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn wizard-selector-btn"
                  @click="encrypted_notepad_selected"
                >
                  <font-awesome-icon icon="lock"/>
                  Зашировать записи
                </a>
                <span class="wizard-hinttext">
                  Записи блокнота будут надежно зашифрованы и будут доступны только после введения пароля
                </span>
              </div>
            </div>
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn wizard-selector-btn"
                  @click="plain_notepad_selected"
                >
                  Без шифрования
                </a>
                <span class="wizard-hinttext">
                  Записи блокнота не будут зашифрованы и будут храниться в открытом виде
                </span>
              </div>
            </div>
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn"
                  @click="cancel_wizard"
                >
                  Отмена
                </a>
              </div>
            </div>
          </div>

          <div v-else-if="step == STEPS.NOTEPAD_NAME">
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <input
                  ref="add_name_input"
                  placeholder="Название блокнота"
                  type="text"
                  :class="notepad_name_class"
                  v-model="creation_info.notepad_name"
                >
                <template v-if="error_text">
                  <span class="left red-text">
                    {{error_text}}
                  </span><br><br>
                </template>
                <span class="wizard-hinttext">
                  Данное название будет отображаться в списке блокнотов на главном экране приложения. Имя позднее можно изменить.
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
                <span
                  class="wizard-secret"
                  style="margin-bottom: 10px;"
                >
                  {{creation_info.secret.value}}
                </span>
                <a class="waves-effect waves-light btn"
                  style="width: 100%;"
                  @click="copy_secret_value"
                >
                  <font-awesome-icon icon="copy"/>
                  Копировать
                </a>
                <p class="wizard-hinttext">Надежно сохраните секретную фразу.</p>
                <p class="wizard-hinttext">После создания блокнота вы сможете открыть его <b class="highlight">только при помощи данной секретной фразы</b> и только потом сможете задать альтернативные способы авторизации.</p>
                <p class="wizard-hinttext">Зашифрованные резервные копии блокнота можно будет открыть <b class="highlight">только при помощи данной секретной фразы</b>.</p>
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
                  @click="goto_enter_name"
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
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import { PartialFileReader } from './../js/partial_file_reader.js';
  import _ from "lodash";
  import diceware from "./../js/diceware/diceware.js";
  import utils from './../js/utils.js'

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
              encrypted: import_data.encrypted,
            };
          } else if(this.is_alpha_schema_type(import_data)) {
            result = {
              error: "ok",
              schema: "alpha",
              encrypted: false,
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

      "notepad_name_class": function() {
        let result = {
          'valid': !!this.creation_info.notepad_name.length,
          'invalid': !this.creation_info.notepad_name.length,
        };
        return result;
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
      fallbackCopyTextToClipboard: function(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        let result;
        try {
          var successful = document.execCommand('copy');
          result = successful;
        } catch (err) {
          err;
          result = false;
        }

        document.body.removeChild(textArea);
        return result;
      },

      copyTextToClipboard: function(text) {
        if (!navigator.clipboard) {
          return Promise.resolve(this.fallbackCopyTextToClipboard(text));
        }
        let promise = new Promise((resolve) => {
          navigator.clipboard.writeText(text).then(function() {
            // console.log('Async: Copying to clipboard was successful!');
            resolve(true);
          }, function(err) {
            err;
            // console.error('Async: Could not copy text: ', err);
            resolve(false);
          });
        });
        return promise;
      },

      copy_secret_value: async function() {
        let success = await this.copyTextToClipboard(this.creation_info.secret.value);
        this.$emit("secret_copied", success);
      },

      goto_enter_name: async function() {
        this.step = STEPS.NOTEPAD_NAME;
        await this.$nextTick();
        this.$refs.add_name_input.focus();
      },

      cancel_wizard: function() {
        this.$emit("cancel")
      },

      finish_wizard: function() {
        if(this.creation_info.notepad_name == "") {
          this.error = "empty";
          utils.vibrate("error");
          return;
        }
        this.$emit("finish", this.creation_info);
      },

      generate_secret: function() {
        let indexes = diceware.generate_indexes_list(6);
        let words = diceware.indexes_list_to_passphrase(indexes, "ru");
        let result = {
          method: "passphrase",
          value: words.join(" "),
        };
        return result;
      },

      encrypted_notepad_selected: function() {
        this.creation_info.encrypted = true;
        this.creation_info.secret = this.generate_secret();
        this.step = STEPS.SECRET;
      },

      plain_notepad_selected: async function() {
        this.creation_info.encrypted = false;
        this.step = STEPS.NOTEPAD_NAME;
        await this.$nextTick();
        this.$refs.add_name_input.focus();
      },

      file_selected: async function() {
        let file = this.$refs.import_file.files[0];
        let result = await this.validate(file);
        if(result != null) {
          this.creation_info.file = file;
          this.creation_info.schema = result.schema;
          this.creation_info.encrypted = result.encrypted;
          if(result.encrypted) {
            this.step = STEPS.NOTEPAD_NAME;
            await this.$nextTick();
            this.$refs.add_name_input.focus();
          } else {
            this.step = STEPS.NOTEPAD_TYPE;
          }
        } else {
          this.$refs.import_file.value = "";
          utils.vibrate("error");
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
            validate_result = result;
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

  .wizard-hinttext {
    display: block;
    text-align: left;
    font-size: 12px;
    margin-top: 8px;
    margin-bottom: 8px;
    line-height: 1.3em;    
  }

  .wizard-secret {
    display: block;
    border: 1px solid;
    padding: 10px;
  }

  .wizard-selector-btn {
    width: 100%;
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
