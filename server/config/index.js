// 全局参数配置
let config = {
	admin: [{
		username: 'admin',
		password: '4371639',
		role: 1,
		desc: '超级管理员',
		avatar: 'upload/avatar/default.png'
	},{
		username: 'root',
		password: '4371639',
		role: 1,
		desc: '超级管理员',
		avatar: 'upload/avatar/default.png'
	},{
		username: 'cisco',
		password: '4371639',
		role: 2,
		desc: '管理员',
		avatar: 'upload/avatar/default.png'
	},{
		username: 'vqlai',
		password: '4371639',
		role: 3,
		desc: '普通用户',
		avatar: 'upload/avatar/default.png'
	}],
	jwt: {
		secret: 'sycho_vq&cisco-lai', //撒盐：加密的时候混淆
		expiresIn: '3600s' //以秒为单位，token到期时间 3600s
	},
	// 本地使用（连接本地mongodb）
	mongodb: {
		host: '127.0.0.1',
		database: 'sycho',
		port: 27017,
		user: '',
		password: ''
	},
	// 本地使用（连接centos远程mongodb）
	// mongodb: {
	// 	host: '193.112.77.76',  // 本地连接远程centos的mongodb用外网ip-193.112.77.76
	// 	database: 'sycho',
	// 	port: 26789,
	// 	user: 'root',
	// 	password: 'v901815Q'
	// },
	// 线上使用
	// mongodb: {
	// 	host: '127.0.0.1', // 线上连接centos的mongodb用127.0.0.1/172.16.0.11   本地用127.0.0.1
	// 	database: 'sycho',
	// 	port: 26789,
	// 	user: 'root',
	// 	password: 'v901815Q'
	// },
	app: {
		port: process.env.PORT || 3002, // server端口
		routerBaseApi: '/api' // 接口基础路径
	}
}

// 注意区分es6与commonJS导出模块的写法
module.exports = config