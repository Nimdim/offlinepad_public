<template>
  <full-screen-box :top="true" :fullscreen="true">
    <span>
      <ul
        class="collection notepads-selector"
      >
        <li class="collection-item"
       >
          <span>
            <form class="col s12">
              <div>
                <span>
                  Выберите pin
                </span><br>
                <pin-pad
                  style="margin: 20px auto;"
                  :numbers_count="numbers_count"
                  @submit="$emit('submit', $event)"
                  @cancel="$emit('cancel')"
                />
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
  import PinPad from './PinPad.vue';

  export default {
    props: {
      "numbers_count": {
        type: Number,
      },
    },
    
    components: {
      FullScreenBox,
      PinPad,
    },

    computed: {
    },

    data: function() {
      let data = {};
      return data;
    },

    mounted: function() {
    },

    watch: {
    },

    methods: {
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
  }
  .pin-number {
    /* display: inline-block; */
    margin: 0 10px;
  }
</style>
