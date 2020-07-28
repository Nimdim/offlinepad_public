<template>
  <li>
    <a @click="on_item_click(data.id)">
      <input v-if="data.edit_state"
        ref="name"
        type="text"
        style="width: calc(100% - 100px);"
        @click.stop=""
        v-model="data.name" />
      <span v-else
        style="margin-right: 20px;"
      >
        {{data.name}}
      </span>
      <template v-if="data.deletable">
        <template v-if="data.edit_state">
          <a class="waves-effect waves-teal btn-small right popup-item-btn"
            key="edit_submit"
            @click.prevent.stop="submit"
          >
            <font-awesome-icon icon="check" />
          </a>
          <a class="waves-effect waves-teal btn-small right red popup-item-btn button-space"
            key="edit_cancel"
            @click.prevent.stop="cancel_edit_state"
          >
            <font-awesome-icon icon="times-circle" />
          </a>
        </template>
        <template v-else-if="delete_prompt">
          <a class="waves-effect waves-teal btn-small right popup-item-btn"
            key="delete_cancel"
            @click.prevent.stop="delete_prompt = false"
          >
            <font-awesome-icon icon="times-circle" />
          </a>
          <a class="waves-effect waves-teal btn-small right red popup-item-btn button-space"
            key="delete_submit"
            @click.prevent.stop="$emit('delete')"
          >
            <font-awesome-icon icon="trash" />
          </a>
        </template>
        <template v-else>
          <a class="waves-effect waves-teal btn-small btn-flat right popup-item-btn"
            key="normal_delete"
            @click.prevent.stop="delete_prompt = true"
          >
            <font-awesome-icon icon="trash" />
          </a>
          <a class="waves-effect waves-teal btn-small btn-flat right popup-item-btn button-space"
            key="normal_edit"
            @click.prevent.stop="enter_edit_state"
          >
            <font-awesome-icon icon="pen" />
          </a>
        </template>
      </template>
      <span v-if="error_text"
        style="display: block;
              font-size: 10px;
              line-height: 10px;
              color: red;"
      >{{error_text}}</span>
    </a>
  </li>
</template>

<script>
import _ from "lodash";

export default {
  props: {
    item_data: Object,
  },

  computed: {
    error_text: function() {
      if(this.data.error == "existing") {
        return "раздел с таким названием существует";
      } else if (this.data.error == "empty") {
        return "название не может быть пустым";
      } else {
        return null;
      }
    },
  },

  data: function() {
    let data = {
      data: _.cloneDeep(this.item_data),
      delete_prompt: false,
    };
    data.data.error = null;
    data.data.edit_state = false;
    return data;
  },

  methods: {
    on_item_click: function(id) {
      this.$emit("click", id);
    },

    enter_edit_state: function() {
      this.data.edit_state = true;
      this.old_name = this.data.name;
    },

    cancel_edit_state: function() {
      this.data.edit_state = false;
      this.data.error = null;
      this.data.name = this.old_name;
    },

    submit: function() {
      this.data.edit_state = false;
      this.data.error = null;
      this.$emit('submit', this.data);
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
