<template>
  <div id="loadscreen">
    <span class="center_span">
    <div class="preloader-wrapper big active">
    <div class="spinner-layer spinner-blue-only">
      <div class="circle-clipper left">
      <div class="circle"></div>
      </div><div class="gap-patch">
      <div class="circle"></div>
      </div><div class="circle-clipper right">
        <div class="circle"></div>
      </div>
    </div>
    </div>
    </span>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    visible: Boolean
  },
  watch: {
    "visible": function(value) {
      setTimeout(function() {
        if(value) {
          window.$("#loadscreen").fadeIn();
        } else {
          window.$("#loadscreen").fadeOut();
        }
      }, 0);
    }
  },
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
