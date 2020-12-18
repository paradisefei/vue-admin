<template>
  <el-card class="box-card">
    <el-form ref="form" :model="sku" :rules="rules" label-width="80px">
      <el-form-item label="SPU名称">
        <span>{{ eachSpuInfo.spuName }}</span>
      </el-form-item>
      <el-form-item label="SKU名称" prop="skuName">
        <el-input placeholder="SKU名称" v-model="sku.skuName">222</el-input>
      </el-form-item>
      <el-form-item label="价格(元)" prop="price">
        <el-input-number
          placeholder="SKU价格"
          controls-position="right"
          v-model="sku.price"
          :min="1"
          :max="10"
          style="width: 100%"
          >333</el-input-number
        >
      </el-form-item>
      <el-form-item label="重量(千克)" prop="weight">
        <el-input-number
          placeholder="SKU重量"
          controls-position="right"
          v-model="sku.weight"
          :min="1"
          :max="10"
          style="width: 100%"
          >444</el-input-number
        >
      </el-form-item>
      <el-form-item label="规格描述" prop="skuDesc">
        <el-input
          type="textarea"
          :rows="5"
          placeholder="SKU规格描述"
          v-model="sku.skuDesc"
          >555</el-input
        >
      </el-form-item>
      <el-form-item label="平台属性" prop="skuAttrValueList">
        <!--
          1.一个数组中有多个对象，这每一个对象中的数据都可以渲染成一个下拉列表，现在我要获取到这每一个下拉列表的值
          2.使用数组来获取这些下拉列表的值，数组的话就需要指定哪个是哪个，那这样的话就用下标来指定哪个是哪个，最后得到一个保存有每一个下拉列表值的数组
          3.数组，保存每一个下拉列表的值
         -->
        <div
          v-for="(attr, index) in attrInfoList"
          :key="attr.id"
          class="saleAttrSelect"
        >
          <span>{{ attr.attrName }}</span>
          <el-select
            v-model="collectSkuAttrValueList[index]"
            placeholder="请选择品牌"
          >
            <el-option
              v-for="attrOption in attr.attrValueList"
              :key="attrOption.id"
              :label="attrOption.valueName"
              :value="`${attrOption.attrId}-${attrOption.id}`"
            ></el-option>
            <!--
              左边:attrId
              右边:valueId
             -->
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="销售属性" prop="skuSaleAttrValueList">
        <div
          v-for="(skuSaleAttr, index) in spuSaleAttrList"
          :key="skuSaleAttr.id"
          class="saleAttrSelect"
        >
          <!--
          每一个下拉框绑定的数据
         -->
          <span>{{ skuSaleAttr.saleAttrName }}</span>
          <el-select
            v-model="collectSkuSaleAttrValueList[index]"
            placeholder="请选择品牌"
          >
            <el-option
              v-for="skuSaleOption in skuSaleAttr.spuSaleAttrValueList"
              :key="skuSaleOption.id"
              :label="skuSaleOption.saleAttrValueName"
              :value="`${skuSaleOption.spuId}-${skuSaleOption.id}`"
            ></el-option>
            <!--
              左边:spuId
              右边:saleAttrValueId
             -->
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="图片列表" prop="skuImageList" ref="skuImageList">
        <!--
          1.图片被选中时，修改最终要提交到服务器的图片的属性
         -->
        <el-table
          ref="multipleTable"
          :data="spuImageList"
          tooltip-effect="dark"
          style="width: 100%"
          border
          @selection-change="handleSelectionChange"
        >
          <!-- @selection-change="handleSelectionChange" -->
          <el-table-column type="selection" width="80">
            <!-- reserve-selection
            row-key="id" -->
            <!--
            更新之后会保留之前的状态
           -->
          </el-table-column>
          <el-table-column label="图片" prop="imgUrl">
            <template v-slot="{ row }"
              ><img :src="row.imgUrl" width="150px"
            /></template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称"> </el-table-column>
          <el-table-column prop="address" label="操作" show-overflow-tooltip>
            <template v-slot="{ row }">
              <el-tag type="success" v-if="row.isDefault">默认</el-tag>
              <el-button type="primary" @click="setDefault(row)" v-else
                >设为默认</el-button
              ></template
            >
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
        4.绑定问题
          1.处理skuAttrValueList
          2.对图片的默认和选中的处理
          3.设置默认图片
    3.表单校验
*/
import { mapState } from "vuex";
export default {
  name: "addSku",
  data() {
    return {
      sku: {
        // 平台属性
        skuAttrValueList: [],
        // 销售属性
        skuSaleAttrValueList: [],
        // 所有选中的照片
        skuImageList: [],
        // 默认照片地址
        skuDefaultImg: "",
      },
      // 收集平台属性
      collectSkuAttrValueList: [],
      // 收集销售属性
      collectSkuSaleAttrValueList: [],
      // 所有图片
      spuImageList: [],
      eachSpuInfo: this.eachSpuInfoProps,
      // 销售属性
      spuSaleAttrList: [],
      // 平台属性
      attrInfoList: [],
      rules: {
        skuName: [
          {
            required: true,
            message: "请输入sku名称",
            trigger: "blur",
          },
        ],
        price: [
          {
            required: true,
            message: "请输入sku价格",
            trigger: "blur",
          },
        ],
        weight: [
          {
            required: true,
            message: "请输入sku重量",
            trigger: "blur",
          },
        ],
        skuDesc: [
          {
            required: true,
            message: "请输入sku规格描述",
            trigger: "blur",
          },
        ],
        skuImageList: [
          {
            required: true,
            validator: this.skuImageListValidator,
          },
        ],
        // 平台属性校验
        skuAttrValueList: [
          {
            required: true,
            validator: this.skuAttrValueListValidator,
          },
        ],
        // 销售属性校验
        skuSaleAttrValueList: [
          {
            required: true,
            validator: this.skuSaleAttrValueListValidator,
          },
        ],
      },
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
    // 销售属性校验
    skuSaleAttrValueListValidator(rules, value, callback) {
      /*
        1.销售属性每一个下拉框都需要有值
      */
      const res = this.collectSkuSaleAttrValueList.reduce(
        (p, c) => (c ? (p = p + 1) : p),
        0
      );
      if (this.spuSaleAttrList.length !== res) {
        callback(new Error("必须选择每一个销售属性"));
        return;
      }
      callback();
      // return;
    },
    // 平台属性校验
    skuAttrValueListValidator(rules, value, callback) {
      /*
        1.平台属性每一个下拉框都需要有值
      */
      const res = this.collectSkuAttrValueList.reduce(
        (p, c) => (c ? (p = p + 1) : p),
        0
      );
      if (this.attrInfoList.length !== res) {
        callback(new Error("必须选择每一个平台属性"));
        return;
      }
      callback();
    },
    // 校验图片列表
    skuImageListValidator(rules, value, callback) {
      /*
        1.最终提交的照片数组中，一定要有一个默认图片
      */
      if (!this.sku.skuImageList.length) {
        callback(new Error("必须至少提交一张图片"));
        return;
      }
      // 在sku中找是否有默认图片
      const res = this.sku.skuImageList.find((skuImage) => skuImage.isDefault);
      if (!res) {
        callback(new Error("必须至少提交一张默认图片"));
        return;
      }
      callback();
    },
    // 设置默认图片
    setDefault(row) {
      /*
        1.同一时间只有一个默认值，遍历所有图片，再把当前行的设为默认
        2.被选中以后，再设置默认的话，sku.skuImageList中的数据不会改
        3.先选默认，再选择
        4.先选择，再默认
          1.选择了，所以在sku中就已经存在了，设置默认时就

        1.判断sku中有没有这个元素
          1.如果sku中有，直接在sku中设置响应式的isDefault属性，但要先把sku中其它的isDefault先设置为false
          2.如果sku中没有，就说明没有点击复选框，
      */

      const res = this.sku.skuImageList.find((skuImg) => skuImg.id === row.id);
      // 如果已经保存在sku中了
      if (res) {
        this.sku.skuImageList = this.sku.skuImageList.map((spuImage) => {
          if (spuImage.id === res.id) {
            this.$set(spuImage, "isDefault", true);
          } else {
            spuImage.isDefault = false;
          }
          return spuImage;
        });
      } else {
        // 如果还没有保存在sku中
        // 先把sku中所有的isDefault设为false
        this.sku.skuImageList = this.sku.skuImageList.map((spuImage) => {
          return {
            ...spuImage,
            isDefault: false,
          };
        });
      }

      this.spuImageList.forEach((spuImage) => {
        /*
          1.遍历，把所有的Default都设为false
        */
        if (spuImage.isDefault) {
          spuImage.isDefault = false;
        }
      });
      this.$set(row, "isDefault", true);
      this.sku.skuDefaultImg = row.imgUrl;
    },
    // 点击表格的复选框
    handleSelectionChange(e) {
      /*
        1.第一个参数，是一个数组，数组中保存一个个的对象，这些对象就是该行的图片信息，顺序是点击的顺序
        2.只有一个参数
        3.点击了某个复选框后，就把这个数组赋值到sku中，也就是最终要提交的所有被选中的图片
          1.深拷贝
        4.点击都在spuImageList的基础上修改
          1.在spuImageList上加上一个表示选中的标识
            1.找到e的最后一个元素，然后加上选中标识
            2.我是在选择了复选框之后才会在sku中添加的，在设置默认的时候只是修改的所有图片中的数据，所以在先选择之后再设置默认时，sku中的数据状态是不会改变的。我现在要是实现的就是当
            我在选择了之后再去设置默认的话，sku中的数据状态会变
      */
      if (!e.length) {
        this.sku.skuImageList = [];
        return;
      }
      this.sku.skuImageList = e.map((skuImg) => {
        const sImg = {
          ...skuImg,
          spuImgId: skuImg.spuId,
        };
        // this.$set(sImg, "isDefault", false);
        return sImg;
      });
    },
    // 保存
    async saveAddSku() {
      /*
        1.保存sku的api
        2.处理skuAttrValueList
        3.一开始这个sku里面的销售属性的值是字符串的，如果这里又把一个一个的对象push进去的话，在下一次保存的时候就变成了一个个的对象，那对象的话就没有办法使用split了
       */
      // 处理得到平台属性的最终值
      this.sku.skuAttrValueList = this.collectSkuAttrValueList.map(
        (skuAttrValue) => {
          const [attrId, valueId] = skuAttrValue.split("-");
          return {
            attrId: +attrId,
            valueId: +valueId,
          };
        }
      );
      // 处理得到销售属性的最终值
      this.sku.skuSaleAttrValueList = this.collectSkuSaleAttrValueList.map(
        (skuSaleAttr) => {
          const [spuId, saleAttrValueId] = skuSaleAttr.split("-");
          return {
            spuId: +spuId,
            saleAttrValueId: +saleAttrValueId,
          };
        }
      );
      // 处理得到图片的最终值
      this.sku.skuImageList = this.sku.skuImageList.map((skuImage) => {
        /*
          1.得到的是sku中的skuImageList
            1.isDefault
            2.isCheck
            3.所有被选中的图片才会被添加到sku.skuImageList中
            4.我点击复选框时改变的就是sku.skuImageList中的数据
        */
        return {
          ...skuImage,
          spuImgId: skuImage.id,
        };
      });

      const data = {
        ...this.sku,
        category3Id: this.categoryId.category3Id,
        isSale: "",
        spuId: this.eachSpuInfo.id,
        tmId: this.eachSpuInfo.tmId,

        // skuDefaultImg: "",
        // skuImageList: this.spuImageList,
      };
      this.$refs.form.validate(async (value) => {
        if (value) {
          await this.$API.sku.saveSkuInfo(data);
          this.$bus.$emit("toggleAddSKU", true);
        }
      });
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
