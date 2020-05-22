<template>
  <div>
    <el-container>
      <el-aside>
        <el-menu :default-active="selected" :active="selected" router id="menu">
          <el-menu-item index="/log/operate">操作日志</el-menu-item>
          <el-menu-item index="/log/login">登录日志</el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import OperateLogComponent from "./OperateLogComponent";
import LoginLogComponent from "./LoginLogComponent";
import VueRouter from "vue-router";

const routes = [
  {
    path: "/log/operate",
    name: "OperateLog",
    component: OperateLogComponent
  },
  {
    path: "/log/login",
    name: "LoginLog",
    component: LoginLogComponent
  }
];

const router = new VueRouter({
  routes
});

export default {
  name: "LogComponent",
  router,
  data() {
    return {
      selected: "/log/operate"
    };
  },
  mounted: function() {
    console.log("LogComponent mounted");
    this.$router.push("/log/operate");
  }
};
</script>

<style scoped>
#menu {
  height: 100%;
}
</style>
