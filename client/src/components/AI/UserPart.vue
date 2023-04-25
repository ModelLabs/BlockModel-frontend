<template>
    <div>
        <img class="head" src="../../assets/User.png"/>
        <div class="content">
            {{Usercontent}}
        </div>
    </div>
</template>
<script>
export default {
  props:['Usercontent']
}
</script>


<style scoped>
.head {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #eee;
  float: right;
}

.content {
  background-color: whitesmoke;
  width: 480px;
  height: auto;
  margin-left: 0px;
  overflow: visible;
  float: right;
  padding: 5px 5px;
  font-size: 14px;
  color: #000;
  text-align: right;
  border: 1px solid black;
  border-radius: 10px;
}
</style>