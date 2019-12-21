/**
 * Created by laiweiqang on 2019/04/26
 */
// 用户控制器
const User = require('../model/user.js')
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const { handleSuccess, handleError } = require('../utils/handle')
const { CustomError, HttpError } = require('../utils/customError.js')
const fs = require('fs')

// 返回数据格式
// { msg: '', success: boolean, data: {} }
// 注意ctx.success在条件分支语句中需要加return不然继续往下执行
// 注意ctx.response.body可以简写为ctx.body但ctx.request.body不可以简写
// ctx.query获取GET请求url参数，ctx.params获取POST请求url参数,ctx.request.body获取请求体参数
// 获取参数，get通过ctx.query;post通过ctx.request.body
class userController{
	// 用户登录
	static async login(ctx){
		// 获取参数，get通过ctx.query;post通过ctx.request.body
		const {username, password} = ctx.request.body
		if(!username){
			throw new CustomError(500, '用户名不能为空')
			// 需返回false，否则会往下执行
			return false
		}
		if(!password){
			throw new CustomError(500, '密码不能为空')
			return false
		}
		let result = await User.findOne({username}).exec().catch(err => {
			throw new CustomError(500, '服务器内部错误')
			return false
		})
		if(result){
			if(result.password === md5(password)){
				// 创建token
				let privateKey = config.jwt.secret // secret //撒盐：加密的时候混淆
				let expiresIn = config.jwt.expiresIn // 3600s //token到期时间
				// jwt.sign(payload, secretOrPrivateKey, [options, callback])
				// 负载 payload 定义一些需要使用的信息：客户端ID、JWT创建的时间、用户ID，负载中不需要传输敏感信息如密码、密钥等，JWT内容通过HTTP传输不安全。
				// options: algorithm (default: HS256) 
				// expiresIn: expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
				// {expiresIn} === {expiresIn: config.jwt.expiresIn} 使用es6对象解构赋值
				// 生成的token在node内存里，token过期jsonwebtoken插件会自动删除
				let token = jwt.sign({id: result._id}, privateKey, {expiresIn})

				handleSuccess({ ctx, msg: '登录成功', data: { token } })
			}else{
				handleError({ ctx, msg: '密码错误' })
			}
		}else{
			handleError({ ctx, msg: '用户名不存在' })
		}
	}

 	// 获取用户登录信息（头像/名称/角色/介绍等）
	static async getUserInfo(ctx){
		let token = ctx.header.authorization.split(' ')[1]
		let decoded = jwt.verify(token, config.jwt.secret)
		let result = await User.findOne({ _id: decoded.id  }).exec().catch(err => {
			throw new CustomError(500, '服务器内部错误')
			return false
		})
		if(result){
			handleSuccess({ ctx, msg: '获取用户信息成功！',
				data: { username: result.username, role: result.role, desc: result.desc,avatar: result.avatar}
			})
		} else {
			handleError({ ctx, msg: '获取用户信息失败！' })
		}
	}

	// 根据搜索条件获取用户，默认获取用户列表
	static async getUser(ctx){
		let { currentPage = 1, pageSize = 10, keyword = '', role = '' } = ctx.query
		// 过滤条件
		const options = {
			sort: { createDate: -1 }, // 按时间倒序
			page: Number(currentPage), // 当前页
			limit: Number(pageSize), // 每页数
			select: '-password' // 过滤密码
		}

		// 查询参数
		const querys = { username: new RegExp(keyword) }

		// 审核状态查询
		if (['1', '2', '3'].includes(role)) { querys.role = Number(role) }
		// 查询
		const result = await User
			.paginate(querys, options)
			.catch(err => {
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		if (result) {
			handleSuccess({
				ctx, msg: '列表数据获取成功', data: {
					pagination: {
						currentPage: result.page, // 当前页
						totalPage: result.pages, // 总页数
						pageSize: result.limit, // 分页大小
						total: result.total, // 总条数
					},
					list: result.docs
				}
			})
		} else {
			handleError({ ctx, msg: '获取列表数据失败' })
		}
	}


	// 新增用户&图片上传 （注意：接口需要有返回，否则响应404）
	static async postUser(ctx){
		// ctx.req是使用multer上传插件封装的请求参数
		const { username, curPwd, surePwd, role, desc } = ctx.req.body //请求参数放在请求体
		const file = ctx.req.file
		if (!curPwd){
			if(file) fs.unlinkSync(file.path)
			throw new CustomError(500, '密码不能为空')
			return false
		}
		if (curPwd != surePwd) {
			if (file) fs.unlinkSync(file.path) // 验证失败删除已上传的头像
			throw new CustomError(500, '两次密码输入不一致')
			return false
		}
		// // 查询新增用户名是否已存在
		let oneUser = await User
			.findOne({ 'username': username })
			.exec() // 执行sql语句
			.catch(err => {
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		if(oneUser){
			if(file) fs.unlinkSync(file.path)
			handleError({ ctx, msg: '用户名已存在！' })
		} else {
			const result = await new User({
				username,
				password: md5(curPwd),
				role: parseInt(role),
				desc: desc,
				avatar: file ? `upload/avatar/${file.filename}` : 'upload/avatar/default.png',
			}).save()
				.catch(err => {
					if (file) fs.unlinkSync(file.path)
					throw new CustomError(500, '服务器内部错误')
					return false
				})
			if (result) handleSuccess({ ctx, msg: '新增链接成功', data: result })
			else handleError({ ctx, msg: '新增链接失败' })
		}
	}

	// 编辑用户&修改图片
	static async putUser(ctx){
		const _id = ctx.params.id
		// const { username, role, desc, prePwd, newPwd, surePwd } = ctx.req.body
		const { prePwd, newPwd, surePwd } = ctx.req.body
		const file = ctx.req.file

		// 去除不更新的字段
		delete ctx.req.body.prePwd
		delete ctx.req.body.newPwd
		delete ctx.req.body.surePwd
		if (!_id) {
			throw new CustomError(500, '无效参数')
			return false
		}
		let oneUser = await User
			.findOne({ '_id': _id })
			.exec() // 执行sql语句
			.catch(err => {
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		if (prePwd || newPwd || surePwd){
			if (!prePwd) {
				if (file) fs.unlinkSync(file.path)
				throw new CustomError(500, '原始密码不能为空')
				return false
			}
			if (!newPwd) {
				if (file) fs.unlinkSync(file.path)
				throw new CustomError(500, '新密码不能为空')
				return false
			}
			if (!surePwd) {
				if (file) fs.unlinkSync(file.path)
				throw new CustomError(500, '确认密码不能为空')
				return false
			}
			if (oneUser.password != md5(prePwd)) {
				if (file) fs.unlinkSync(file.path) // 验证失败删除已上传的头像
				throw new CustomError(500, '原始密码输入有误！')
				return false
			}
			if (newPwd == prePwd) {
				if (file) fs.unlinkSync(file.path)
				throw new CustomError(500, '新密码不能与原始密码相同')
				return false
			}
			if (newPwd != surePwd) {
				if (file) fs.unlinkSync(file.path) // 验证失败删除已上传的头像
				throw new CustomError(500, '新密码两次输入不一致！')
				return false
			}
			ctx.req.body.password = md5(newPwd)
		}
		ctx.req.body.avatar = file ? `upload/avatar/${file.filename}` : oneUser.avatar
		const result = await User
			.findByIdAndUpdate(_id, ctx.req.body , { new: true }) // new: true ？？？
			.catch(err => {
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		if (result) {
			// 有新图片上传 更新完毕后将老图删除
			// 要过滤掉默认图片，不然会被删除
			if (file && !oneUser.avatar.includes('default.png')) {
				// 先读取头像看是否存在,确保头像不存在的去删除的异常
				fs.readFile(`src/static/${oneUser.avatar}`, (err, data)=>{
					// 读取文件失败/错误
					if (err) {
						throw new CustomError(500, '读取文件失败')
						return false
					} else {
						// 读取文件成功
						fs.unlinkSync(`src/static/${oneUser.avatar}`)
					}
				})
			}
			handleSuccess({ ctx, msg: '修改数据成功', data: result })
		} else handleError({ ctx, msg: '修改数据失败' })
	}

	// 删除用户&删除图片
	static async deleteUser(ctx) {
		const _id = ctx.params.id
		if (!_id) {
			throw new CustomError(500, '无效参数')
			return false
		}
		const result = await User
			.findByIdAndRemove(_id)
			.catch(err => {
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		if (result) {
			// fs.unlinkSync(`./src/static/${result.avatar}`) // 删除头像
			// 默认头像不删除
			if (result.avatar && !result.avatar.includes('default.png')){
				// 先读取头像看是否存在
				fs.readFile(`src/static/${result.avatar}`, (err, data) => {
					// 读取文件失败/错误
					if (err) {
						throw new CustomError(500, '读取文件失败')
						return false
					}else{
						// 读取文件成功
						fs.unlinkSync(`src/static/${result.avatar}`)
					}
				})
			}
			handleSuccess({ ctx, msg: '删除成功', data: result })
		} else handleError({ ctx, msg: '删除失败' })
	}

	// 用户退出 （前端直接退，无需后台退出）
	static async logout(ctx) {
		const { token } = ctx.request.body
	}

	// 添加用户（废弃）
	static async addUser(ctx) {
		//es6对象解构赋值
		const { username, password, auth } = ctx.request.body //请求参数放在请求体
		if (!username) {
			handleError({ ctx, msg: '用户名不能为空！' })
			return false
		}
		if (!password) {
			handleError({ ctx, msg: '密码不能为空！' })
			return false
		}
		if (!auth) {
			handleError({ ctx, msg: '权限没有分配！' })
			return false
		}
		let hasOneUser = await User
			.findOne({ 'username': username })
			.exec() // 执行sql语句
			.catch(err => {
				ctx.throw(500, '服务器内部错误-findOneUser错误！')
			})
		if (hasOneUser === null) {
			const user = new User({
				username,
				password: md5(password),
				auth: parseInt(auth),
				// createTime: new Date()
			})
			let result = await user.save().catch((err) => {
				ctx.throw(500, '服务器内部错误-addUser错误！')
			})
			handleSuccess({
				ctx, msg: '新增成功！',
				data: result
			})
		} else {
			handleError({ ctx, msg: '用户名已存在！' })
		}
	}
}

// 注意区分es6与commonJS导入导出模块的写法
 module.exports = userController