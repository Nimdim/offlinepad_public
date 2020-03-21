<template>
  <li @click="$emit('click')">
    <a href="#!"
      style="padding-right: 8px;"
    >
      <font-awesome-icon class="mobile-menu-icon" icon="th" />
      {{note_filter.name}}
      <template v-if="note_filter.id.indexOf('internal_') == -1">
        <template v-if="delete_prompt">
          <a class="waves-effect waves-teal btn-small right"
            key="delete_cancel"
            style="position: relative; top: 8px; padding: 0px 10px; margin: 0px"
            @click="delete_prompt = false"
          >
            <font-awesome-icon v-if="note_filter.id.indexOf('internal_') == -1"
              icon="times-circle"
            />
          </a>
          <a class="waves-effect waves-teal btn-small red right"
            key="delete_submit"
            style="position: relative; top: 8px; padding: 0px 10px; margin: 0px"
            @click="$emit('delete')"
          >
            <font-awesome-icon v-if="note_filter.id.indexOf('internal_') == -1"
              icon="trash"
            />
          </a>
        </template>
        <template v-else>
          <a class="waves-effect waves-teal btn-small btn-flat right"
            key="normal_delete"
            style="position: relative; top: 8px; padding: 0px 10px; margin: 0px"
            @click="delete_prompt = true"
          >
            <font-awesome-icon
              icon="trash"
            />
          </a>
        </template>
      </template>
    </a>
  </li>
</template>

<script>

import _ from "lodash";

export default {
  props: {
    note_filter: Object,
  },

  data: function() {
    let data = {
      data: _.cloneDeep(this.note_filter),
      delete_prompt: false,
    };
    return data;
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
