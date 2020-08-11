<template>
  <li
    :class="{'editing': data.edit_state}"
    @click="$emit('click')">
    <a style="padding-right: 8px;">
      <font-awesome-icon v-if="typeof(data.id) == 'number'"
        class="mobile-menu-icon"
        icon="bookmark"
      />
      <font-awesome-icon v-else
        class="mobile-menu-icon"
        icon="book"
      />
      <input v-if="data.edit_state"
        ref="name"
        type="text"
        style="width: calc(100% - 110px);"
        @click.stop=""
        v-model="data.name" />
      <span v-else>
        {{data.name}}
      </span>
      <template v-if="typeof(data.id) == 'number'">
        <template v-if="data.edit_state">
          <a class="waves-effect waves-teal btn-small right note-filter-btn"
            key="edit_submit"
            v-on:click.prevent.stop="submit">
            <font-awesome-icon icon="check" />
          </a>
          <a class="waves-effect waves-teal btn-small right red note-filter-btn button-space"
            key="edit_cancel"
            @click.prevent.stop="cancel_edit">
            <font-awesome-icon icon="times-circle" />
          </a>
        </template>
        <template v-else-if="delete_prompt">
          <a class="waves-effect waves-teal btn-small right note-filter-btn"
            key="delete_cancel"
            @click.prevent.stop="delete_prompt = false"
          >
            <font-awesome-icon icon="times-circle" />
          </a>
          <a class="waves-effect waves-teal btn-small red right note-filter-btn button-space"
            key="delete_submit"
            @click.prevent.stop="$emit('delete')"
          >
            <font-awesome-icon icon="trash" />
          </a>
        </template>
        <template v-else>
          <a class="waves-effect waves-teal btn-small btn-flat right note-filter-btn"
            key="normal_delete"
            @click.prevent.stop="delete_prompt = true"
          >
            <font-awesome-icon icon="trash" />
          </a>
          <a class="waves-effect waves-teal btn-small btn-flat right note-filter-btn button-space"
            key="normal_edit"
            @click.prevent.stop="edit_item"
          >
            <font-awesome-icon icon="pen" />
          </a>
        </template>
        <span v-if="error_text"
          style="display: block;
                position: relative;
                top: -10px;
                left: 10px;
                font-size: 10px;
                line-height: 10px;
                color: red;
                margin-top: 5px;"
        >{{error_text}}</span>
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

  computed: {
    error_text: function() {
      if(this.data.error == "existing") {
        return "Закладка с таким названием существует";
      } else if (this.data.error == "empty") {
        return "Название не может быть пустым";
      } else {
        return null;
      }
    },
  },

  data: function() {
    let data = {
      data: _.cloneDeep(this.note_filter),
      delete_prompt: false,
    };
    data.data.error = null;
    data.data.edit_state = false;
    return data;
  },

  methods: {
    submit: function() {
      this.data.error = null;
      this.data.edit_state = false;
      this.$emit("edit_state_changed", this.data.edit_state);
      this.$emit("submit", this.data);
    },

    cancel_edit: function() {
      this.data.error = null;
      this.data.name = this.old_name;
      this.data.edit_state = false;
      this.$emit("edit_state_changed", this.data.edit_state);
    },

    edit_item: function() {
      this.old_name = this.data.name;
      this.data.edit_state = true;
      this.$emit("edit_state_changed", this.data.edit_state);
      this.$nextTick(
        () => {
          this.$refs.name.focus();
        }
      )
    },
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  nav ul a.note-filter-btn {
    position: relative;
    top: 8px;
    padding: 0px 10px;
    margin: 0px;
  }
</style>
