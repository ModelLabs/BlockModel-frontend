<template>
  <div>
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

      <el-form-item label="Properties" prop="properties">
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
      </el-form-item>

      <!-- <el-form-item label="Report File" prop="reportFile">
        <el-upload
          accept=".pdf"
          action="https://jsonplaceholder.typicode.com/posts/"
          :file-list="fileArr"
          :show-file-list="true"
          :auto-upload="false"
          :before-upload="beforeUpload"
          :on-success="upSuccess"
          :on-error="upError"
          :on-change="imgPreview"
        >
          <el-button size="small" type="primary" class="upload-btn">
            <span class="iconfont icon-shangchuan" />Click to Upload
          </el-button>
        </el-upload>
      </el-form-item> -->

      <!-- <el-form-item label="Include Model" prop="include">
        <el-switch v-model="ruleForm.delivery"></el-switch>
      </el-form-item> -->

      <!-- <el-form-item label="External Link" prop="exlink">
        <el-input v-model="ruleForm.exlink"></el-input>
      </el-form-item> -->

      <el-form-item>
        <!-- <el-button @click="resetForm('ruleForm')">Reset</el-button> -->
        <el-button type="primary" @click="mint()">Mint</el-button>
      </el-form-item>
    </el-form>
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
const crypto = require("crypto");
export default {
  props: ["close"],
  data() {
    return {
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
        properties: [],
        // include: false,
        // exlink: "",
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
  },
  computed: {
    ...mapState([
      "user",
      "statusCode",
      "configData",
      "historySimulateData",
      "ruleLists",
    ]),
  },
  methods: {
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
    //     this.$msg("????????????????????? pdf");
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
    //     this.upLoadImgUrl = URL.createObjectURL(file.raw); // ??????URL
    //     this.pdfUrl = this.getPdfUrl(file);
    //     console.log(this.upLoadImgUrl);
    //   } else {
    //     this.$message.error("?????????pdf??????");
    //   }
    // },

    // ????????????
    upSuccess(res) {
      this.$message({
        message: "????????????",
        type: "success",
      });
    },
    // ????????????
    upError(e) {
      this.$message({
        message: "????????????",
        type: "error",
      });
    },
    //??????pdf
    getPdfUrl(file) {
      console.log(file);
      let url = window.URL.createObjectURL(file.raw); //??????????????????url
      //??????pdf
      let loadingTask = pdf.createLoadingTask(url);
      loadingTask.promise
        .then((pdf) => {
          this.numPages = pdf.numPages;
          console.log(this.numPages);
        })
        .catch((err) => {
          console.error("pdf ????????????", err);
        });
      return url;
    },
    //?????????????????????nft
    async confirmMint(modelData, user, name, desc, pic) {
      // ????????????????????? 32 ????????????????????? NFT Key ??? AES ????????????
      const key = randomString(32);
      // ?????? AES ??????
      // ?????? iv ?????????????????? null
      const cipher = crypto.createCipheriv("aes256", key, Buffer.alloc(16, 0));

      let encryptedSecretData = encryptDataNormal(cipher, modelData + ",,," + this.getParamsOutsideGraph() + ",,," + JSON.stringify(this.historySimulateData));

      // ????????????????????? EOA ??????
      let encryptPub = await getEOAPubkey(this.user);

      // ??? NFT Key ?????????????????????
      let encKey = await encryptDataEOA(encryptPub, key);
      console.log("encrypted key:", encKey);

      // ??? picture, secret data ????????? IPFS
      let picCID = await uploadToIPFS(pic);
      let secretCID = await uploadToIPFS(encryptedSecretData);
      // let tmp = await downloadFromIPFS(picCID);
      // console.log("downloaded data", tmp);

      // ?????? property.content TODO
      let propertyContent = new Array();
      for (let i = 0; i < this.ruleLists.length; i++) {
        propertyContent.push(this.ruleLists[i]);
      } 

      // TODO (Xufei) [Done] ????????????
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

          // TODO (Xufei) [Done] ??????????????????????????????????????????????????????????????????
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
            _this.$message.error("????????????????????????");
            return false;
          }
          if (files.item(dd).size > imgLimit * 102400) {
            //to do sth
            this.$message.error("??????????????????1MB");
          } else {
            image.src = window.URL.createObjectURL(files.item(dd));
            image.onload = function () {
              // ?????????????????????
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
                .toLowerCase(); //????????????
              var base64 = canvas.toDataURL("image/" + ext, quality);
              // ??????????????????base64??????
              if (_this.imgArr.length <= 1) {
                _this.imgArr.unshift("");
                _this.imgArr.splice(0, 1, base64); //???????????????????????????????????????????????????this.imgArr[index] = url;
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
      const modelData = getStore("graph");
      try {
        this.confirmMint(
          modelData,
          this.user,
          this.ruleForm.name,
          this.ruleForm.desc,
          this.imgArr[0]
        );
      } finally {
        this.ruleForm.name = "";
        this.ruleForm.desc = "";
        this.imgArr = [];
        this.allowAddImg = true;
        this.close();
      }
    },
    // ???????????????????????????????????????????????? JSON ?????????
    getParamsOutsideGraph() {
      let res = {
        configData: this.configData,
      };

      return JSON.stringify(res);
    },
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