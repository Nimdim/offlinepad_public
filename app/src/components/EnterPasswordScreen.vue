<template>
  <full-screen-box
    :top="true"
    :fullscreen="true"
    style="background-color: rgba(0, 0, 0, 0.5);"
  >
    <ul
      class="collection notepads-selector block-center"
      style="border: unset;"
    >
      <li class="collection-item"
      >
        <span>
          <form class="col s12">
            <div
              class="row"
              style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <span
                  class="unselectable"
                >
                  Для продолжения авторизуйтесь
                </span>
              </div>
            </div>
            <div class="row" style="margin-bottom: 0px;">
              <div class="input-field col s12">
                <span
                  class="left text-selector unselectable"
                  :class="{'active': current_method=='passphrase'}"
                  @click="set_current_method('passphrase')"
                >
                  Фраза
                </span>
                <span
                  class="text-selector unselectable"
                  :class="{'active': current_method=='password', 'disabled': !available_methods['password']}"
                  @click="set_current_method('password')"
                >
                  Пароль
                </span>
                <span
                  class="right text-selector unselectable"
                  :class="{'active': current_method=='pin', 'disabled': !available_methods['pin']}"
                  @click="set_current_method('pin')"
                >
                  ПИН
                </span>
              </div>
            </div>

            <template v-if="current_method != 'pin'">
              <template v-if="!password_processing">
                <div
                  class="row" style="margin-bottom: 0px;"
                >
                  <div class="input-field col s12">
                    <input
                      ref="add_name_input"
                      :placeholder="secret_placeholder[current_method]"
                      :type="input_type"
                      :class="password_valid"
                      v-model="password"
                      show-password
                      style="width: calc(100% - 50px);"
                    >
                    <a class="waves-effect waves-light btn action-button"
                      style="width: 50px;"
                      @click="toggle_password"
                    >
                      <font-awesome-icon icon="eye"
                      />
                    </a>

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
                  <div class="input-field col s6">
                    <a class="waves-effect waves-light btn left action-button"
                      style="width: 100%;"
                      @click="$emit('cancel')"
                    >
                      <font-awesome-icon icon="times-circle"/>
                    </a>
                  </div>
                  <div class="input-field col s6">
                    <a class="waves-effect waves-light btn right action-button"
                      style="width: 100%;"
                      @click="submit_password"
                    >
                      <font-awesome-icon icon="check"/>
                    </a>
                  </div>
                </div>
              </template>
              <preloader v-else />
            </template>
            <pin-pad
              v-else
              ref="pin_pad"
              style="margin: 20px auto;"
              :numbers_count="4"
              @submit="$emit('submit', {'method': 'pin', 'value': $event})"
              @cancel="$emit('cancel')"
            />
          </form>
        </span>
      </li>
    </ul>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";
  import PinPad from "./PinPad.vue";
  import Preloader from './Preloader.vue'

  export default {
    props: {
      "items": Array,
      "available_methods": Object,
      "auth_method": {
        type: String,
        default: "passphrase",
      }
    },
    
    components: {
      FullScreenBox,
      PinPad,
      Preloader,
    },

    computed: {
      "error_text": function() {
        if(this.error == "empty") {
          return "Пароль не может быть пустым";
        }
        return null;
      },

      "input_type": function() {
        if(this.show_password) {
          return "text";
        } else {
          return "password";
        }
      },

      "password_valid": function() {
        let result = "invalid";
        if(this.password.length > 0) {
          result = "valid";
        }
        return result;
      },
    },

    data: function() {
      let current_method = this.auth_method;
      if(this.available_methods[this.auth_method] !== true) {
        let METHODS = ["pin", "password", "passphrase"];
        for(let k = 0; k < METHODS.length; k++) {
          let method = METHODS[k];
          if(this.available_methods[method]) {
            current_method = method;
            break;
          }
        }
      }
      let data = {
        current_method: current_method,
        password_processing: false,
        show_password: false,
        secret_placeholder: {
          "passphrase": "",
          "password": "",
          "pin": "Пин",
        },
        password: "",
        error: "",
      };
      return data;
    },

    mounted: function() {
      this.password = "";
    },

    watch: {
      current_method: {
        handler: async function(value) {
          this.password = "";
          this.show_password = false;
          if(value == "passphrase" || value == "password") {
            await this.$nextTick();
            this.$refs.add_name_input.focus();
          }
        },
        immediate: true,
      },

      password: function() {
        this.error = "";
      }
    },

    methods: {
      submit_password: async function() {
        if(this.password.length == 0) {
          this.error = "empty";
          return;
        }
        this.password_processing = true;
        await this.$nextTick();
        let data = {
          'method': this.current_method,
          'value': this.password,
        };
        this.$emit('submit', data);
      },

      set_current_method: function(method) {
        if(this.available_methods[method]) {
          this.current_method = method;
        }
      },

      reset: function() {
        this.password_processing = false;
        if(this.$refs.pin_pad != null) {
          this.$refs.pin_pad.clear();
        }
      },

      toggle_password: function() {
        this.show_password = !this.show_password;
      }
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .collection.notepads-selector .collection-item {
    padding: 10px;
  }

  .text-selector {
    cursor: pointer;
    display: inline-block;
    width: 60px;
  }

  .text-selector.active {
    text-decoration: underline;
  }

  .text-selector.disabled {
    color: gray;
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

  .one-notepad-center {
      position: relative;
      display: inline-block;
      top: 50%;
      left: 50%;
      -webkit-transform: translate(-50%, -50%);
      transform: translate(-50%, -50%);
  }

</style>
