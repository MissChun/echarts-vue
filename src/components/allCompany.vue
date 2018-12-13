<!-- 相关产品需求文档在https://www.tapd.cn/39093645/prong/stories/view/1139093645001001091@ -->
<template>
  <div>
    <el-form class="search-filters-form" label-width="150px" :model="searchFilters" status-icon>
      <el-row type="flex" justify="left">
        <el-col :span="6">
          <el-form-item label="贸易商:">
            <el-select style="width:100%" v-model="searchFilters.companyName" clearable placeholder="请选择" @change="startSearch">
              <el-option v-for="(item,key) in companyList" :key="key" :label="item.company" :value="item.company"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务结算完成时间:">
            <el-date-picker style="width:100%" editable="editable" v-model="searchFilters.timeParam" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']" @change="startSearch">
            </el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item label="承运商:">
            <el-select style="width:100%" v-model="searchFilters.carrier" clearable placeholder="请选择" @change="searchCarrierOrder">
              <el-option v-for="(item,key) in carrierList" :key="key" :label="item.coocompany" :value="item.coocompany"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务结算完成时间:">
            <el-date-picker style="width:100%" editable="editable" v-model="searchFilters.carrierTimeParam" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['00:00:00', '23:59:59']" @change="searchCarrierOrder">
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
    <div id="carrier-echarts-container"></div>
  </div>
</template>
<script>
let lngIcon = require('@/assets/imgs/lng_2.png')
export default {
  name: 'allCompany',
  data() {
    return {
      searchFilters: {
        timeParam: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
        carrierTimeParam: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
        companyName: '',
        fluid: '',
        carrier: '',
      },
      resultData: [], //业务单数据
      carrierOrderList: [],
      fluidList: [], //液场列表数据
      companyList: [], //公司列表
      choosedFuildList: [],
      fluidBillData: '',
      carrierList: [],
      pageLoading: false,
      getFuildLoading: true,
      /*echarts相关*/
      tradeChart: '',
      tradeEchartsData: { //echart相关数据
        data: [],
        selectedData: [],
        legendData: [],
      },
      totalSalsum: 0, //总销售额
      totalCount: 0, //总销售单数

      carrierChart: '',
      carrierEchartsData: {
        data: [],
        selectedData: [],
        legendData: [],
      },
      totalSumweight: 0, //总承运量
      carrierTotalCount: 0, //总销售单数

      /*地图相关实例*/
      map: '', //地图实例
      tradeMarkerList: '', //业务单分布站点marker实例列表
      carrierMarkerList: '',
      markerList: '',
      allMakers: '', //获取的所有marker
      cluster: '', //点聚合实例
      circleList: [], //液厂同心圆实例列表
      textMarkerList: [], //textmarker列表，用于标注圆半径公里
      fluidMarkerList: [], //所选液场marker列表
    }
  },
  mounted() {

  },
  methods: {
    init() {
      this.map = new AMap.Map('map-container', {
        zoom: 5
      });
      this.initMarkList();
      this.getData();
      this.getCompany();
      this.getFluid();
      this.getCarrierList();
    },

    getData() {
      let p1 = this.getTradeOrder();
      let p2 = this.getCarrierOrder();
      this.pageLoading = true;
      Promise.all([p1, p2]).then(() => {
        this.pageLoading = false;
        this.renderMarker();
        this.setTradeOption();
        this.setCarrierOption();
        this.initCircle();
      }).catch(() => {
        this.pageLoading = false;
      })
    },

    getTradeOpt() {
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
          data: this.tradeEchartsData.legendData,
          selected: this.tradeEchartsData.selectedData
        },
        series: [{
          name: '销售总额',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['40%', '50%'],
          data: this.tradeEchartsData.salsumData,
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
          data: this.tradeEchartsData.waycountData,
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
    setTradeOption() {
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

      this.tradeEchartsData = {
        salsumData: salsumData,
        waycountData: waycountData,
        selectedData: selectedData,
        legendData: legendData,
      }

      let option = this.getTradeOpt();
      this.tradeChart = this.$echarts.init(dom);
      this.tradeChart.setOption(option);
    },
    getCarrierOpt() {
      let subtextStr = `总承运量：${this.totalSumweight}吨，总承运单数${this.carrierTotalCount}单`;
      let option = {
        title: {
          text: '承运商承运总量占比图',
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
          data: this.carrierEchartsData.legendData,
          selected: this.carrierEchartsData.selectedData
        },
        series: [{
          name: '承运总量',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['40%', '50%'],
          data: this.carrierEchartsData.salsumData,
          legendHoverLink: true,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }, {
          name: '承运单数',
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
          data: this.carrierEchartsData.waycountData,
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
    setCarrierOption() {
      let dom = document.getElementById('carrier-echarts-container');
      let resultDataCopy = [...this.carrierOrderList];
      let salsumData = [];
      let waycountData = [];
      let legendData = [];
      let selectedData = {};
      this.totalSumweight = 0;
      this.carrierTotalCount = 0;

      resultDataCopy.sort(this.compare("sumweight"));

      resultDataCopy.map((item, index) => {

        waycountData.push({
          name: item.station_name,
          value: item.waycount
        });

        salsumData.push({
          name: item.station_name,
          value: item.sumweight
        });

        legendData.push(item.station_name);

        selectedData[item.station_name] = index < 10;

        this.totalSumweight += item.sumweight;
        this.carrierTotalCount += item.waycount;

      });

      this.totalSumweight = this.totalSumweight.toFixed(3);

      this.carrierEchartsData = {
        salsumData: salsumData,
        waycountData: waycountData,
        selectedData: selectedData,
        legendData: legendData,
      }

      let option = this.getCarrierOpt();
      this.carrierChart = this.$echarts.init(dom);
      this.carrierChart.setOption(option);
    },
    dateToStr(date) {
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
    getTradeOrder() {
      let startTime = new Date(Date.parse(this.searchFilters.timeParam[0]));
      let startTimeStr = this.dateToStr(startTime);
      let endTime = new Date(Date.parse(this.searchFilters.timeParam[1]));
      let endTimeStr = this.dateToStr(endTime);

      return this.$$http("getMapData", {
          stime: startTimeStr,
          etime: endTimeStr,
          companyname: this.searchFilters.companyName
        })
        .then(results => {
          if (results.data.code == 0) {
            this.resultData = results.data.data;
          }
        })
    },

    initMarkList() {
      AMapUI.loadUI(['misc/MarkerList', 'overlay/SimpleMarker', 'overlay/SimpleInfoWindow', 'control/BasicControl'],
        (MarkerList, SimpleMarker, SimpleInfoWindow, BasicControl) => {

          this.map.addControl(new BasicControl.Zoom({
            position: 'lt', //left top，左上角
            showZoomNum: true //显示zoom值
          }));

          //内置的样式
          var iconStyles = SimpleMarker.getBuiltInIconStyles('default');

          console.log('iconStyles', iconStyles);

          const initMarkListFun = (tradeMarkerList) => {

            let longtitude = tradeMarkerList ? 'longti' : 'longtitude';
            let latitude = tradeMarkerList ? 'laiti' : 'latitude';
            let salsum = tradeMarkerList ? 'salsum' : 'sumweight';
            let offset = tradeMarkerList ? new AMap.Pixel(-15, -20) : new AMap.Pixel(-15, 20);
            console.log('offset', offset);
            let iconStyle = tradeMarkerList ? {
              src: require('../assets/imgs/red.png'),
              style: {
                width: '29px',
                height: '40px',
              }
            } : {
              src: require('../assets/imgs/green.png'),
              style: {
                width: '29px',
                height: '40px',

                transform: 'rotate(180deg)'
              }
            }
            //写到这里
            return new MarkerList({

              map: this.map,

              //从数据中读取位置, 返回lngLat
              getPosition: (item) => {
                return [item[longtitude], item[latitude]];
              },

              //数据ID，如果不提供，默认使用数组索引，即index
              getDataId: (item, index) => {
                return index;
              },

              getInfoWindow: (data, context, recycledInfoWindow) => {
                let infoTitleStr = '<div class="marker-info-window"><span class="fs-13">' + data.station_name + '</span>';
                let infoBodyStr = '';
                if (tradeMarkerList) {
                  infoBodyStr = '<div class="fs-13 md-5">销售总额：' + data[salsum] +
                    '元</div><div class="fs-13 md-5">销售单数：' + data.waycount +
                    '</div>';
                } else {
                  infoBodyStr = '<div class="fs-13 md-5">承运总量：' + data[salsum] +
                    '吨</div><div class="fs-13 md-5">承运单数：' + data.waycount +
                    '</div>';
                }
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
                  offset: offset,
                  iconStyle: iconStyle,
                  iconLabel: {
                    innerHTML: '<span style="line-height:38px">' + dataItem.waycount + '</span>',
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
          }

          this.tradeMarkerList = initMarkListFun('tradeMarkerList');
          this.carrierMarkerList = initMarkListFun();

        });
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
            text: `${ radius / 1000 }`,
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
    renderMarker: function() {
      let renderCluster = () => {
        this.carrierMarkerList.render(this.carrierOrderList);
        this.tradeMarkerList.render(this.resultData);

        this.map.plugin(["AMap.MarkerClusterer"], () => {
          this.allMakers = [...this.tradeMarkerList.getAllMarkers(), ...this.carrierMarkerList.getAllMarkers()];
          console.log('this.allMakers', this.allMakers);
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
      if (this.tradeMarkerList) {
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
    getCompany() {
      return this.$$http("getCompany").then(results => {
        if (results.data.code == 0) {
          this.companyList = results.data.data;
        }
      });
    },
    startSearch() {
      this.pageLoading = true;
      this.getTradeOrder().then(result => {
        this.pageLoading = false;
        this.renderMarker();
        this.setTradeOption();
      });
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
    },
    getCarrierList() {
      return this.$$http("getCarrierList").then(results => {
        if (results.data.code == 0) {
          this.carrierList = results.data.data;
        }
      });
    },
    getCarrierOrder() {
      let startTime = new Date(Date.parse(this.searchFilters.carrierTimeParam[0]));
      let startTimeStr = this.dateToStr(startTime);
      let endTime = new Date(Date.parse(this.searchFilters.carrierTimeParam[1]));
      let endTimeStr = this.dateToStr(endTime);
      return this.$$http("getCarrierOrder", {
          stime: startTimeStr,
          etime: endTimeStr,
          carrier_name: this.searchFilters.carrier
        })
        .then(results => {
          if (results.data.code == 0) {
            this.carrierOrderList = results.data.data;
          }
        })
    },
    searchCarrierOrder() {
      this.pageLoading = true;
      this.getCarrierOrder().then(result => {
        this.pageLoading = false;
        this.renderMarker();
        this.setCarrierOption();
      });
    }
  },
  created() {


  },
  mounted() {
    this.init();
  },
}

</script>
<style scoped>
.map-loading {
  position: absolute;
  height: 50px;
  width: 100%;
  left: 0;
  top: 290px;

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
  height: 800px;
}

#carrier-echarts-container {
  width: 100%;
  padding-top: 20px;
  height: 800px;
}



.fs-13 {
  font-size: 13px;
}

.md-5 {
  margin-bottom: 5px;
}

</style>
