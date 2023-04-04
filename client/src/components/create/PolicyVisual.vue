<template>
    <div>
        <el-radio v-model="radio" label="amount">Amount</el-radio>
        <el-radio v-model="radio" label="percentage">Percentage</el-radio>

        <canvas ref="chart"></canvas>
        <div class="create-point">
            <div class="input">
                <span>X:</span>
                <el-input
                    class="input-x"
                    v-model="newPoint.x"
                    size="mini"
                    placeholder=X-Axis
                    ></el-input>
            </div>

            <div class="input">
                <span>Y:</span>
                <el-input
                    class="input-y"
                    v-model="newPoint.y"
                    size="mini"
                    placeholder=Y-Axis
                ></el-input>
            </div>
            <el-button @click="addPoint" class="add-button" size="mini">Create</el-button>
            <el-button @click="clear()" class="clear-button" size="mini">Clear</el-button>
        </div>

        <el-button @click="submit()" class="submit-button" size="mini">Submit</el-button>
        
    </div>
</template>
<script>
// import { Chart, registerables } from 'chart.js'
import { mapState } from "vuex";
import dragdataPlugin from "chartjs-plugin-dragdata"

import { Chart as ChartJS, registerables} from "chart.js"
ChartJS.register(...registerables, dragdataPlugin)

// let labels = new Map();
// labels.set("MintNFT1", "Low-NFT");


// datapoints.set("MintNFT1", Array.from({ length: 200 }, (elm, i) => ({
//                     x: i,
//                     y: 100
//                 })));


export default {
    //TODO  希望通过 props 传递过来的值, 直接就是 policyFunction.value, 和 tokenName.value, 
    // 是在父组件中通过 index 下标指定的，就不需要把整个 policyData 传过来了，也不需要传 index 了
    props: ["edgeID","policyData", "policyIndex"],
    data() {
        return {
            newPoint: {
                x: 0,
                y: 0
            },
            radio: "",
            y_scales: {},
            datapoints: new Array(),
        }
    },
    mounted() {
        console.log("policy index:", this.policyIndex);
        console.log("policy data:", this.policyData);
        this.datapoints = this.policyData.policyFunction[this.policyIndex].value.datapoints;
        this.radio = this.policyData.policyFunction[this.policyIndex].value.type
        console.log("init datapoints", this.datapoints);
        console.log("init radio", this.radio);
        if (this.radio == "amount") {
            this.y_scales = {
                suggestedMin: 0,
                suggestedMax: 10000,
            }
        }
        else {
            this.y_scales = {
                min: 0,
                max: 100,
            }
        }

        // labels.set(edge, );
        console.log("before rendercanvas 1");
        this.renderCanvas();
    },
    methods: {

        addPoint() {
            
            if (this.datapoints.length == 0) {
                this.datapoints.push({x: this.newPoint.x, y: this.newPoint.y});
            }
            else {
                // 当添加的数据点的 x 值是已经存在的，自动更新其 y 值，否则插入新数据
                let i = 0;
                for (; i < this.datapoints.length; i++) {
                    if (this.datapoints[i].x == this.newPoint.x) {
                        this.datapoints[i].y = this.newPoint.y;
                        break;
                    }
                    if (i == this.datapoints.length - 1 || this.datapoints[i].x > this.newPoint.x) {
                        this.datapoints.push({x: this.newPoint.x, y: this.newPoint.y});
                        break;
                    }
                }
            }
            
            this.datapoints.sort(function(a, b){return a.x - b.x});
            console.log("before rendercanvas 2");
            this.renderCanvas();
            
        },

        submit() {
            console.log("datapoints:", this.datapoints);
            this.policyData.policyFunction[this.policyIndex].value.type = this.radio;
            this.policyData.policyFunction[this.policyIndex].value.datapoints = this.datapoints;
        },
        clear() {
            this.datapoints = new Array();
            this.renderCanvas();
        },

        renderCanvas() {
            let _this = this;
            console.log("label:", this.policyData.tokenName[this.policyIndex].value);
            this.$nextTick(()=>{
                let chartStatus = ChartJS.getChart(this.$refs.chart); // <canvas> id
                if (chartStatus != undefined) {
                chartStatus.destroy();
                }
                const myChart = new ChartJS(this.$refs.chart, {
                    type: "scatter",
                    data: {
                        "datasets": [
                            {
                                label: this.policyData.tokenName[this.policyIndex].value,
                                data: this.datapoints,
                                "backgroundColor": "rgba(255, 99, 132, 1)",
                                borderWidth: 2.5,
                                fill: false,
                                pointRadius: 5,
                                pointHitRadius: 10,
                                showLine:true,
                            }
                        ]
                    },
                    options: {
                        plugins: {
                            dragData: {
                                round: 1, // rounds the values to n decimal places 
                                            // in this case 1, e.g 0.1234 => 0.1)
                                showTooltip: true, // show the tooltip while dragging [default = true]
                                // dragX: true, // also enable dragging along the x-axis.
                                                // this solely works for continous, numerical x-axis scales (no categories or dates)!
                                onDragStart: function(e, element) {
                                    /*
                                    // e = event, element = datapoint that was dragged
                                    // you may use this callback to prohibit dragging certain datapoints
                                    // by returning false in this callback
                                    if (element.datasetIndex === 0 && element.index === 0) {
                                    // this would prohibit dragging the first datapoint in the first
                                    // dataset entirely
                                    return false
                                    }
                                    */
                                   _this.datapoints.splice(element.index, 1);
                                },
                                onDrag: function(e, datasetIndex, index, value) {         
                                    /*     
                                    // you may control the range in which datapoints are allowed to be
                                    // dragged by returning `false` in this callback
                                    if (value < 0) return false // this only allows positive values
                                    if (datasetIndex === 0 && index === 0 && value > 20) return false 
                                    */
                                },
                                onDragEnd: function(e, datasetIndex, index, value) {
                                    // you may use this callback to store the final datapoint value
                                    // (after dragging) in a database, or update other UI elements that
                                    // dependent on it
                                    
                                    // _this.datapoints[index].x=value.x;
                                    // _this.datapoints[index].y=value.y;
                                },

                            }
                        },
                        scales: {
                            // x: {
                            //     max:25,
                            //     min:0
                            // }, 
                            y: this.y_scales
                        }
                    }
                });
            })
        }
    },

    computed: {
        
    },

    watch: {
        radio: {
            handler() {
                if (this.radio == "amount") {
                    this.y_scales = {
                        suggestedMin: 0,
                        suggestedMax: 10000,
                    }
                } else {
                    this.y_scales = {
                        min: 0,
                        max: 100,
                    }
                }

                this.renderCanvas();
        
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.create-point {
  .input {
    // padding: 10px 15px;
    margin-left: 250px;
    span {
      font-size: 14px;
      color:rgb(0, 0, 0);
      font-weight: 600;
    }
    /deep/ .el-input__inner {
      color:rgb(194, 194, 194);
    }
    .input-x {
      margin-left: 10px;
      width: 100px;
    }
    .input-y {
      margin-left: 10px;
      width: 100px;
    }
  }
  .add-button {
    width: 80px;
    color:rgb(0, 0, 0);
    margin-left: 250px;
  }
}
.submit-button {
      margin-left: 500px;
      width: 100px;
}
.clear-button {
      margin-left: 10px;
      width: 100px;
}
</style>