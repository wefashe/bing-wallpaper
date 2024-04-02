// 图片预加载 小图片加载完成后自动替换，大图片懒加载替换
function preloader(id, small_src, big_src){
  if(!small_src)return;
  var small_image = new Image();
  small_image.src = small_src;
  small_image.style.width = '100%';
  function imageComplete(e_id, s_src, b_src){
    var image_obj = document.getElementById(e_id)
    image_obj.src = s_src

    var big_image = new Image();
    big_image.src = b_src;
    big_image.style.width = '100%';
  }
  if(small_image.complete) {  
    imageComplete(id, small_src, big_src)
  }
  small_image.onload = function(){
    imageComplete(id, small_src, big_src)
  }

}

// 图片懒加载 可视区域判断是否加载完成，加载完成后自动替换
function lazyload() {
  var images = document.querySelectorAll('img[data-src]')
  for (let image of images) {
    if (!image.dataset.src) return
    var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if (image.offsetTop < clientHeight + scrollTop){
      let src =  image.dataset.src
      if(!src)return;
      
      var big_image = new Image();
      big_image.src = src;
      big_image.style.width = '100%';
      if(big_image.complete) {  
        image.src = src;
      }
      big_image.onload = function() {  
        image.src = src;
      }  
      // 判断图片是否加载完成
      if(image.complete) {  
        image.removeAttribute('data-src')
      }
      image.onload = function() {  
        image.removeAttribute('data-src')
      }  
    }
  }
}

// 防抖节流
function throttle(func, wait, immediate){
  let last = 0, timer = null;
  return function(...args) {
      const now = Date.now();
      const context = this;
      if (now - last < wait && !immediate) {
        // 防抖 用于控制函数触发的频率
        // 两次触发函数的时间小于延迟时间，走防抖逻辑
        clearTimeout(timer);
        timer = setTimeout(function() {
          last = now;
          func.apply(context, args);
        }, wait);
      } else {
        // 节流 触发必须间隔一段时间
        // 函数两次触发事件已经大于延迟，必须要给用户一个反馈，走节流逻辑
        last = now;
        func.apply(context, args);
      }
  };
}

// 图片加载错误的捕获及处理
window.addEventListener("error", function (event) {
    const target = event.target;
    if (target instanceof HTMLImageElement) {
      const curTimes = Number(target.dataset.retryTimes) || 0
      // 重试2次
      if (curTimes >= 2) {
        // 去除，防止滚动重复加载
        target.removeAttribute('data-src');
        target.classList.add("me-img-error");
      } else {
        target.dataset.retryTimes = curTimes + 1
        target.src = target.src
      }
    }
}, true);

// 图片下载
function download(url, fileName){
  const xhr = new XMLHttpRequest();
  xhr.open('GET',url, true)
  xhr.responseType = 'blob'
  // 请求成功
  xhr.onload = function () {
    if((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304){
      blobSaveAsFile(this.response, fileName);
    }     
  }
  // 监听下载进度
  xhr.addEventListener('progress', function (e) {
      let percent = Math.trunc(e.loaded / e.total * 100);
      // todo
  });
  // 错误处理
  xhr.addEventListener('error', function (e) {
      // todo
  });
  xhr.send()
}

// 文本下载
function stringSaveAsFile(str, fileName){
    const blob = new Blob([str], { type: 'text/plain' });
    blobSaveAsFile(blob, fileName);
}

function blobSaveAsFile(blob, fileName){
    var urlCreator = window.URL || window.webkitURL;
    // 将Blob转化为同源的url
    const imageUrl = urlCreator.createObjectURL(blob);
    const tag = document.createElement('a');
    tag.href = imageUrl;
    tag.download = fileName || ""
    tag.style.display = 'none';
    document.body.appendChild(tag);
    tag.click();
    setTimeout(function(){
      document.body.removeChild(tag);
      tag.remove();
      urlCreator.revokeObjectURL(blob);
    }, 100);
}


function imgloading(oImg) {
  var n = 0;
  var timer = setInterval(function () {
      n++;
      oImg.style.opacity = n / 100;
      if (n >= 100) {
          clearInterval(timer);
      }
      ;
  }, 5);
};

function setImage(db, pageIndex, pageSize){
  var stmt = db.prepare("select * from wallpaper w  order by enddate desc limit ($pageIndex * $pageSize), $pageSize");
  stmt.bind({ $pageIndex: pageIndex, $pageSize: pageSize });
  var image_list = document.getElementById('image-list')
  var prefix = 'https://cn.bing.com'
  while (stmt.step()) {
      var row = stmt.getAsObject();  
      var url = row.url.substring(0,row.url.indexOf('&'));
      var small_img_url = `${prefix}${url}&w=120`;
      var big_img_url = `${prefix}${url}&w=384&h=216`   
      var view_count = Math.floor(Math.random()*(100 - 1000) + 1000);
      // 渐进式图片
      var image_html = `<div class="w3-quarter w3-padding"> 
                          <div class="w3-card w3-round-large me-card">
                            <div class="me-img">
                              <a href = "${prefix}${row.copyrightlink}" target="_blank"> 
                                <img id="${row.enddate}" class="me-img w3-image" src="${small_img_url}" data-src="${big_img_url}"  title="${row.copyright}" alt="${prefix}${row.urlbase}" loading="lazy" style="width:100%;max-width:100%"> 
                              </a> 
                            </div>
                            <div class = "w3-padding-small">
                              <div class="w3-row w3-padding-small w3-tiny"><i class="fa fa-circle" style="color: #ff5745; font-weight: bold;"></i> 必应壁纸</div>
                              <div class="w3-row w3-padding-small me-img-title" title="${row.title}">${row.title}</div>
                              <div class="w3-row w3-padding-small w3-small me-meta">
                                <div class="w3-left"><i class="fa fa-clock-o"></i> ${row.enddate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3")}</div>
                                <div class="w3-right" style="margin-left:12px"><i class="fa fa-heart"></i> ${view_count}</div>
                                <div class="w3-right"><i class="fa fa-eye"></i> ${Math.floor(Math.random()*(view_count - 1000) + 1000)}</div>
                              </div>
                            </div>
                          </div>
                        </div>`
      image_list.innerHTML += image_html;  
      // 预加载
      preloader(row.enddate, small_img_url, big_img_url)
  }
}


function readDbFile(callback) {
    let config = {
      locateFile: () => "static/js/sql-wasm.wasm",
    };
    initSqlJs(config).then(function (SQL) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', "static/db/images.db", true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = e => {
          document.getElementById('me-load').classList.toggle('w3-hide');
          const uInt8Array = new Uint8Array(xhr.response); 
          callback(new SQL.Database(uInt8Array));
        };
        xhr.send(); 
    });
}
let pageIndex = 1, pageSize = 36
readDbFile(function(db){
  setImage(db,pageIndex,pageSize)
  // 懒加载
  lazyload()
  window.addEventListener('scroll', () => {
      // 获取页面高度
      var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      // 获取滚动高度
      var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      // 获取可视区域高度 这个不会变
      var clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
      if (scrollHeight - scrollTop - clientHeight < clientHeight/2 ){
        pageIndex ++
        setImage(db,pageIndex,pageSize)
      }
      throttle(lazyload, 200)();
  }, false);
});

// 封装DOMContentLoaded事件来检测页面DOM是否加载完毕
function ready(func){
  // 目前Mozilla、Opera和webkit 525+内核支持DOMContentLoaded事件
  if(document.addEventListener) {
      document.addEventListener('DOMContentLoaded', function() {
          document.removeEventListener('DOMContentLoaded',arguments.callee, false);
          func();
      }, false);
  } 
  // 如果IE
  else if(document.attachEvent) {
      // 确保当页面是在iframe中加载时，事件依旧会被安全触发
      document.attachEvent('onreadystatechange', function() {
          if(document.readyState == 'complete') {
              document.detachEvent('onreadystatechange', arguments.callee);
              func();
          }
      });
      // 如果是IE且页面不在iframe中时，轮询调用doScroll 方法检测DOM是否加载完毕
      if(document.documentElement.doScroll && typeof window.frameElement === "undefined") {
          try{
              document.documentElement.doScroll('left');
          }
          catch(error){
              return setTimeout(arguments.callee, 20);
          };
          func();
      }
  }
};


ready(function (event){
    console.log('DOM已被完全加载和解析');

}, false);
window.onload = function () {
  console.log('页面资源全部加载完毕');
}









