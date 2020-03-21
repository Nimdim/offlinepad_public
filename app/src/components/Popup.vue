<template>
<ul id="dropdown1" class="dropdown-content" :style="style">
  <li v-for="item in items" :key="item.id">
    <a href="#!" @click="on_item_click(item.id)">{{item.name}}</a>
  </li>
  <!-- <li class="divider"></li>
  <li><a href="#!">Разбор</a></li>
  <li><a href="#!">Задачи</a></li> -->
</ul>
</template>

<script>

export default {
  props: {
    items: Array,
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
</style>
