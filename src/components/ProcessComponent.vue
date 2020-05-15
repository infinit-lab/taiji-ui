<template>
  <div>
    <el-row>
      <el-col :span="20" :offset="2">
        <el-table :data="processList" stripe style="width: 100%">
          <el-table-column type="index" align="center"></el-table-column>
          <el-table-column
            prop="name"
            label="名称"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="pid"
            label="进程ID"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="runningTime"
            label="运行时间"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="status"
            label="运行状态"
            align="center"
          ></el-table-column>
          <el-table-column
            prop="updateStatus"
            label="升级状态"
            align="center"
          ></el-table-column>
          <el-table-column label="操作" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="text"
                v-show="isStartVisible(scope.$index)"
                @click="onStart(scope.$index)"
              >
                启动
              </el-button>
              <el-button
                type="text"
                v-show="isRestartVisible(scope.$index)"
                @click="onRestart(scope.$index)"
              >
                重启
              </el-button>
              <el-button
                type="text"
                v-show="isStopVisible(scope.$index)"
                @click="onStop(scope.$index)"
              >
                停止
              </el-button>
              <el-button
                type="text"
                v-show="isDisableVisible(scope.$index)"
                @click="onDisable(scope.$index)"
              >
                禁用
              </el-button>
              <el-button
                type="text"
                v-show="isEnableVisible(scope.$index)"
                @click="onEnable(scope.$index)"
              >
                启用
              </el-button>
              <el-button type="text" @click="onUpdate(scope.$index)">
                升级
              </el-button>
              <el-button
                type="text"
                @click="onConfig(scope.$index)"
                :loading="isLoadingConfig"
              >
                配置
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-dialog title="升级" :visible.sync="updateVisible" width="300px">
      <input type="file" id="updateFile" accept=".zip" />
      <span slot="footer">
        <el-button @click="updateVisible = false">取消</el-button>
        <el-button type="primary" @click="onUpdateFile" :loading="isUpdating">
          确定
        </el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="配置"
      :visible.sync="configVisible"
      width="30%"
      height="50%"
    >
      <el-input
        v-model="configContent"
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 15 }"
      ></el-input>
      <span slot="footer">
        <el-button @click="configVisible = false">取消</el-button>
        <el-button type="primary" @click="onConfigFile" :loading="isConfiging">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import yolanda from "yolanda-ui";
import define from "../define";
import { v4 } from "uuid";
import { Base64 } from "js-base64";

var status = {
  started: "运行",
  stopped: "停止",
  disable: "禁用"
};

export default {
  name: "Process",
  data() {
    return {
      processList: [],
      updateTimeInterval: 0,

      processSubscriber: null,

      updateVisible: false,
      updateIndex: -1,
      updateUuid: {},
      isUpdating: false,
      updateSubscriber: null,

      configVisible: false,
      configIndex: -1,
      isLoadingConfig: false,
      isConfiging: false,
      configContent: ""
    };
  },
  created: function() {
    console.log("Process component created");
    this.processSubscriber = yolanda.subscribe(
      define.KeyProcess,
      (key, value) => {
        this.handleNotification(key, value);
      }
    );
    this.updateSubscriber = yolanda.subscribe(
      define.KeyUpdate,
      (key, value) => {
        if ("data" in value) {
          let status = "";
          switch (value.data.status) {
            case define.UpdateUpdating:
              status =
                "升级中 " +
                value.data.current.toString() +
                "/" +
                value.data.total.toString();
              break;
            case define.UpdateSuccess:
              status = "升级成功";
              break;
            case define.UpdateFail:
              status = "升级失败";
              break;
          }
          let processId = this.updateUuid[value.id];
          for (let i = 0; i < this.processList.length; i++) {
            if (this.processList[i].id === processId) {
              this.processList[i].updateStatus = status;
              this.updateProcess(this.processList[i]);
              break;
            }
          }
        }
      }
    );
    this.initTable();
    this.updateTimeInterval = setInterval(() => {
      for (let i = 0; i < this.processList.length; i++) {
        this.updateRunningTime(this.processList[i]);
      }
    }, 1000);
  },
  beforeDestroy: function() {
    this.updateVisible = false;
    this.configVisible = false;
    console.log("Process component before destroy");
    if (this.processSubscriber !== null) {
      yolanda.unsubscribe(define.KeyProcess, this.processSubscriber);
      this.processSubscriber = null;
    }
    if (this.updateSubscriber !== null) {
      yolanda.unsubscribe(define.KeyUpdate, this.updateSubscriber);
      this.updateSubscriber = null;
    }
    if (this.updateTimeInterval > 0) {
      clearInterval(this.updateTimeInterval);
      this.updateTimeInterval = 0;
    }
  },
  methods: {
    initTable: function() {
      yolanda.sendHttpRequest(
        {
          method: "GET",
          url: "/api/1/process"
        },
        response => {
          if (yolanda.isResultTrue(response)) {
            if ("data" in response.data) {
              this.processList = response.data.data;
              for (let i = 0; i < this.processList.length; i++) {
                this.processList[i].updateStatus = "-";
                this.updateStatus(this.processList[i]);
              }
            }
          }
        },
        "获取进程列表失败"
      );
    },
    updateProcess: function(process) {
      for (let i = 0; i < this.processList.length; i++) {
        if (this.processList[i].id == process.id) {
          process.updateStatus = this.processList[i].updateStatus;
          this.processList.splice(i, 1, process);
          return;
        }
      }
    },
    updateStatus: function(process) {
      if (process.enable === true) {
        yolanda.sendHttpRequest(
          {
            method: "GET",
            url: "/api/1/process/" + process.id + "/status/started"
          },
          response => {
            if (yolanda.isResultTrue(response)) {
              if ("data" in response.data) {
                if (parseInt(response.data.data.value) === 1) {
                  process.status = status.started;
                  this.updateRunningTime(process);
                  return;
                }
              }
            }
            process.status = status.stopped;
            this.updateRunningTime(process);
          }
        );
      } else {
        process.status = status.disable;
        this.updateRunningTime(process);
      }
    },
    updateRunningTime: function(process) {
      if (process.status !== status.started) {
        process.runningTime = "-";
        this.updateProcess(process);
        return;
      }
      const startTime = new Date(process.startTime.replace(/-/g, "/"));
      const now = new Date();
      let runningTime = now - startTime;
      const millisecond = runningTime % 1000;
      let second = 0;
      runningTime = (runningTime - millisecond) / 1000;
      if (runningTime > 0) {
        second = runningTime % 60;
      }
      let minute = 0;
      runningTime = (runningTime - second) / 60;
      if (runningTime > 0) {
        minute = runningTime % 60;
      }
      let hour = 0;
      runningTime = (runningTime - minute) / 60;
      if (runningTime > 0) {
        hour = runningTime % 24;
      }
      let day = 0;
      day = (runningTime - hour) / 24;
      if (day < 0) {
        day = 0;
      }

      process.runningTime = "";
      if (day > 0) {
        process.runningTime += day.toString() + "天 ";
      }
      if (hour > 0) {
        process.runningTime += hour.toString() + "小时 ";
      }
      if (minute > 0) {
        process.runningTime += minute.toString() + "分钟 ";
      }
      if (second > 0) {
        process.runningTime += second.toString() + "秒";
      }
      if (process.runningTime === "") {
        process.runningTime = "-";
      }
      this.updateProcess(process);
    },
    isStartVisible: function(index) {
      if (index >= this.processList.length) {
        return false;
      }
      if (this.processList[index].enable === false) {
        return false;
      }
      if (this.processList[index].status === status.stopped) {
        return true;
      }
      return false;
    },
    isRestartVisible: function(index) {
      if (index >= this.processList.length) {
        return false;
      }
      if (this.processList[index].enable === false) {
        return false;
      }
      if (this.processList[index].status === status.started) {
        return true;
      }
      return false;
    },
    isStopVisible: function(index) {
      if (index >= this.processList.length) {
        return false;
      }
      if (this.processList[index].enable === false) {
        return false;
      }
      if (this.processList[index].status === status.started) {
        return true;
      }
      return false;
    },
    isDisableVisible: function(index) {
      if (index >= this.processList.length) {
        return false;
      }
      if (this.processList[index].enable === true) {
        return true;
      }
      return false;
    },
    isEnableVisible: function(index) {
      if (index >= this.processList.length) {
        return false;
      }
      if (this.processList[index].enable === false) {
        return true;
      }
      return false;
    },
    operate: function(index, operation, error) {
      if (index >= this.processList.length) {
        return;
      }
      const process = this.processList[index];
      yolanda.sendHttpRequest(
        {
          method: "PUT",
          url: "/api/1/process/" + process.id + "/operation",
          data: {
            operation: operation
          }
        },
        null,
        error
      );
    },
    onStart: function(index) {
      this.operate(index, "start", "启动进程失败");
    },
    onStop: function(index) {
      this.operate(index, "stop", "停止进程失败");
    },
    onRestart: function(index) {
      this.operate(index, "restart", "重启进程失败");
    },
    onDisable: function(index) {
      this.operate(index, "disable", "禁用进程失败");
    },
    onEnable: function(index) {
      this.operate(index, "enable", "启用进程失败");
    },
    handleNotification: function(key, value) {
      if ("id" in value) {
        yolanda.sendHttpRequest(
          {
            method: "GET",
            url: "/api/1/process/" + value.id
          },
          response => {
            if (yolanda.isResultTrue(response)) {
              if ("data" in response.data) {
                this.updateStatus(response.data.data);
              }
            }
          },
          "获取进程失败"
        );
      }
    },
    onUpdate: function(index) {
      document.getElementById("updateFile").value = "";
      this.updateVisible = true;
      this.updateIndex = index;
    },
    onUpdateFile: function() {
      let file = document.getElementById("updateFile").files[0];
      if (file === null) {
        this.updateIndex = -1;
        this.$message.error("打开文件失败");
        return;
      }
      if (
        this.updateIndex === -1 ||
        this.updateIndex >= this.processList.length
      ) {
        this.updateIndex = -1;
        this.$message.error("非法序号");
        return;
      }
      let process = this.processList[this.updateIndex];
      this.updateIndex = -1;
      let updateUuid = v4();
      let reader = new FileReader();
      reader.onloadend = () => {
        this.isUpdating = true;
        yolanda.sendHttpRequest(
          {
            method: "PUT",
            url: "/api/1/process/" + process.id + "/update-file/" + updateUuid,
            data: reader.result,
            headers: {
              "Content-Type": file.type,
              "Content-Size": file.size,
              "File-Name": file.name
            }
          },
          response => {
            this.isUpdating = false;
            if (yolanda.isResultTrue(response)) {
              this.updateUuid[updateUuid] = process.id;
              this.updateVisible = false;
            }
          },
          "上传更新文件失败"
        );
      };
      reader.readAsArrayBuffer(file);
    },
    onConfig: function(index) {
      if (index >= this.processList.length) {
        return;
      }
      let process = this.processList[index];
      this.isLoadingConfig = true;
      yolanda.sendHttpRequest(
        {
          method: "GET",
          url: "/api/1/process/" + process.id + "/config-file"
        },
        response => {
          this.isLoadingConfig = false;
          if (yolanda.isResultTrue(response)) {
            if ("data" in response.data) {
              this.configContent = Base64.decode(response.data.data);
              this.configIndex = process.id;
              this.configVisible = true;
            }
          }
        },
        "获取配置文件失败"
      );
    },
    onConfigFile: function() {
      this.isConfiging = true;
      yolanda.sendHttpRequest(
        {
          method: "PUT",
          url: "/api/1/process/" + this.configIndex + "/config-file",
          data: {
            content: Base64.encode(this.configContent)
          }
        },
        response => {
          this.isConfiging = false;
          if (yolanda.isResultTrue(response)) {
            this.configContent = "";
            this.configVisible = false;
            this.configIndex = -1;
          }
        },
        "更新配置文件失败"
      );
    }
  }
};
</script>
