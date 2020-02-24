<template>
  <li class="collection-item" v-on:click="$emit('click', data.id)">
    <p v-if="delete_prompt !== true">
      <label v-on:click.stop="">
        <input type="checkbox" v-model="data.checked"/>
        <input v-if="data.edit_state"
          placeholder="Название метки" type="text" class="validate" v-model="data.name" />
        <span v-else>{{data.name}}</span>
      </label>
      <span class="badge">{{data.count}}</span>
      <template v-if="data.edit_state">
        <a class="waves-effect waves-teal btn right tag_delete_btn"
          v-on:click.prevent.stop="$emit('submit', data)">
          <i class="material-icons">done</i>
        </a>
        <a class="waves-effect waves-teal btn right tag_delete_btn"
          @click.prevent.stop="$emit('cancel', data)">
          <i class="material-icons">cancel</i>
        </a>
      </template>
      <template v-else>
        <a class="waves-effect waves-teal btn right tag_delete_btn"
          v-on:click.prevent.stop="delete_prompt = true">
          <i class="material-icons">delete</i>
        </a>
        <a class="waves-effect waves-teal btn right tag_delete_btn"
          v-on:click.prevent.stop="edit_item">
          <i class="material-icons">create</i>
        </a>
      </template>
    </p>
    <p v-else>
      <a class="waves-effect waves-teal btn tag_delete_btn"
        style="margin-right: 10px;"
        v-on:click.prevent.stop="delete_prompt = false">
        <i class="material-icons">Отмена</i>
      </a>
      <a class="waves-effect waves-teal btn tag_delete_btn"
        v-on:click.prevent.stop="$emit('delete', data.id)">
        <i class="material-icons">Удалить</i>
      </a>
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
</style>
