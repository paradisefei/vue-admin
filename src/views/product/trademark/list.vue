<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="addTrademark"
      >添加</el-button
    >
    <el-dialog title="添加品牌" :visible.sync="isVisible" width="50%">
      <!--
      表单
        品牌名称
        品牌LOGO
     -->
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="ruleForm.tmName"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logoUrl">
          <!--
            这里的action的值是文件上传的地址
              在这里表示的是图片，我唤起文件夹出现，然后选择图片并选择打开时，就会向action这个地址发送请求
              发送了请求之后会返回一个对象，这个对象可以在on-success这个回调中获取到，这个对象保存有这张图片的一个url地址，拿到这个地址就可以去进行post请求了

              什么时候触发
              怎么请求
                请求的这个地址是最终的服务器地址，还是跨域的问题没有搞得特别清楚，这里是属于代码中的请求，也就是客户端请求，那就得先搞清楚这个action的请求是不是Ajax请求了
              去哪请求
                action
                  优化一下这个action地址，因为这个是进行的Ajax请求，存在跨域问题
                  有两种方式可以写
                    直接写死，把最重要请求的地址写在这里，直接写死不是要写上完整的地址吗，为什么会404
                      我请求的确实是最终的地址，你既然所有的基础路径都加了/dev-api，那你之前所有的请求都是加了的
                      遇到/dev-api就把请求代理到http://182.92.128.115是不是就是意味着我只要路径中出现了/dev-api，就会在原来的基础上把/dev-api替换成http://182.92.128.115
           -->
          <el-upload
            class="avatar-uploader"
            action="http://182.92.128.115/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <!--
            一开始ruleForm.logoUrl的空的，所以图片标签是隐藏的，加号和框都是i的功能，当上传了图片有地址了之后，图片标签就插入DOM树并显示图片了，那如果<el-upload></el-upload>中间啥元素都没有要如何触发上传呢
           -->
            <img
              v-if="ruleForm.logoUrl"
              :src="ruleForm.logoUrl"
              class="avatar"
            />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
          <span>只能上传jpg/png文件，且不超过50kb</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogAck('ruleForm')"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!--
      四列
      表头标题
      显示数据
        tableData是一个数组
        表格中显示图片
          插槽
        表格中使用按钮
        分页器
          居中
          右侧靠右
     -->

    <!-- 表格 -->
    <el-table
      :data="trademarkList"
      border
      style="width: 100%; margin: 30px 0"
      v-loading="isLoading"
    >
      <!--
        序号使用数据在数组中的下标
       -->
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="tmName" label="品牌名称"> </el-table-column>
      <el-table-column label="品牌LOGO">
        <template slot-scope="scope">
          <img :src="scope.row.logoUrl" class="trademark-img" />
        </template>
      </el-table-column>
      <el-table-column prop="do" label="操作">
        <template v-slot="scope">
          <el-button
            type="warning"
            icon="el-icon-edit"
            @click="updateTrademark(scope.row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            @click="delTrademark(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      class="pagination"
      :page-sizes="[3, 6, 9]"
      :page-size="limit"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      layout="prev, pager, next, jumper, sizes, total"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
/*
  1.界面结构
      1.按钮
      2.表格
      3.分页器
  2.请求数据，渲染页面
    渲染在品牌管理页面的数据
    引入请求品牌数据列表api，并进行请求
  3.总共的数据
  4.请求某一页的数据
    点击分页器的页码请求对应页的数据
  5.添加
    点击弹窗
  6.修改
    点击修改，出现弹窗
    把上一次的校验结果清空
  7.loading效果
    在切换页码时会进行请求，这个请求的过程需要时间，在请求的这段时间内加上loading的效果
    v-loading的指令，值为布尔值，为true时，表示显示loading效果；false时不显示，这里就有两个问题
      在哪里显示
        v-loading作为哪个元素的属性，loading遮罩就会被绑定到该元素的子节点上
      什么时候显示
        发送请求前显示，请求成功拿到数据后就不显示
  8.删除
*/

export default {
  name: "TrademarkList",
  data() {
    return {
      trademarkList: [],
      total: 0,
      // 指定显示某一页
      page: 1,
      // 每一页的限制
      limit: 3,
      // 弹窗是否隐藏
      isVisible: false,
      // 弹窗
      ruleForm: {
        tmName: "",
        // 上传的图片地址
        logoUrl: "",
      },
      // 我输入了内容也给我报错，在单个表单上传递校验规则，使用方法来校验
      rules: {
        tmName: [
          {
            required: true,
            message: "请输入品牌名称",
            trigger: "blur",
          },
        ],
        logoUrl: [{ required: true, message: "请上传品牌logo" }],
      },
      // 是否显示遮罩-loading效果
      isLoading: false,
    };
  },
  methods: {
    // 把请求某页数据的方法封装成函数
    async myGetOneOfPage(page, limit) {
      this.isLoading = true;
      const { trademark } = this.$API;
      // 这个请求可以得到所有数据，数据的长度，但是我要渲染的是某一页的数据，可以直接请求某一页的数据
      // const resList = await trademark.getPageList();
      const resOnePage = await trademark.getOneOfPage(page, limit);
      const { records, total } = resOnePage.data;
      if (resOnePage.code === 200) {
        /*
        获取成功后将真正要用的数据赋值到定义的渲染数据中
        进行渲染
      */
        this.$message.success("成功获取品牌数据列表");
        // 真正要被渲染的数据
        this.trademarkList = records;
        // 数据的总长度
        this.total = total;
      } else {
        this.$message.error("获取品牌数据列表失败");
      }
      this.isLoading = false;
    },
    // 点击按钮获取对应页码的数据
    handleCurrentChange(newPage) {
      this.page = newPage;

      const { page, limit, myGetOneOfPage } = this;
      myGetOneOfPage(page, limit);
    },
    // 改变每一页该显示多少数据
    handleSizeChange(newLimit) {
      /*
        使用新的limit去请求
        每一次改了几条/页时，都从显示第一页的数据开始
        我点击了之后传入的是数字1，请求的时候也是用1，但最终显示出来的不是1高亮，高亮的始终是上一次page请求的数
        使用响应式数据去请求
      */
      this.page = 1;
      this.limit = newLimit;
      const { page, limit, myGetOneOfPage } = this;
      myGetOneOfPage(page, limit);
    },
    // 添加按钮
    addTrademark() {
      // 清空上一次的校验结果
      this.$refs.ruleForm && this.$refs.ruleForm.clearValidate();
      this.isVisible = true;
      this.ruleForm = {
        tmName: "",
        // 上传的图片地址
        logoUrl: "",
      };

      /*
        弹窗
          点击添加显示弹窗
        修改弹窗内容
        发送请求需要的参数
        引入发送请求的api
          需要的参数
        点击确定的时候发送请求
      */
    },
    // 修改按钮
    updateTrademark(row) {
      /*
        出现弹窗
        弹窗中要显示这一行的数据
        再点击添加时为空
        进行修改
      */
      // 清空上一次的校验结果
      this.$refs.ruleForm && this.$refs.ruleForm.clearValidate();
      this.isVisible = true;
      this.ruleForm = { ...row };
    },
    // 删除按钮
    async delTrademark(id) {
      /*
        发送请求删除
        再重新发送请求渲染页面
      */
      //  console.log(id);
      await this.$API.trademark.deleteTrademark(id);
      this.myGetOneOfPage(this.page, this.limit);
    },
    // 上传之后会来到这个函数
    handleAvatarSuccess(res, file) {
      console.log(res, file);
      /*
        上传成功之后就会来到这个函数，res中会有图片地址，拿到这个地址去请求
       */
      this.ruleForm.logoUrl = res.data;
    },
    //  上传前
    beforeAvatarUpload(file) {
      /*
        限制图片的大小和图片类型
        可以根据file得到文件的类型和大小
          文件的类型为jpg，png，jpeg
        上传的地址问题
        点击打开之后就会执行这个函数里面的代码，那是把图片上传到哪里了
          点击打开之后就会去进行请求，我请求的时候就需要有tmName, logoUrl参数，我需要拿到图片地址
      */
      const imgType = ["image/jpg", "image/png", "image/jpeg"];
      const isType = imgType.indexOf(file.type) > -1;
      console.log(file.size);
      const isLt = file.size / 1024 < 50;
      console.log(isType, isLt);
      if (!isType) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt) {
        this.$message.error("上传头像图片大小不能超过 50kb!");
      }
      console.log(isType && isLt);
      return isType && isLt;
    },
    // 校验及进行请求
    dialogAck(formName) {
      /*
          在修改时，如果数据没有改就不需要发送请求；点击确定，就要发送修改的请求
          在添加时，是没有id的，在修改时会有id，根据id来确定是添加还是修改
      */
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          /*
            判断是否有id
          */
          const isUpdate = this.ruleForm.id;
          if (isUpdate) {
            /*
            修改
              发送请求
              如果没有修改数据，则不需要发送请求
           */
            const findTrademark = this.trademarkList.find((trademark) => {
              if (trademark.id === this.ruleForm.id) {
                return true;
              }
            });
            if (
              findTrademark.tmName === this.ruleForm.tmName &&
              findTrademark.logoUrl === this.ruleForm.logoUrl
            ) {
              this.$message.warning("数据没有被修改");
              return;
            }
            await this.$API.trademark.updateTrademark(this.ruleForm);
          } else {
            /*
              添加
           */
            await this.$API.trademark.addTrademark(this.ruleForm);
          }
          // 添加完之后对话框隐藏
          this.isVisible = false;
          // 再请求数据重新渲染页面
          this.myGetOneOfPage(this.page, this.limit);
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
  },
  mounted() {
    this.myGetOneOfPage(this.page, this.limit);
  },
};
</script>
<style scoped>
.trademark-img {
  width: 100px;
}
.pagination {
  text-align: center;
}
/deep/.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
