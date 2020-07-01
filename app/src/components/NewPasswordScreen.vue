<template>
  <full-screen-box :top="true" :fullscreen="true">
    <ul
      class="collection notepads-selector block-center"
      style="border: unset;"
    >
      <li class="collection-item"
      >
        <span>
          <form class="col s12">
            <div>
              <span>
                Введите новый пароль
              </span>
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <input
                    ref="add_name_input"
                    placeholder=""
                    :type="input_type"
                    class="validate"
                    v-model="password"
                  >
                  <span v-if="error_text"
                    class="left red-text" style=""
                  >
                    {{error_text}}
                  </span>
                  <a class="waves-effect waves-light btn left action-button"
                    style="width: 100%;"
                    @click="toggle_password"
                  >
                    <font-awesome-icon icon="eye"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div
                class="input-field col s12"
                style="margin: 0px;"
              >
                <div>
                  <div v-for="(i, ix) in new Array(14)"
                    :key="ix"
                    class="complexity-line"
                    :class="password_complexity_style(ix)"
                  />
                </div>
                <span style="float: left;" class="wizard-hinttext">
                  {{password_complexity_text}}
                </span>
              </div>
            </div>

            <div
              class="row" style="margin-bottom: 0px;"
            >
              Введите пароль еще раз
              <div class="input-field col s12">
                <input
                  ref="add_name_input_repeat"
                  placeholder=""
                  :type="input_type"
                  class="validate"
                  v-model="password_repeat"
                >
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
                  @click="submit"
                >
                  <font-awesome-icon icon="check"/>
                </a>
              </div>
            </div>
          </form>
        </span>
      </li>
    </ul>
  </full-screen-box>
</template>
<script>

  import cryptobox from "./../js/cryptobox.js";
  import FullScreenBox from "./FullScreenBox.vue";

  // let human_time = function(secs) {
  //   if(secs < 1) {
  //       return {
  //           word: "less than a second"
  //       };
  //   }
  //   secs = Math.floor(secs / 60);
  //   if(secs < 90) {
  //       return {
  //           number: secs,
  //           word: "m"
  //       }
  //   }
  //   secs = Math.floor(secs / 60);
  //   if(secs < 36) {
  //       return {
  //           number: secs,
  //           word: "h",
  //       }
  //   }
  //   secs = Math.floor(secs / 24);
  //   if(secs < 45) {
  //       return {
  //           number: secs,
  //           word: "d",
  //       }
  //   }
  //   secs = Math.floor(secs / 30);
  //   if(secs < 18) {
  //       return {
  //           number: secs,
  //           word: "month"
  //       }
  //   }
  //   secs = Math.floor(secs / 12);
  //   return {
  //       number: secs,
  //       word: "year",
  //   }
  // };

  export default {
    props: {
    },
    
    components: {
      FullScreenBox,
    },

    computed: {
      "error_text": function() {
        if(this.error == "empty") {
          return "Пароль не может быть пустым";
        }
        if(this.error == "not equal") {
          return "Пароли не совпадают";
        }
        return null;
      },

      password_complexity_text: function() {
        switch(this.password_complexity) {
          case "weak": return "Слабый пароль";
          case "good": return "Хороший пароль";
          case "secure": return "Надежный пароль";
        }
        return "";
      },

      password_complexity: function() {
        if(this.password_bits < 58) {
          return "weak";
        }
        if(this.password_bits < 68) {
          return "good";
        }
        return "secure";
      }
    },

    data: function() {
      let data = {
        password: "",
        password_repeat: "",
        error: null,
        complexity: null,
        avg_time: null,
        input_type: "password",
        password_bits: 0,
      };
      return data;
    },

    mounted: function() {
      this.password = "";
      this.$refs.add_name_input.focus()
    },

    watch: {
      "password": function(password) {
        // let alphabet_size = cryptobox.calc_alphabet_size(password);
        this.password_bits = cryptobox.calc_password_bits(password);
        // let combinations = Math.pow(alphabet_size, password.length);
        // let ht = human_time(combinations / 1000000000000);
        // if(ht.number == null) {
        //     this.avg_time = ht.word;
        // } else {
        //     this.avg_time = ht.number + " " + ht.word;
        // }
      },
    },

    methods: {
      password_complexity_style: function(ix) {
        let result = [this.password_complexity];
        if((ix + 1) * 5 < this.password_bits) {
          result.push("filled");
        }
        return result;
      },

      toggle_password: function() {
        if(this.input_type == "password") {
          this.input_type = "text";
        } else {
          this.input_type = "password";
        }
      },

      submit: function() {
        if(this.password == "") {
          this.error = "empty";
        } else if (this.password != this.password_repeat) {
          this.error = "not equal";
        } else {
          this.$emit("submit", this.password);
        }
      }
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .complexity-line {
    width: 13px;
    height: 4px;
    display: inline-block;
    margin-left: 0px;
    margin-right: 3px;
    float: left;
    border: 1px solid;
  }

  .complexity-line.weak {
    border-color: gray;
  }

  .complexity-line.good {
    border-color: gray;
  }

  .complexity-line.secure {
    border-color: gray;
  }

  .complexity-line.weak.filled {
    background-color: red;
    border-color: red;
  }

  .complexity-line.good.filled {
    background-color: yellow;
    border-color: yellow;
  }

  .complexity-line.secure.filled {
    background-color: green;
    border-color: green;
  }
</style>
