<template>
  <el-card class="box-card">
    <el-form ref="form" :model="eachSpuInfo" label-width="80px">
      <el-form-item label="SPU名称">
        <span>{{ eachSpuInfo.spuName }}</span>
      </el-form-item>
      <el-form-item label="SKU名称">
        <el-input placeholder="SKU名称" v-model="skuNameText">222</el-input>
      </el-form-item>
      <el-form-item label="价格(元)">
        <el-input-number
          placeholder="SKU价格"
          controls-position="right"
          v-model="skuPriceText"
          :min="1"
          :max="10"
          style="width: 100%"
          >333</el-input-number
        >
      </el-form-item>
      <el-form-item label="重量(千克)">
        <el-input-number
          placeholder="SKU重量"
          controls-position="right"
          v-model="skuWeightText"
          :min="1"
          :max="10"
          style="width: 100%"
          >444</el-input-number
        >
      </el-form-item>
      <el-form-item label="规格描述(千克)" prop="spuName">
        <el-input
          type="textarea"
          :rows="5"
          placeholder="SKU规格描述"
          v-model="skuDescriptionText"
          >555</el-input
        >
      </el-form-item>
      <el-form-item label="平台属性">
        <div v-for="attr in attrInfoList" :key="attr.id" class="saleAttrSelect">
          <span>{{ attr.attrName }}</span>
          <el-select v-model="attr.id" placeholder="请选择品牌">
            <el-option
              v-for="attrOption in attr.attrValueList"
              :key="attrOption.id"
              :label="attrOption.valueName"
              :value="attrOption.attrId"
            ></el-option>
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="销售属性">
        <div
          v-for="spuSaleAttr in spuSaleAttrList"
          :key="spuSaleAttr.id"
          class="saleAttrSelect"
        >
          <!--
          每一个下拉框绑定的数据
         -->
          <span>{{ spuSaleAttr.saleAttrName }}</span>
          <el-select
            v-model="spuSaleAttr.saleAttrName"
            placeholder="请选择品牌"
          >
            <el-option
              v-for="spuSaleOption in spuSaleAttr.spuSaleAttrValueList"
              :key="spuSaleOption.id"
              :label="spuSaleOption.saleAttrValueName"
              :value="spuSaleOption.id"
            ></el-option>
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="图片列表" placeholder="SKU规格描述">
        <el-table
          ref="multipleTable"
          :data="spuImageList"
          tooltip-effect="dark"
          style="width: 100%"
          border
        >
          <!-- @selection-change="handleSelectionChange" -->
          <el-table-column type="selection" width="80"> </el-table-column>
          <el-table-column label="图片" prop="imgUrl">
            <template v-slot="{ row }"
              ><img :src="row.imgUrl" width="150px"
            /></template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column prop="address" label="操作" show-overflow-tooltip>
            <el-button type="primary">设为默认</el-button>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="saveAddSku">保存</el-button>
        <el-button @click="cancelAddSku">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
/*
  1.添加sku
    1.渲染页面
      1.基本结构
      2.显示隐藏
    2.请求数据
      1.图片列表
        1.就是该spu的所有图片
        2.拿到spuId，发送请求
          1.如何在表格里面显示图片
        3.平台属性
          select对齐
*/
import { mapState } from "vuex";
export default {
  name: "addSku",
  data() {
    return {
      sku: {},
      tableData: [],
      spuImageList: [],
      eachSpuInfo: this.eachSpuInfoProps,
      // sku名称
      skuNameText: "",
      // sku价格
      skuPriceText: "",
      // sku重量
      skuWeightText: "",
      // sku描述
      skuDescriptionText: "",
      // 销售属性
      spuSaleAttrList: [],
      // 销售属性的双向绑定数据
      spuSaleAttrModel: "",
      // 平台属性
      attrInfoList: [],
      // 平台属性的双向绑定数据
      attrInfoModel: "",
    };
  },
  props: {
    eachSpuInfoProps: {
      type: Object,
    },
  },
  computed: {
    ...mapState({
      categoryId: (state) => state.category.categoryId,
    }),
  },
  methods: {
    // 保存
    saveAddSku() {
      this.$bus.$emit("toggleAddSKU", true);
    },
    // 取消保存
    cancelAddSku() {
      /*
        1.显示allSpu组件，有内容
          1.Category组件中每一个分类要有，addSpu组件中要渲染所有的spu内容
          2.要有每一个分类的话，就需要知道每一个category的id值，这样就又需要把categoryId传入到category组件中
          3.点击取消重新回到前一个页面时，整个是重新挂载的，此时又需要有id，以及根据id重新请求allSpu数据
      */
      this.$bus.$emit("toggleAddSKU", true);
    },
    // 获取所有图片
    async myGetSpuImageList() {
      // 发送请求获取所有图片
      const res = await this.$API.spu.getSpuImageList(this.eachSpuInfo.id);
      if (res.code === 200) {
        this.$message.success("成功获取所有图片数据");
        this.spuImageList = res.data;
      } else {
        this.$message.error("获取所有图片失败");
      }
    },
    // 获取销售属性
    async myGetSpuSaleAttrList() {
      // 发送请求获取所有图片
      const res = await this.$API.spu.getSpuSaleAttrList(this.eachSpuInfo.id);
      if (res.code === 200) {
        this.$message.success("成功获取该SPU下的所有已存在的销售属性");
        this.spuSaleAttrList = res.data;
      } else {
        this.$message.error("获取销售属性失败");
      }
    },
    // 获取平台属性
    async myGetAttrInfoList() {
      // 发送请求获取所有图片
      const res = await this.$API.attr.getAttrInfoList({
        category1Id: this.categoryId.category1Id,
        category2Id: this.categoryId.category2Id,
        category3Id: this.categoryId.category3Id,
      });
      if (res.code === 200) {
        this.$message.success("成功获取平台属性");
        this.attrInfoList = res.data;
      } else {
        this.$message.error("获取平台属性失败");
      }
    },
  },
  mounted() {
    this.myGetSpuImageList();
    // 获取销售属性
    this.myGetSpuSaleAttrList();
    // 获取平台属性
    this.myGetAttrInfoList();
  },
};
</script>
<style lang="sass" scoped>
>>>.el-input-number .el-input__inner
  text-align: left

.saleAttrSelect
  display: inline-block
  margin-right: 40px
</style>
