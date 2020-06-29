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
                Выберите пароль
              </span>
              <div
                class="row" style="margin-bottom: 0px;"
              >
                <div class="input-field col s12">
                  <input
                    ref="add_name_input"
                    placeholder="Пароль"
                    type="text"
                    class="validate"
                    v-model="password"
                  >
                  <span v-if="error_text"
                    class="left red-text" style=""
                  >
                    {{error_text}}
                  </span>
                </div>
              </div>
            </div>
            <!-- <div TODO
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                Сложность: <span>{{complexity}}</span><br>
                Примерное подбора: <span>{{avg_time}}</span>
              </div>
            </div> -->
            <div
              class="row" style="margin-bottom: 0px;"
            >
              <div class="input-field col s12">
                <a class="waves-effect waves-light btn left red"
                  @click="$emit('cancel')"
                >
                  <font-awesome-icon icon="times-circle"/>
                </a>
                <a class="waves-effect waves-light btn right"
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

  let human_time = function(secs) {
    if(secs < 1) {
        return {
            word: "less than a second"
        };
    }
    secs = Math.floor(secs / 60);
    if(secs < 90) {
        return {
            number: secs,
            word: "m"
        }
    }
    secs = Math.floor(secs / 60);
    if(secs < 36) {
        return {
            number: secs,
            word: "h",
        }
    }
    secs = Math.floor(secs / 24);
    if(secs < 45) {
        return {
            number: secs,
            word: "d",
        }
    }
    secs = Math.floor(secs / 30);
    if(secs < 18) {
        return {
            number: secs,
            word: "month"
        }
    }
    secs = Math.floor(secs / 12);
    return {
        number: secs,
        word: "year",
    }
  };

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
        return null;
      },
    },

    data: function() {
      let data = {
        password: "",
        error: null,
        complexity: null,
        avg_time: null,
      };
      return data;
    },

    mounted: function() {
      this.password = "";
      this.$refs.add_name_input.focus()
    },

    watch: {
      "password": function(password) {
        let alphabet_size = cryptobox.calc_alphabet_size(password);
        let combinations = Math.pow(alphabet_size, password.length);
        let ht = human_time(combinations / 1000000000000);
        if(ht.number == null) {
            this.avg_time = ht.word;
        } else {
            this.avg_time = ht.number + " " + ht.word;
        }
      },
    },

    methods: {
      submit: function() {
        if(this.password == "") {
          this.error = "empty";
        } else {
          this.$emit("submit", this.password);
        }
      }
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
