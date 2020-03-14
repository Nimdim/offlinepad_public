<template>
    <div class="fullscreenbox">
        <span>
            <p>при заркытии блокнота все данные будут потеряны</p>
            <a class="waves-effect waves-teal btn-small red"
                v-on:click.prevent.stop="$emit('submit')">
                закрыть
            </a>
            <a class="waves-effect waves-teal btn-small "
                @click.prevent.stop="$emit('cancel')">
                отмена
            </a>        
        </span>
    </div>
</template>

<script>
export default {
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
