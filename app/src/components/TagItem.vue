<template>
  <li class="collection-item" v-on:click="$emit('click', tag.id)">
    <p v-if="tag.hidden !== true">
      <label v-on:click.stop="">
        <input type="checkbox" v-model="tag.checked"/>
        <span>{{tag.name}}</span>
      </label>
      <span class="badge">{{tag.count}}</span>
      <a class="waves-effect waves-teal btn right tag_delete_btn" v-on:click.prevent.stop="$emit('hide', tag.id)">
        <i class="material-icons">delete</i>
      </a>
    </p>
    <p v-else>
      <a class="waves-effect waves-teal btn tag_delete_btn" style="margin-right: 10px;" v-on:click.prevent.stop="$emit('show', tag.id)">
        <i class="material-icons">Отмена</i>
      </a>
      <a class="waves-effect waves-teal btn tag_delete_btn" v-on:click.prevent.stop="$emit('delete', tag.id)">
        <i class="material-icons">Удалить</i>
      </a>
    </p>
  </li>
</template>

<script>
export default {
  props: {
    tag: Object,
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
</style>
