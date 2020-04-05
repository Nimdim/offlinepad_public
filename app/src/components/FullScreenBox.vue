<template>
    <div
        class="fullscreenbox"
        :class="{'fullscreenbox--order-top': top}"
    >
        <span>
            <slot />
        </span>
    </div>
</template>

<script>
export default {
    props: {
        "top": {
            type: Boolean,
            default: false,
        }
    }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .fullscreenbox {
        position: fixed;
        left: 0px;
        top: 0px;
        right: 0px;
        bottom: 0px;
    }

    .fullscreenbox--order-top {
        z-index: 2000;
    }

    .fullscreenbox > span {
        position: fixed;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
</style>
