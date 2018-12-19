<template>
  <div>
    <el-form class="search-filters-form" label-width="150px" :model="searchFilters" status-icon>
      <el-row type="flex" justify="left">
        <el-col :span="12">
          <el-form-item label="业务结算完成时间:">
            <el-date-picker style="width:100%" editable="editable" v-model="searchFilters.timeParam" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']" @change="startSearch">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row type="flex" justify="left">
        <el-col :span="6">
          <el-form-item label="液厂:">
            <el-select style="width:100%" v-model="searchFilters.fluid" :loading="getFuildLoading" filterable multiple clearable placeholder="请选择" @change="fluidChange">
              <el-option v-for="(item,key) in fluidList" :key="key" :label="item.fliud_name" :value="item.fliud_name"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="map-loading" v-loading="pageLoading"></div>
    <div class="map-title">业务单全国分布图</div>
    <div id="map-container"></div>
    <div id="echarts-container"></div>
    <div class="table-list">
      <el-table :data="waybillOfFluidData" style="width: 100%;" size="mini">
        <el-table-column prop="fluid_name" align="center" label="液厂名称" width="180">
        </el-table-column>
        <el-table-column label=" 100" align="center">
          <el-table-column prop="100.salsum" label="销售总额" align="center" width="120">
          </el-table-column>
          <el-table-column prop="100.waycount" label="总单数" align="center">
          </el-table-column>
          <el-table-column prop="100.stationcount" label="总站点数" align="center">
          </el-table-column>
        </el-table-column>
        <el-table-column label="150" align="center">
          <el-table-column prop="150.salsum" label="销售总额" align="center" width="120">
          </el-table-column>
          <el-table-column prop=" 150.waycount" label="总单数" align="center">
          </el-table-column>
          <el-table-column prop="150.stationcount" label="总站点数" align="center">
          </el-table-column>
        </el-table-column>
        <el-table-column label="200" align="center">
          <el-table-column prop="200.salsum" label="销售总额" align="center" width="120">
          </el-table-column>
          <el-table-column prop=" 200.waycount" label="总单数" align="center">
          </el-table-column>
          <el-table-column prop="200.stationcount" label="总站点数" align="center">
          </el-table-column>
        </el-table-column>
        <el-table-column label="250" align="center">
          <el-table-column prop="250.salsum" label="销售总额" align="center" width="120">
          </el-table-column>
          <el-table-column prop=" 250.waycount" label="总单数" align="center">
          </el-table-column>
          <el-table-column prop="250.stationcount" label="总站点数" align="center">
          </el-table-column>
        </el-table-column>
        <el-table-column label="300" align="center">
          <el-table-column prop="300.salsum" label="销售总额" align="center" width="120">
          </el-table-column>
          <el-table-column prop=" 300.waycount" label="总单数" align="center">
          </el-table-column>
          <el-table-column prop="300.stationcount" label="总站点数" align="center">
          </el-table-column>
        </el-table-column>
        <el-table-column label="350" align="center">
          <el-table-column prop="350.salsum" label="销售总额" align="center" width="120">
          </el-table-column>
          <el-table-column prop=" 350.waycount" label="总单数" align="center">
          </el-table-column>
          <el-table-column prop="350.stationcount" label="总站点数" align="center">
          </el-table-column>
        </el-table-column>
        <el-table-column label="400" align="center">
          <el-table-column prop="400.salsum" label="销售总额" align="center" width="120">
          </el-table-column>
          <el-table-column prop=" 400.waycount" label="总单数" align="center">
          </el-table-column>
          <el-table-column prop="400.stationcount" label="总站点数" align="center">
          </el-table-column>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
let lngIcon = require('@/assets/imgs/lng_2.png')
export default {
  name: 'mapAalasis',
  data() {
    return {
      resultData: [],
      fluidList: [],
      choosedFuildList: [],
      getFuildLoading: true,
      searchFilters: {
        timeParam: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
        companyName: '龙口胜通能源有限公司',
        fluid: '',
      },
      map: '',
      markerList: '',
      allMakers: '',
      cluster: '',
      echartsData: {
        data: [],
        selectedData: [],
        legendData: [],
      },
      circleList: [],
      textMarkerList: [],
      fluidMarkerList: [],
      totalSalsum: 0,
      totalCount: 0,
      pageLoading: false,
      fluidBillData: '',
      waybillOfFluidData: [],

    }
  },

  mounted() {

  },

  methods: {
    getOpt() {
      let subtextStr = `总销售额：${this.totalSalsum}元，总销售单数${this.totalCount}单`;
      let option = {
        title: {
          text: '贸易商销售总额占比图',
          subtext: subtextStr,
          subtextStyle: {
            color: '#333',
            fontSize: '14'
          },
          x: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        toolbox: {
          show: true,
          right: '20%',
          feature: {
            dataView: {
              readOnly: false
            },
            saveAsImage: {}
          }
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 50,
          top: 10,
          bottom: 20,
          data: this.echartsData.legendData,
          selected: this.echartsData.selectedData
        },
        series: [{
          name: '销售总额',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['40%', '50%'],
          data: this.echartsData.salsumData,
          legendHoverLink: true,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }, {
          name: '销售单数',
          type: 'pie',

          label: {
            normal: {
              show: false,
            },

          },
          labelLine: {
            normal: {
              show: false
            }
          },
          radius: ['0%', '30%'],
          center: ['40%', '50%'],
          legendHoverLink: true,
          data: this.echartsData.waycountData,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
      return option;
    },
    setOption() {
      let dom = document.getElementById('echarts-container');
      let resultDataCopy = [...this.resultData];
      let salsumData = [];
      let waycountData = [];
      let legendData = [];
      let selectedData = {};
      this.totalSalsum = 0;
      this.totalCount = 0;

      resultDataCopy.sort(this.compare("salsum"));

      resultDataCopy.map((item, index) => {

        waycountData.push({
          name: item.station_name,
          value: item.waycount
        });

        salsumData.push({
          name: item.station_name,
          value: item.salsum
        });

        legendData.push(item.station_name);

        selectedData[item.station_name] = index < 10;

        this.totalSalsum += item.salsum;
        this.totalCount += item.waycount;
      });

      this.totalSalsum = this.totalSalsum.toFixed(3);


      this.echartsData = {
        salsumData: salsumData,
        waycountData: waycountData,
        selectedData: selectedData,
        legendData: legendData,
      }
      let option = this.getOpt();
      this.myChart = this.$echarts.init(dom);
      this.myChart.setOption(option);
    },
    dateToStr: function(date) {
      let dateDetail = this.getDateDetail(date);
      let str = '';
      str = dateDetail.year + '-' + dateDetail.month + '-' + dateDetail.day + ' ' + dateDetail.hour + ':' + dateDetail.minute + ':' + dateDetail.second;
      return str;
    },
    getDateDetail(date) {
      if (date && date.getFullYear()) {
        let dateDetail = {};
        dateDetail.year = date.getFullYear();
        dateDetail.month = (date.getMonth() + 1) > 9 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1);
        dateDetail.day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
        dateDetail.hour = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
        dateDetail.minute = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
        dateDetail.second = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();

        return dateDetail;
      } else {
        return date;
      }

    },
    getdata() {
      let startTime = new Date(Date.parse(this.searchFilters.timeParam[0]));
      let startTimeStr = this.dateToStr(startTime);
      let endTime = new Date(Date.parse(this.searchFilters.timeParam[1]));
      let endTimeStr = this.dateToStr(endTime);
      this.pageLoading = true;
      return this.$$http("getMapData", {
        stime: startTimeStr,
        etime: endTimeStr,
        companyname: this.searchFilters.companyName
      }).then(results => {
        this.pageLoading = false;
        if (results.data.code == 0) {
          this.resultData = results.data.data;
        }
      }).catch(() => {
        this.pageLoading = false;
      });
    },
    initMarkList() {
      AMapUI.loadUI(['misc/MarkerList', 'overlay/SimpleMarker', 'overlay/SimpleInfoWindow', 'control/BasicControl'],
        (MarkerList, SimpleMarker, SimpleInfoWindow, BasicControl) => {

          this.map.addControl(new BasicControl.Zoom({
            position: 'lt', //left top，左上角
            showZoomNum: true //显示zoom值
          }));

          let $ = MarkerList.utils.$; //即jQuery/Zepto

          this.markerList = new MarkerList({

            map: this.map,

            //从数据中读取位置, 返回lngLat
            getPosition: (item) => {
              return [item.longti, item.laiti];
            },

            //数据ID，如果不提供，默认使用数组索引，即index
            getDataId: (item, index) => {
              return index;
            },

            getInfoWindow: (data, context, recycledInfoWindow) => {
              let infoTitleStr = '<div class="marker-info-window"><span class="fs-13">' + data.station_name + '</span>';
              let infoBodyStr = '<div class="fs-13 md-5">销售总额：' + data.salsum +
                '元</div><div class="fs-13 md-5">销售单数：' + data.waycount +
                '</div>'
              if (recycledInfoWindow) {
                recycledInfoWindow.setInfoTitle(infoTitleStr);
                recycledInfoWindow.setInfoBody(infoBodyStr);
                return recycledInfoWindow;
              } else {
                return new SimpleInfoWindow({
                  infoTitle: infoTitleStr,
                  infoBody: infoBodyStr,
                  offset: new AMap.Pixel(0, -37)
                });
              }
            },

            //构造marker用的options对象, content和title支持模板，也可以是函数，返回marker实例，或者返回options对象
            getMarker: (dataItem, context, recycledMarker) => {

              var iconTheme = 'default';
              //内置的样式
              var iconStyles = SimpleMarker.getBuiltInIconStyles(iconTheme);

              return new SimpleMarker({
                containerClassNames: 'my-marker',
                iconTheme: iconTheme,
                iconStyle: iconStyles[17],
                iconLabel: {
                  innerHTML: dataItem.waycount,
                  style: {
                    //颜色, #333, red等等，这里仅作示例，取iconStyle中首尾相对的颜色
                    color: '#fff'
                  }
                },
                label: {
                  content: dataItem.station_name,
                  offset: new AMap.Pixel(32, 15)
                }
              });

            },

            //marker上监听的事件
            markerEvents: ['click', 'mouseover', 'mouseout'],

            selectedClassNames: 'selected',

            autoSetFitView: false

          });

        });
    },

    renderMarker: function() {
      let renderCluster = () => {
        this.markerList.render(this.resultData);
        this.map.plugin(["AMap.MarkerClusterer"], () => {
          this.allMakers = this.markerList.getAllMarkers();
          if (this.cluster) {
            this.cluster.setMarkers(this.allMakers);
          } else {
            this.cluster = new AMap.MarkerClusterer(this.map, this.allMakers, {
              minClusterSize: 4,
              maxZoom: 17,
            });
          }

        });
      }
      if (this.markerList) {
        renderCluster();
      } else {
        setTimeout(() => {
          renderCluster();
        }, 1000)
      }
      this.map.setFitView(this.allMakers);
    },
    compare(propertyName) {
      return function(object1, object2) {
        var value1 = object1[propertyName];
        var value2 = object2[propertyName];
        if (value2 < value1) {
          return -1;
        } else if (value2 > value1) {
          return 1;
        } else {
          return 0;
        }
      }
    },
    startSearch() {
      this.getdata().then(result => {
        this.renderMarker();
        this.setOption();
      });
      if (this.searchFilters.fluid.length) {
        this.getWaybillOfFluid();
      }

    },
    initCircle() {

      //清除地图上的圆及相关公里展示
      this.circleList.length && this.map.remove([...this.circleList, ...this.textMarkerList, ...this.fluidMarkerList]);
      this.circleList = [];
      this.textMarkerList = [];
      this.fluidMarkerList = [];

      for (let i = 0, _length = this.choosedFuildList.length; i < _length; i++) {
        let radius = 100000;
        let strokeOpacity = 1;
        for (let j = 0; j < 7; j++) {
          if (j > 2) {
            strokeOpacity -= 0.2;
          }
          let circle = new AMap.Circle({
            center: [this.choosedFuildList[i].longtitude, this.choosedFuildList[i].latitude],
            radius: radius, //半径
            strokeColor: "#4A9BF8",
            strokeOpacity: 1,
            strokeWeight: 1.6,
            strokeOpacity: strokeOpacity,
            fillOpacity: 0,
            strokeDasharray: [10, 10],
            // 线样式还支持 'dashed'
            fillColor: '#4A9BF8',
            zIndex: 50
          })

          let circleCenterLngLat = new AMap.LngLat(this.choosedFuildList[i].longtitude, this.choosedFuildList[i].latitude);

          let textPosition = circleCenterLngLat.offset(Math.sqrt((radius * radius) / 2), Math.sqrt((radius * radius) / 2));
          let textPositionTwo = circleCenterLngLat.offset(0, radius);
          let text = '';
          if (this.choosedFuildList[i].bill) {
            text = `${this.choosedFuildList[i].bill[j].min}~${this.choosedFuildList[i].bill[j].max}`
          } else {
            text = '';
          }
          let textMarker = new AMap.Text({
            text: `${radius/1000}`,
            position: textPosition,
            angle: '45',
            style: {
              'font-size': '12px',
              'background-color': '#fff',
            }
          });

          let textMarkerTow = new AMap.Text({
            text: text,
            position: textPositionTwo,
            style: {
              'font-size': '12px',
              'background-color': '#fff',
            }
          });

          let icon = new AMap.Icon({
            size: new AMap.Size(20, 20), // 图标尺寸
            image: lngIcon, // Icon的图像
            imageSize: new AMap.Size(20, 20) // 根据所设置的大小拉伸或压缩图片
          });

          let fluidMaker = new AMap.Marker({
            position: [this.choosedFuildList[i].longtitude, this.choosedFuildList[i].latitude],
            icon: icon,
            offset: new AMap.Pixel(-10, -10),
          });

          let fluidLabel = new AMap.Text({
            text: this.choosedFuildList[i].fliud_name,
            position: [this.choosedFuildList[i].longtitude, this.choosedFuildList[i].latitude],
            style: {
              'font-size': '12px',
              'background-color': '#fff',
            },
            offset: new AMap.Pixel(0, 20),
          });

          radius += 50000;
          this.circleList.push(circle);
          this.textMarkerList.push(textMarker);
          this.textMarkerList.push(textMarkerTow);
          this.fluidMarkerList.push(fluidMaker);
          this.textMarkerList.push(fluidLabel);
        }

      }

      this.map.add([...this.circleList, ...this.textMarkerList, ...this.fluidMarkerList]);

    },
    getFluid() {
      return this.$$http("getFluid")
        .then(results => {
          this.getFuildLoading = false;
          if (results.data.code == 0) {
            this.fluidList = results.data.data;
          }
        })
        .catch(() => {
          this.getFuildLoading = false;
        });
    },
    getFluidBill() {
      return this.$$http("getFluidBill", {
          fluid_name: this.searchFilters.fluid
        })
        .then(results => {
          if (results.data.code == 0) {
            this.fluidBillData = results.data.data;
          }
        })
    },
    fluidChange() {

      this.getFluidBill().then(() => {
        this.choosedFuildList = [];
        this.searchFilters.fluid.map((item, index) => {
          this.fluidList.map((fluidItem, fluidIndex) => {
            if (item === fluidItem.fliud_name) {
              fluidItem.bill = this.fluidBillData[fluidItem.fliud_name] ? Object.values(this.fluidBillData[fluidItem.fliud_name]) : '';
              this.choosedFuildList.push(fluidItem);
            }
          })
        })
        console.log('this.choosedFuildList', this.choosedFuildList);
        this.initCircle();
      })

      this.getWaybillOfFluid();

    },

    getWaybillOfFluid() {
      let startTime = new Date(Date.parse(this.searchFilters.timeParam[0]));
      let startTimeStr = this.dateToStr(startTime);
      let endTime = new Date(Date.parse(this.searchFilters.timeParam[1]));
      let endTimeStr = this.dateToStr(endTime);
      return this.$$http("getWaybillOfFluid", {
          fluid_name: this.searchFilters.fluid,
          stime: startTimeStr,
          etime: endTimeStr,
          companyname: this.searchFilters.companyName
        })
        .then(results => {
          if (results.data.code == 0) {
            this.waybillOfFluidData = results.data.data;
          }
        })
    },

  },
  created() {
    let newDate = new Date();

  },
  mounted() {
    this.map = new AMap.Map('map-container', {
      zoom: 5
    });
    this.initMarkList();
    this.getFluid();
    this.getdata().then(result => {
      this.renderMarker();
      this.setOption();
      this.initCircle();
    });

  },
}

</script>
<style scoped>
.map-loading {
  position: absolute;
  height: 50px;
  width: 100%;
  left: 0;
  top: 160px;

  /deep/ .el-loading-mask {
    background-color: rgba(250, 250, 250, 0);
  }
}

.map-title {
  line-height: 50px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

#map-container {
  width: 100%;
  height: 1000px;
}

#echarts-container {
  width: 100%;
  padding-top: 20px;
  height: 1000px;
}

.fs-13 {
  font-size: 13px;
}

.md-5 {
  margin-bottom: 5px;
}


.table-list {
  min-height: 50px;

  border: 1px solid #e4e7ed;
  position: relative;
  margin: 0 20px 50px 20px;

  .adjust {
    margin-bottom: 10px;
    min-height: 18px;
    text-align: left;

    span {
      float: right;
      background: #4a9bf8;
      padding: 1px 6px;
      border-radius: 4px;
      color: #fff;
      line-height: 16px;
      font-size: 12px;
    }
  }

  .el-table--mini {
    th {
      padding: 10px 0;

      font-weight: 400;

      color: #303133;

      font-size: 14px;
    }

    td {
      .td-hover {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap
      }

      font-size: 12px;
    }
  }

  .el-table__header {
    th {
      background: #f2f5fe;
    }
  }
}

.page-list {
  margin: 20px 0 0 0;
}

.tabal-height-50 {
  height: 50px;
}

.tabal-height-500 {
  height: 500px;

  /deep/ .el-table__body-wrapper {
    height: 456px;
  }
}

</style>
