/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import shell from 'shelljs'

/**
 * 递归创建目录 同步方法
 * @param dir
 * @returns {boolean}
 */
export function mkdirsSync (dir) {
  if (fs.existsSync(dir)) {
    return true
  }
  else {
    if (mkdirsSync(path.dirname(dir))) {
      fs.mkdirSync(dir)
      return true
    }
  }
}

/**
 * 遍历目录文件 同步方法
 * @param dir 要遍历的文件目录
 * @param files 收集的文件列表
 * @param excludes 要排除的文件列表
 */
export function traverseDirSync (dir, files, excludes = null) {
  const list = fs.readdirSync(dir)
  list.forEach(function (file) {
    file = path.resolve(path.join(dir, file))
    if (excludes && excludes.indexOf(file) > -1) {
    }
    else{
      const stat = fs.statSync(file)
      if (stat && stat.isDirectory()) {
        traverseDirSync(file, files, excludes)
      }
      //文件
      else {
        files.push(file)
      }
    }
  })
}

/**
 * 删除目录
 * @param dir
 */
export function clearDirSync (dir) {
  let files = []
  if (fs.existsSync(dir)) {
    files = fs.readdirSync(dir)
    files.forEach(function (file, index) {
      const curPath = dir + '/' + file
      if (fs.statSync(curPath).isDirectory()) {
        clearDirSync(curPath)
      }
      else {
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(dir)
  }
}


/**
 * 规范日志
 */
export const colorconsole = {
  trace (...args) {
    console.trace(...args)
  },
  log (...args) {
    console.log(chalk.green(...args))
  },
  info (...args) {
    console.info(chalk.green(...args))
  },
  warn (...args) {
    console.warn(chalk.yellow.bold(...args))
  },
  error (...args) {
    console.error(chalk.red.bold(...args))
  },
  throw (...args) {
    throw new Error(chalk.red.bold(...args))
  }
}

/**
 * 转换babel模块名
 * @param moduleName
 * @returns {*}
 */
export function loadBabelModule (moduleName) {
  // 从当前js所在目录或者当前工作目录查找指定模块，没有找到则返回模块名
  const currentModulePath = path.resolve(__dirname, '..', 'node_modules', moduleName)
  // 当前运行目录
  const pwdModulePath = path.resolve(process.cwd(), 'node_modules', moduleName)
  if (fs.existsSync(currentModulePath)) {
    return currentModulePath
  }
  else if (fs.existsSync(pwdModulePath)) {
    return pwdModulePath
  }
  return moduleName
}


/**
 * 创建mainifest.json文件，如果已经存在，则拷贝到tmpDir中，如果不存在，从tplDir中拷贝
 * @param {*} tplDir 
 * @param {*} targetDir 
 * @param tmpDir
 * @param suggestPackNameJson 建议的名称，包含packageName 和projectName
 */
export function createMainifestJson(tplDir, targetDir, tmpDir, suggestPackNameJson, orientation = 'portrait'){
  // apk包名的正则表达式
  let reg = /^[a-zA-Z]+[0-9a-zA-Z_]*(\.[a-zA-Z]+[0-9a-zA-Z_]*)*$/
  let option = {}
  let manifestExist = false
  if (!suggestPackNameJson || !suggestPackNameJson.packageName || !suggestPackNameJson.projectName) {
    console.log(chalk.red('lack suggestPackJson config'))
    shell.exit(1)
  }

  // 判断target下是否有manifest.json文件
  if (!fs.existsSync(path.join(targetDir, 'manifest.json'))) {
    option = require(path.join(tplDir,'manifest.json'))
    let projectname = suggestPackNameJson.projectName
    let apkname = suggestPackNameJson.packageName
    if(!reg.test(apkname)){
      apkname = 'com.quickgame.demo';
      projectname = 'QuickgameDemo'
    }
    option['package'] = apkname
    option['name'] = projectname
    option['orientation'] = orientation
    let str = JSON.stringify(option);
    fs.writeFileSync(path.join(tmpDir, 'manifest.json'), str)
  }
  else {
    manifestExist = true
    option = require(path.join(targetDir, 'manifest.json'))
    if (targetDir != tmpDir) {//直接调用的时候，没有临时文件，可能会出现相同的场景
      copyFiles(path.join(targetDir, 'manifest.json'), tmpDir)
    }
    
    if(!reg.test(option['package'])){
      console.log(chalk.red('package incorrect in the file ' + path.join(targetDir, 'manifest.json')))
      shell.exit(1)
    }
  }
  return {
    option,
    manifestExist
  }
}

/**
 * 根据引擎，从配置文件中读取项目名称
 * @param {*} engine 
 * @param {*} cwdDir 
 * @param {*} pubDir 
 */
export function getSuggestPackNameJson (engine, cwdDir, pubDir) {
  if (engine === 'cocos') {
    if (fs.existsSync(path.join(pubDir,'.cocos-project.json'))) {
      let cocosProjectJson = null
      try {
        cocosProjectJson = require(path.join(pubDir,'.cocos-project.json'))
      }
      catch (e) {
      }
      if (cocosProjectJson && cocosProjectJson.projectName && cocosProjectJson.packageName) {
        return {
          projectName: cocosProjectJson.projectName,
          packageName: cocosProjectJson.packageName
        }
      }
    }
  }
  else if (engine === 'egret') {
    let projectJson = null
    let configPath = path.join(pubDir,'project.config.json')
    if(fs.existsSync(configPath)) {
      try {
        projectJson = require(configPath)
      }
      catch (e) {
      }
      if (projectJson && projectJson.projectname) {
        return {
          projectName: projectJson.projectname,
          packageName: projectJson.projectname
        }
      }
    }
  }
  let projectname = path.basename(cwdDir)
  let apkname = 'com.' + projectname
  return {
    projectName: projectname,
    packageName: apkname
  }
}

/**
 * 如果目标文件有，不拷贝，如果没有，从模板中拷贝到目标文件
 * @param {*} quickgameDir 
 * @param {*} _root 
 * @param {*} config 
 * @param {*} isDev 
 */
export function copySignFile(quickgameDir, _root, config, isDev) {
  //检查签名文件，如果是dev模式，缺少sign文件，从打包项目中拷贝，如果是发布，需要release下有对应签名文件
  let signDir = path.join(quickgameDir, config.SIGN_DIR_NAME)
  let _sign = path.resolve(_root, './sign') // 自带的签名文件

  if(!fs.existsSync(signDir)){
    console.log(chalk.yellow(`### no sign files ### copy default to the project`))
    copyFiles(_sign, signDir)
  }
  let signEnvDir = isDev ? config.SIGN_DEBUG_DIR : config.SIGN_RELEASE_DIR
  let privatekey = path.join(signDir, signEnvDir, config.PRIVATE_FILE_NAME)
  let certificate = path.join(signDir, signEnvDir, config.CERTIFICATE_FILE_NAME)
  if(!fs.existsSync(privatekey) || !fs.existsSync(certificate)) {
    if (!isDev) {
      console.log(chalk.red(`### no release sign files ### please make sure that the sign files exist:privatekey:${privatekey}, certificate:${certificate}`))
      shell.exit(1)
    }
    else {
      console.log(chalk.yellow(`### no sign files ### copy default to the project`))
      copyFiles(path.join(_sign, signEnvDir), path.join(signDir, signEnvDir))
    }
  }
  return {
    privatekey:privatekey,
    certificate:certificate
  }
}

function getOrientation(pubDir, engine) {
  let orientation = 'portait'
  if (engine == 'cocos') {
    let settingPath = path.resolve(pubDir, './src/settings.js')
    if(fs.existsSync(settingPath)) {
      global.window = {}
      try {
        require(settingPath)
        orientation = window['_CCSettings'] && window['_CCSettings']['orientation'] ? window['_CCSettings']['orientation'] : orientation
      }
      catch (e) {
        console.log(chalk.yellow(`加载Settings文件失败，无法获得orientation`))
      }
      
    }
  }
  else if (engine == 'laya' || engine == 'egret') {
    let settingPath = path.resolve(pubDir, './game.json')
    if(fs.existsSync(settingPath)) {
      try {
        let setting = require(settingPath)
        orientation = setting.deviceOrientation ? setting.deviceOrientation : orientation
      }
      catch (e) {
        console.log(chalk.yellow(`加载Settings文件失败，无法获得orientation`))
      }
    }
  }
  return orientation
}

/**
 * 生成对应的目录，处理manifest.json和logo.png，sign签名文件
 * @param {*} pubDir 生成的发布目录
 * @param {*} cwdDir 当前运行时目录
 * @param {*} config 
 * @param {*} engineConfig 
 * @param {*} engine 
 * @param {*} isDev 
 */
export function mkBuildDirs (pubDir, cwdDir, config, engineConfig, engine, isDev) {
  let quickgameDir = path.resolve(pubDir,'../',(engine == 'egret' ? getProjectName(cwdDir) + "_" : "")  + config.QUICKGAME_DIR)
  let quickgameTmpDir = path.resolve(pubDir,'../', config.QUICKGAME_DIR_TMP)
  let distDir = path.join(quickgameDir, config.DEST_DIR)

  fs.emptyDirSync(quickgameTmpDir)

  let _root = path.resolve(__dirname, '../')//本项目根目录
  let _tplDir = path.join(_root, 'tpl')
  let _tplEngine = path.join(_root, engine)
  
  let orientation = getOrientation(pubDir, engine)
  let manifestJson = createMainifestJson(_tplDir, quickgameDir, quickgameTmpDir, getSuggestPackNameJson(engine, cwdDir, pubDir), orientation)

  //文件如果存在，写到临时文件中；如果不存在，从模板里写到临时文件中
  engineConfig.DEFAULT_TPL_FILES && engineConfig.DEFAULT_TPL_FILES.forEach((tplFile) => {
    let tplFileAbs = path.join(quickgameDir, tplFile)
    if (fs.existsSync(tplFileAbs)) {
      copyFiles(tplFileAbs, quickgameTmpDir)
    }
    else {
      copyFiles(path.join(_tplDir, tplFile), quickgameTmpDir)
    }
  })

  //单独处理logo文件；分文件已经存在和没有存在来处理
  if (manifestJson.option.icon) {
    let iconPath = path.resolve(path.join(quickgameDir, manifestJson.option.icon))
    if (fs.existsSync(iconPath)) {
      copyFiles(iconPath, path.join(quickgameTmpDir,path.dirname(manifestJson.option.icon)))
    }
    else {
      copyFiles(path.join(_tplDir, 'logo.png'), quickgameTmpDir)
    }
  }
  

  if (fs.existsSync(path.join(quickgameDir, config.SIGN_DIR_NAME))) {
    let signFileDir = path.join(quickgameTmpDir, config.SIGN_DIR_NAME)
    copyFiles(path.join(quickgameDir, config.SIGN_DIR_NAME), signFileDir)
  }

  //清空quickgame文件夹
  fs.emptyDirSync(quickgameDir)

  //将临时文件夹的内容写回生成目录
  copyFiles(quickgameTmpDir, quickgameDir)

  //写入默认文件
  if (fs.existsSync(_tplEngine) && engineConfig.DEFAULT_TPL_FILES_JS)
   engineConfig.DEFAULT_TPL_FILES_JS.forEach((tplFile) => {
    copyFiles(path.join(_tplEngine, tplFile), quickgameDir)
  })

  fs.ensureDirSync(distDir)
  console.log(chalk.green(`[准备工作]build&dist 文件夹已删除, manifest配置文件已生成`))

  //检查签名文件，如果是dev模式，缺少sign文件，从打包项目中拷贝，如果是发布，需要release下有对应签名文件
  let signFiles = copySignFile(quickgameDir, _root, config, isDev)

  fs.removeSync(quickgameTmpDir)
  return {
    signFiles:signFiles,
    distDir:distDir,
    quickgameDir:quickgameDir,
    manifestJson:manifestJson
  }
}

/**
 * 根据文件夹名字生成快应用的文件夹名称
 * @param {*} dir 
 */
function getProjectName(dir) {
  let dirName = path.basename(dir)
  return dirName.replace('wxgame','')
}
/**
 * 拷贝文件，如果文件已经存在，不会覆盖
 * @param {string} src 
 * @param {string} dest 
 * @param {Array} excludeExts 不拷贝的文件后缀
 * @param {Array} excludes 不拷贝的文件列表
 * @param forceCopy 是否强制覆盖文件
 */
export function copyFiles (src, dest, excludeExts = null, excludes = null, forceCopy = false) {
  let stat = fs.statSync(src)
  if(stat.isDirectory()) {
    const files = []
    // 遍历收集文件列表
    excludes = excludes || []
    traverseDirSync(src, files, excludes)
    files.forEach(file => {
      const relative = path.relative(src, file)
      const finalPath = path.resolve(path.join(dest, relative))
      //console.log('rf',relative,finalPath)
      if (!fs.existsSync(finalPath)) {
        if (excludeExts && excludeExts.length > 0 && excludeExts.indexOf(path.extname(file)) > -1) {
        }
        else {
          fs.copySync(file, finalPath)
        }
      }
      else {
        if (!forceCopy) {
          console.log(chalk.white(`[信息]文件: ${finalPath} 已存在`))
        }
        else {
          fs.copySync(file, finalPath)
        }
      }
    })
  }
  else {
    if (excludeExts && excludeExts.length > 0 && excludeExts.indexOf(path.extname(src)) > -1) {
      //console.log('not copy', src)
    }
    else {
      fs.copySync(src, path.resolve(path.join(dest, path.basename(src))))
    }
  }
}