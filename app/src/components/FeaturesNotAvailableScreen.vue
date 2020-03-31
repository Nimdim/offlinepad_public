<template>
    <full-screen-box :top="true" class="deep-orange darken-4 white-text">
        <font-awesome-icon
            icon="exclamation-triangle"
            style="width: 200px; height: 200px;"
        />
        <p>
            Используемый вами браузер не поддерживает необходимые для работы данного WEB-приложения функции.
        </p>
    </full-screen-box>
</template>

<script>
import FullScreenBox from "./FullScreenBox.vue";
export default {
    components: {
        FullScreenBox,
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
