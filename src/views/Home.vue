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
      id="changePasswordDialog"
    >
      <p>原密码:</p>
      <el-input
        v-model="originPassword"
        placeholder="请输入原密码"
        show-password
        clearable
      ></el-input>
      <p>新密码:</p>
      <el-input
        v-model="newPassword"
        placeholder="请输入新密码"
        show-password
        clearable
      ></el-input>
      <p>确认新密码:</p>
      <el-input
        v-model="checkNewPassword"
        placeholder="请确认新密码"
        show-password
        clearable
      ></el-input>
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
      changingPassword: false
    };
  },
  router,
  created: function() {
    this.$router.push("/home");
  },
  beforeDestroy: function() {
    this.changePasswordVisible = false;
  },
  methods: {
    handleSelect: function(key) {
      switch (key) {
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
    }
  }
};
</script>

<style scoped>
#changePasswordDialog {
  text-align: left;
  font-size: 12px;
}
</style>
