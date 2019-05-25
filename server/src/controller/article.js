/**
 * Created by laiweiqang on 2019/04/26
 */
// 文章控制器
const Article = require('../model/article.js')
const { handleSuccess, handleError } = require('../utils/handle')
const { CustomError, HttpError } = require('../utils/customError.js')
const fs = require('fs')

// ctx.req.files  ctx.req.body  文件上传
// ctx.request.body POST/PUT
// ctx.query GET
// ctx.params DELETE
class articleController{

	// 获取文章列表
	static async getArticle(ctx) {
		const {
			keyword = '',
			tag,
			type,
			publish = 1,
			state = 1,
			currentPage = 1,
			pageSize = 10,
      date,
			hot } = ctx.query
			console.log(ctx.query)
		// 过滤条件
		const options = {
			sort: { createTime: -1 },
			page: Number(currentPage),
			limit: Number(pageSize),
			// populate: ['tag'],
			select: '-content'  // 加这个content被过滤掉，不会返回到前端
		}

		// 参数
		const querys = {}

		// 关键词查询
		if (keyword) {
			const keywordReg = new RegExp(keyword)
			querys['$or'] = [
				{ 'title': keywordReg },
				// { 'content': keywordReg },
				{ 'desc': keywordReg }
			]
		}

		// 按照state查询
		if (['1', '2'].includes(state)) {
			querys.state = state
		}

		// 按照公开程度查询
		if (['1', '2'].includes(publish)) {
			querys.publish = publish
		}

		// 按照类型程度查询
		if (['1', '2', '3'].includes(type)) {
			querys.type = type
		}
		
		// 按热度排行
		if (hot) {
			options.sort = {
				'meta.views': -1,
				'meta.likes': -1,
				'meta.comments': -1
			}
		}

		// 时间查询
		if (date) {
			const getDate = new Date(date)
			if (!Object.is(getDate.toString(), 'Invalid Date')) {
				querys.create_at = {
					"$gte": new Date((getDate / 1000 - 60 * 60 * 8) * 1000),
					"$lt": new Date((getDate / 1000 + 60 * 60 * 16) * 1000)
				}
			}
		}

		// if (tag) querys.tag = tag
		if (tag) querys.tag = { $regex: tag }

		// 如果是前台请求，则重置公开状态和发布状态
		// if (!authIsVerified(ctx.request)) {
		// 	querys.state = 1
		// 	querys.publish = 1
		// }

		// 查询
		const result = await Article
			.paginate(querys, options)
			.catch(err => {
				console.log(err)
				// ctx.throw(500, '服务器内部错误')
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		console.log(result)
		if (result) {
			handleSuccess({
				ctx,
				data: {
					pagination: {
						total: result.total,
						currentPage: result.page,
						totalPage: result.pages,
						pageSize: result.limit
					},
					list: result.docs
				},
				msg: '列表数据获取成功!'
			})
		} else handleError({ ctx, msg: '获取列表数据失败' })

		// console.log(ctx.query)
		// console.log(ctx.query.currentPage)
		// let currentPage = parseInt(ctx.query.currentPage)
		// let pageSize = parseInt(ctx.query.pageSize)
		// let queryTitle = ctx.query.queryTitle
		// let queryType = parseInt(ctx.query.queryType)
		// let queryTag = parseInt(ctx.query.queryTag)
		// let result = null, total = 0
		// currentPage = currentPage <= 0 ? 1 : currentPage
		// // 组合搜索内容
		// const querys = {}
		// // 组合查询
		// if (queryTitle) {
		// 	querys['$or'] = [
		// 		{ 'title': { $regex: queryTitle } }, // 使用正则模糊搜索,可在数组添加多个条件
		// 	]
		// }
		// // 权限查询
		// if (queryType) { querys.type = queryType }
		// if (queryTag) { 
		// 	querys.tag = { $regex: queryTag } // 使用正则模糊搜索,可在数组添加多个条件
		// }
		// console.log(querys)
		// result = await Article
		// 	.find(querys) // 模糊搜索
		// 	.sort({ 'createTime': -1 }) // 排序，-1为倒序
		// 	.skip(pageSize * (currentPage - 1)) // 跳过数
		// 	.limit(pageSize) // 限制每页显示数
		// 	.exec() // 执行sql语句
		// 	.catch(err => {
		// 		ctx.throw(500, '服务器内部错误-getArticles错误！')
		// 	})
		// console.log(result)
		// if (result.length) {
		// 	total = await Article // 获取分页总数
		// 		// .count() // 5.2版本已废弃
		// 		.countDocuments()
		// 		.exec()
		// 		.catch(err => {
		// 			ctx.throw(500, '服务器内部错误-Article分页总数查询错误!')
		// 		})
		// }
		// if (result) {
		// 	handleSuccess({
		// 		ctx, msg: '数据获取成功！',
		// 		data: {
		// 			pagination: {
		// 				total,
		// 				currentPage,
		// 				pageSize
		// 			},
		// 			list: result
		// 		}
		// 	})
		// } else {
		// 	handleError({ ctx, msg: '数据获取失败！' })
		// }
	}

	// 获取指定id的文章内容
	static async getArticleById(ctx) {
		let _id = ctx.params.id
		if (!_id) {
			handleError({ ctx, msg: '无效参数' })
			return false
		}
		const result = await Article
			.findById({ _id })
			// .populate('tag')
			// .exec() // 执行sql语句
			.catch(err => {
				console.log(err)
				// ctx.throw(500, '服务器内部错误-findArticleById错误！')
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		console.log(result)
		if (result) {
			// 每次请求，views 都增加一次
			result.meta.views += 1
			result.save()
			handleSuccess({ ctx, msg: '文章获取成功', data: result })
		} else {
			handleError({ ctx, msg: '文章获取失败' })
		}
	}

	// 发布文章
	static async postArticle(ctx) {
		// ctx.request.body.tag = ctx.request.body.tag.join()
		// ctx.request.body.tag = 'xyz'
		console.log(ctx.request.body)
		const result = await new Article(ctx.request.body)
			.save()
			.catch(err => {
				console.log(err)
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		console.log(result)
		if (result) {
			handleSuccess({ ctx, msg: '添加文章成功', data: result })

			// 百度 seo push
			// request.post({
			// 	url: `http://data.zz.baidu.com/urls?site=${config.BAIDU.site}&token=${config.BAIDU.token}`,
			// 	headers: { 'Content-Type': 'text/plain' },
			// 	body: `${config.INFO.site}/article/${res._id}`
			// }, (error, response, body) => {
			// 	console.log('推送结果：', body)
			// })
			
		} else handleError({ ctx, message: '添加文章失败' })
		
		//es6对象解构赋值
		// const { title, author, type, tag, likeNum, lookNum, releaseTime, content } = ctx.request.body //请求参数放在请求体
		// if (!title) {
		// 	handleError({ ctx, msg: '文章标题不能为空！' })
		// 	return false
		// }else if (!author) {
		// 	handleError({ ctx, msg: '作者不能为空！' })
		// 	return false
		// } else if (!type) {
		// 	handleError({ ctx, msg: '文章类型不能为空！' })
		// 	return false
		// } else if (!tag) {
		// 	handleError({ ctx, msg: '文章标签不能为空！' })
		// 	return false
		// } else if (typeof likeNum === "underfined") {
		// 	handleError({ ctx, msg: '点赞数不能为空！' })
		// 	return false
		// } else if (typeof lookNum === "underfined") {
		// 	handleError({ ctx, msg: '浏览数不能为空！' })
		// 	return false
		// } else if (!releaseTime) {
		// 	handleError({ ctx, msg: '发布时间不能为空！' })
		// 	return false
		// } else if (!content) {
		// 	handleError({ ctx, msg: '文章内容为空！' })
		// 	return false
		// }
		// let oneArticle = await Article
		// 	.findOne({ 'title': title })
		// 	.exec() // 执行sql语句
		// 	.catch(err => {
		// 		ctx.throw(500, '服务器内部错误-findOneArticle错误！')
		// 	})
		// console.log(oneArticle)
		// if (oneArticle === null) {
		// 	const article = new Article({
		// 		title,
		// 		author,
		// 		type,
		// 		tag,
		// 		likeNum,
		// 		lookNum,
		// 		releaseTime,
		// 		content,
		// 		createTime: new Date().getTime()
		// 	})
		// 	let result = await article.save().catch((err) => {
		// 		ctx.throw(500, '服务器内部错误-addArticle错误！')
		// 	})
		// 	handleSuccess({
		// 		ctx, msg: '文章发布成功！',
		// 		data: result
		// 	})
		// } else {
		// 	handleError({ ctx, msg: '文章名已存在！' })
		// }
	}

	// 编辑文章
	static async putArticle(ctx) {
		const { id, title, author, type, tag, likeNum, lookNum, releaseTime, content } = ctx.request.body 
		if (!title) {
			handleError({ ctx, msg: '文章标题不能为空！' })
			return false
		} else if (!author) {
			handleError({ ctx, msg: '作者不能为空！' })
			return false
		} else if (!type) {
			handleError({ ctx, msg: '文章类型不能为空！' })
			return false
		} else if (!tag) {
			handleError({ ctx, msg: '文章标签不能为空！' })
			return false
		} else if (typeof likeNum === "underfined") {
			handleError({ ctx, msg: '点赞数不能为空！' })
			return false
		} else if (typeof lookNum === "underfined") {
			handleError({ ctx, msg: '浏览数不能为空！' })
			return false
		} else if (!releaseTime) {
			handleError({ ctx, msg: '发布时间不能为空！' })
			return false
		} else if (!content) {
			handleError({ ctx, msg: '文章内容为空！' })
			return false
		}
		let result = null
		if (id) {
			result = await Article.findByIdAndUpdate(id, {
				title,
				author,
				type,
				tag,
				likeNum,
				lookNum,
				releaseTime,
				content
			}, { new: true })
				.exec() // 执行查询，并将查询结果传入回调函数,可以传人一个函数，会返回成为一个完整的 promise 对象
				.catch((err) => {
					ctx.throw(500, '服务器内部错误-findByIdAndUpdate错误!')
				})
			if (result) {
				handleSuccess({
					ctx, msg: '修改成功！',
					data: result
				})
			}
		}
	}

	// 修改文章状态
	static async patchArticle(ctx) { 
		const _id = ctx.params.id

		const { state, publish } = ctx.request.body

		const querys = {}

		if (state) querys.state = state

		if (publish) querys.publish = publish

		if (!_id) {
			handleError({ ctx, message: '无效参数' })
			return false
		}

		const result = await Article
			.findByIdAndUpdate(_id, querys)
			.catch(err => {
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		if (result) handleSuccess({ ctx, msg: '更新文章状态成功' })
		else handleError({ ctx, msg: '更新文章状态失败' })
	}

	// 删除文章
	static async deleteArticle(ctx) {
		const _id = ctx.params.id

		if (!_id) {
			handleError({ ctx, message: '无效参数' })
			return false
		}

		const res = await Article
			.findByIdAndRemove(_id)
			.catch(err => {
				// ctx.throw(500, '服务器内部错误')
				throw new CustomError(500, '服务器内部错误')
				return false
			})
		if (res) {
			handleSuccess({ ctx, msg: '删除文章成功' })

			// 百度推送
			// request.post({
			// 	url: `http://data.zz.baidu.com/del?site=${config.BAIDU.site}&token=${config.BAIDU.token}`,
			// 	headers: { 'Content-Type': 'text/plain' },
			// 	body: `${config.INFO.site}/article/${_id}`
			// }, (error, response, body) => {
			// 	console.log('百度删除结果：', body);
			// })
		} else handleError({ ctx, msg: '删除文章失败' })

		// const id = ctx.params.id
		// if (!id) {
		// 	handleError({ ctx, msg: '参数无效，删除失败！' })
		// 	return false
		// }
		// const result = await Article
		// 	.findByIdAndRemove(id)
		// 	.catch(err => {
		// 		ctx.throw(500, '服务器内部错误-deleteArticle错误！')
		// 	})
		// if (result) handleSuccess({ ctx, msg: '删除成功！', data: result })
		// else handleError({ ctx, msg: '删除失败！' })
	}


	// 上传文章图片
	static async uploadArticlePics(ctx) {
		// console.log(`http://${ctx.req.headers.host}`)
		console.log(ctx.req.files) // 获取批量上传数组
		console.log(ctx.req.body)
		const files = ctx.req.files
		// if (files.length) {
		// 	let host = `http://${ctx.req.headers.host}/upload/article`
		// 	let reg = /!\[(.*?)\]\((.*?)\)/g
		// 	let originImgs = []
		// 	let cacheImg = null
		// 	while ((cacheImg = reg.exec(content)) !== null) {
		// 		originImgs.push(cacheImg[0])
		// 	}
		// 	for (let [index, item] of originImgs.entries()) {
		// 		content = content.replace(item, `![图片${index}](${host}/${files[index].filename})`)
		// 	}
		// } 
		let result = []
		for (let item of files) {
			let obj = {}
			obj.url = `upload/article/${item.filename}`
			obj.name = item.filename
			result.push(obj)
		}
		handleSuccess({
			ctx, msg: '批量上传图片成功！',
			data: result
		})
	}

	// 删除文章图片
	static async removeArticlePics(ctx) {
		console.log(ctx.request.body)
		if (ctx.request.body.url) {
			fs.readFile(`static/${ctx.request.body.url}`, (err, data) => {
				// 读取文件失败/错误
				if (err) {
					// throw err;
					console.log(err)
					handleError({ ctx, msg: '删除失败' })
				} else {
					// 读取文件成功
					fs.unlinkSync(`static/${ctx.request.body.url}`)
				}
			})
		} else {
			handleError({ ctx, msg: '没有图片路径' })
		}
		handleSuccess({
			ctx, msg: '删除成功！',
			data: 'remove successful。'
		})
	}

	// 发布文章
	static async release(ctx){
		// console.log(`http://${ctx.req.headers.host}`)
		console.log(ctx.req.files) // 获取批量上传数组
		console.log(ctx.req.body)
		let { title, type, content } = ctx.req.body
		const files = ctx.req.files
		if(!title){
			handleError({ ctx, msg: '标题不能为空！' })
			// if(files.length){
			// 	for(let item of files){
			// 		fs.unlinkSync(item.path) // 验证失败删除已上传的头像
			// 	}
			// }
			return false
		}
		if(files.length){
			let host = `http://${ctx.req.headers.host}/upload/article`
			let reg = /!\[(.*?)\]\((.*?)\)/g
			let originImgs = []
			let cacheImg = null
			while ((cacheImg = reg.exec(content)) !== null){
				originImgs.push(cacheImg[0])
			}
			for (let [index, item] of originImgs.entries()){
				content = content.replace(item, `![图片${index}](${host}/${files[index].filename})`)
			}
			// console.log(content)
		}
		let oneArticle = await Article
			.findOne({ 'title': title })
			.exec() // 执行sql语句
			.catch(err => {
				ctx.throw(500, '服务器内部错误-findOneArticle错误！')
			})
		if(oneArticle === null){
			const article = new Article({
				title,
				type: 1,
				content
			})
			let result = await article.save().catch((err) => {
				ctx.throw(500, '服务器内部错误-addArticle错误！')
			})
			handleSuccess({
				ctx, msg: '新增成功！',
				data: result
			})
		}
	}
}

module.exports = articleController