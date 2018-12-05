const api = {
	getCarriesFuild:{
	    url: '/freight/loadbase',
	    method: 'get',
	    desc: '获取承运商',
	    param: {

	    }
  	},
  	getdrawLineData:{
  		url: '/freight/loadfreight',
	    method: 'get',
	    desc: '获取图表数据',
	    param: {

	    }
  	}
}
export default api;