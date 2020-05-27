var define = {
  KeyToken: 1,
  KeyPassword: 2,
  KeyCpuUseRate: 3,
  KeyMemUseRate: 4,
  KeyProcess: 5,
  KeyProcessStatus: 7,
  KeyStatistic: 8,
  KeyUpdate: 9,

  StatusCreated: 1,
  StatusUpdated: 2,
  StatusDeleted: 3,

  UpdateUpdating: 1,
  UpdateSuccess: 2,
  UpdateFail: 3,

  OperateStart: "start",
  OperateStop: "stop",
  OperateRestart: "restart",
  OperateEnable: "enable",
  OperateDisable: "disable",
  OperateConfig: "config",
  OperateUpdate: "update",
  OperateDownloadLog: "download_log",
  OperateConfigNet: "config_net"
};

export default define;
