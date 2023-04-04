<template>
    <div id="lineChart" ref="lineChart" class="lineChart"></div>
</template>
 
<script>
import { Line,Pie } from "@antv/g2plot";
import { last } from '@antv/util';
import { mapState, mapMutations } from "vuex";
import { Pool } from "../../graph/pool";
export default {
  name: "linePieChart",
  props: {
    linePieData: {
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
    category: {
      type: String,
      default: "token",
    },
  },
  data() {
    return {
      alreadyRender: false,
      LinePlot: null,
      PiePlot:null,
    };
  },
  computed: {
    ...mapState([
    ]),
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
      this.LinePlot = new Line(this.$refs.lineChart, {
        data: this.linePieData,
        height: this.Height,
        width: this.Width,
        xField: this.xField,
        yField: this.yField,
        seriesField: this.category,
        smooth: true,
        legend:true,
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
      if (this.linePieData.length != 0) {
        this.LinePlot.render();
      }

      // pie
      // this.PiePlot = new Pie(container,{
      //   data,
      //   width: 120,
      //   height: 120,
      //   appendPadding: 10,
      //   autoFit: false,
      //   angleField: 'value',
      //   colorField: 'type',
      //   legend: false,
      //   tooltip: false,
      //   animation: false,
      //   color: line.chart.themeObject.colors10,
      //   label: {
      //     type: 'inner',
      //     offset: '-10%',
      //     content: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
      //   },
      // });
      // this. PiePlot.render();

    //   this.LinePlot.update({
    //     tooltip: {
    //       customContent: (value, items) => {
    //         const pieData = items.map((item) => ({
    //           type: item.name,
    //           value: Number(item.value),
    //         }));
    //         const container = document.createElement('div');
    //         const pieContainer = document.createElement('div');
    //         setStyles(container, divStyles);
    //         createPie(pieContainer, pieData);
    //         container.appendChild(pieContainer);
    //         return container;
    //       },
    //     },
    //   });
    //   // 初始化，默认激活
    //   const point = LinePlot.chart.getXY(last(data.filter((d) => !!d.value)));
    //   LinePlot.chart.showTooltip(point);
    },
  },
  watch: {
    linePieData:{
      handler(){
        //如果未选数据则渲染为空
        if (this.linePieData.length == 0) {
          this.LinePlot.changeData([]);
        } else {
          //如果从未渲染过则渲染
          if (!this.alreadyRender) {
            this.LinePlot.render();
          }
          //否则直接更新数据
          this.LinePlot.changeData(this.linePieData);
        }
      },
      deep: true,
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
  .lineChart {
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