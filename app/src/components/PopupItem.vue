<template>
  <li @click="$emit('click')">
    <a href="#!" @click="on_item_click(data.id)">
      <span style="margin-right: 20px;">
        {{data.name}}
      </span>
      <template v-if="data.deletable">
        <template v-if="delete_prompt">
          <a class="waves-effect waves-teal btn-small right popup-item-btn"
            key="delete_cancel"
            @click.prevent.stop="delete_prompt = false">
            <font-awesome-icon icon="times-circle" />
          </a>
          <a class="waves-effect waves-teal btn-small right red popup-item-btn"
          key="delete_submit"
              v-on:click.prevent.stop="$emit('delete')">
              <font-awesome-icon icon="trash" />
          </a>
        </template>
        <template v-else>
          <a class="waves-effect waves-teal btn-small btn-flat right popup-item-btn"
          key="normal_delete"
              v-on:click.prevent.stop="delete_prompt = true">
              <font-awesome-icon icon="trash" />
          </a>
        </template>
      </template>
    </a>
  </li>
</template>

<script>

export default {
  props: {
    data: Object,
  },

  data: function() {
    let data = {
      delete_prompt: false,
      style: {
        display: "none",
        top: "0px",
        left: "0px",
        opacity: 0,
      },
    };
    return data;
  },

  mounted: function() {
    window.document.body.addEventListener("click", this.body_click);
  },

  beforeDestroy: function() {
    window.document.body.removeEventListener("click", this.body_click);
  },

  methods: {
    body_click: function() {
      this.hide();
    },

    on_item_click: function(id) {
      this.style.display = "none";
      this.$emit("click", id);
    },

    hide: function() {
      this.style.display = "none";
    },

    toggle: function(x, y) {
      if(this.style.display == "none") {
        this.style.display = "block";
        this.style.left = x + "px";
        this.style.top = y + "px";
        this.style.opacity = 1;
      } else {
        this.hide();
      }
    },
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  .popup-item-btn {
    position: relative;
    top: -6px;
  }
</style>
