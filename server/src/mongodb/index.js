// mongoose数据库模块
const mongoose = require('mongoose')
const config = require('../utils/config.js')

mongoose.Promise = global.Promise;

// exports.mongoose = mongoose
// exports.connect
module.exports = () =>{
	// const mongoUrl = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`;
	const mongoUrl = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}:${config.mongodb.port}/${config.mongodb.database}`;
	//连接数据库
	// 新版mongodb连接数据库要加{ useNewUrlParser:true }
	mongoose.connect(mongoUrl, { useNewUrlParser: true })
	
	const db = mongoose.connection
	// 连接错误处理
	db.on('error',()=>{
		console.log('数据库连接出错！')
	})
	// 连接成功处理
	db.once('open',()=>{
		console.log('数据库连接成功！')
	})

	return mongoose
}
