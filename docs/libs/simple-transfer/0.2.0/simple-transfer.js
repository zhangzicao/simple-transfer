/**
 * @name SimpleTransfer 一个简单的穿梭框
 * @author zhangzicao
 * @namespace SimpleTransfer
 * @requires jquery
 * @vesion 0.2.0
 * @param {object} option 配置
 * @param {string|object} option.elem=.simple-transfer-container 初始化的容器
 * @param {array} option.data 列表数据
 * @param {string} option.data[].id 列表数据id
 * @param {string} option.data[].name 列表数据name
 * @param {array} option.checkedIds 右侧数据id列表
 * @param {string} option.checkedIds[] 右侧数据项的id
 * @param {string} option.multiple 多选
 * @param {function} option.onChange 移动时触发
 * @property {function} getIdsAtRight 获取选中列表id集，返回一个id数组或id字符串（单选时为字符串）
 * @property {function} filterData 筛选数据列表，传入一个function，return true时为显示，false为隐藏
 * @return {object} 返回一个SimpleTransfer对象
 */
(function(root,factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS.
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals.
    root.SimpleTransfer = factory(root.jQuery);
  }
})(this,function(jquery){
  var $=jquery;

  function SimpleTransfer(option) {
    this.option = $.extend({
      elem: '.simple-transfer-container' //初始化的容器
      ,data: [] //数据
      ,checkedIds: [] //选中的数据id
      ,multiple:true //多选
      ,title:['请选择','请选择','已选列表']
      ,max:null
    },option);

    this.init()
  }

  SimpleTransfer.prototype.init=function () {
    var self=this;
    self.$container = $(self.option.elem);
    self.data1= self.option.data.length>0 && self.option.data[0] instanceof Array?self.option.data[0]:self.option.data
    self.data2= self.option.data.length>0 && self.option.data[0] instanceof Array?self.option.data[1]:[];
    self.isDataMerge = self.data1.length>0 && self.data2.length>0? true: false;
    self.multiple= self.option.multiple;
    self.title= self.option.title;
    self.onChange= self.option.onChange;
    self.checkedIds= [];

    //checkedIds处理
    if(typeof self.option.checkedIds=='string'){
      self.option.checkedIds=self.option.checkedIds.split(',')
      if(self.option.checkedIds[0]=='') delete self.option.checkedIds[0];
    }

    self.$container.find('.simple-transfer-col').remove()

    var col1= '<div class="simple-transfer-col simple-transfer-col-1 '+(!self.multiple||self.isDataMerge?"simple-transfer-chk-type-radio":"")+'">' +
        ' <div class="simple-transfer-col-title"><i class="simple-transfer-chk simple-transfer-chkall"></i>'+self.title[0]+'</div>' +
        '<ul class="simple-transfer-list">'
        ,col2= '<div class="simple-transfer-col simple-transfer-col-2 '+(!self.multiple||self.isDataMerge?"simple-transfer-chk-type-radio":"")+'">' +
        ' <div class="simple-transfer-col-title"><i class="simple-transfer-chk simple-transfer-chkall"></i>'+self.title[1]+'</div>' +
        ' <div class="simple-transfer-actions"><div class="simple-transfer-actions-one">+</div></div>' +
        ' <ul class="simple-transfer-list">'
        ,col3= '<div class="simple-transfer-col simple-transfer-col-3 '+(!self.multiple?"simple-transfer-chk-type-radio":"")+'">' +
        ' <div class="simple-transfer-col-title"><i class="simple-transfer-chk simple-transfer-chkall"></i>'+self.title[2]+'</div>' +
        ' <ul class="simple-transfer-list simple-transfer-checked-list"></ul>' +
        ' <div class="simple-transfer-actions">' +
        '   <span class="move-all-right">&gt;&gt;</span><span class="move-right">&gt;</span><span class="move-left">&lt;</span><span class="move-all-left">&lt;&lt;</span>' +
        ' </div>' +
        '</div>';
    $.each(self.data1,function (index,item) {
      col1+='<li data-id="'+item.id+'"><i class="simple-transfer-chk"></i><div class="simple-transfer-item-text">'+item.name+'</div></li>'
    })
    $.each(self.data2,function (index,item) {
      col2+='<li data-id="'+item.id+'"><i class="simple-transfer-chk"></i><div class="simple-transfer-item-text">'+item.name+'</div></li>'
    })
    col1+='</ul></div>'
    col2+='</ul></div>'
    self.$container.append(col1);
    if( self.data2.length >0) {
      self.$container.addClass('has-col-3').append(col2);
    }
    self.$container.append(col3);
    if( self.isDataMerge || !self.multiple) {
      self.$container.find('.move-all-left,.move-all-right').hide();
    }

    self.$checkList=self.$container.find('.simple-transfer-checked-list')

    self.moveToRightById(self.option.checkedIds,true);

    //阻止选中字体
    self.$container.on('selectstart', function(e) {
      e.preventDefault()
    })

    //全选
    self.$container.on('click','.simple-transfer-chkall', function(e) {
      if($(this).hasClass('checked')){
        $(this).closest('.simple-transfer-col').find('li').removeClass('checked')
      }else{
        $(this).closest('.simple-transfer-col').find('li').addClass('checked')
      }
      $(this).toggleClass('checked')
    })

    //选中
    self.$container.on('click','.simple-transfer-list li', function(e) {
      if((self.multiple && !self.isDataMerge) || ($(this).closest('.simple-transfer-col-3').length>0 && self.isDataMerge)){
        $(this).toggleClass('checked')
        var index=$(this).closest('.simple-transfer-col-1').length>0?1:$(this).closest('.simple-transfer-col-2').length>0?2:3
        self.updateCheckBox(index)
      }
      else{
        $(this).closest('.simple-transfer-list').find('.checked').removeClass('checked')
        $(this).addClass('checked')
      }
    })
    // 右移
    self.$container.on('click','.move-right', function () {
      self.moveCheckedToRight()
      self.onChange && self.onChange()
    })
    // 左移
    self.$container.on('click','.move-left', function () {
      self.moveCheckedToLeft()
      self.onChange && self.onChange()
    })
    // 全部右移
    self.$container.on('click','.move-all-right', function(e) {
      var idArr= self.$container.find('.simple-transfer-col-1 .simple-transfer-list li').not('.disabled-item').not('.disabled-notkey').map(function () {
        return $(this).data('id')+""
      }).get();
      self.moveToRightById(idArr)
      self.onChange && self.onChange()
    })
    // 全部左移
    self.$container.on('click','.move-all-left', function(e) {
      var idArr= self.$container.find('.simple-transfer-col-3 .simple-transfer-list li').not('.disabled-item').map(function () {
        return $(this).data('id')+""
      }).get();
      self.moveToLeftById(idArr)
      self.onChange && self.onChange()
    })
  }

  //获取右侧选中
  SimpleTransfer.prototype.getCheckedIdsAtRight= function() {
    var self=this;
    var idArr= self.$container.find('.simple-transfer-col-3 .simple-transfer-list .checked').not('.disabled-item').map(function () {
      return $(this).data('id')+""
    }).get();
    return idArr;
  }

  //获取左侧选中
  SimpleTransfer.prototype.getCheckedIdsAtLeft= function() {
    var self=this;
    if(self.data1.length>0 && self.data2.length>0){
      var idArr= [(self.$container.find('.simple-transfer-col-1 .simple-transfer-list .checked').not('.disabled-item').not('.disabled-notkey').data('id')||"")+'+'+(self.$container.find('.simple-transfer-col-2 .simple-transfer-list .checked').not('.disabled-item').not('.disabled-notkey').data('id')||"")]
    }else{
      var idArr= self.$container.find('.simple-transfer-col-1 .simple-transfer-list .checked').not('.disabled-item').not('.disabled-notkey').map(function () {
        return $(this).data('id')+""
      }).get();
    }
    return idArr;
  }

  //移动选中的到左侧
  SimpleTransfer.prototype.moveCheckedToLeft = function() {
    var self=this;
    var idArr=self.getCheckedIdsAtRight();
    if(idArr.length==0) return;
    self.moveToLeftById(idArr);
  }

  //移动到左侧
  SimpleTransfer.prototype.moveToLeftById = function(idArr,uncheckItem) {
    var self=this;
    var movefn=function (ids) {
      var id1=ids,
          id2;
      if(ids.indexOf('+')>-1){
        id1=ids.split('+')[0];
        id2=ids.split('+')[1];
      }
      if(self.checkedIds.indexOf(ids)>-1){
        self.checkedIds.splice(self.checkedIds.indexOf(ids),1)
      }
      if(!self.multiple || self.isDataMerge){
        self.$container.find('.simple-transfer-col-1 .checked').removeClass('checked')
        id2!=null && self.$container.find('.simple-transfer-col-2 .checked').removeClass('checked')
      }

      self.$container.find('.simple-transfer-col-1 [data-id="'+id1+'"]').removeClass('disabled-item')[uncheckItem?'removeClass':'addClass']('checked')
      id2!=null && self.$container.find('.simple-transfer-col-2 [data-id='+id2+']').removeClass('disabled-item')[uncheckItem?'removeClass':'addClass']('checked')

      self.$container.find('.simple-transfer-col-3 [data-id="'+ids+'"]').remove();
    }
    self.$container.find('.simple-transfer-col-1 .checked,.simple-transfer-col-2 .checked').removeClass('checked');
    if(idArr instanceof Array){
      $.each(idArr,function (index,ids) {
        movefn(ids)
      })
    }else{
      movefn(idArr)
    }
    self.updateCheckBox(1)
    self.data2.length>0 && self.updateCheckBox(2)
  }

  //移动选中的到右侧
  SimpleTransfer.prototype.moveCheckedToRight = function() {
    var self=this;
    var idArr=self.getCheckedIdsAtLeft();
    if(idArr.length==0) return;
    if(idArr[0].indexOf('+')==0 || idArr[0].indexOf('+')==idArr[0].length-1) {
      return;
    }
    if(!self.multiple && self.$container.find('.simple-transfer-checked-list li').length>0) return
    self.moveToRightById(idArr);
  }

  //移动到右侧
  SimpleTransfer.prototype.moveToRightById = function(idArr,uncheckItem) {
    var self=this;
    var movefn=function (ids) {
      var id1=ids,
          id2;
      if(ids.indexOf('+')>-1){
        id1=ids.split('+')[0];
        id2=ids.split('+')[1];
      }

      self.$container.find('.simple-transfer-col-1 [data-id="'+id1+'"]').addClass('disabled-item')
      id2!=null && self.$container.find('.simple-transfer-col-2 [data-id='+id2+']').addClass('disabled-item')

      var filteredData=$(self.data1).filter(function (i,item) {
        return id1==item.id
      }).get();
      var name1=filteredData[0].name;

      if(id2!=null){
        var filteredData2=$(self.data2).filter(function (i,item) {
          return id2==item.id
        }).get()
        if(filteredData2.length>0){
          name1+=" + "+filteredData2[0].name
        }
      }
      if(filteredData.length>0 && self.$container.find('.simple-transfer-col-3 [data-id="'+ids+'"]').length==0){
        self.$checkList.append('<li class="'+(uncheckItem?"":"checked")+'" data-id="'+ids+'"><i class="simple-transfer-chk"></i><div class="simple-transfer-item-text">'+name1+'</div></li>')
      }
    }
    self.$checkList.find('.checked').removeClass('checked');
    if(idArr instanceof Array){
      if(self.option.max && self.checkedIds.length+idArr.length>self.option.max){
        alert('最多选择'+self.option.max+'组')
        return;
      }
      $.each(idArr,function (index,ids) {
        movefn(ids)
      })
    }else{
      if(self.option.max && self.checkedIds.length>=self.option.max){
        alert('最多选择'+self.option.max+'组')
        return;
      }
      movefn(idArr)
    }
    self.updateCheckBox(3)
    self.checkedIds=(self.checkedIds||[]).concat(idArr)
  }

  //更新全选状态
  SimpleTransfer.prototype.updateCheckBox = function(colNum) {
    var self=this;
    if(self.$container.find('.simple-transfer-col-'+colNum).find('li').not('.disabled-item,.disabled-notkey,.checked').length>0
        || self.$container.find('.simple-transfer-col-'+colNum).find('li').not('.disabled-item,.disabled-notkey').length==0){
      self.$container.find('.simple-transfer-col-'+colNum+' .simple-transfer-chkall').removeClass('checked')
    }else{
      self.$container.find('.simple-transfer-col-'+colNum+' .simple-transfer-chkall').addClass('checked')
    }
  }

  //数据筛选，查询用
  SimpleTransfer.prototype.filterData = function(filterFn) {
    var self=this;
    $.each(self.data1,function (index,item) {
      if(filterFn(item)){
        //显示
        self.$container.find('.simple-transfer-col-1 li[data-id="'+item.id+'"]').removeClass('disabled-notkey');
      }else{
        //隐藏
        self.$container.find('.simple-transfer-col-1 li[data-id="'+item.id+'"]').addClass('disabled-notkey');
      }
    });
    self.data2.length>0 && $.each(self.data2,function (index,item) {
      if(filterFn(item)){
        //显示
        self.$container.find('.simple-transfer-col-2 li[data-id="'+item.id+'"]').removeClass('disabled-notkey');
      }else{
        //隐藏
        self.$container.find('.simple-transfer-col-2 li[data-id="'+item.id+'"]').addClass('disabled-notkey');
      }
    });
    self.updateCheckBox(1)
    self.data2.length>0 && self.updateCheckBox(2)
  }

  //获取右侧id列表
  SimpleTransfer.prototype.getIdsAtRight= function() {
    var self=this;
    var idArr= self.$container.find('.simple-transfer-col-3 .simple-transfer-list li').map(function () {
      return $(this).data('id')+""
    }).get();
    if(!self.multiple){
      idArr = idArr[0]||''
    }
    return idArr;
  }

  return SimpleTransfer;
})
