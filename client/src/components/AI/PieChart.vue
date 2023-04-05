<template>
  <div id="pieChart" ref="pieChart" class="pieChart"></div>
</template>
 
<script>
import { Pie } from "@antv/g2plot";
export default {
  name: "pieChart",
  props: {
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
      value: [],
      PiePlot:null,
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
    piedata:{
      handler(){
        //如果未选数据则渲染为空
        if (this.piedata.length == 0) {
          this.PiePlot.changeData([]);
        } else {
          //如果从未渲染过则渲染
          if (!this.alreadyRender) {
            this.PiePlot.render();
          }
          //否则直接更新数据
          this.PiePlot.changeData(this.piedata);
        }
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss">
.pieChart{
  width: 430px;
  height: 270px;
}
</style>