<template>
    <span>
        <span v-for="(tag, index) in tags" :key="index.toString() + tag" class="chip">
            <span v-if="tag_select_view == 'mobile_compact'"
              style="position: relative;"
            >
              {{get_tag_name(tag)}}
              <select
                  style="position: absolute; left: 0; top: -8px; width: 100%; opacity: 0;"
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
            </span>
            <select v-else
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
import platform from 'platform'

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
    },
  },

  data: function() {
    let tag_select_view = "standart";
    if(platform.os.family == "Android") {
      tag_select_view = "mobile_compact";
    }
    let data = {
      tags: _.cloneDeep(this.initial_tags),
      enable_watch: true,
      tag_select_view: tag_select_view,
    };
    return data;
  },

  methods: {
    add_tag: function() {
      this.tags.splice(this.tags.length, 0, "0");
    },
    
    delete_tag: function(index) {
      this.tags.splice(index, 1);
    },

    // mobile_compact_select: function(index) {
    //   debugger
    //   // this.tags.splice(index, 1, this.all_tags[0].id);
    //   this.mobile_compact_select_index = index;
    //   eventFire(this.$refs.mobile_compact_selector, "mousedown");
    //   // this.$refs.mobile_compact_selector.click();
    // },

    get_tag_name: function(tag_id) {
      let index;
      for(index in this.all_tags) {
        let tag = this.all_tags[index];
        if(tag.id == tag_id) {
          return tag.name;
        }
      }
      return "Выберите";
    },
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
