<template >
  <div class="header-container">
    <div class="header-box">
      <ul class="topnav">
        <li class="logo-box">
          <router-link to="/explore">
            <img src="../assets/BlockModellogo.png" alt="logo" class="logo" />
          </router-link>
        </li>
        <li>
          <img src="../assets/BetaTag.png" alt="version" class="version" />
        </li>
        <!-- <li class="search-box">
          <div class="search-input-outside">
            <el-input
              v-model="searchContent"
              placeholder="Search items"
              class="serch-input"
            ></el-input>
          </div>
          <i class="el-icon-search search-icon"></i>
        </li> -->
        <li class="connect-web3-button">
          <el-dropdown>
            <el-button type="primary">
              Log In<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item split-button="true">
                  <span v-if="this.user==null" @click="connectWeb3()">Connect Wallet</span>
                  <span v-else>{{this.user.substring(0, 5) + '...' + this.user.substring(this.user.length - 4)}}</span>
              </el-dropdown-item>
              <el-dropdown-item split-button="true">
                  <span v-if="this.userEmail==null" @click="connectEmail()">Connect Email</span>
                  <span v-else>{{this.userEmail.substring(0, 5) + '...' + this.userEmail.substring(this.userEmail.length - 4)}}</span>
              </el-dropdown-item>
              <el-dropdown-item icon="el-icon-user">
                <router-link class="profile" to="/profile">
                  Profile
                </router-link>
              </el-dropdown-item>
              <el-dropdown-item icon="el-icon-right" split-button="true">
                <span @click="logout()">Log Out</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </li>
        
        <li class="jump-survey">
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSc7-ZVTRYlFFBDPPvUfiB_yOC4MUds8gPetACOZBMrS4_DIKw/viewform" 
            target="_blank" 
            style="text-decoration: none">
            <el-button icon="el-icon-tickets" circle type="primary"></el-button>
          </a>
        </li> 
      
        <el-dialog title="Connect Email" :visible.sync="emailDialogVisible" width="30%">
          <el-form :inline="true" :model="form" class="demo-form-inline">
            <el-form-item label="Email">
              <el-input v-model="form.email" placeholder="Use to receive verify conde"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="sendCode(form.email)" v-loading="sendLoading">Send</el-button>
            </el-form-item>
          </el-form>

          <!-- TODO：报错 span -->
          <p v-if="ifSendError">Email verification failed, please change email or try again later.</p>

          <el-form :inline="true" :model="form" class="demo-form-inline">
            <el-form-item label="Code">
              <el-input v-model="form.code" placeholder="Enter code to verify"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="verifyCode(form.email,form.code)" v-loading="verifyLoading">Verify</el-button>
            </el-form-item>
          </el-form>

          <!-- TODO：验证码错误 span -->
          <p v-if="ifCodeError">Verification code timed out or error, please try again</p>
        </el-dialog>

        <!-- <div class="avatar"> -->
        <!-- <div class="avatar" v-show="false"> -->
          <!-- <span class="user-short-id">{{ shorUserId }}</span> -->
          <!--<router-link to="/profile">Profile</router-link>
           <el-avatar icon="el-icon-user-solid" class="avatar-icon"></el-avatar> -->
          <!-- <el-dropdown>
            <div
              class="avatar-icon"
              ref="avatar"
              style="
                background: linear-gradient(
                  to right,
                  #ab506d,
                  #34a3ad,
                  #e367dc
                );
              "
            ></div>
            <el-dropdown-menu slot="dropdown" class="dropdown-menu-in-header">
              <el-dropdown-item icon="el-icon-user"
                ><router-link class="profile" to="/profile"
                  >Profile</router-link
                ></el-dropdown-item
              >
              <el-dropdown-item icon="el-icon-right" @click="logout()"
                >Log Out</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown> -->
        <!-- </div> -->

        <router-link tag="li" to="/explore" class="left">
          <span>Explore</span>
        </router-link>
        <router-link tag="li" to="/design" class="left">
          <span>Design</span>
        </router-link>
        <router-link tag="li" to="/create" class="left">
          <span>Create</span>
        </router-link>
        <router-link tag="li" to="/resources" class="left">
          <span>Resources</span>
        </router-link>
      </ul>
    </div>
  </div>
</template>
<script>
import { mapState, mapMutations, mapActions } from "vuex";
import { getStore, setStore, removeStore } from "../utils/storage";
// import { setupIPFS } from "../utils/ipfsUtil";
import {
  connectMetamask,
  accountChangeListener,
  getWeb3Provider,
} from "../api/contracts";
export default {
  data() {
    return {
      // user:'',
      // userEmail:'',
      emailDialogVisible:false,
      form:{
        email:'',
        code:'',
      },
      formLabelWidth: '60px',
      dialogFormVisible:false,
      ifSendError:false,
      ifCodeError:false,

      sendLoading: false,
      verifyLoading: false,
      searchContent: "",
    };
  },
  computed: {
    ...mapState(["web3Provider", "user", "userEmail"]),
    // shorUserId() {
    //   return (
    //     this.user.substring(0, 5) +
    //     "..." +
    //     this.user.substring(this.user.length - 4)
    //   );
    // },
  },
  methods: {
    ...mapActions(["set_web3_provider"]),
    ...mapMutations(["SET_USER", "SET_USER_EMAIL"]),
    initProvider() {
      let provider = getWeb3Provider();
      if (provider == null) {
        this.$notify.warning({
          title: "Warning",
          message: "Please install metamask first!",
          duration: 0,
          position: "bottom-right",
        });
      }
      this.set_web3_provider(provider);
    },
    initUser() {
      let tmpUser = getStore("user");
      let tmpUserEmail = getStore("user_email");
      // user = getStore("userEmail");
      if (tmpUser == null || tmpUser == "null" || tmpUser.length == 0) {
        this.connectWeb3();
      } else {
        this.SET_USER(tmpUser);
      }
      if (tmpUserEmail != null && tmpUserEmail != "null" && tmpUserEmail.length > 0) {
        this.SET_USER_EMAIL(tmpUserEmail);
      }
      console.log("loggin user:", this.user, ", email:", this.userEmail);
    },
    connectWeb3() {
      if (window.ethereum) {
        window.ethereum.enable().then((res) => {
          this.SET_USER(res[0]);
          // console.log("res:",res[0]);
        })
      }else{
        alert("Please install MetaMask～！")
      }

      connectMetamask(this.web3Provider).then((response) => {
        if (response.status) {
          if (this.user != null) {
            this.$notify.success({
              title: "Success",
              message: "Account switching succeeded!",
              position: "bottom-right",
            });
          } else {
            this.$notify.success({
              title: "Success",
              message: "Account connect succeeded!",
              position: "bottom-right",
            });
          }
          // this.SET_USER(response.account[0]);
          // console.log("response.account:", response.account[0]);

          //生成账户头像
          // this.$nextTick(function () {
          //   this.$refs.avatar.style.background =
          //     "linear-gradient(to right, #" +
          //     response.account[0].substring(2, 8) +
          //     ", #" +
          //     response.account[0].substring(8, 14) +
          //     ", #" +
          //     response.account[0].substring(14, 20) +
          //     ")";
          // });
        } else {
          this.$notify.error({
            title: "Error",
            message: "Connect failed!",
            duration: 0,
            position: "bottom-right",
          });
        }
      });
    },

    connectEmail() {
      this.emailDialogVisible = true;
    },
    // connect() {
    //   if (window.ethereum) {
    //     window.ethereum.enable().then((res) => {
    //     this.SET_USER(res[0]);
    //   })
    //   }else{
    //     alert("Please install MetaMask～！")
    //   }
    // },
    logout() {
      this.SET_USER(null);
      this.SET_USER_EMAIL(null);
    },
    async sendCode(email){
      this.sendLoading = true;
      let response = await this.axios.get(`/api/send/${email}`);
      console.log("response:", response);
      if (response.status == 200) {
        this.ifSendError = false;
      }
      else {
        console.log("send code error:",response.statusText, "\nPlease try again!");
        this.ifSendError = true;
      }
      // this.axios.get(`/api/send/${email}`).then(
      //   result => {
      //     console.log("succeed",result.data)
      //   },
      //   error => {
      //     alert("send code error:",error, "\nPlease try again!");
      //     _this.ifSendError = true;
      //   }
      // )
      this.sendLoading = false;
    },

    async verifyCode(email,code){
      this.verifyLoading = true;

      let response = await this.axios.post('/api/authcode',{user:email, code:code});
      if (response.status == 200) {
        if(response.data.result=="true") {
          this.SET_USER_EMAIL(email);
          this.ifCodeError = false;
          this.verifyLoading = false;
          this.emailDialogVisible = false;
        }
        else{
          console.log("verify email error: Wrong Code", "\nPlease try again");
          this.ifCodeError = true;
          this.emailDialogVisible = true;
          this.verifyLoading = false;
        } 
      }
      else {
        console.log("verify email error: ",error, "\nPlease try again");
        this.ifCodeError = true;
        this.emailDialogVisible = true;
        this.verifyLoading = false;
      }
      // this.axios.post('/api/authcode',{user:email, code:code}).then(
      //   result => {
      //     console.log("succeed",result.data)
      //     if(result.data.result=="true") {
      //       // this.userEmail = email;
      //       console.log("in true_-------");
      //       _this.SET_USER_EMAIL(email);
      //       _this.ifCodeError = false;
            
      //     }
      //     else _this.ifCodeError = true;
      //   },
      //   error => {
      //     alert("verify email error: ",error, "\nPlease try again");
      //     _this.ifCodeError = true;
      //   }
      // )

    }
  },
  mounted() {
    // 连接 IPFS 服务
    // setupIPFS();
    this.initProvider();
    accountChangeListener(this.connectWeb3);
    this.initUser();

    // if (window.ethereum) {
    //   window.ethereum.enable().then(() => {
    //     //alert("当前钱包地址："+res[0])
    //   })
    // }else{
    //   alert("Please install MetaMask～！")
    // }
  },
};
</script>
<style  scoped lang="scss">
.header-box {
  height: 80px;
  width: 1400px;
  .topnav {
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    //background-color: black;
    position: fixed;
    z-index: 9999;
    top: 0;
    width: 100%;
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.5), 0 0 6px rgba(74, 141, 223, 0.5);
    .logo {
      margin: 10px 55px;
      width: 50px;
    }
    .version {
      margin: 30px 0px;
      width: 50px;
    }
    .logo-box {
      img {
        width: 200px;
        height: 50px;
        margin-top: 2.5%;
      }
    }
    .search-box {
      width: 550px;
      margin-left: 300px;
      .search-input-outside {
          float:left;
          width: 500px;
          height: 47px;
          margin-top: 20px;
          background: -webkit-linear-gradient(0deg, #37e2f5, #f574f5);
          border-radius: 10px;
          .serch-input {
            width: 490px;
            float: left;
            margin-top:4px;
            margin-left:5px;
            /deep/ .el-input__inner {
              border: solid 0px rgb(229, 232, 235);
              background-color: rgba(255, 255, 255,0.75);
              border-radius: 6px;
              margin: 0 auto;
            }
          }
      
      }
      .search-icon {
        float: left;
        margin-left: 15px;
        margin-top: 4px;
        font-size: 25px;
        font-weight: 600;
        line-height: 80px;
        cursor: wait;
        color: #49e4f5;
      }
        .search-icon:hover {
          color: #b074f5;
        }
    }

    li {
      float: left;
      margin-right: 30px;
      span {
        display: block;
        text-align: center;
        padding: 14px 16px;
        height: 50px;
        background: -webkit-linear-gradient(left, #49e4f5, #d849f5);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        line-height: 50px;
        text-decoration: none;
        //color: rgb(0, 0, 0);
        font-weight: 2000;
        font-size: 16px;
        font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
        sans-serif;
        &:hover {
          //color: rgb(104, 104, 104);
          transition: color 0.4s ease 0s;
          cursor: pointer;
          background: -webkit-linear-gradient(right, #49e4f5, #d849f5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }
    .left {
      float: left;
    }
    .login {
      float: right;
      margin: 20px 10px 0px 10px;
      cursor: pointer;
    }
    .el-button {
      color: white;
      border: 0;
      background: -webkit-linear-gradient(left, #78c9f5, #ca82f4);
    }
    .el-input{
      width: 200px;
    }
    /deep/ .el-dialog__body {
      color: #ff4141;
    }
    .connect-web3-button {
      float: right;
      margin: 20px 30px 0px 20px;
      cursor: pointer;
      .el-button {
        color: white;
        border: 0;
        background: -webkit-linear-gradient(left, #49e4f5, #d849f5);
      }
    }
    .jump-survey {
      float: right;
      margin: 20px 30px 0px 20px;
      cursor: pointer;
    }
    .connect-email-button {
      float: right;
      margin: 20px 0px 0px 20px;
      cursor: pointer;
      .el-button {
        color: white;
        border: 0;
        background: -webkit-linear-gradient(left, #49e4f5, #d849f5);
      }
    }
    .avatar {
      float: right;
      .avatar-icon {
        float: left;
        margin: 20px 30px 20px 0px;
        height: 35px;
        width: 35px;
        border-radius: 100%;
        background-color: red;
        padding: 1px;
        border: 2px solid rgb(255, 239, 12);
        cursor: pointer;
      }
      .user-short-id {
        float: left;
        display: block;
        margin: 25px 10px 0px 60px;
        padding: 5px 10px;
        border: solid 1px #e7e7e7;
        border-radius: 20px;
        font-family: "Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS",
          sans-serif;
        font-weight: 600;
      }
      /deep/ .el-avatar {
        background-color: #fff;
        color: #000;
      }
      /deep/ .el-avatar--icon {
        font-size: 25px;
      }

      .profile {
        color: #000;
      }
    }
    .float-right{
      position: fixed;
      display: flex;
      flex-direction: column;
      right: 30px;
      bottom: 30px;
      z-index: 10;
      padding: 3px 3px 0 3px;
      border-radius: 3px;
      border: 1px solid #ddd;
      background: #fff;
    }
  }
}
ul li.router-link-active,
ul li.router-link-exact-active {
  border-bottom: solid 2px rgb(2, 157, 247);
}
</style>

<style lang="scss">
.dropdown-menu-in-header li {
  color: black;
  .router-link-active {
    text-decoration: none;
    color: black;
  }
  a{
    text-decoration: none;
    color: black;
  }
}
</style>