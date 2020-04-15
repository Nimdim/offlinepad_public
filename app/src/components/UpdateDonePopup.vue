<template>
  <div class="col s12 m7 message_popup">
    <div class="card attention horizontal">
      <div class="card-stacked">
        <div class="card-content">
          <p>
            Обновление выполнено
            <font-awesome-icon
              class="grey_icon"
              icon="times"
              style="margin-left: 10px;"
              @click.prevent="$emit('close')" />
          </p>
          <p>Текущая версия: {{version}}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["version"],
  }
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
