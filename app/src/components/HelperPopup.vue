<template>
  <div class="col s12 m7">
    <div class="card attention horizontal popup">
      <div class="card-stacked">
        <div
          class="countdown"
          :style="countdown_style"
        >
          <div class="time-pointer">
          </div>
        </div>
        <div class="card-content">
          <p style="font-size: 12px; line-height: 1.2em;">
            {{text}}
          </p>
          <font-awesome-icon
            class="grey_icon popup-close"
            icon="times"
            style="margin-left: 10px;"
            @click.prevent="$emit('close')" />
          <p
            v-for="(action, ix) in actions" :key="ix"
            style="color: darkorange; text-decoration: underline; cursor: pointer; font-size: 12px;"
            @click="click_action(action)"
        >
            {{action.text}}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      "text": {},
      "actions": {},
      "hide_delay": {
        type: Number,
        default: 0,
      },
    },

    computed: {
      countdown_style: function() {
        let style = {};
        if(this.hide_delay != 0) {
          style.animation = this.hide_delay + "s linear countdown_burn forwards";
        } else {
          style.display = "none";
        }
        return style;
      },
    },

    data: function() {
      return {
        delay_position: 100,
      };
    },

    mounted: function() {
      if(this.hide_delay != 0) {
        this.countdown_style.animation = this.hide_delay + "s linear countdown_burn forwards";
        setTimeout(this.close, this.hide_delay * 1000 - 100);
      }
    },

    methods: {
      close: function() {
        this.$emit("close");
      },

      click_action: function(action) {
        action.handler();
        this.close();
      },
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .countdown {
    left: 0px;
    top: 0px;
    width: 100%;
    height: 2px;
  }

  .time-pointer {
    width: 6px;
    height: 6px;
    float: right;
    border-radius: 100%;
    position: relative;
    top: -2px;
    left: 2px;
  }

  @keyframes countdown_burn {
    from {
      width: 100%;
    }

    to {
      width: 0%;
    }
  }
</style>
