<template>
  <div>
    <el-row>
      <el-col :span="6">
        进程概览
        <el-row>
          <el-col :span="6" :offset="6">
            <p>总数</p>
            <p>{{ total }}</p>
          </el-col>
          <el-col :span="6">
            <p>运行</p>
            <p>{{ running }}</p>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6" :offset="6">
            <p>禁用</p>
            <p>{{ disable }}</p>
          </el-col>
          <el-col :span="6">
            <p>停止</p>
            <p>{{ stopped }}</p>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="9">
        CPU状态
        <div id="cpuStatus" style="height: 300px;"></div>
      </el-col>
      <el-col :span="9">
        内存状态 ({{ memTotal }}GB)
        <div id="memStatus" style="height: 300px;"></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import yolanda from "yolanda-ui";
import echarts from "echarts";
import define from "../define";

export default {
  name: "HomeBoard",
  data() {
    return {
      total: 0,
      running: 0,
      stopped: 0,
      disable: 0,

      cpuStatus: null,

      memStatus: null,
      memTotal: 0,

      subscriber: null,
      cpuSubscriber: null,
      memSubscriber: null
    };
  },
  created: function() {
    this.updateStatistic();
    this.subscriber = yolanda.subscribe(define.KeyStatistic, (key, value) => {
      if ("data" in value) {
        this.total = value.data.total;
        this.running = value.data.running;
        this.stopped = value.data.stopped;
        this.disable = value.data.disable;
      }
    });
    this.cpuSubscriber = yolanda.subscribe(
      define.KeyCpuUseRate,
      (key, value) => {
        if ("data" in value) {
          let option = this.cpuStatus.getOption();
          option.series[0].data.shift();
          option.series[0].data.push(value.data);
          this.cpuStatus.setOption(option);
        }
      }
    );
    this.memSubscriber = yolanda.subscribe(
      define.KeyMemUseRate,
      (key, value) => {
        if ("data" in value) {
          let option = this.memStatus.getOption();
          option.series[0].data.shift();
          option.series[0].data.push(value.data.rate);
          this.memStatus.setOption(option);
          this.memTotal = value.data.total / 1024 / 1024 / 1024;
          this.memTotal = this.memTotal.toFixed(2);
        }
      }
    );
  },
  mounted: function() {
    this.initCpuStatus();
    this.initMemStatus();
  },
  beforeDestroy: function() {
    if (this.subscriber !== null) {
      yolanda.unsubscribe(define.KeyStatistic, this.subscriber);
      this.subscriber = null;
    }
    if (this.cpuSubscriber !== null) {
      yolanda.unsubscribe(define.KeyCpuUseRate, this.cpuSubscriber);
      this.cpuSubscriber = null;
    }
    if (this.memSubscriber !== null) {
      yolanda.unsubscribe(define.KeyMemUseRate, this.memSubscriber);
      this.memSubscriber = null;
    }
  },
  methods: {
    updateStatistic: function() {
      yolanda.sendHttpRequest(
        {
          method: "GET",
          url: "/api/1/process/statistic"
        },
        response => {
          if (yolanda.isResultTrue(response)) {
            if ("data" in response.data) {
              this.total = response.data.data.total;
              this.running = response.data.data.running;
              this.stopped = response.data.data.stopped;
              this.disable = response.data.data.disable;
            }
          }
        },
        "获取进程统计失败"
      );
    },
    initCpuStatus: function() {
      this.cpuStatus = echarts.init(document.getElementById("cpuStatus"));
      this.cpuStatus.setOption({
        title: {
          text: ""
        },
        tooltip: {},
        legend: {},
        xAxis: {
          data: ["", "", "", "", "", "", "", "", "", ""]
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100
        },
        series: [
          {
            name: "利用率",
            type: "line",
            itemStyle: {
              normal: {
                color: "#409eff"
              }
            },
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        ]
      });
    },
    initMemStatus: function() {
      this.memStatus = echarts.init(document.getElementById("memStatus"));
      this.memStatus.setOption({
        title: {
          text: ""
        },
        tooltip: {},
        legend: {},
        xAxis: {
          data: ["", "", "", "", "", "", "", "", "", ""]
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100
        },
        series: [
          {
            name: "利用率",
            type: "line",
            itemStyle: {
              normal: {
                color: "#409eff"
              }
            },
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        ]
      });
    },
    updateCpuStatus: function() {
      yolanda.sendHttpRequest(
        {
          method: "GET",
          url: "/api/1/performance/cpu"
        },
        response => {
          if (yolanda.isResultTrue(response)) {
            if ("data" in response.data) {
              let option = this.cpuStatus.getOption();
              option.series[0].data.shift();
              option.series[0].data.push(response.data.data);
              this.cpuStatus.setOption(option);
            }
          }
        },
        "获取CPU利用率失败"
      );
    },
    updateMemStatus: function() {
      yolanda.sendHttpRequest(
        {
          method: "GET",
          url: "/api/1/performance/mem"
        },
        response => {
          if (yolanda.isResultTrue(response)) {
            if ("data" in response.data) {
              let option = this.memStatus.getOption();
              option.series[0].data.shift();
              option.series[0].data.push(response.data.data.rate);
              this.memStatus.setOption(option);
              this.memTotal = response.data.data.total / 1024 / 1024 / 1024;
              this.memTotal = this.memTotal.toFixed(2);
            }
          }
        },
        "获取内存利用率失败"
      );
    }
  }
};
</script>
