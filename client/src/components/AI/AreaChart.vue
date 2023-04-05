<template>
    <div id="areaChart" ref="areaChart" class="areaChart"></div>
</template>
 
<script>
import { Area } from "@antv/g2plot";

export default {
  name: "AreaChart",
  props: {
    areaData: {
      type: Array,
      default() {
        return [];
      },
    },
    Height: {
      type: Number,
      default: 500,
    },
    Width: {
      type: Number,
      default: 700,
    },
    xField: {
      type: String,
      default: "day",
    },
    yField: {
      type: String,
      default: "releaseAmount",
    },
    seriesField: {
      type: String,
      default: "stakeholder",
    },
  },
  data() {
    return {
      alreadyRender: false,
      AreaPlot: null,
    };
  },
  mounted() {
    this.initG2Plot();
  },
  methods: {

    /**
     * chart图表初始化
     * 需要根据后期的数据动态修改其中的x，y字段
     */
    initG2Plot() {
      this.AreaPlot = new Area(this.$refs.areaChart, {
        data: this.areaData,
        height: this.Height,
        width: this.Width,
        xField: this.xField,
        yField: this.yField,
        seriesField: this.seriesField,
        smooth: true,
        yAxis: {
          label: {
            // 数值格式化为千分位
            formatter: (v) =>
              `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`),
          },
          grid: {
            line: {
              style: {
                stroke: "black",
                lineWidth: 0.2,
                lineDash: [4, 5],
                strokeOpacity: 0.7,
                shadowColor: "black",
                shadowBlur: 10,
                shadowOffsetX: 5,
                shadowOffsetY: 5,
                cursor: "pointer",
              },
            },
          },
        },
        legend: {
          radio: {},
        },
        slider:{
          start:0,
          end:1
        },
        tooltip: {
          follow: true,
          enterable: true,
          offset: 18,
          shared: true,
          marker: { lineWidth: 0.5, r: 3 },
        },
      });
      if (this.areaData.length != 0) {
        this.AreaPlot.render();
      }
    },
  },
  watch: {
    areaData:{
      handler(){
        //如果未选数据则渲染为空
        if (this.areaData.length == 0) {
          this.AreaPlot.changeData([]);
        } else {
          //如果从未渲染过则渲染
          if (!this.alreadyRender) {
            this.AreaPlot.render();
          }
          //否则直接更新数据
          this.AreaPlot.changeData(this.areaData);
        }
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss">
.areaChart {
    width: 430px;
    height: 270px;
  }
</style>