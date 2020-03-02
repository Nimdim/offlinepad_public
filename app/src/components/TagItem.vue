<template>
  <li class="collection-item" v-on:click="$emit('click', data.id)">
    <p>
      <input v-if="data.edit_state"
        placeholder="Название метки" type="text" class="validate tag_name" v-model="data.name" />
      <span class="tag_name" v-else v-html="tag.name_highlighted"></span>
      <span class="badge">{{data.count}}</span>
      <template v-if="data.edit_state">
        <a class="waves-effect waves-teal btn-small right tag_delete_btn"
          v-on:click.prevent.stop="$emit('submit', data)">
          <font-awesome-icon icon="check" />
        </a>
        <a class="waves-effect waves-teal btn-small right tag_delete_btn red"
          @click.prevent.stop="$emit('cancel', data)">
          <font-awesome-icon icon="times-circle" />
        </a>
      </template>
      <template v-else-if="delete_prompt">
        <a class="waves-effect waves-teal btn-small right tag_delete_btn"
          @click.prevent.stop="delete_prompt = false">
          <font-awesome-icon icon="times-circle" />
        </a>
        <a class="waves-effect waves-teal btn-small right tag_delete_btn red"
          v-on:click.prevent.stop="$emit('delete', data.id)">
          <font-awesome-icon icon="trash" />
        </a>
      </template>
      <template v-else>
        <a class="waves-effect waves-teal btn-flat btn-small right tag_delete_btn"
          v-on:click.prevent.stop="delete_prompt = true">
          <font-awesome-icon icon="trash" class="grey_icon" />
        </a>
        <a class="waves-effect waves-teal btn-flat btn-small right tag_delete_btn"
          v-on:click.prevent.stop="edit_item">
          <font-awesome-icon icon="pen" class="grey_icon" />
        </a>
      </template>
    </p>
  </li>
</template>

<script>
  import _ from "lodash";

  export default {
    props: {
      tag: Object,
    },
    data: function() {
      let data = {
        delete_prompt: false,
        data: _.cloneDeep(this.tag),
      }
      return data;
    },
    methods: {
      edit_item: function() {
        this.data._old_name = this.data.name;
        this.data.edit_state = true
      }
    }
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  input[type=text].tag_name {
    width: calc(100% - 160px);
    position: relative;
    top: -10px;
    margin: 0px;
  }
  span.tag_name {
    width: calc(100% - 160px);
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
