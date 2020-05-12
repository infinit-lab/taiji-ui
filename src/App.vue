<template>
  <div id="app">
    <router-view @logined="logined" />
  </div>
</template>

<script>
import yolanda from "yolanda-ui";
import define from "./define";

export default {
  data() {
    return {
      subscriber: null,
      isLogined: false
    };
  },
  methods: {
    logined: function(token) {
      if (this.isLogined === true) {
        return;
      }
      console.log("logined");
      this.isLogined = true;
      this.$store.commit("setToken", token);
      console.log("connectNotifier");
      yolanda.connectNotifier(
        "ws://" + window.location.host + "/ws/1/notification"
      );
      this.$router.push("/");
    },
    logouted: function() {
      console.log("logouted");
      this.isLogined = false;
      this.$store.commit("setToken", "");
      yolanda.disconnectNotifier();
      this.$router.push("login");
    }
  },
  created: function() {
    console.log("created");
    this.subscriber = yolanda.subscribe(define.KeyToken, (key, value) => {
      if (key === define.KeyToken && "id" in value && "status" in value) {
        if (value.status === define.StatusDeleted) {
          this.logouted();
        }
      }
    });

    yolanda.registerNotifyCallback(data => {
      data = JSON.parse(data);
      if ("key" in data) {
        if (data.key === define.KeyToken) {
          console.log(data);
        }
        yolanda.publish(data.key, data);
      }
    });

    yolanda.registerErrorMessageCallback(errorMessage => {
      this.$message.error(errorMessage);
    });

    const token = this.$store.getters.getToken;
    if (token === "") {
      this.$router.push("/login");
    } else {
      this.logined(token);
      this.$router.push("/");
    }
  },
  mounted: function() {
    console.log("mounted");
  },
  beforeDestroy: function() {
    console.log("beforeDestroy");
    //yolanda.disconnectNotifier();
  }
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
