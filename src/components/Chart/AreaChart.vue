<template>
  <div class="box">
    <div id="areaChart" ref="areaChart" class="areaChart" v-bind:class="{ show: chartShow }"></div>
    <!-- 空状态时显示 -->
    <el-empty
      description="Please set token allocation first!"
      class="empty-box"
      v-bind:class="{ show: !chartShow }"
    ></el-empty>
  </div>
</template>
 
<script>
import { Area } from "@antv/g2plot";
export default {
  name: "areaChart",
  props: {
    areadata: {
      type: Array,
      default() {
        return [];
      },
    },
    xField: {
      type: String,
      default: "data",
    },
    yField: {
      type: String,
      default: "value",
    },
    category: {
      type: String,
      default: "role",
    },
  },
  data() {
    return {
      alreadyRender: false,
      chartShow: true,
    };
  },
  mounted() {
    this.initG2Plot();
  },
  methods: {
    /**
     * PieChart图表初始化
     * 需要根据后期的数据动态修改数据
     */
    initG2Plot() {
      this.AreaPlot = new Area(this.$refs.areaChart, {
        data: this.areadata,
        xField:'date',
        yField:'value',
        seriesField:'role',
        slider:{
          start:0,
          end:1,
        },
      });
      if (this.areadata.length) {
        this.AreaPlot.render();
      }
    },
  },
  watch: {
    /**
    * 监听对应数据字段，当数据发生变化时重新渲染
    */
    areadata:{
      handler() {
        console.log("AD",this.areadata);
        let tmpData = [];
        if(!this.areadata.length){
            this.chartShow = true;
            this.AreaPlot.changeData([]);
        }
        else{
            this.chartShow = false;
            tmpData = this.areadata;
        }
        //如果从未渲染过则渲染
        if (!this.alreadyRender) {
            this.AreaPlot.render();
        }
        //更新数据
        this.AreaPlot.changeData(tmpData);
       },
      deep:true,
    },
  },
};
</script>

<style lang="scss">
.box {
  padding: 5px;
  .attr-select {
    span {
      margin-right: 5px;
      font-size: 14px;
      font-weight: 600;
    }
  }
  .areaChart {
    margin-top: 30px;
  }
  .empty-box {
    height: 546px;
  }
}
.show {
  display: none !important;
}
</style>