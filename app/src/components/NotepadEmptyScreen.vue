<template>
    <full-screen-box>
        <font-awesome-icon
            icon="box-open"
            style="width: 200px; height: 200px; color: gray;"
        />
        <p>
            Блокнот еще не был создан. <a href="#!" @click="$emit('create')">Создайте</a> новый или <a href="#!" @click="$emit('open')">откройте</a> резервную копию.
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
