<template>
  <div class="login">
    <h1>
      太极
    </h1>
    <LoginComponent @logined="logined" />
  </div>
</template>

<script>
import LoginComponent from "@/components/LoginComponent";
//import yolanda from "yolanda-ui";

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
