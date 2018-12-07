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
    </el-form>
    <div class="map-loading" v-loading="pageLoading"></div>
    <div class="map-title">业务单全国分布图</div>
    <div id="map-container"></div>
    <div id="echarts-container"></div>
  </div>
</template>
<script>
require('echarts-amap')
export default {
  name: 'HelloWorld',
  data() {
    return {
      resultData: [],
      searchFilters: {
        timeParam: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
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
      pageLoading: false,

    }
  },

  mounted() {

  },

  methods: {
    getOpt() {
      let option = {
        title: {
          text: '销售总额占比图',
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
      resultDataCopy.sort(this.compare("salsum"));
      let salsumData = resultDataCopy.map(item => {
        return {
          name: item.station_name,
          value: item.salsum
        }
      });
      let waycountData = resultDataCopy.map(item => {
        return {
          name: item.station_name,
          value: item.waycount
        }
      });
      let legendData = resultDataCopy.map(item => item.station_name);

      let selectedData = {};

      resultDataCopy.map((item, index) => {
        selectedData[item.station_name] = index < 10
      })

      console.log('selectedData', selectedData);
      this.echartsData = {
        salsumData: salsumData,
        waycountData: waycountData,
        selectedData: selectedData,
        legendData: legendData,
      }
      let option = this.getOpt();
      this.myChart = this.$echarts.init(dom);
      this.myChart.setOption(option);

      /*this.myChart.on('mouseover', 'series.pie', (params) => {
        if (params.seriesIndex === 0) {
          this.myChart.dispatchAction({
            type: 'pieSelect',
            // 可选，系列 index，可以是一个数组指定多个系列
            seriesIndex: 1,
            // 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
            dataIndex: params.dataIndex,
          })
        } else {
          this.myChart.dispatchAction({
            type: 'pieSelect',
            // 可选，系列 index，可以是一个数组指定多个系列
            seriesIndex: 0,
            // 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
            dataIndex: params.dataIndex,
          })
        }
      });

      this.myChart.on('mouseout', 'series.pie', (params) => {
        if (params.seriesIndex === 0) {
          this.myChart.dispatchAction({
            type: 'pieUnSelect',
            // 可选，系列 index，可以是一个数组指定多个系列
            seriesIndex: 1,
            // 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
            dataIndex: params.dataIndex,
          })
        } else {
          this.myChart.dispatchAction({
            type: 'pieUnSelect',
            // 可选，系列 index，可以是一个数组指定多个系列
            seriesIndex: 0,
            // 数据的 index，如果不指定也可以通过 name 属性根据名称指定数据
            dataIndex: params.dataIndex,
          })
        }
      });*/



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
      }).then(results => {
        this.pageLoading = false;
        if (results.data.code == 0) {
          this.resultData = results.data.data;
          console.log('this.resultData', this.resultData);
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
    }

  },
  created() {
    let newDate = new Date();

  },
  mounted() {
    this.map = new AMap.Map('map-container', {
      zoom: 5
    });
    this.initMarkList();
    this.getdata().then(result => {
      this.renderMarker();

      this.setOption();
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

</style>
