<template>
    <div>
        <img class="head"
              src="../../assets/AI.png"/>
          <div class="content-with-chart" v-if="drawChart">
            {{AIcontent}}
            <div class='chart'>
              <div class='pie-chart' >
                <PieChart :piedata="piedata" />
              </div>
              <div class='line-chart'>
                <AreaChart :areaData="lineData" />
              </div>
            </div>
          </div>
          <div class="content-without-chart" v-else>
            {{AIcontent}}
          </div>
    </div>
</template>

<script>
// import LineChart from './LineChart.vue'
import PieChart from './PieChart.vue'
import AreaChart from './AreaChart.vue'

export default {
    props:['AIcontent','drawChart','piedata','lineData'],
    components: {
        // LineChart,
        PieChart,
        AreaChart
    },
}
</script>


<style lang="scss" scoped>
.head {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #eee;
  float: left;
}

.content-with-chart {
  background-color:whitesmoke;
  width: 480px;
  height: 320px;
  border: 1px solid black;
  border-radius: 10px;
  overflow: scroll;
  float: right;
  margin-right: 70px;
  padding: 5px 5px;
  font-size: 14px;
  color: #000;
  text-align: left;
    .chart {
      width: 920px;
      margin-top: 10px;
      .pie-chart{
        width: 430px;
        height: 270px;
        float: left;
      }
      .line-chart{
        width: 430px;
        height:270px;
        float: right;
        margin-right: 50px;
      }
    }
}
.content-without-chart {
  width: 480px;
  height: auto;
  margin-right: 0px;
  overflow: visible;
  float: right;
  padding: 5px 5px;
  font-size: 14px;
  color: #000;
  text-align: left;
  border: 1px solid black;
  border-radius: 10px;
}
</style>