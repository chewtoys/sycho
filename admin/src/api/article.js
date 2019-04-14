import request from '@/api/request'

// 传参方式: post方式用 data: {...data} ，get方式用 params: {...params}
// 增删改查 post delete put get

// 根据id获取指定wenz
export function getArticleById(params) {
  return request({
    url: '/getArticleById',
    method: 'get',
    params: { ...params }
  })
}

// 获取文章列表
export function getArticles(params) {
  console.log(params)
  return request({
    url: '/getArticles',
    method: 'get',
    params: { ...params }
  })
}

// 新增文章
export async function addArticle(data) {
  return await request({
    url: '/addArticle',
    method: 'post',
    data: { ...data }
  })
}

// 修改文章
export async function editArticle(data) {
  return await request({
    url: '/editArticle',
    method: 'put',
    data: { ...data }
  })
}

// 删除文章
export async function deleteArticle(data) {
  return await request({
    url: `/deleteArticle/${data}`,
    method: 'delete',
  })
}