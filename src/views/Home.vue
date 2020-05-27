<template>
  <div class="home">
    <el-row>
      <el-col :span="2">
        <h1>太极</h1>
      </el-col>
      <el-col :span="20">
        <el-menu mode="horizontal" :default-active="activeIndex" router>
          <el-menu-item index="/home">首页</el-menu-item>
          <el-menu-item index="/process">进程</el-menu-item>
          <el-menu-item index="/log">日志</el-menu-item>
        </el-menu>
      </el-col>
      <el-col :span="2">
        <el-menu mode="horizontal" @select="handleSelect">
          <el-submenu index="config">
            <template slot="title">配置</template>
            <el-menu-item index="configNet">网卡配置</el-menu-item>
            <el-menu-item index="changePassword">修改密码</el-menu-item>
            <el-menu-item index="logout">注销</el-menu-item>
            <el-menu-item index="about">关于</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-col>
    </el-row>
    <router-view></router-view>
    <el-dialog
      title="修改密码"
      :visible.sync="changePasswordVisible"
      width="30%"
      class="dialog"
    >
      <div class="grid">
        <div class="key">原密码：</div>
        <el-input
          v-model="originPassword"
          placeholder="请输入原密码"
          show-password
          clearable
          class="value"
        ></el-input>
        <div class="key">新密码：</div>
        <el-input
          v-model="newPassword"
          placeholder="请输入新密码"
          show-password
          clearable
          class="value"
        ></el-input>
        <div class="key">确认密码：</div>
        <el-input
          v-model="checkNewPassword"
          placeholder="请确认新密码"
          show-password
          clearable
          class="value"
        ></el-input>
      </div>
      <span slot="footer">
        <el-button @click="changePasswordVisible = false">取消</el-button>
        <el-button
          @click="onChangePassword"
          type="primary"
          :loading="changingPassword"
        >
          确定
        </el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="网卡配置"
      :visible.sync="configNetVisible"
      width="30%"
      class="dialog"
    >
      <div class="grid">
        <div class="key">网卡：</div>
        <el-select
          class="value"
          v-model="netInterfaceIndex"
          placeholder="请选择网卡"
          @change="onNetInterfaceChanged"
        >
          <el-option
            v-for="item in netInterfaces"
            :key="item.index"
            :label="item.name"
            :value="item.index"
          ></el-option>
        </el-select>
        <div class="key">MAC：</div>
        <el-input class="value" v-model="mac" readonly></el-input>
        <div class="key">IP：</div>
        <el-input class="value" v-model="ip"></el-input>
        <div class="key">子网掩码：</div>
        <el-input class="value" v-model="mask"></el-input>
        <div class="key">网关：</div>
        <el-input class="value" v-model="gateway"></el-input>
      </div>
      <span slot="footer">
        <el-button @click="configNetVisible = false">取消</el-button>
        <el-button @click="onConfigNet" type="primary" :loading="configingNet">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import HomeComponent from "../components/HomeComponent";
import ProcessComponent from "../components/ProcessComponent";
import LogComponent from "../components/LogComponent";
import VueRouter from "vue-router";
import yolanda from "yolanda-ui";
import md5 from "js-md5";

const routes = [
  {
    path: "/home",
    name: "HomeBoard",
    component: HomeComponent
  },
  {
    path: "/process",
    name: "Process",
    component: ProcessComponent
  },
  {
    path: "/log",
    name: "Log",
    component: LogComponent
  }
];

const router = new VueRouter({
  routes
});

export default {
  name: "Home",
  data() {
    return {
      activeIndex: "/home",

      changePasswordVisible: false,
      originPassword: "",
      newPassword: "",
      checkNewPassword: "",
      changingPassword: false,

      configNetVisible: false,
      configingNet: false,
      netInterfaces: [],
      netInterfaceIndex: "",
      mac: "",
      ip: "",
      mask: "",
      gateway: ""
    };
  },
  router,
  created: function() {
    this.$router.push("/home");
  },
  beforeDestroy: function() {
    this.changePasswordVisible = false;
    this.configNetVisible = false;
  },
  methods: {
    handleSelect: function(key) {
      switch (key) {
        case "configNet":
          this.netInterfaces = [];
          this.netInterfaceIndex = "";
          this.mac = "";
          this.ip = "";
          this.mask = "";
          this.gateway = "";
          yolanda.sendHttpRequest(
            {
              method: "GET",
              url: "/api/1/net/interface"
            },
            response => {
              if (yolanda.isResultTrue(response)) {
                if ("data" in response.data) {
                  this.netInterfaces = response.data.data;
                  if (this.netInterfaces.length > 0) {
                    this.netInterfaceIndex = this.netInterfaces[0].index;
                    this.onNetInterfaceChanged();
                  }
                  this.configNetVisible = true;
                }
              }
            },
            "获取网卡列表失败"
          );
          break;
        case "changePassword":
          this.originPassword = "";
          this.newPassword = "";
          this.checkNewPassword = "";
          this.changingPassword = false;
          this.changePasswordVisible = true;
          break;
        case "logout":
          this.$confirm("是否确认注销?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }).then(() => {
            yolanda.sendHttpRequest(
              {
                method: "DELETE",
                url: "/api/1/token/" + this.$store.state.token
              },
              response => {
                if (yolanda.isResultTrue(response)) {
                  this.$message({
                    message: "注销成功",
                    type: "success"
                  });
                }
              },
              "注销失败"
            );
          });
          break;
        case "about":
          yolanda.sendHttpRequest(
            {
              method: "GET",
              url: "/api/1/version"
            },
            response => {
              if (yolanda.isResultTrue(response)) {
                if ("data" in response.data) {
                  this.$alert(
                    "<p>版本号：" +
                      response.data.data.version +
                      " Build(" +
                      response.data.data.commitId +
                      ")</p>" +
                      "<p>构建时间：" +
                      response.data.data.buildTime +
                      "</p>",
                    "关于",
                    {
                      confirmButtonText: "确定",
                      dangerouslyUseHTMLString: true
                    }
                  );
                }
              }
            },
            "获取版本失败"
          );
          break;
        default:
          return;
      }
    },
    onChangePassword: function() {
      if (this.originPassword === "") {
        this.$message.error("原密码不能为空");
        return;
      }
      if (this.newPassword === "") {
        this.$message.error("新密码不能为空");
        return;
      }
      if (this.newPassword !== this.checkNewPassword) {
        this.$message.error("两次输入密码不一致");
        return;
      }
      if (this.originPassword === this.newPassword) {
        this.$message.error("原密码与新密码不能相同");
        return;
      }
      this.changingPassword = true;
      const originPassword = md5(this.originPassword);
      console.log(originPassword);
      const newPassword = md5(this.newPassword);
      console.log(newPassword);
      yolanda.sendHttpRequest(
        {
          method: "PUT",
          url: "/api/1/password/" + this.$store.state.username,
          data: {
            origin: originPassword,
            new: newPassword
          }
        },
        response => {
          this.changingPassword = false;
          if (yolanda.isResultTrue(response)) {
            this.$message({
              message: "修改密码成功",
              type: "success"
            });
            this.changePasswordVisible = false;
          }
        },
        "修改密码失败"
      );
    },
    onNetInterfaceChanged: function() {
      for (let i = 0; i < this.netInterfaces.length; i++) {
        if (this.netInterfaceIndex === this.netInterfaces[i].index) {
          this.mac = this.netInterfaces[i].mac;
          this.ip = this.netInterfaces[i].ip;
          this.mask = this.netInterfaces[i].mask;
          this.gateway = this.netInterfaces[i].gateway;
          break;
        }
      }
    },
    checkIp(ip) {
      const reg = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
      if (reg.test(ip)) {
        if (
          RegExp.$1 < 256 &&
          RegExp.$2 < 256 &&
          RegExp.$3 < 256 &&
          RegExp.$4 < 256
        ) {
          return true;
        }
      }
      return false;
    },
    onConfigNet: function() {
      if (this.checkIp(this.ip) === false) {
        this.$message.error("IP格式错误");
      }
      if (this.checkIp(this.mask) === false) {
        this.$message.error("子网掩码格式错误");
      }
      if (this.checkIp(this.gateway) === false) {
        this.$message.error("网关格式错误");
      }
      let isFind = false;
      for (let i = 0; i < this.netInterfaces.length; i++) {
        if (this.netInterfaces[i].index === this.netInterfaceIndex) {
          const net = this.netInterfaces[i];
          if (
            net.ip === this.ip &&
            net.mask === this.mask &&
            net.gateway === this.gateway
          ) {
            break;
          }
          isFind = true;
          this.configingNet = true;
          yolanda.sendHttpRequest(
            {
              method: "PUT",
              url: "/api/1/net/interface/" + net.index.toString(),
              data: {
                index: net.index,
                name: net.name,
                description: net.description,
                mac: net.mac,
                ip: this.ip,
                mask: this.mask,
                gateway: this.gateway
              }
            },
            response => {
              this.configingNet = false;
              if (yolanda.isResultTrue(response)) {
                this.configNetVisible = false;
              }
            },
            "设置网卡失败"
          );
          break;
        }
      }
      if (isFind === false) {
        this.configNetVisible = false;
      }
    }
  }
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 70px 1fr;
  grid-template-rows: auto;
  grid-auto-flow: dense;
  text-align: left;
  margin-left: 10px;
  margin-right: 10px;
  grid-row-gap: 10px;
}
.key {
  grid-column-start: 1;
  grid-column-end: 2;
  justify-content: end;
  margin: auto 0;
}
.value {
  grid-column-start: 2;
  grid-column-end: 3;
  word-wrap: wrap;
  word-break: break-word;
}
</style>
