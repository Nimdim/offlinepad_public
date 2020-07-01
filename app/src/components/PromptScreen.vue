<template>
  <full-screen-box :top="true">
    <div class="row">
      <span>
          {{title}}
      </span>
    </div>
    <div class="row">
      <a
        class="waves-effect waves-teal btn button-space"
        :class="submit_class"
        @click.prevent="$emit('submit')"
      >
        <span v-if="submit_text">{{submit_text}}</span>
        <font-awesome-icon v-else icon="check" />
      </a>

      <a
        class="waves-effect waves-teal btn"
        :class="cancel_class"
        @click.prevent="$emit('cancel')"
      >
        <span v-if="cancel_text">{{cancel_text}}</span>
        <font-awesome-icon v-else icon="times-circle" />
      </a>
    </div>
  </full-screen-box>
</template>
<script>
  import FullScreenBox from "./FullScreenBox.vue";

  export default {
    props: {
      title: {
        type: String,
        default: "Вы уверены",
      },
      options: {},
    },

    computed: {
      submit_class: function() {
        let result = [];
        if(this.swap_colors) {
          result.push("red");
        }
        return result;
      },

      cancel_class: function() {
        let result = [];
        if(!this.swap_colors) {
          result.push("red");
        }
        return result;
      },
    },

    data: function() {
      let data = {
        swap_colors: false,
        submit_text: null,
        cancel_text: null,
      };
      if(this.options != null) {
        if(this.options.swap_colors) {
          data.swap_colors = this.options.swap_colors;
        }
        if(this.options.submit_text) {
          data.submit_text = this.options.submit_text;
        }
        if(this.options.cancel_text) {
          data.cancel_text = this.options.cancel_text;
        }
      }
      return data;
    },

    components: {
      FullScreenBox,
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
