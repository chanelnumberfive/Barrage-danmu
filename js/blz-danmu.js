// JavaScript Document
+ function ($) {
   'use strict';
   
	//弹幕构造函数	
    function Danmu(obj){
		obj=obj||{};
		this.elem=obj.elem||null;
		this.clears={indexs:[],timer:[]};
		this.index=obj.index||0;
		this.newIndex=obj.newIndex||0;
		this.time=obj.time||16;
		this.displacement=obj.displacement||$(window).width();
		this.data=obj.data||[];
		this.spacing=obj.spacing||$(window).width()/6;
		this.parallax=obj.parallax||5;
		this.isOpen=true;
	}
	
	//发送弹幕消息
    Danmu.prototype.sendWish=function(data) {
		this.newIndex=this.newIndex+1;
        this.data.splice(this.newIndex,0, data);
    };
	
    //为每个弹幕盒子分配一条消息
    function assignMessage($target, data) {
        var name = data.name;
        var dl = document.createElement('dl');
        $(dl).html('<dt class="blz-dial-title" aria-label="' + name + '"><img src="' + data.url + '" alt="' + name + '" title="' + name + '"></dt><dd class="blz-dial-para">' +name+':“'+ data.words + '”</dd>');
        $target.append($(dl));
        return $(dl);
    }

    //获取可用的数组元素的索引
	function getIndex(a){
		var l;
		if(a.indexs.length>0){
			l=a.indexs.shift();
		}else{
			l=a.timer.length;
		}
		return l;
	}
	//为元素添加偏移量,运行完毕后清除该元素
    function addAnimate($target, cssObject, t,a) {//参数a为数组集合是弹幕实例中的属性clears
		setTimeout(function () {
			$target.css(cssObject);
			setTimeout(function () {
				$target.remove();
			}, t);
        }, 30);//原设置时间为0，经测试效果不理想，改为30后，效果正常
    }

    //计算动画过渡时间
    function getTimes(w,data) {
       	var t = data.time * (data.displacement + w) / data.displacement;
        return t;
    }
	
	//添加弹幕消息
	function addDanmu(data,elem){
		if (data.data.length !== 0&&data.isOpen===false) {
			if(data.index >= data.data.length){data.newIndex=data.index = 0;}
			data.newIndex = data.newIndex>data.index?data.newIndex:data.index;
			var $target = assignMessage($(elem), data.data[data.index++]);
			var w=$target.width()+data.spacing;
			var t = getTimes(w,data);
			var a=data.clears;
			var l=getIndex(a);
			addAnimate($target, {
				'-webkit-transform': 'translate(' + (-data.displacement - w) + 'px)',
				'-webkit-transition-duration': t - data.parallax + 's',
				'transform': 'translate(' + (-data.displacement - w) + 'px)',
				'transition-duration': t - data.parallax + 's'
			}, (t - data.parallax) * 1000,a);
			a.timer[l]=setTimeout(function () {
				a.indexs.push(l);
				addDanmu(data,elem);
			}, 1000 * (t - data.parallax) * w / (data.displacement + w));
		}
	}
	
    //弹幕初始化
	$.fn.initDanmu=function(obj){
		return this.each(function(index,elem){
			$(elem).data('blz-danmu',new Danmu(obj));
		});
	};
	$('[data-blz-danmu]').initDanmu();
	
	//发送弹幕消息
	$.fn.sendWish=function(data){
		return this.each(function(index,elem){
			$(elem).data('blz-danmu').sendWish(data);
		});
	};
	//开始弹幕
    $.fn.danmuOpen=function() {
        return this.each(function(index,elem){
			var $elem=$(elem);
			var data=$elem.data('blz-danmu');
			var $danmu=$elem.children('li');
			if(data.isOpen===false){return false;}//防止重复开启弹幕及花屏
			data.isOpen=false;
			$danmu.each(function(index, eleme) {
				addDanmu(data,eleme);
            });
		});
    };
	$.fn.danmuClose=function(){
		return this.each(function(index,elem){
			var $elem=$(elem);
			var data=$elem.data('blz-danmu');
			var a=data.clears;
			if(data.isOpen===true){return false;}
			data.isOpen=true;
			a.indexs=[];
			//$elem.find('dl').css({'opacity':0,'z-index':-1});
			$elem.find('li').empty();
			a.timer.forEach(function(b){
				a.indexs[a.indexs.length]=a.indexs.length;
				clearTimeout(b);
			});
		});
	};
}(window.Zepto||window.jQuery);