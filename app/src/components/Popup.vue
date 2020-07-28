<template>
<ul id="dropdown1" class="dropdown-content" :style="style">
  <popup-item v-for="item in items" :key="item.id"
    :item_data="item"
    @click="on_item_click(item.id)"
    @delete="$emit('delete', item.id)"
    @submit="$emit('submit', {id: item.id, data: $event})"
  />
</ul>
</template>

<script>

import PopupItem from "./PopupItem.vue"

export default {
  props: {
    items: Array,
  },

  components: {
    PopupItem,
  },

  data: function() {
    let data = {
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
      this.hide();
      this.$emit("click", id);
    },

    hide: function() {
      this.style.display = "none";
    },

    show_at: function(x, y) {
      this.style.display = "block";
      this.style.left = x + "px";
      this.style.top = y + "px";
      this.style.opacity = 1;
    },

    is_hidden: function() {
      return this.style.display == "none";
    },

    toggle: function(x, y) {
      if(this.is_hidden()) {
        this.show_at(x, y);
      } else {
        this.hide();
      }
    },
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
