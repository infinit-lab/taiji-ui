<template>
  <div id="loginDiv">
    <el-container id="loginContainer">
      <el-main id="loginMain">
        <p>用户名：</p>
        <el-input v-model="username" placeholder="请输入用户名" clearable />
        <p>密码：</p>
        <el-input
          v-model="password"
          placeholder="请输入密码"
          show-password
          clearable
        />
      </el-main>
      <el-footer id="loginFooter">
        <el-checkbox v-model="remember">记住我</el-checkbox>
        <el-button type="primary" :loading="logining" @click="login">
          登录
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import yolanda from "yolanda-ui";
import md5 from "js-md5";

export default {
  data() {
    return {
      username: "",
      password: "",
      remember: false,
      logining: false
    };
  },
  methods: {
    login: function() {
      if (this.username === "" || this.password === "") {
        this.$message.error("用户名或密码不能为空");
        return;
      }
      this.logining = true;
      yolanda.sendHttpRequest(
        {
          method: "POST",
          url: "/api/1/token",
          data: {
            username: this.username,
            password: md5(this.password)
          }
        },
        response => {
          this.logining = false;
          if (yolanda.isResultTrue(response)) {
            this.$emit("logined", response.data.data);
            this.$store.commit("setRemember", this.remember);
            this.$store.commit("setUsername", this.username);
          }
        },
        "登录失败"
      );
      this.logining = false;
    }
  },
  created: function() {
    this.remember = this.$store.getters.getRemember;
    if (this.remember) {
      this.username = this.$store.getters.getUsername;
    }
  }
};
</script>

<style scoped>
#loginDiv {
  display: flex;
  justify-content: center;
}
#loginContainer {
  max-width: 400px;
  min-width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
#loginMain {
  text-align: left;
}
#loginFooter {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
</style>
