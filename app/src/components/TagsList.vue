<template>
    <span>
    <span v-for="(tag, index) in tags" :key="tag.id" class="chip">
        <select
            class="browser-default"
            v-model="tags[index]"
        >
            <option value="0" disabled selected>Выберите</option>
            <option v-for="global_tag in all_tags" :key="global_tag.id"
                :value="global_tag.id"
                :selected="tag == global_tag.id"
            >
                {{global_tag.name}}
            </option>
        </select>
        <font-awesome-icon icon="trash"
        @click="delete_tag(index)"/>
    </span>
    <span class="chip"
        @click="add_tag">
        <font-awesome-icon icon="plus" />
    </span>
    </span>
</template>

<script>

import _ from "lodash";

export default {
  props: {
    initial_tags: Array,
    all_tags: Array,
  },

  watch: {
    "initial_tags": function(values) {
      this.enable_watch = false;
      this.$nextTick(function() {
        this.tags = _.cloneDeep(values);
        this.$nextTick(function() {
          this.enable_watch = true;
        }.bind(this));
      }.bind(this));
    },
  
    "tags": {
      handler: function(value) {
        if(this.enable_watch) {
          this.$emit("change", value);
        }
      },
      deep: true
    }
  },

  data: function() {
    let data = {
      tags: _.cloneDeep(this.initial_tags),
      enable_watch: true,
    };
    return data;
  },

  methods: {
    "add_tag": function() {
      this.tags.push(0);
    },
    
    "delete_tag": function(index) {
      this.tags.splice(index, 1);
    },
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
