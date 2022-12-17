<template>
    <canvas ref="chart"></canvas>
</template>
<script>
// import { Chart, registerables } from 'chart.js'
import { mapState } from "vuex";
import dragdataPlugin from "chartjs-plugin-dragdata"

import { Chart as ChartJS, registerables} from "chart.js"
ChartJS.register(...registerables, dragdataPlugin)

let labels = new Map();
labels.set("MintNFT1", "Low-NFT");
labels.set("MintNFT2", "Medium-NFT");
labels.set("MintNFT3", "High-NFT");
labels.set("Buy", "Low-NFT");
labels.set("Upgrade1", "Low-NFT");
labels.set("Upgrade2", "Medium-NFT");
labels.set("Return1", "Medium-NFT");
labels.set("Return2", "High-NFT");
labels.set("BurnGST1", "GST");
labels.set("BurnGST2", "GST");
labels.set("ClaimGST", "GST");
labels.set("MintGST", "GST");

let datapoints= new Map();
datapoints.set("MintNFT1", Array.from({ length: 200 }, (elm, i) => ({
                    x: i,
                    y: 100
                })));
datapoints.set("MintNFT2", [
                    {
                        "x": 0,
                        "y": 20000
                    }
                ]);
datapoints.set("MintNFT3", [
                    {
                        "x": 0,
                        "y": 20000
                    }
                ]);
datapoints.set("Buy", Array.from({ length: 200 }, (elm, i) => ({
                    x: i + 1,
                    y: 100
                })));
datapoints.set("Upgrade1", Array.from({ length: 200 }, (elm, i) => ({
                    x: 101 + i,
                    y: 100
                })));
datapoints.set("Upgrade2", Array.from({ length: 200 }, (elm, i) => ({
                    x: 201 + i,
                    y: 100
                })));
datapoints.set("Return1", Array.from({ length: 200 }, (elm, i) => ({
                    x: 101 + i,
                    y: 100
                })));
datapoints.set("Return2", Array.from({ length: 200 }, (elm, i) => ({
                    x: 201 + i,
                    y: 100
                })));
datapoints.set("BurnGST1", Array.from({ length: 200 }, (elm, i) => ({
                    x: 101 + i,
                    y: 10000
                })));
datapoints.set("BurnGST2", Array.from({ length: 200 }, (elm, i) => ({
                    x: 201 + i,
                    y: 100000
                })));
datapoints.set("ClaimGST", [...Array.from({ length: 100 }, (elm, i) => ({
                    x: i + 1,
                    y: i * 100})), ...Array.from({ length: 100 }, (elm, i) => ({
                    x: 101 + i,
                    y: 10000 + i * 100 * 10})),...Array.from({ length: 100 }, (elm, i) => ({
                    x: 201 + i,
                    y: 100000 + i * 100 * 100 + 10000 - i * 100})),...Array.from({ length: 100 }, (elm, i) => ({
                    x: 301 + i,
                    y: 1000000 + i * 100 * 100 + 10 * (10000 - i * 100) })),...Array.from({ length: 100 }, (elm, i) => ({
                    x: 401 + i,
                    y: 2000000}))
                ]);
datapoints.set("MintGST", [...Array.from({ length: 100 }, (elm, i) => ({
                    x: i,
                    y: i * 100})), ...Array.from({ length: 100 }, (elm, i) => ({
                    x: 100 + i,
                    y: 10000 + i * 100 * 10})),...Array.from({ length: 100 }, (elm, i) => ({
                    x: 200 + i,
                    y: 100000 + i * 100 * 100 + 10000 - i * 100})),...Array.from({ length: 100 }, (elm, i) => ({
                    x: 300 + i,
                    y: 1000000 + i * 100 * 100 + 10 * (10000 - i * 100) })),...Array.from({ length: 100 }, (elm, i) => ({
                    x: 400 + i,
                    y: 2000000}))
                ]);
datapoints.set("StartMove", Array.from({ length: 400 }, (elm, i) => ({
                    x: i + 1,
                    y: 100
                })));
datapoints.set("StopMove", Array.from({ length: 300 }, (elm, i) => ({
                    x: i + 101,
                    y: 100
                })));


let edge="";

export default {
    data() {
        return {
        }
    },
    mounted() {
        edge=this.editEdge;
        console.log("edge:", edge);
        this.createDatapoints();
        this.$nextTick(()=>{
            const myChart = new ChartJS(this.$refs.chart, {
                type: "scatter",
                data: {
                    "datasets": [
                        {
                            label: labels.get(edge),
                            data: datapoints.get(edge),
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
                            dragX: true, // also enable dragging along the x-axis.
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
                                
                                console.log("index:", index);
                                console.log("value:", value);
                                console.log("data points before:", datapoints.get(edge));
                                datapoints.get(edge)[index].x=value.x;
                                datapoints.get(edge)[index].y=value.y;
                                console.log("data points after:", datapoints.get(edge));
                            },
                        }
                    },
                    scales: {
                        // x: {
                        //     max:25,
                        //     min:0
                        // }, 
                        y: {
                            beginAtZero: true
                            // dragData: false // disables datapoint dragging for the entire axis
                        }
                    }
                }
            });
            console.log(myChart);
        })
    },
    methods: {
        createDatapoints() {
            if (!datapoints.has(edge)) {
                datapoints.set(edge, Array.from({ length: 400 }, (elm, i) => ({
                    x: i,
                    y: 100
                })));
            }
        }
    },
    computed: {
        ...mapState(["editEdge"]),
    },
}
</script>

<style lang="scss" scoped>

</style>