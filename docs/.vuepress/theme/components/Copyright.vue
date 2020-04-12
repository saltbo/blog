<template>
    <div>
        <el-divider></el-divider>
        <ul class="copyright">
            <li>原文出处：<a :href="origin">{{origin}}</a></li>
            <li>原文作者：<a href="https://github.com/saltbo">https://github.com/saltbo</a></li>
            <li>原文链接：<a :href="link">{{link}}</a></li>
            <li>版权声明：本文欢迎任何形式转载，转载时完整保留本声明信息（包含原文链接、原文出处、原文作者、版权声明）即可。本文后续所有修改都会第一时间在原始地址更新。</li>
        </ul>
    </div>
</template>
<script>
export default {
    data(){
        return {
            location: {}
        }
    },
    computed:{
        origin(){
            return this.location.origin
        },
        link(){
            return this.location.href
        }
    },
    mounted(){
        this.location = window.location;
    }
}
</script>

<style lang="stylus" scoped>
.copyright
    margin 0 0 20px 0
    padding-left 15px
    word-break break-word
    color #666
    border-left 4px solid #ddd
    li
        list-style none
        line-height 28px
</style>