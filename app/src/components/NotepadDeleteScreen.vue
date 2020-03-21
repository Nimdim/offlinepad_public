<template>
    <full-screen-box>
        <p>при заркытии блокнота все данные будут потеряны</p>
        <a class="waves-effect waves-teal btn-small red"
            v-on:click.prevent="$emit('submit')">
            закрыть
        </a>
        <a class="waves-effect waves-teal btn-small "
            @click.prevent="$emit('cancel')">
            отмена
        </a>        
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
