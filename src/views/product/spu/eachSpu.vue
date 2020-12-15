<template>
  <el-card class="box-card">
    <el-form ref="form" :rules="rules" :model="eachSpuInfo" label-width="80px">
      <el-form-item label="SPU名称" prop="spuName" placeholder="SPU名称">
        <el-input v-model="eachSpuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌" prop="tmId">
        <!--
            第一次渲染的时候trademarkList数组为空
           -->
        <el-select v-model="eachSpuInfo.tmId" placeholder="请选择品牌">
          <el-option
            v-for="eachTrademark in trademarkList"
            :key="eachTrademark.id"
            :label="eachTrademark.tmName"
            :value="eachTrademark.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述" prop="description">
        <el-input
          type="textarea"
          v-model="eachSpuInfo.description"
          placeholder="SPU描述"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU图片" prop="imageList">
        <!--
            1.多个图片的显示
            2.请求获取所有图片
           -->
        <el-upload
          class="avatar-uploader"
          :on-preview="handlePreview"
          :on-remove="handleRemove"
          action="http://182.92.128.115/admin/product/fileUpload"
          :file-list="spuImageList"
          list-type="picture-card"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="销售属性" prop="saleAttr">
        <el-select
          v-model="checkSpuAttrValue"
          :placeholder="`还有${leftHowMany}项选择`"
        >
          <el-option
            v-for="spuAttrValue in baseSaleAttrList"
            :key="spuAttrValue.id"
            :label="spuAttrValue.name"
            :value="spuAttrValue.id"
          ></el-option></el-select
        ><el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!checkSpuAttrValue"
          style="margin-left: 10px"
          @click="addSaleAttr(checkSpuAttrValue)"
          >添加销售属性</el-button
        >
        <!--
            1.点击添加销售属性
              1.
           -->
        <el-table :data="spuAttrValueListInTable" border class="elButton">
          <el-table-column type="index" label="序号" width="100" align="center">
          </el-table-column>
          <el-table-column prop="saleAttrName" label="属性名称" width="150">
          </el-table-column>
          <!--
          整个表格使用attrInfoList的数据，是一个数组，这个数组中的每一项都是一个个的对象，并且对象中的属性名是相同的，每一个对象中的数据会渲染占一行
          这个prop属性就是指在一行中，渲染在该列的属性的名称
         -->
          <el-table-column prop="spuSaleAttrValueList" label="属性值列表">
            <template v-slot="{ row }">
              <el-tag
                v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
                :key="spuSaleAttrValue.id"
                closable
                @close="delSaleAttrValue(row, index)"
                >{{ spuSaleAttrValue.saleAttrValueName }}</el-tag
              >
              <!--
                1.失去焦点时
                  1.鼠标
                  2.键盘
               -->
              <el-input
                v-if="row.edit"
                style="width: 100px"
                ref="input"
                v-model="addSaleAttrValueText"
                @blur="editComplete(row)"
                @keyup.enter.native="editComplete(row)"
              ></el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="addSaleAttrValue(row)"
                >+ 添加</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template v-slot="{ row }">
              <el-popconfirm title="确定删除吗" @onConfirm="delAttr(row)">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  slot="reference"
                  size="mini"
                ></el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveModify">保存</el-button>
        <el-button @click="cancelModify">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
/*
  1.点击修改属性时，把改行的所有数据都传到eachSpu组件中
  2.挂载成功进行哪些请求
  3.图片上传
  4.添加属性值
    1.切换是否可编辑模式
  5.表单校验

*/
export default {
  name: "EachSpu",
  data() {
    return {
      // 所有品牌列表
      trademarkList: [],
      // 品牌值
      firstTrademarkId: "",
      // 所有显示的图片
      spuImageList: [],
      // 所有销售属性数据
      baseSaleAttrList: [],
      // 要渲染在表格中的销售属性值数据
      spuAttrValueListInTable: [],
      // 销售属性中选择的某个属性
      checkSpuAttrValue: "",
      eachSpuInfo: {
        ...JSON.parse(JSON.stringify(this.eachSpuInfoProps)),
      },
      // 添加属性值文本框
      addSaleAttrValueText: "",
      rules: {
        spuName: [
          {
            required: true,
            message: "请输入SPU名称",
            trigger: "blur",
          },
        ],
        description: [
          {
            required: true,
            message: "请输入SPU描述",
            trigger: "blur",
          },
        ],
        tmId: [
          {
            required: true,
            message: "请输入选择品牌",
            trigger: "blur",
          },
        ],
        imageList: [
          {
            required: true,
            validator: this.imageListValidator,
          },
        ],
        saleAttr: [
          {
            required: true,
            validator: this.saleAttrValidator,
          },
        ],
      },
    };
  },
  props: {
    eachSpuInfoProps: {
      type: Object,
    },
    categoryId: {
      type: Object,
    },
  },
  computed: {
    // 品牌列表中的第一个品牌的id
    // firstTrademarkId: {
    //   get() {
    //     return this.eachSpuInfo ? this.eachSpuInfo.tmId : "";
    //   },
    //   set() {},
    // },
    // 还有几项选择
    leftHowMany() {
      return this.baseSaleAttrList.length;
    },
  },
  methods: {
    // 点击保存时进行校验
    saveModify() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          const spuImageList = this.spuImageList.map((spuImage) => {
            return {
              id: spuImage.uid,
              imgName: spuImage.name,
              imgUrl: spuImage.url,
              spuId: spuImage.spuId,
            };
          });
          const data = {
            ...this.eachSpuInfo,
            spuImageList,
            spuSaleAttrList: this.spuAttrValueListInTable,
          };
          if (data.id) {
            // 有id就是更新
            await this.$API.spu.updateSpuInfo(data);
          } else {
            await this.$API.spu.saveSpuInfo(data);
          }
          this.eachSpuInfoProps.id = undefined;
          this.$emit("cancelSave", this.eachSpuInfoProps, this.categoryId);
        }
      });
    },
    // 校验销售属性
    saleAttrValidator(rule, value, callback) {
      /*
        表格中必须至少有项属性
      */
      if (!this.spuAttrValueListInTable) {
        callback(new Error("至少添加一项属性"));
        return false;
      }
      this.spuAttrValueListInTable.some((spuAttrValue) => {
        if (!spuAttrValue.spuSaleAttrValueList.length) {
          callback(new Error("属性值列表不能为空"));
          return false;
        }
      });
      callback();
      return true;
    },
    // 校验上传的图片
    imageListValidator(rule, value, callback) {
      if (!this.spuImageList.length) {
        return callback(new Error("至少有一张图片"));
      }
      callback();
      return true;
    },
    // 校验品牌
    trademarkValidator(rule, value, callback) {
      if (this.firstTrademarkId) {
        callback();
        return true;
      }
      return callback(new Error("请选择品牌"));
    },
    // 删除表格中的属性(就是一行)
    delAttr(row) {
      this.spuAttrValueListInTable = this.spuAttrValueListInTable.filter(
        (spuAttr) => {
          if (spuAttr.id === row.id) {
            return false;
          }
          return true;
        }
      );
    },
    // 添加属性值时失去焦点
    editComplete(row) {
      /*
        1.变成不可编辑模式
        2.向属性值列表中添加一个对象
        3.文本框不能为空
       */
      if (this.addSaleAttrValueText === "") {
        this.$message.error("属性值为空");
        row.edit = false;
        return;
      }

      const res = this.spuAttrValueListInTable.find((spuAttrValueList) => {
        if (spuAttrValueList.id === row.id) {
          return true;
        }
      });
      res.spuSaleAttrValueList.push({
        saleAttrValueName: this.addSaleAttrValueText,
        spuId: res.spuId,
        baseSaleAttrId: res.baseSaleAttrId,
        saleAttrName: res.saleAttrName,
      });
      this.addSaleAttrValueText = "";
      row.edit = false;
    },
    // 删除属性值
    delSaleAttrValue(row, index) {
      row.spuSaleAttrValueList.splice(index, 1);
    },
    // 添加属性值
    addSaleAttrValue(row) {
      /*
        1.
      */
      this.$set(row, "edit", true);
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
      // row.spuSaleAttrValueList.push({
      //   saleAttrValueName: this.spuSaleAttrValueList,
      // });
    },
    // 上传之后会来到这个函数
    handleAvatarSuccess(res, file) {
      /*
        1.上传成功之后就会来到这个函数，res中会有图片地址，拿到这个地址去请求
        2.上传成功之后，更新spuImageList
       */
      this.spuImageList.push({
        uid: file.uid,
        name: file.name,
        url: res.data,
        // spuId: this.eachSpuInfo.id,
      });
      // this.ruleForm.logoUrl = res.data;
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
      const isLt = file.size / 1024 < 50;
      if (!isType) {
        this.$message.error("上传头像图片只能是 JPG 格式!");
      }
      if (!isLt) {
        this.$message.error("上传头像图片大小不能超过 50kb!");
      }
      return isType && isLt;
    },
    // 取消保存
    async cancelModify() {
      /*
        1.卸载当前组件，挂载allSpu组件
        2.删除id属性
        3.所有spu信息仍要渲染在allSpu组件中
          1.重新挂载，所有又会变成空数组；重新挂载时allSpu信息要保留
      */
      this.eachSpuInfoProps.id = undefined;
      this.$emit("cancelSave", this.eachSpuInfoProps, this.categoryId);
    },
    // 上传图片
    handleRemove(res, file, fileList) {
      this.spuImageList = this.spuImageList.filter((spuImage) => {
        if (spuImage.uid === res.uid) {
          return false;
        }
        return true;
      });
    },
    handlePreview(file) {
      console.log(file);
    },
    // 添加销售属性
    addSaleAttr(id) {
      /*
        1.选择了某个销售属性，就把这个销售属性的属性值渲染在下面的表格中
          1.遍历，把该id的属性值列表存入到数组中
      */
      const res = this.baseSaleAttrList.find((spuAttr) => {
        if (spuAttr.id === id) {
          return true;
        }
      });
      this.baseSaleAttrList = this.baseSaleAttrList.filter((baseSaleAttr) => {
        if (baseSaleAttr.id === id) {
          return false;
        }
        return true;
      });
      this.spuAttrValueListInTable.push({
        baseSaleAttrId: res.id,
        saleAttrName: res.name,
        spuSaleAttrValueList: [],
      });
      this.checkSpuAttrValue = "";
    },
    // 获取品牌
    async myGetAllTrademarkList() {
      const res1 = await this.$API.spu.getAllTrademarkList();
      if (res1.code === 200) {
        this.$message.success("成功获取所有品牌数据");
        this.trademarkList = res1.data;
      } else {
        this.$message.error("获取所有品牌数据失败");
      }
    },
    // 获取所有图片
    async myGetSpuImageList() {
      const res2 = await this.$API.spu.getSpuImageList(this.eachSpuInfo.id);
      if (res2.code === 200) {
        this.$message.success("成功获取所有图片数据");
        this.spuImageList = res2.data.map((img) => {
          return {
            name: img.imgName,
            url: img.imgUrl,
          };
        });
      } else {
        this.$message.error("获取所有图片失败");
      }
    },
    // 获取销售属性
    async myGetBaseSaleAttrList() {
      const res3 = await this.$API.spu.getBaseSaleAttrList();
      if (res3.code === 200) {
        this.$message.success("成功获取所有销售属性数据");
        this.baseSaleAttrList = res3.data;
      } else {
        this.$message.error("获取所有销售属性数据失败");
      }
    },
    // 获取特定spu下的销售属性
    async myGetSpuSaleAttrList() {
      const res = await this.$API.spu.getSpuSaleAttrList(this.eachSpuInfo.id);
      if (res.code === 200) {
        this.$message.success("成功获取所有销售属性数据");
        this.spuAttrValueListInTable = res.data;
        this.baseSaleAttrList = this.baseSaleAttrList.filter((eachBaseSale) => {
          return !this.spuAttrValueListInTable.find((eachSpuAttr) => {
            if (eachSpuAttr.baseSaleAttrId === eachBaseSale.id) {
              return true;
            }
          });
        });
      } else {
        this.$message.error("获取所有销售属性数据失败");
      }
    },
  },
  async mounted() {
    /*
      获取这个spu下的所有销售属性
    */
    await this.myGetAllTrademarkList();
    await this.myGetSpuImageList();
    await this.myGetBaseSaleAttrList();
    await this.myGetSpuSaleAttrList();
  },
};
</script>
