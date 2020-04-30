<template>
  <div class="login">
    <h1 class="header">Puppy</h1>
    <LoginComponent @logined="logined" />
  </div>
</template>

<script>
import LoginComponent from "@/components/LoginComponent";

export default {
  name: "Login",
  components: {
    LoginComponent
  },
  methods: {
    logined: function(token) {
      this.$emit("logined", token);
    }
  }
};
</script>

<style scoped>
.header {
  color: #409eff;
}
</style>
