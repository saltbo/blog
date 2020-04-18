<template>
    <el-card>
        <img class="icon" :src="icon">
        <router-link :to="link">{{name}}</router-link>
    </el-card>
</template>
<script>
export default {
    props:{
        name: String,
        icon: String,
        link: String,
    }
}
</script>

<style lang="stylus" scoped>
.el-card
    display inline-block
    min-width 200px
    margin-top 20px
    margin-right 5px

.icon 
    width 50px
    height 50px
    vertical-align middle
</style>