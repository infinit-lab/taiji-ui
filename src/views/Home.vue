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
            <el-menu-item index="license">证书</el-menu-item>
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
    <el-dialog title="证书" :visible.sync="licenseVisible" width="30%">
      <div id="license" v-show="!isImporting">
        <div id="fingerprint">
          <div>机器指纹：</div>
          <div id="fingerprintContent">{{ fingerprint }}</div>
          <el-button
            type="text"
            id="fingerprintCopy"
            @click="onCopyFingerprint"
          >
            复制
          </el-button>
        </div>
        <div>授权状态：{{ licenseStatus }}</div>
        <div id="validDuration">有效时间：{{ licenseDuration }}</div>
      </div>
      <div v-show="isImporting">
        <input type="file" id="licenseFile" accept=".txt" />
      </div>
      <span slot="footer">
        <el-button @click="onImportLicense">{{
          importButtonContent
        }}</el-button>
        <el-button
          @click="onConfirmImport"
          type="primary"
          :loading="isImportingFile"
        >
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
import define from "../define";

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
      gateway: "",

      licenseVisible: false,
      fingerprint: "",
      licenseStatus: "",
      licenseDatetime: "",
      licenseDuration: "",
      isImporting: false,
      isImportingFile: false
    };
  },
  router,
  created: function() {
    this.$router.push("/home");
  },
  beforeDestroy: function() {
    this.changePasswordVisible = false;
    this.configNetVisible = false;
    this.licenseVisible = false;
  },
  computed: {
    importButtonContent: {
      get() {
        if (this.isImporting) {
          return "返回";
        } else {
          return "导入证书";
        }
      },
      set() {}
    }
  },
  methods: {
    getDuration: function(duration) {
      let second = 0;
      if (duration > 0) {
        second = duration % 60;
      }
      let minute = 0;
      duration = (duration - second) / 60;
      if (duration > 0) {
        minute = duration % 60;
      }
      let hour = 0;
      duration = (duration - minute) / 60;
      if (duration > 0) {
        hour = duration % 24;
      }
      let day = 0;
      day = (duration - hour) / 24;
      if (day < 0) {
        day = 0;
      }

      let durationStr = "";
      if (day > 0) {
        durationStr += day.toString() + "天 ";
      }
      if (hour > 0) {
        durationStr += hour.toString() + "小时 ";
      }
      if (minute > 0) {
        durationStr += minute.toString() + "分钟 ";
      }
      if (second > 0) {
        durationStr += second.toString() + "秒";
      }
      if (process.runningTime === "") {
        durationStr = "-";
      }
      return durationStr;
    },
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
        case "license":
          this.isImporting = false;
          this.importButtonContent = "导入证书";
          yolanda.sendHttpRequest(
            {
              method: "GET",
              url: "/api/1/license"
            },
            response => {
              if (yolanda.isResultTrue(response)) {
                if ("data" in response.data) {
                  let data = response.data.data;
                  this.fingerprint = data.fingerprint;
                  this.licenseDatetime = "-";
                  this.licenseDuration = "-";
                  switch (data.status) {
                    case define.LicenseUnauthorized:
                      this.licenseStatus = "未授权";
                      break;
                    case define.LicenseAuthorized:
                      this.licenseStatus = "已授权";
                      if (data.isForever) {
                        this.licenseDatetime = "永久";
                        this.licenseDuration = "永久";
                      } else {
                        this.licenseDatetime = data.validDatetime;
                        this.licenseDuration = this.getDuration(
                          data.validDuration
                        );
                      }
                      break;
                    case define.LicenseImporting:
                      this.licenseStatus = "正在导入证书";
                      break;
                  }
                  this.licenseVisible = true;
                }
              }
            },
            "获取证书失败"
          );
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
    },
    onCopyFingerprint: function() {
      let textarea = document.createElement("textarea");
      let currentFocus = document.activeElement;
      document.body.appendChild(textarea);
      textarea.value = this.fingerprint;
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        this.$message.error("复制失败");
      }
      this.$message({
        message: "复制成功",
        type: "success"
      });
      document.body.removeChild(textarea);
      currentFocus.focus();
    },
    onImportLicense: function() {
      let e = document.getElementById("licenseFile");
      if (e !== null) {
        e.value = "";
      }
      this.isImporting = !this.isImporting;
    },
    onConfirmImport: function() {
      if (this.isImporting) {
        let file = document.getElementById("licenseFile").files[0];
        if (file == null) {
          this.$message.error("打开文件失败");
          return;
        }
        let reader = new FileReader();
        reader.onload = () => {
          this.isImportingFile = true;
          yolanda.sendHttpRequest(
            {
              method: "PUT",
              url: "/api/1/license",
              data: reader.result,
              headers: {
                "Content-Type": file.type,
                "Content-Size": file.size,
                "File-Name": file.name
              }
            },
            response => {
              this.isImportingFile = false;
              if (yolanda.isResultTrue(response)) {
                this.licenseVisible = false;
              }
            },
            "导入证书失败"
          );
        };
        reader.onerror = () => {
          this.$message.error("读取文件失败");
        };
        reader.readAsArrayBuffer(file);
      } else {
        this.licenseVisible = false;
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
#license {
  text-align: left;
  padding-left: 20px;
}
#fingerprint {
  display: flex;
  flex-direction: row;
  align-items: center;
}
#fingerprintCopy {
  margin-left: 10px;
}
#validDuration {
  margin-top: 10px;
}
#licenseFile {
  width: 200px;
}
</style>
