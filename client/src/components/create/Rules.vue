<template>
    <el-card class="box-card">
        <span v-show="!showRules.length">Nothing was used</span>
        <div v-for="o in showRules" :key="o" class="text item">
            {{ o }}
        </div>
    </el-card>
</template>

<script>

export default {
    props:['showRules'],
}
</script>

<style scoped>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .box-card {
    width: 510px;
  }
</style>
