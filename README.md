# simple-transfer
``` bash
 一个简单的穿梭框
```
[demo/文档]( https://zhangzicao.github.io/simple-transfer)

## 介绍
基于jquery实现的穿梭框。

## 调用
#### 初始化：
``` javascript
var transfer1 = new SimpleTransfer({
  elem:"#transferBox1",
  title:["请选择测试数据",null,"已选的测试数据"],
  data:[
    {id:1,name:"测试数据1"},
    {id:2,name:"测试数据2"},
    {id:3,name:"测试数据3"},
    {id:4,name:"测试数据4"},
    {id:5,name:"测试数据5"},
    {id:6,name:"测试数据6"},
    {id:7,name:"测试数据7"},
    {id:8,name:"测试数据8"},
    {id:9,name:"测试数据9"}
  ],
  checkedIds:['1','3','7','8']
})
```

## 返回
> {object} SimpleTransfer对象

## 依赖
> jquery


## 目录
下面主要介绍几个重要的目录

``` bash
|-dist  代码发布目录
|-doc  文档和demo所在文件夹
```