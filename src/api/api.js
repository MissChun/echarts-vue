const api = {
  getCarriesFuild: {
    url: '/freight/loadbase',
    method: 'get',
    desc: '获取承运商',
    param: {

    }
  },
  getdrawLineData: {
    url: '/freight/loadfreight',
    method: 'get',
    desc: '获取图表数据',
    param: {

    }
  },
  getMapData: {
    url: '/station_waybill/getswaybillinfo',
    method: 'get',
    desc: '获取站点订单分析数据',
    param: {

    }
  },
  getCompany: {
    url: '/station_waybill/loadcompany',
    method: 'get',
    desc: '默认加载所有有订单的贸易公司',
    param: {

    }
  },

}
export default api;
