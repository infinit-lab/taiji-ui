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
      <div id="select">
        <el-select v-model="processId" placeholder="请选择进程名" clearable>
          <el-option
            v-for="item in processOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
      <el-button type="primary" @click="onSearch" :loading="isSearching">
        搜索
      </el-button>
    </div>
    <el-row>
      <el-col :span="22" :offset="1">
        <el-table
          :data="operateLogList"
          :height="tableHeight"
          ref="table"
          v-loading="isLoading"
          stripe
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
            label="进程名"
            align="center"
            prop="processName"
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
import define from "../define";

export default {
  name: "OperateLogComponent",
  data() {
    return {
      dateTimeRange: [new Date(), new Date()],
      processId: "",
      processOptions: [],
      operateLogList: [],
      isSearching: false,
      tableDom: null,
      isAll: false,
      onceRows: 20,
      times: 0,
      isLoading: false,
      tableHeight: window.innerHeight - 200
    };
  },
  methods: {
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
    getOperateLog: function() {
      let startTime = this.dateToString(this.dateTimeRange[0]);
      let stopTime = this.dateToString(this.dateTimeRange[1]);
      let processId = this.processId;
      if (processId === "") {
        processId = "0";
      }
      if (this.times == 0) {
        this.isSearching = true;
      }
      this.isLoading = true;
      yolanda.sendHttpRequest(
        {
          method: "GET",
          url:
            "/api/1/operate-log?startTime=" +
            startTime +
            "&stopTime=" +
            stopTime +
            "&processId=" +
            processId +
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
                this.operateLogList.push(
                  this.formatOperateLog(response.data.data[i])
                );
              }
              if (response.data.data.length < this.onceRows) {
                this.isAll = true;
              }
              this.times++;
            }
          }
        },
        "获取操作日志失败"
      );
    },
    onSearch: function() {
      this.isAll = false;
      this.times = 0;
      this.operateLogList = [];
      this.getOperateLog();
    },
    formatOperateLog: function(log) {
      switch (log.operate) {
        case define.OperateStart:
          log.operate = "启动";
          break;
        case define.OperateStop:
          log.operate = "停止";
          break;
        case define.OperateRestart:
          log.operate = "重启";
          break;
        case define.OperateEnable:
          log.operate = "启用";
          break;
        case define.OperateDisable:
          log.operate = "禁用";
          break;
        case define.OperateUpdate:
          log.operate = "升级";
          break;
        case define.OperateConfig:
          log.operate = "配置";
          break;
        case define.OperateDownloadLog:
          log.operate = "下载日志";
          break;
        default:
          break;
      }
      return log;
    }
  },
  created: function() {
    this.dateTimeRange[0].setHours(0, 0, 0);
    this.dateTimeRange[1].setHours(23, 59, 59);

    yolanda.sendHttpRequest(
      {
        method: "GET",
        url: "/api/1/process"
      },
      response => {
        if (yolanda.isResultTrue(response)) {
          if ("data" in response.data) {
            this.processOptions = response.data.data;
          }
        }
      },
      "获取进程列表失败"
    );
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
            this.getOperateLog();
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
  margin-bottom: 10px;
}
#picker {
  margin: 0 10px;
}
#select {
  margin-right: 10px;
}
</style>
