<template>
  <div class="box">
    <div id="pieChart" ref="pieChart" class="pieChart" v-bind:class="{ show: chartShow }"></div>
    <!-- 空状态时显示 -->
    <el-empty
      description="Please set token allocation first!"
      class="empty-box"
      v-bind:class="{ show: !chartShow }"
    ></el-empty>
  </div>
</template>
 
<script>
import { Pie } from "@antv/g2plot";
export default {
  name: "pieChart",
  props: {
    // 如果相加不是一百（选了多个 token）会自动处理
    piedata: {
      type: Array,
      default() {
        return [];
      },
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
      this.PiePlot = new Pie(this.$refs.pieChart, {
        // 在 padding 基础上图标上下左右四个方向间距
        appendPadding: 10,
        // TODO：修改
        data: this.piedata,
        // data 数据对象有两个值，type 和 value，type 是扇形颜色对应的值（名字），value是比例（数值）
        angleField: 'value',
        colorField: 'type',
        // 半径
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
      });
      if (this.piedata.length) {
        this.PiePlot.render();
      }
    },
  },
  watch: {
    /**
    * 监听对应数据字段，当数据发生变化时重新渲染
    */
    piedata:{
      handler() {
        let tmpData = [];
        if(!this.piedata.length){
            this.chartShow = true;
            this.PiePlot.changeData([]);
        }
        else{
            this.chartShow = false;
            tmpData = this.piedata;
        }
        //如果从未渲染过则渲染
        if (!this.alreadyRender) {
            this.PiePlot.render();
        }
        //更新数据
        this.PiePlot.changeData(tmpData);
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
  .pieChart {
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