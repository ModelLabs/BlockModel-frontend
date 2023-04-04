<template>
  <div class="mint-box">
    <el-steps :active="active" finish-status="success" class="step">
      <el-step title="Select Nodes"></el-step>
      <el-step title="Select Edges"></el-step>
      <el-step title="Select Data"></el-step>
      <el-step title="Enter Description"></el-step>
    </el-steps>

    <MintNodes v-if="active===0" />
    <MintEdges v-if="active===1" />
    <MintSelect v-if="active===2" />

    <!-- <MintNodes v-if="active===0" :mintNodes="mintNodes"/>
    <MintEdges v-if="active===1" :mintEdges="mintEdges"/>
    <MintSelect v-if="active===2" :modelDataForSelect="modelDataForSelect" :selectVisualData="selectVisualData" 
      :selectProperties="selectProperties"/> -->


    <div v-else-if="active===3">
      <el-form
      :label-position="labelPosition"
      :model="ruleForm"
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item label="Model Image">
        <div class="com-upload-img">
          <div class="img_group">
            <div class="img_box" v-if="allowAddImg">
              <div>
                <i class="el-icon-picture image-upload-button"></i>
                <input
                  ref="upload"
                  type="file"
                  accept="image/*"
                  multiple="multiple"
                  class="model-image-input"
                  @change="changeImg($event)"
                />
              </div>
            </div>

            <viewer :images="imgArr">
              <img
                v-for="(src, index) in imgArr"
                :src="src"
                :key="index"
                width="450"
                class="img-show"
                @contextmenu.prevent="deleteImg(index)"
              />
            </viewer>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="Model Name" prop="name">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>

      <el-form-item label="Description" prop="desc">
        <el-input v-model="ruleForm.desc"></el-input>
      </el-form-item>

      <!-- <el-form-item label="Properties" prop="properties">
        <el-tooltip
          class="item"
          effect="light"
          :content="item.content"
          placement="bottom"
          v-for="item in ruleLists"
          :key="item.id"
        >
          <div class="property-item">{{ item.label }}</div>
        </el-tooltip>
      </el-form-item> -->
    </el-form>
    </div>

    <el-button style="margin-top: 12px;" @click="back" v-show="active>0">Back</el-button>
    <el-button style="margin-top: 12px;" @click="next" v-if="btnText">Next</el-button>
    <el-button style="margin-top: 12px;" @click="mint" v-if="!btnText">Mint</el-button>

  </div>

</template>


<script>
import pdf from "vue-pdf";
import { savemetadata } from "../../api/index";
import { createNFT } from "../../api/web3/contracts";
import { mapState } from "vuex";
import { getStore } from "../../utils/storage";
import { randomString } from "../../utils/ranDom";

import { uploadToIPFS } from "../../utils/ipfsUtil";
import { encryptDataNormal, encryptDataEOA, getEOAPubkey, decryptDataEOA} from "../../utils/cryptoUtil";

import MintNodes from "./MintNodes";
import MintEdges from "./MintEdges";
import MintSelect from "./MintSelect";

const crypto = require("crypto");
export default {
  data() {
    return {
      // 控制步骤条
      active:0,
      // 控制展示 next ｜ Mint 按钮
      btnText:true,
      // 删掉为选节点｜边的 selectNodeData
      modelDataForSelect:[],

      // step3 Select Visualization Data 放这 （下面是示例数据）
      visualizationDataOptions:[
        {
          value: 1,
          label: '0',
          children: [
            { value: 2, label: 'Allocation' },
            { value: 3, label: 'Emissions' },
            { value: 4, label: 'Free Money' },
          ]
        },],
      // step3 Select Properties 放这 （下面是示例数据）
      propertiesDataOptions:[
        { value: 1, label: 'property 1' },
        { value: 2, label: 'property 2' },
      ],
      imgArr: [],
      allowAddImg: true,
      labelPosition: "top",
      dialogImageUrl: "",
      //fileList: [],
      pdfUrl: "",
      numPages: [],
      // fileArr: [],
      upLoadImgUrl: "",
      dialogVisible: false,
      ruleForm: {
        name: "",
        desc: "",
      //   properties: [],
      //   include: false,
      //   exlink: "",
      },
      rules: {
        name: [
          {
            required: true,
            message: "Please Enter Model Name",
            trigger: "blur",
          },
          {
            min: 3,
            max: 15,
            message: "3 to 15 characters long",
            trigger: "blur",
          },
        ],
        desc: [
          {
            required: true,
            message: "Please Enter Model Description",
            trigger: "blur",
          },
          {
            min: 3,
            max: 150,
            message: "3 to 150 characters long",
            trigger: "blur",
          },
        ],

        // exlink: [
        //   {
        //     required: true,
        //     message: "Please Enter External Link",
        //     trigger: "blur",
        //   },
        //   {
        //     min: 10,
        //     max: 200,
        //     message: "10 to 200 characters long",
        //     trigger: "blur",
        //   },
        // ],
      },
      mintResult: false,
    };
  },
  components: {
    pdf,
    MintNodes,
    MintEdges,
    MintSelect,
  },
  computed: {
    ...mapState([
      "user",
      "statusCode",
      "configData",
      "historySimulateData",
      "ruleLists",
      "graph",
      "mintNodesId",
      "mintEdgesId",
      "mintModelData",
      "mintVisualData",
      "mintPropertyData",
    ]),
  },
  methods: {
    // 这是控制步骤条往下走及显示 next ｜ mint 按钮的方法
    next() {
      // TODO 到 step3 的时候删掉前面没有选的节点和边的数据
      if (this.active++ >= 2) this.btnText  = false;
      if (this.active === 2) {
        for(let i=0;i<this.selectNodeData.length;i++){
          if(this.mintNodesId.indexOf(this.selectNodeData[i].value) != -1 | 
            this.mintEdgesId.indexOf(this.selectNodeData[i].value)!= -1) {
              this.modelDataForSelect.push(this.selectNodeData[i]);
          }
        }
        
      }
    },
    // 这是控制步骤条往前走的方法 
    back(){
      if (this.active > 0) {
        this.active--;
      }
      if (this.active < 3 && !this.btnText) {
        this.btnText  = true;
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert("submit!");
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // resetForm(formName) {
    //   this.$refs[formName].resetFields();
    // },

    // handleRemove(file, fileList) {
    //   console.log(file, fileList);
    // },
    // handlePictureCardPreview(file) {
    //   this.dialogImageUrl = file.url;
    //   this.dialogVisible = true;
    // },
    // handleChange(file, fileList) {
    //   this.fileList = fileList.slice(-3);
    // },
    // beforeUpload(file) {
    //   const fileSuffix = file.name.substring(file.name.lastIndexOf(".") + 1);
    //   const whiteList = ["pdf"];
    //   if (whiteList.indexOf(fileSuffix) === -1) {
    //     this.$msg("上传文件只能是 pdf");
    //     return false;
    //   }
    // },
    // imgPreview(file) {
    //   this.fileArr = [];
    //   this.fileArr.push(file);
    //   this.form.position = "";
    //   console.log(file);
    //   this.form.position = file.name;
    //   let fileName = file.name;
    //   let regex = /(.jpg|.jpeg|.gif|.png|.pdf)$/;
    //   if (regex.test(fileName.toLowerCase())) {
    //     this.upLoadImgUrl = URL.createObjectURL(file.raw); // 获取URL
    //     this.pdfUrl = this.getPdfUrl(file);
    //     console.log(this.upLoadImgUrl);
    //   } else {
    //     this.$message.error("请选择pdf文件");
    //   }
    // },

    // 上传成功
    upSuccess(res) {
      this.$message({
        message: "上传成功",
        type: "success",
      });
    },
    // 上传失败
    upError(e) {
      this.$message({
        message: "上传失败",
        type: "error",
      });
    },
    //处理pdf
    getPdfUrl(file) {
      console.log(file);
      let url = window.URL.createObjectURL(file.raw); //将文件转化成url
      //加载pdf
      let loadingTask = pdf.createLoadingTask(url);
      loadingTask.promise
        .then((pdf) => {
          this.numPages = pdf.numPages;
          console.log(this.numPages);
        })
        .catch((err) => {
          console.error("pdf 加载失败", err);
        });
      return url;
    },
    //调用该函数创建nft
    async confirmMint(modelData, user, name, desc, pic) {
      // 随机生成长度为 32 的字符串，作为 NFT Key 的 AES 对称私钥
      const key = randomString(32);
      // 创建 AES 加密
      // 参数 iv 不可以设置为 null
      const cipher = crypto.createCipheriv("aes256", key, Buffer.alloc(16, 0));

      let encryptedSecretData = encryptDataNormal(cipher, modelData + ",,," + this.getParamsOutsideGraph() + ",,," + JSON.stringify(this.historySimulateData));

      // 获取当前登陆的 EOA 公钥
      let encryptPub = await getEOAPubkey(this.user);

      // 将 NFT Key 用当前公钥加密
      let encKey = encryptDataEOA(encryptPub, key);
      console.log("encrypted key:", encKey);

      // 将 picture, secret data 上传到 IPFS
      let picCID = await uploadToIPFS(pic);
      let secretCID = await uploadToIPFS(encryptedSecretData);
      // let tmp = await downloadFromIPFS(picCID);
      // console.log("downloaded data", tmp);

      // 组装 property.content TODO
      let propertyContent = new Array();
      for (let i = 0; i < this.ruleLists.length; i++) {
        propertyContent.push(this.ruleLists[i]);
      } 

      // TODO (Xufei) [Done] 调用合约
      createNFT(
        this.user,
        this.ruleForm.name,
        picCID,
        this.ruleForm.desc,
        [JSON.stringify(propertyContent)],
        encKey,
        secretCID
      ).then((chainRes) => {
        if (chainRes.status == "success") {
          this.$notify.success({
            title: "Success",
            message: "Mint NFT successful !",
            position: "bottom-right",
          });
          console.log("tx response:", chainRes.response);

          // TODO (Xufei) [Done] 根据合约返回的交易回执，将相关信息同步到后端
          let params = {
            nftId: chainRes.response.id,
            address: chainRes.response.owner,
            metadata: {
              name: this.ruleForm.name,
              desc: this.ruleForm.desc,
              picUrl: picCID,
              property: JSON.stringify(propertyContent),
              key: encKey,
              privUrl: secretCID
            }
          };

          savemetadata(params).then((res) => {
            if (res.message_code == this.statusCode.SUCCESSED) {
              console.log("SUCCESS sync mint data to database");
            } else {
              console.error("FAIL sync mint data to database");
            }
          });

        } else {
          this.$notify.error({
            title: "Error",
            message: "Mint NFT error !",
            position: "bottom-right",
          });
        }
      });

    },
    changeImg(e) {
      // console.log(this.imgArr);
      var _this = this;
      var imgLimit = 10;
      var files = e.target.files;
      var image = new Image();
      if (files.length > 0) {
        var dd = 0;
        var timer = setInterval(function () {
          if (
            files.item(dd).type != "image/png" &&
            files.item(dd).type != "image/jpeg" &&
            files.item(dd).type != "image/gif"
          ) {
            _this.$message.error("仅支持图片类型！");
            return false;
          }
          if (files.item(dd).size > imgLimit * 102400) {
            //to do sth
            this.$message.error("图片要求小于1MB");
          } else {
            image.src = window.URL.createObjectURL(files.item(dd));
            image.onload = function () {
              // 默认按比例压缩
              var w = image.width,
                h = image.height;
              var quality = 1;
              var canvas = document.createElement("canvas");
              var ctx = canvas.getContext("2d");
              var anw = document.createAttribute("width");
              anw.nodeValue = w;
              var anh = document.createAttribute("height");
              anh.nodeValue = h;
              canvas.setAttributeNode(anw);
              canvas.setAttributeNode(anh);
              ctx.drawImage(image, 0, 0, w, h);
              var ext = image.src
                .substring(image.src.lastIndexOf(".") + 1)
                .toLowerCase(); //图片格式
              var base64 = canvas.toDataURL("image/" + ext, quality);
              // 回调函数返回base64的值
              if (_this.imgArr.length <= 1) {
                _this.imgArr.unshift("");
                _this.imgArr.splice(0, 1, base64); //替换数组数据的方法，此处不能使用：this.imgArr[index] = url;
                _this.$notify.success({
                  title: "Success",
                  message:
                    "Image upload successful! You can right-click to delete it ",
                  position: "bottom-right",
                });
                _this.$refs.upload.value = null;
                if (_this.imgArr.length >= 1) {
                  _this.allowAddImg = false;
                }
              }
            };
          }
          if (dd < files.length - 1) {
            dd++;
          } else {
            clearInterval(timer);
          }
        }, 1000);
      }
    },
    deleteImg(index) {
      this.imgArr.splice(index, 1);
      if (this.imgArr.length < 5) {
        this.allowAddImg = true;
      }
    },
    mint() {
      // 以下组装用于 mint 的 graph data
      // 1. 基于 step 1-3 选择，在当前 this.graph 上改造
      // 1.1 从 localdb 取出当前 graph data ，是 string，转成 obj
      let tmpGraph = JSON.parse(getStore("graph"));
      // 1.2 存放选中的节点｜边
      let tmpcells = [];
      // 1.3 存放选中的的节点｜边及其数据
      let mintGraph = {cells:[]};
      // 1.4 得到带有 选中的节点和边的全部数据 的 graph：mintGraph
      for(let i=0;i<tmpGraph.cells.length;i++){
        if(this.mintNodesId.indexOf(tmpGraph.cells[i].id) != -1 
          | this.mintEdgesId.indexOf(tmpGraph.cells[i].id) != -1){
          tmpcells.push(tmpGraph.cells[i]);
        }
      }
      mintGraph.cells = tmpcells;
      // 1. END --------------->
      console.log("graph",mintGraph);
      console.log("mintModelData",this.mintModelData);

      // 2. 移除 mintGraph 中用户未选择的 nodeData｜edgeData
      // 2.1 存选中的节点｜线及其优化后的 nodeData 优化的意思是删掉用户没选的 data
      // includes: genesis
      let selectModelData = []; // ！！！这个最终用于替换原 mint 里面的 modelData
      // 2.2 保存临时的 nodeData ，是 id 到 nodeData 的 map
      // includes: pool,stakeholder,blackhole   edges
      let tmpNodeData = new Map();
      
      for(let j=0;j<this.mintModelData.length;j++){
        // 遍历用户在 step3 选中的节点｜线数据 type：Array
        // 主要通过第二位（index：1）的关键词判断是什么类型的节点/线
        switch(this.mintModelData[j][1]){
          case "Supply":
            // must be genesis nodes
            // 整个节点存入 <- 按 index 取出这个节点 <- 通过节点 id，用 indexOf 查节点位置
            selectModelData.push(tmpGraph.cells[tmpGraph.cells.indexOf(this.mintModelData[j][0])]);
            break;
          case "Token":
            // must be blackhole nodes
            for(let k=0;k<mintGraph.cells.length;k++){
              // 从选中的的节点｜边及其数据中根据 key 找到这个 balckhole node
              if(mintGraph.cells[k].id === this.mintModelData[j][0]) {
                // 如果这个节点之前已经找过并存储了
                if(tmpNodeData.has(this.mintModelData[j][0])){
                  // 是通过 burn 设置的. 通过 key 拿出 value 
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 balckhole node
                  // 从 nodeData 中取出 token 信息并补充进去
                  let tmpValue = tmpNodeData.get(this.mintModelData[j][0]);
                  tmpValue.token = mintGraph.cells[k].data.nodeData.token;
                  // 按 key 再 set 一下新 value
                  tmpNodeData.set(this.mintModelData[j][0],tmpValue);
                }
                else{
                  // 如果这个节点之前没找到过及存储，burn 信息也没有，默认设为0
                  let tmpList = {token:'',burn:0};
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 balckhole node
                  // 从 nodeData 中取出 token 信息并补充进去
                  tmpList.token = mintGraph.cells[k].data.nodeData.token;
                  // 按 key set value
                  tmpNodeData.set(this.mintModelData[j][0],tmpList);
                }
              }
            }
            break;
          case "Burn":
            // must be blackhole nodes
            for(let k=0;k<mintGraph.cells.length;k++){
              // 从选中的的节点｜边及其数据中根据 key 找到这个 balckhole node
              if(mintGraph.cells[k].id === this.mintModelData[j][0]) {
                // 如果这个节点之前已经找过并存储了
                if(tmpNodeData.has(this.mintModelData[j][0])){
                  // 是通过 burn 设置的. 通过 key 拿出 value 
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 balckhole node
                  // 从 nodeData 中取出 burn 信息并补充进去
                  let tmpValue = tmpNodeData.get(this.mintModelData[j][0]);
                  tmpValue.burn = mintGraph.cells[k].data.nodeData.burn;
                  // 按 key 再 set 一下新 value
                  tmpNodeData.set(this.mintModelData[j][0],tmpValue);
                }
                else{
                  // 如果这个节点之前没找到过及存储，token 信息也没有，默认设为 ''
                  let tmpList = {token:'',burn:0};
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 balckhole node
                  // 从 nodeData 中取出 burn 信息并补充进去
                  tmpList.burn = mintGraph.cells[k].data.nodeData.burn;
                  // 按 key set value
                  tmpNodeData.set(this.mintModelData[j][0],tmpList);
                }
              }
            }
            break;
          case "Hold":
            // must be stakeholder nodes
            for(let k=0;k<mintGraph.cells.length;k++){
              // 从选中的的节点｜边及其数据中根据 key 找到这个 balckhole node
              if(mintGraph.cells[k].id === this.mintModelData[j][0]) {
                // 如果这个节点之前已经找过并存储了
                if(tmpNodeData.has(this.mintModelData[j][0])){
                  // 说明这个 stakeholder 持有的多个币都被用户选择了
                  // 不用初始化，通过 key 拿出 value，直接 push 补充即可
                  let tmpValue = tmpNodeData.get(this.mintModelData[j][0]);
                  tmpValue.tokenAmounts.push(
                    mintGraph.cells[k].data.nodeData.tokens.tokenAmounts[this.mintModelData[j][2]]
                  );
                  tmpValue.tokenNames.push(
                    mintGraph.cells[k].data.nodeData.tokens.tokenNames[this.mintModelData[j][2]]
                  );             
                  // 按 key 再 set 一下新 value
                  tmpNodeData.set(this.mintModelData[j][0],tmpValue);
                }
                else{
                  // 如果这个节点之前没找到过及存储，初始化
                  let tmpList = {tokenAmounts:[],tokenNames:[]};
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 stakeholder node
                  // 从 nodeData 中取出对应信息并补充进去
                  tmpList.tokenAmounts.push(
                    mintGraph.cells[k].data.nodeData.tokens.tokenAmounts[this.mintModelData[j][2]]
                  );
                  tmpList.tokenNames.push(
                    mintGraph.cells[k].data.nodeData.tokens.tokenNames[this.mintModelData[j][2]]
                  );
                  // 按 key set value
                  tmpNodeData.set(this.mintModelData[j][0],tmpList);
                }
              }
            }
            break;
          case "Tokens":
            // must be pool nodes
            for(let k=0;k<mintGraph.cells.length;k++){
              // 从选中的的节点｜边及其数据中根据 key 找到这个 pool node
              if(mintGraph.cells[k].id === this.mintModelData[j][0]) {
                // 如果这个节点之前已经找过并存储了
                if(tmpNodeData.has(this.mintModelData[j][0])){
                  // 是通过 modules 设置的. 通过 key 拿出 value 
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 pool node
                  // 从 nodeData 中取出 tokens 信息并补充进去
                  let tmpValue = tmpNodeData.get(this.mintModelData[j][0]);
                  tmpValue.tokens.tokenAmounts.push(
                    mintGraph.cells[k].data.nodeData.tokens.tokenAmounts[this.mintModelData[j][2]]
                  );
                  tmpValue.tokens.tokenNames.push(
                    mintGraph.cells[k].data.nodeData.tokens.tokenNames[this.mintModelData[j][2]]
                  ); 
                  // 按 key 再 set 一下新 value
                  tmpNodeData.set(this.mintModelData[j][0],tmpValue);
                }
                else{
                  // 如果这个节点之前没找到过及存储，初始化
                  let tmpList = {
                    tokens:{tokenAmounts:[],tokenNames:[]},
                    modules:{moduleExpressions:[],moduleNames:[]}
                  };
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 stakeholder node
                  // 从 nodeData 中取出对应信息并补充进去
                  tmpList.tokens.tokenAmounts.push(
                    mintGraph.cells[k].data.nodeData.tokens.tokenAmounts[this.mintModelData[j][2]]
                  );
                  tmpList.tokens.tokenNames.push(
                    mintGraph.cells[k].data.nodeData.tokens.tokenNames[this.mintModelData[j][2]]
                  );
                  tmpNodeData.set(this.mintModelData[j][0],tmpList);
                }
              }
            }
            break;
          case "Modules":
            // must be pool nodes
            for(let k=0;k<mintGraph.cells.length;k++){
              // 从选中的的节点｜边及其数据中根据 key 找到这个 pool node
              if(mintGraph.cells[k].id === this.mintModelData[j][0]) {
                // 如果这个节点之前已经找过并存储了
                if(tmpNodeData.has(this.mintModelData[j][0])){
                  // 是通过 modules 设置的. 通过 key 拿出 value 
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 pool node
                  // 从 nodeData 中取出 tokens 信息并补充进去
                  let tmpValue = tmpNodeData.get(this.mintModelData[j][0]);
                  tmpValue.modules.moduleExpressions.push(
                    mintGraph.cells[k].data.nodeData.modules.moduleExpressions[this.mintModelData[j][2]]
                  );
                  tmpValue.modules.moduleNames.push(
                    mintGraph.cells[k].data.nodeData.modules.moduleNames[this.mintModelData[j][2]]
                  ); 
                  // 按 key 再 set 一下新 value
                  tmpNodeData.set(this.mintModelData[j][0],tmpValue);
                }
                else{
                  // 如果这个节点之前没找到过及存储，初始化
                  let tmpList = {
                    tokens:{tokenAmounts:[],tokenNames:[]},
                    modules:{moduleExpressions:[],moduleNames:[]}
                  };
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 stakeholder node
                  // 从 nodeData 中取出对应信息并补充进去
                  tmpList.modules.moduleExpressions.push(
                    mintGraph.cells[k].data.nodeData.modules.moduleExpressions[this.mintModelData[j][2]]
                  );
                  tmpList.modules.moduleNames.push(
                    mintGraph.cells[k].data.nodeData.modules.moduleNames[this.mintModelData[j][2]]
                  );
                  tmpNodeData.set(this.mintModelData[j][0],tmpList);
                }
              }
            }
            break;
          case "Policy":
            // must be edge
            for(let k=0;k<mintGraph.cells.length;k++){
              // 从选中的的节点｜边及其数据中根据 key 找到这个 edge
              if(mintGraph.cells[k].id === this.mintModelData[j][0]) {
                // 如果这个节点之前已经找过并存储了
                if(tmpNodeData.has(this.mintModelData[j][0])){
                  // 是通过 policy 设置的. 通过 key 拿出 value 
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 edge
                  // 从 edgeData 中取出 policy 信息并补充进去
                  let tmpValue = tmpNodeData.get(this.mintModelData[j][0]);
                  tmpValue.policy.policyFunctions.push(
                    mintGraph.cells[k].data.edgeData.policy.policyFunctions[this.mintModelData[j][2]]
                  );
                  tmpValue.policy.policyNames.push(
                    mintGraph.cells[k].data.edgeData.policy.policyNames[this.mintModelData[j][2]]
                  );
                  tmpValue.policy.tokenNames.push(
                    mintGraph.cells[k].data.edgeData.policy.tokenNames[this.mintModelData[j][2]]
                  );
                  // 按 key 再 set 一下新 value
                  tmpNodeData.set(this.mintModelData[j][0],tmpValue);
                }
                else{
                  // 如果这个节点之前没找到过及存储，初始化默认信息
                  let tmpList = {
                    checked:true,
                    policy:{policyFunctions:[],policyNames:[],tokenNames:[]}
                  };
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 edge
                  // 从 edgeData 中取出 policy 信息并补充进去
                  tmpList.policy.policyFunctions.push(
                    mintGraph.cells[k].data.edgeData.policy.policyFunctions[this.mintModelData[j][2]]
                  );
                  tmpList.policy.policyNames.push(
                    mintGraph.cells[k].data.edgeData.policy.policyNames[this.mintModelData[j][2]]
                  );
                  tmpList.policy.tokenNames.push(
                    mintGraph.cells[k].data.edgeData.policy.tokenNames[this.mintModelData[j][2]]
                  );
                  // 按 key set value
                  tmpNodeData.set(this.mintModelData[j][0],tmpList);
                }
              }
            }
            break;
          case "Active":
            // must be edge
            for(let k=0;k<mintGraph.cells.length;k++){
              // 从选中的的节点｜边及其数据中根据 key 找到这个 edge
              if(mintGraph.cells[k].id === this.mintModelData[j][0]) {
                // 如果这个节点之前已经找过并存储了
                if(tmpNodeData.has(this.mintModelData[j][0])){
                  // 是通过 policy 设置的. 通过 key 拿出 value 
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 edge
                  // 从 edgeData 中取出 active 信息并补充进去
                  let tmpValue = tmpNodeData.get(this.mintModelData[j][0]);
                  tmpValue.checked = mintGraph.cells[k].data.edgeData.checked;
                  // 按 key 再 set 一下新 value
                  tmpNodeData.set(this.mintModelData[j][0],tmpValue);
                }
                else{
                  // 如果这个节点之前没找到过及存储，初始化默认信息
                  let tmpList = {
                    checked:true,
                    policy:{policyFunctions:[],policyNames:[],tokenNames:[]}
                  };
                  // 从选中的的节点｜边及其数据中根据 key 找到这个 edge
                  // 从 edgeData 中取出 active 信息并补充进去
                  tmpList.checked = mintGraph.cells[k].data.edgeData.checked;
                  // 按 key set value
                  tmpNodeData.set(this.mintModelData[j][0],tmpList);
                }
              }
            }
            break;
          default:
            break
        }
      }
      console.log("tmpNodeData",tmpNodeData);
      // 2.3 用用户选的 nodeData 替换除 genesis 之外的节点和边的 nodeData｜edgeData（未选已的设置默认值）
      // 替换后整体存入 selectModelData （已含 genesis 如有）
      for(let i=0;i<mintGraph.cells.length;i++){
        // skip genesis node, find selected nodeData|edgeData by id and replace if exit
        if(mintGraph.cells[i].data.type === "blackhole"){
          if(tmpNodeData.has(mintGraph.cells[i].id))
            mintGraph.cells[i].data.nodeData = tmpNodeData.get(mintGraph.cells[i].id);
          else
            mintGraph.cells[i].data.nodeData = {token:'',burn:0};
          // 整个节点存入 <- 按 index 取出这个节点 <- 通过节点 id，用 indexOf 查节点位置
          selectModelData.push(mintGraph.cells[i]);
        }
        else if(mintGraph.cells[i].data.type === "pool"){
          if(tmpNodeData.has(mintGraph.cells[i].id))
            mintGraph.cells[i].data.nodeData = tmpNodeData.get(mintGraph.cells[i].id);
          else
            mintGraph.cells[i].data.nodeData = {modules:[],tokens:[]};
          // 整个节点存入 <- 按 index 取出这个节点 <- 通过节点 id，用 indexOf 查节点位置
          selectModelData.push(mintGraph.cells[i]);
        }
        else if(mintGraph.cells[i].data.type === "stakeholder"){
          if(tmpNodeData.has(mintGraph.cells[i].id))
            mintGraph.cells[i].data.nodeData = tmpNodeData.get(mintGraph.cells[i].id);
          else
            mintGraph.cells[i].data.nodeData = {tokens:{tokenAmounts:[],tokenNames:[]}};
          // 整个节点存入 <- 按 index 取出这个节点 <- 通过节点 id，用 indexOf 查节点位置
          selectModelData.push(mintGraph.cells[i]);
        }
        else if(mintGraph.cells[i].data.type === "edge"){
          if(tmpNodeData.has(mintGraph.cells[i].id))
            mintGraph.cells[i].data.edgeData = tmpNodeData.get(mintGraph.cells[i].id);
          else
            mintGraph.cells[i].data.edgeData = {checked:true,policy:{tokenNames:[],policyNames:[],policyFunctions:[]}};
          // 整个节点存入 <- 按 index 取出这个节点 <- 通过节点 id，用 indexOf 查节点位置
          selectModelData.push(mintGraph.cells[i]);
        }
      }
      console.log("selectModelData",selectModelData);
      // 2. END --------------->
      // 以上组装用于 mint 的 graph data

      // 以下组装用于 mint 的 Vusual data
      // 
      console.log("Visual Data",this.mintVisualData);
      // 以上组装用于 mint 的 Vusual data
      // 遍历 [0]is index [1]is chart
      
      // 2. Visual data ，Property data from step 3
      // 3. picture、name、desc
      // console.log("name",this.ruleForm.name);
      // console.log("desc",this.ruleForm.desc);
      // console.log("img",this.imgArr[0]);

      // const modelData = getStore("graph");
      // try {
      //   this.confirmMint(
      //     modelData,
      //     this.user,
      //     this.ruleForm.name,
      //     this.ruleForm.desc,
      //     this.imgArr[0]
      //   );
      // } finally {
      //   this.ruleForm.name = "";
      //   this.ruleForm.desc = "";
      //   this.imgArr = [];
      //   this.allowAddImg = true;
      //   this.close();
      // }
    },
    // 获取画布之外的环境参数，返回值是 JSON 字符串
    getParamsOutsideGraph() {
      let res = {
        configData: this.configData,
      };

      return JSON.stringify(res);
    },
  },
  computed: {
      ...mapState([
        "selectNodeData",
      ]),
    },
};
</script>

<style lang="scss" scoped >
.img_box {
  position: relative;
  .image-upload-button {
    font-size: 60px;
    margin-left: 30px;
  }
  .model-image-input {
    position: absolute;
    font-size: 40px;
    left: 30px;
    top: 0;
    opacity: 0;
    width: 60px;
  }
}
.img-show {
  margin-left: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
.item {
  margin: 4px;
  float: left;
  height: 16px;
}
.property-item {
  background: #fff;
  padding: 5px 20px;
  border-radius: 8px;
  line-height: 16px;
  color: rgb(102, 101, 101);
  border: rgb(195, 195, 195) solid 1px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}
</style>