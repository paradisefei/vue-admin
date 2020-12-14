<template>
  <div>
    <Category
      @fromCategory="fromCategory"
      :disableSelect="isShowAddSpu"
    ></Category>

    <el-card class="box-card" v-show="isShowAddSpu">
      <el-button type="primary" icon="el-icon-plus" :disabled="isDisableAddSpu"
        >添加SPU</el-button
      >
      <el-table :data="allSpuInfoList" border class="elButton">
        <el-table-column type="index" label="序号" width="100" align="center">
        </el-table-column>
        <el-table-column prop="spuName" label="SPU名称"> </el-table-column>
        <!--
          整个表格使用attrInfoList的数据，是一个数组，这个数组中的每一项都是一个个的对象，并且对象中的属性名是相同的，每一个对象中的数据会渲染占一行
          这个prop属性就是指在一行中，渲染在该列的属性的名称
         -->
        <el-table-column prop="description" label="SPU描述"> </el-table-column>
        <el-table-column label="操作">
          <template v-slot="{ row }">
            <el-tooltip
              popper-class="atooltip"
              effect="light"
              content="添加SPU"
              placement="bottom"
            >
              <el-button
                type="primary"
                icon="el-icon-plus"
                size="mini"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              popper-class="atooltip"
              effect="light"
              content="修改SPU"
              placement="bottom"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="modifySpu(row)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              popper-class="atooltip"
              effect="light"
              content="查看所有SKU"
              placement="bottom"
            >
              <el-button
                type="primary"
                icon="el-icon-info"
                size="mini"
              ></el-button>
            </el-tooltip>

            <el-popconfirm title="确定删除吗">
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
      <!-- 分页器 -->
      <el-pagination
        class="pagination"
        :page-sizes="[3, 6, 9]"
        :page-size="size"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="current"
        layout="prev, pager, next, jumper, sizes, total"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <el-card class="box-card" v-show="!isShowAddSpu">
      <el-form ref="form" :model="eachSpuInfo" label-width="80px">
        <el-form-item label="SPU名称" placeholder="SPU名称">
          <el-input v-model="eachSpuInfo.spuName"></el-input>
        </el-form-item>
        <el-form-item label="品牌">
          <!--
            第一次渲染的时候trademarkList数组为空
           -->
          <el-select v-model="firstTrademarkId" placeholder="请选择品牌">
            <el-option
              v-for="eachTrademark in trademarkList"
              :key="eachTrademark.id"
              :label="eachTrademark.tmName"
              :value="eachTrademark.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="SPU描述">
          <el-input
            type="textarea"
            v-model="eachSpuInfo.description"
            placeholder="SPU描述"
          ></el-input>
        </el-form-item>
        <el-form-item label="SPU图片">
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
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="销售属性">
          <el-select v-model="checkSpuAttrValue" :placeholder="`还有${leftHowMany}项选择`">
            <el-option
              v-for="spuAttrValue in spuAttrValueList"
              :key="spuAttrValue.id"
              :label="spuAttrValue.saleAttrName"
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
            1.点击
           -->
          <el-table :data="spuAttrValueListInTable" border class="elButton">
            <el-table-column
              type="index"
              label="序号"
              width="100"
              align="center"
            >
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
                  v-for="spuSaleAttrValue in row.spuSaleAttrValueList"
                  :key="spuSaleAttrValue.id"
                  closable
                  >{{ spuSaleAttrValue.saleAttrValueName }}</el-tag
                >
                <el-button class="button-new-tag" size="small"
                  >+ 添加</el-button
                >
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
              <template>
                <el-popconfirm title="确定删除吗">
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
          <el-button type="primary">保存</el-button>
          <el-button @click="cancelModify">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
/*
  1.渲染
    1.三级分类下拉框复用
    2.添加SPU
    3.分页器
  2.获取数据
    1.定义api
      1.获取spu基本信息
        1.获取所有spu信息渲染在table中
      2.这个三级分类下的所有spu
      3.获取到三级列表的id时进行spu信息的获取
  3.点击修改SPU
*/
import Vue from "vue";
import Category from "@/components/Category";
import { tooltip } from "element-ui";
Vue.use(tooltip);
export default {
  name: "SpuList",
  data() {
    return {
      categoryId: {
        // 一级分类某项得id
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      // 是否显示添加SPU组件
      isShowAddSpu: true,
      // isShowAddSpu: false,
      // 分页器相关属性
      size: 3,
      current: 1,
      total: 0,
      allSpuInfoList: [],
      eachSpuInfo: {
        spuName: "",
        description: "",
      },
      // 所有品牌列表
      trademarkList: [],
      // 所有显示的图片
      spuImageList: [],
      // 所有销售属性数据
      spuAttrValueList: [],
      // 要渲染在表格中的销售属性值数据
      spuAttrValueListInTable: [],
      attrInfoList: [],
      // 销售属性中选择的某个属性
      checkSpuAttrValue: "",
    };
  },
  computed: {
    // 还有几项选择
    leftHowMany() {
      return this.spuAttrValueList.length - this.spuAttrValueListInTable.length;
    },
    // 是否禁用添加SPU按钮
    isDisableAddSpu() {
      return !this.categoryId.category3Id;
    },
    // 品牌列表中的第一个品牌的id
    firstTrademarkId() {
      console.log(this.trademarkList);
      if (!this.trademarkList.length) {
        return "";
      } else {
        return this.trademarkList[0].id;
      }
    },
  },
  methods: {
    // 添加销售属性
    addSaleAttr(id) {
      /*
        1.选择了某个销售属性，就把这个销售属性的属性值渲染在下面的表格中
          1.遍历，把该id的属性值列表存入到数组中
      */
      this.spuAttrValueListInTable.push(
        this.spuAttrValueList.find((spuAttr) => {
          if (spuAttr.id === id) {
            return true;
          }
        })
      );
      this.checkSpuAttrValue = "";
      // console.log(id);
    },
    // 上传图片
    handleRemove(file, fileList) {
      console.log(file, fileList);
    },
    handlePreview(file) {
      console.log(file);
    },
    // 取消保存
    cancelModify() {
      this.isShowAddSpu = true;
      this.eachSpuInfo = {
        spuName: "",
        description: "",
      };
    },
    // 点击修改spu
    async modifySpu(row) {
      /*
        1.来到修改组件
        2.显示spu名称
          1.改行能获取到的数据有
            1.名称
            2.描述
          2.要请求的数据有
            1.品牌
            2.图片
            3.销售属性
        3.给eachSpuInfo对象上的属性赋值
        4.分别进行请求，获取到要请求的数据来进行渲染
          1.获取品牌
          2.获取图片
          3.获取销售属性
      */
      this.isShowAddSpu = false;
      console.log(this.eachSpuInfo, row);
      this.eachSpuInfo = JSON.parse(JSON.stringify(row));
      // 获取品牌
      const res1 = await this.$API.spu.getAllTrademarkList();
      console.log(res1);
      if (res1.code === 200) {
        this.$message.success("成功获取所有品牌数据");
        this.trademarkList = res1.data;
      } else {
        this.$message.error("获取所有品牌数据失败");
      }

      // 获取所有图片
      const res2 = await this.$API.spu.getSpuImageList(row.id);
      console.log(res2);
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

      // 获取销售属性
      const res3 = await this.$API.spu.getSpuSaleAttrList(row.id);
      console.log(res3);
      if (res1.code === 200) {
        this.$message.success("成功获取所有销售属性数据");
        this.spuAttrValueList = res3.data;
      } else {
        this.$message.error("获取所有销售属性数据失败");
      }
    },
    // category获取到三级列表id时，触发事件
    async fromCategory(allSpuInfoList, categoryId) {
      /*
        1.获取到所有的spu列表数据
        2.触发时会传入两个数据
        3.还要把id都传过来
        4.获取到数据把数据渲染到组件中
        5.获取到和分页器相关的数据
        6.获取到三级分类数据时，接触按钮禁用
      */
      this.allSpuInfoList = allSpuInfoList;
      if (!Object.keys(categoryId).length) return;
      const { current, size } = this;
      this.categoryId = categoryId;
      console.log();
      const res = await this.$API.spu.getAllSpuInfoList({
        current,
        size,
        category3Id: this.categoryId.category3Id,
      });
      if (res.code === 200) {
        this.$message.success("allSpuInfoList获取成功");
        this.allSpuInfoList = res.data.records;
        this.toal = res.data.total;
        this.current = res.data.current;
        this.size = res.data.size;
      } else {
        this.$message.error("数据获取失败");
      }
    },
    handleSizeChange() {
      console.log(1);
    },
    handleCurrentChange() {
      console.log(1);
    },
  },
  components: {
    Category,
  },
  mounted() {
    // this.$API.spu.getAllSpuInfoList();
  },
};
</script>

<style scoped>
.elButton {
  width: 100%;
  margin: 20px 0;
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
