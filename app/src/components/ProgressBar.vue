<template>
  <div class="progress">
    <div class="determinate" :style="{'width': progress + '%'}"></div>
  </div>
</template>
<script>
  export default {
    props: {
      progress: {
        type: Number,
        default: 0
      },
    },
  }
</script>
