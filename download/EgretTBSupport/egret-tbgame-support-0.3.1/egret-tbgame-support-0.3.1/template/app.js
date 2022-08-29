App({
  onLaunch(options) {
    // 第一次打开
    console.info('App onLaunch1');
  },
  onShow(options) {
    // 当应用启动，或从后台进入前台显示时触发
    if($global.egretonShow){
        $global.egretonShow()    
    }
  },
  onHide(options) {
    // 当应用从前台进入后台时触发
    if($global.egretonHide){
        $global.egretonHide()
    }
  },
});
