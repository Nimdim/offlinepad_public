<template>
  <div style="width: 180px; height: 260px;" v-if="entering">
    <div
      class="row"
    >
      <span v-for="(i, ix) in pin" :key="ix"
        class="pin-number"
      >
        <span
          class="unselectable"
          v-if="i == '_'"
        >
          {{i}}
        </span>
        <!-- <span v-else>*</span> -->
        <font-awesome-icon
          v-else
          icon="asterisk"
          style="font-size: 9px;"
        />
      </span>
    </div>
    <div
      class="row"
      ref="pin_pad"
    >
      <div>
        <span class="pin-button unselectable"
          @click="press_pin('1')"
        >
          1
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('2')"
        >
          2
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('3')"
        >
          3
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('4')"
        >
          4
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('5')"
        >
          5
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('6')"
        >
          6
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('7')"
        >
          7
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('8')"
        >
          8
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('9')"
        >
          9
        </span>
        <span class="pin-button unselectable"
          @click="cancel"
        >
          <font-awesome-icon icon="times-circle" />
        </span>
        <span class="pin-button unselectable"
          @click="press_pin('0')"
        >
          0
        </span>
        <span class="pin-button unselectable"
          @click="clear"
        >
          <font-awesome-icon icon="backspace" />
        </span>
      </div>
    </div>
  </div>
  <div style="width: 180px; height: 260px;" v-else>
    <preloader/>
  </div>
</template>
<script>
  import Preloader from "./Preloader.vue"
  import utils from "./../js/utils.js"

  let sleep = function(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  };

  export default {
    components: {
      Preloader,
    },

    props: {
      "numbers_count": {
        type: Number,
      },
    },
    
    data: function() {
      let data = {
        pin: (new Array(this.numbers_count)).fill("_"),
        current: 0,
        entering: true,
      };
      return data;
    },

    mounted: function() {
      window.document.body.addEventListener("keydown", this.on_key_down)
    },

    beforeDestroy: function() {
      window.document.body.removeEventListener("keydown", this.on_key_down)
    },

    watch: {
    },

    methods: {
      on_key_down: function(e) {
        switch(e.code) {
          case "Digit1":
            this.press_pin("1");
            break;
          case "Digit2":
            this.press_pin("2");
            break;
          case "Digit3":
            this.press_pin("3");
            break;
          case "Digit4":
            this.press_pin("4");
            break;
          case "Digit5":
            this.press_pin("5");
            break;
          case "Digit6":
            this.press_pin("6");
            break;
          case "Digit7":
            this.press_pin("7");
            break;
          case "Digit8":
            this.press_pin("8");
            break;
          case "Digit9":
            this.press_pin("9");
            break;
          case "Digit0":
            this.press_pin("0");
            break;
          case "Backspace":
            this.clear();
            break;
          case "Escape":
            this.cancel();
            break;
        }
      },

      press_pin: async function(number) {
        if(this.current < this.numbers_count) {
          utils.vibrate("button");
          this.pin.splice(this.current, 1, number);
          this.current += 1;
          if(this.current == this.pin.length) {
            await sleep(0.25);
            this.entering = false;
            await sleep(0.5);
            this.$emit("submit", this.pin.join(""));
          }
        }
      },

      clear: function() {
        this.entering = true;
        for(let k = 0; k < this.pin.length; k++) {
          this.pin.splice(k, 1, "_");
        }
        this.current = 0;
      },

      cancel: function() {
        this.$emit("cancel");
      },
    },
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .pin-button {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin: 10px;
    padding: 9px;
    font-size: 18px;
  }

  /* .pin-button:hover {
    background: darkorange;
    color: black;
  } */

  .pin-number {
    /* display: inline-block; */
    margin: 0 10px;
    font-size: 16px;
  }
</style>
