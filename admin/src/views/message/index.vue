<template>
  <div class="message">
    <el-row type="flex" justify="space-between" class="header" :gutter="6">
      <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="4"><el-input placeholder="请输入昵称" v-model="keyword" clearable @keyup.enter.native="_getMessage" size="small"> </el-input> </el-col>
      <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="4">
        <el-select v-model="state" placeholder="请选择留言状态" style="display: block;" clearable size="small">
          <el-option
            v-for="item in stateList"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="16" v-if="winWidth>500">
        <el-button type="primary" icon="el-icon-search" round @click.native="_getMessage" size="small">搜索</el-button>
        <el-button type="primary" icon="el-icon-plus" round @click="handleAdd" size="small">新增</el-button>
      </el-col>
    </el-row>
    <el-row style="padding: 0 10px;" v-if="winWidth<=500" type="flex" justify="end">
      <el-button type="primary" icon="el-icon-search" round @click.native="_getMessage" size="small">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" round @click="handleAdd" size="small">新增</el-button>
    </el-row>
    <el-row class="content">
      <el-col :span="24">
        <el-table
          :data="tableData"
          border
          height="560"
          stripe
          fit
          highlight-current-row
          style="width: 100%"
          size="small">
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-form label-position="left" inline class="table-expand">
                <el-form-item label="IP：">
                  <span>{{ props.row.ip }}</span>
                </el-form-item>
                <el-form-item label="地址：">
                  <span v-if="!props.row.country&&!props.row.city">{{ props.row.country }} {{ props.row.city }}</span>
                  <span v-else>暂无</span>
                </el-form-item>
                <el-form-item label="浏览器：">
                  <span v-html="uaParse(props.row.agent)"></span>
                </el-form-item>
                <el-form-item label="系统：">
                  <span v-html="osParse(props.row.agent)"></span>
                </el-form-item>
                <el-form-item label="点赞数：">
                  <span v-html="props.row.likes"></span>
                </el-form-item>
                <el-form-item label="postId：">
                  <span v-html="props.row.postId"></span>
                </el-form-item>
                <el-form-item label="isReply：">
                  <span v-html="props.row.isReply"></span>
                </el-form-item>
                <el-form-item label="replyId：">
                  <span v-html="props.row.replyId||'暂无'"></span>
                </el-form-item>
                <el-form-item label="replyName：">
                  <span v-html="props.row.replyName||'暂无'"></span>
                </el-form-item>
                <el-form-item label="吐槽数：">
                  <span v-html="props.row.dislikes"></span>
                </el-form-item>
                <el-form-item label="头像颜色：">
                  <span v-text="props.row.color"></span>
                </el-form-item>
                <el-form-item label="头像图片：">
                  <span v-text="props.row.avator||'暂无'"></span>
                </el-form-item>
                <el-form-item label="更新时间：">
                  <span>{{props.row.updateDate | formatterTime}}</span>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column
            type="index"
            label="序号"
            align="center"
            width="50">
          </el-table-column>
          <el-table-column
            prop="postType"
            label="类型"
            align="center"
            width="80">
          </el-table-column>
          <el-table-column
            prop="name"
            label="昵称"
            width="120px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="email"
            label="邮箱"
            width="200px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            prop="content"
            label="内容"
            min-width="200px"
            show-overflow-tooltip>
          </el-table-column>
          <el-table-column
            label="创建时间"
            width="180">
            <template slot-scope="scope">
              <i class="iconfont icon-date mar"></i>
              {{ scope.row.createDate | formatterTime}}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            width="80">
            <template slot-scope="scope">
              {{ scope.row.state === 0 ? '待审核' : scope.row.state === 1 ? '通过' : '不通过' }}
            </template>
          </el-table-column>
          <!-- fixed="right" -->
          <el-table-column
            label="操作"
            width="250">
            <template slot-scope="scope">
              <transition-group tag="span" name="btn">
                <el-button
                  type="success"
                  size="small"
                  v-if="scope.row.state === 0 || scope.row.state === 2"
                  @click="handleState(scope.row, 1)"
                  key="1">通过</el-button>
                <el-button
                  type="danger"
                  size="small"
                  v-if="scope.row.state === 0 || scope.row.state === 1"
                  @click="handleState(scope.row, 2)"
                  key="2">不通过</el-button>
                <el-button
                  type="danger"
                  size="small"
                  key="3"
                  @click="handleDelete(scope.row)"
                  :disabled="scope.row.deleteing">{{ scope.row.deleteing ? '删除中' : '删 除' }}</el-button>
                <!-- <el-button type="text" size="small" icon="el-icon-edit" key="4">编辑</el-button>
                <el-button type="text" size="small" icon="el-icon-edit" key="5">回复</el-button> -->
              </transition-group>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 30, 50, 100]"
          layout="total, sizes, prev, pager, next">
        </el-pagination>
      </el-col>
    </el-row>
    <el-dialog
      :title="dialogType === 1 ? '添加' : '编辑'"
      :visible.sync="dialogVisible"
      :width="winWidth<500?'90%':winWidth<1200?'60%':'30%'"
      :close-on-click-modal="false">
      <el-form ref="messageForm" :model="messageForm" :rules="messageFormRules" label-width="80px" status-icon>
        <el-form-item label="昵称" required prop="name">
          <el-input v-model="messageForm.name" placeholder="请输入昵称" clearable size="small"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" required prop="email">
          <el-input v-model="messageForm.email" placeholder="请输入邮箱" clearable size="small"></el-input>
        </el-form-item>
        <el-form-item label="URL" required prop="url">
          <el-input v-model="messageForm.url" placeholder="请输入URL" clearable size="small"></el-input>
        </el-form-item>
        <el-form-item label="内容" required prop="content" @keyup.enter.native="handleSubmitForm">
          <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="messageForm.content" size="small"> </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false" size="small">取 消</el-button>
        <el-button type="primary" @click="handleSubmitForm" size="small">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { UAParse, OSParse } from '@/assets/js/parse.js'
import { formatterTime } from '@/assets/js/filter.js'
import { checkEmail, validURL } from '@/assets/js/validate.js'
  export default {
    name: 'message',
    data(){
      let validateEmail = (rule, value, callback) => {
        if(value === ''){
          callback(new Error('请输入邮箱'))
        }else if (!checkEmail(value)) {
          callback(new Error('请正确输入邮箱'))
        } else {
          callback()
        }
      }
      let validateURL = (rule, value, callback) => {
        if(value === ''){
          callback(new Error('请输入URL'))
        }else if (!validURL(value)) {
          callback(new Error('请正确输入URL'))
        } else {
          callback()
        }
      }
      return {
        keyword: '',
        state: '',
        stateList: [{
          value: '3',
          label: '全部'
        }, {
          value: '0',
          label: '待审核'
        }, {
          value: '1',
          label: '已通过'
        }, {
          value: '2',
          label: '未通过'
        }],
        messageForm: {
          id: undefined,
          name: '',
          email: '',
          url: '',
          content: ''
        },
        messageFormRules: {
          name: [
            { required: true, message: '请输入昵称', trigger: 'blur' },
            { required: true, message: '请输入昵称', trigger: 'change' }
          ],
          email: [
            { validator: validateEmail, trigger: 'blur' },
            { validator: validateEmail, trigger: 'change' }
          ],
          url: [
            { validator: validateURL, trigger: 'blur' },
            { validator: validateURL, trigger: 'change' }
          ],
          content: [
            { required: true, message: '请输入内容', trigger: 'blur' },
            { required: true, message: '请输入内容', trigger: 'change' }
          ]
        },
        dialogVisible: false,
        dialogType: 1,
        tableData: [],
        currentPage: 1,
        pageSize: 10,
        total: 0,
        loading: false,
      }
    },
    created: function (){
      this._getMessage()
    },
    filters: {
      formatterTime
    },
    mounted: function () {
      this.$nextTick(() => {})
    },
    methods: {
      // 根据条件获取留言
      _getMessage(params){
        this.loading = true
        this.$store.dispatch('message/getMessage', { currentPage: this.currentPage, pageSize: this.pageSize, keyword: this.keyword, state: this.state }).then(res => {
          // console.log(res)
          if(res.success){
            this.tableData = [...res.data.list]
            this.total = res.data.pagination.total
            this.pageSize = res.data.pagination.pageSize
            this.currentPage = res.data.pagination.currentPage
          }else{
            this.$message.error(res.msg)
          }
        }).then(() => {
          this.loading = false
        })
      },
      uaParse(val){
        return UAParse(val)
      },
      osParse(val){
        return OSParse(val)
      },
      handleSizeChange(val) {
        // console.log(`每页 ${val} 条`)
        this.pageSize = val
        this._getMessage()
      },
      handleCurrentChange(val) {
        // console.log(`当前页: ${val}`)
        this.currentPage = val
        this._getMessage()
      },
      // 新增留言
      handleAdd(){
        this.messageForm.id = ''
        this.messageForm.name = ''
        this.messageForm.email = ''
        this.messageForm.url = ''
        this.messageForm.content = ''
        // this.$refs['messageForm'].resetFields()
        this.dialogType = 1
        this.dialogVisible = true
        this.$nextTick(() => {
          this.$refs['messageForm'].clearValidate()
        })
      },
      // 提交留言
      handleSubmitForm(){
        this.$refs.messageForm.validate((valid) => { // 表单校验
          if (valid) {
            let params = {
              name: this.messageForm.name,
              email: this.messageForm.email,
              url: this.messageForm.url,
              content: this.messageForm.content,
              agent: navigator.userAgent
            }
            this.$store.dispatch('message/postMessage', params).then(res => {
              if(res.success){
                this._getMessage() // 刷新页面数据
                this.dialogVisible = false
                this.$message.success(res.msg)
              }else{
                this.$message.error(res.msg)
              }
            })
          }
        })
      },
      // 修改状态
      handleState(row, code){
        this.$store.dispatch('message/patchMessage', { _id: row._id, state: code, postId: row.postId }).then(res => {
          if(res.success){
            this.$message({
              message: res.msg,
              type: 'success'
            })
            this._getMessage()
          }else{
            this.$message({
              message: res.msg,
              type: 'error'
            })
          }
        })
      },
      // 删除留言
      handleDelete(row){
        this.$confirm('此操作将删除该行, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let id = ''
          if(row.postId){
            id = `${row._id},${row.postId}`
          }else{
            id = row._id
          }
          this.$store.dispatch('message/deleteMessage', id).then(res => {
            if(res.success){
              this.$message({
                message: res.msg,
                type: 'success'
              })
              this._getMessage()
            }else{
              this.$message({
                message: res.msg,
                type: 'error'
              })
            }
          })
        }).catch(() => {
          // console.log('取消删除')
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  $bg: #fff;
  .message{
    margin-top: 10px;
    padding: 0 10px 10px;
    background-color: $bg;
    .header{
      padding: 10px;
    }
    .content{
      padding: 10px;
      background-color: $bg;
    }
    .el-pagination{
      padding: 10px 0;
      text-align: right;
    }
  }
</style>
