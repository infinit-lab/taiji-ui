<template>
  <div>
    <div id="search">
      <div id="picker">
        <el-date-picker
          v-model="dateTimeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        ></el-date-picker>
      </div>
      <el-button type="primary" @click="onSearch" :loading="isSearching">
        搜索
      </el-button>
    </div>
    <el-row>
      <el-col :span="22" :offset="1">
        <el-table
          :data="loginLogList"
          :height="tableHeight"
          ref="table"
          v-loading="isLoading"
        >
          <el-table-column type="index" align="center"></el-table-column>
          <el-table-column
            label="用户名"
            align="center"
            prop="username"
          ></el-table-column>
          <el-table-column
            label="IP"
            align="center"
            prop="ip"
          ></el-table-column>
          <el-table-column
            label="操作"
            align="center"
            prop="operate"
          ></el-table-column>
          <el-table-column
            label="时间"
            align="center"
            prop="time"
          ></el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import yolanda from "yolanda-ui";

export default {
  name: "LoginLogComponent",
  data() {
    return {
      dateTimeRange: [new Date(), new Date()],
      isSearching: false,
      loginLogList: [],
      isLoading: false,
      tableDom: null,
      isAll: false,
      times: 0,
      onceRows: 20,
      tableHeight: window.innerHeight - 200
    };
  },
  methods: {
    onSearch: function() {
      this.isAll = false;
      this.times = 0;
      this.loginLogList = [];
      this.getLoginLog();
    },
    formatNumber: function(num) {
      if (num < 10) {
        num = "0" + num;
      }
      return num;
    },
    dateToString: function(date) {
      let year = date.getFullYear();
      let month = this.formatNumber(date.getMonth() + 1);
      let day = this.formatNumber(date.getDate());
      let hour = this.formatNumber(date.getHours());
      let minute = this.formatNumber(date.getMinutes());
      let second = this.formatNumber(date.getSeconds());
      let dateString =
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second;
      return dateString;
    },
    getLoginLog: function() {
      let startTime = this.dateToString(this.dateTimeRange[0]);
      let stopTime = this.dateToString(this.dateTimeRange[1]);
      if (this.times == 0) {
        this.isSearching = true;
      }
      this.isLoading = true;
      yolanda.sendHttpRequest(
        {
          method: "GET",
          url:
            "/api/1/login-log?startTime=" +
            startTime +
            "&stopTime=" +
            stopTime +
            "&rows=" +
            this.onceRows +
            "&offset=" +
            this.times * this.onceRows
        },
        response => {
          this.isSearching = false;
          this.isLoading = false;
          if (yolanda.isResultTrue(response)) {
            if ("data" in response.data && response.data.data !== null) {
              for (let i = 0; i < response.data.data.length; i++) {
                this.loginLogList.push(
                  this.formatLoginLog(response.data.data[i])
                );
              }
              if (response.data.data.length < this.onceRows) {
                this.isAll = true;
              }
              this.times++;
            }
          }
        },
        "获取登录日志失败"
      );
    },
    formatLoginLog: function(log) {
      if (log.isLogin) {
        log.operate = "登录";
      } else {
        log.operate = "注销";
      }
      return log;
    }
  },
  created: function() {
    this.dateTimeRange[0].setHours(0, 0, 0);
    this.dateTimeRange[1].setHours(23, 59, 59);
  },
  mounted: function() {
    this.tableDom = this.$refs.table.bodyWrapper;
    if (this.tableDom !== null) {
      this.tableDom.addEventListener("scroll", () => {
        let scrollTop = this.tableDom.scrollTop;
        let windowHeight = this.tableDom.clientHeight;
        let scrollHeight = this.tableDom.scrollHeight;
        if (scrollTop + windowHeight === scrollHeight) {
          if (!this.isAll) {
            this.getLoginLog();
          }
        }
      });
    }
  }
};
</script>

<style scoped>
#search {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
}
#picker {
  margin: 0 10px;
}
</style>
