import path from 'path'

import fs from 'fs-extra'
import chalk from 'chalk'
import shell from 'shelljs'

import browserify from 'browserify'
import globby from 'globby'
import babelify from 'babelify'
import gulp from 'gulp'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import sourcemaps from 'gulp-sourcemaps'
import uglify from 'gulp-uglify'

const preludePath = path.resolve(__dirname, '../../prelude/browserify_prelude_src.js');
const prelude = fs.readFileSync(preludePath, 'utf8')
import { sign } from '../sign/signer'
import * as CONFIG from '../config/config'

import {
  traverseDirSync,
  loadBabelModule,
  copyFiles
} from '../utils'

/**
 * 不能存在main的包
 * 包名不能冲突，root必须存在
 * @param {JSON} manifestJson 
 */
export function checkSubpackageConf(projectDir, manifestJson){
  let tmpPack = {}
  manifestJson.subpackages.forEach((subpackage) => {
    if(subpackage.name && subpackage.root) {
      if (tmpPack[subpackage.name]){
        console.log(chalk.red(`[配置错误]分包名重复： ${subpackage.name}`))
        shell.exit(1)
      }
      else if(subpackage.name  == CONFIG.MAIN_PACK_NAME) {
        console.log(chalk.red(`[配置错误]分包名称不能为main： [${subpackage.name}]`))
        shell.exit(1)
      }
      else {
        let subpackRoot = path.resolve(projectDir, subpackage.root)
        if (fs.existsSync(subpackRoot)) {
          let stat = fs.statSync(subpackRoot)
          if (stat.isDirectory()){
            tmpPack[subpackage.name] = subpackage
          }
          else {//文件必须是js
            if (path.extname(subpackage.root) === '.js') {
              tmpPack[subpackage.name] = subpackage
            }
            else {
              console.log(chalk.red(`[配置错误]分包[${subpackage.name}] root必须是目录或者.js文件`))
              shell.exit(1)
            }
          }
        }
        else {
          console.log(chalk.red(`[配置错误]分包[${subpackage.name}] root 不存在`))
          shell.exit(1)
        }
      }
    }
    else {
      console.log(chalk.red(`[配置错误]分包配置必须包含name和root属性`))
      shell.exit(1)
    }
  })
  console.log(chalk.green(`### 分包配置检查完成 ### 准备打包`))
}

/**
 * 将目标文件夹打包成rpk文件
 * @param {*} rpkName 包名,可以为空
 * @param {*} targetDir 
 * @param {*} distDir 
 * @param {*} manifestJson 
 * @param {*} signFiles 签名文件
 * @param {*} isDev
 */
export async function signDir(rpkName, targetDir, distDir, manifestJson, signFiles, isDev) {
  return new Promise((resolve, reject)=> {
    let name = rpkName ? rpkName : manifestJson['package']
    console.log(chalk.green(`### 开始签名rpk ###: ${name}`))
    sign({
      input: targetDir,
      output: distDir,
      rpkName: name,
      signFiles: signFiles
    },isDev,(rpkFile) => {
      console.log(chalk.green(`### 完成签名rpk ###: ${rpkFile}`))
      resolve()
    })
    
  })
}

/**
 * 
 * @param  dir 要构建的目录/文件
 * @param targetDir 目标目录
 * @param isMain 是否主包
 * @param hasSub 
 * @param excludes 排除的文件
 * @param exposeModules
 */
export async function buildDir(isBuildJs, dir, targetDir, isMain, hasSub, excludes = [], exposeModules = {}, isDev = true) {
  //console.log('构建目录',dir,isMain,excludes)
  fs.ensureDirSync(targetDir)
  //注意，打包文件夹还要排除
  if(isMain) {
    excludes.push(path.resolve(dir, CONFIG.QUICKGAME_DIR))
    excludes.push(path.resolve(dir, CONFIG.SIGN_DIR_NAME))
    excludes.push(path.resolve(dir, CONFIG.BUILD_PATH))
    excludes.push(path.resolve(dir, CONFIG.DEST_DIR))
    CONFIG.EXCLUDES.forEach((file)=>{
      excludes.push(path.resolve(dir, file))
    })
  }
  
  try {
    if (isBuildJs){//cocos的js不打包，已经打过一次了
      console.log(chalk.green(`### 开始构建js ### 包名： ${dir}`))
      await buildJs(dir, targetDir, isMain, hasSub, excludes, exposeModules, isDev)
      console.log(chalk.green(`### js构建完成 ### 包名： ${dir}`))
      copyFiles(dir, targetDir, ['.js'], excludes)
    }
    else{
      copyFiles(dir, targetDir,[],excludes)
    }
    
  }
  catch(err){
    console.log(chalk.red(`### 构建js失败 ### ${err}`))
  }
  
  
}

/**
 * 根据文件列表和包名获取要排除的文件列表
 * @param {*} subpackCollections 
 * @param {*} mainpackCollection 
 * @param {*} packName 
 * @param {*} type 
 */
export function getExcludes (subpackObj, subpackCollections, mainpackCollection, packName, type = "all") {
  let excludes = []
  for(let subpackname in subpackCollections) {
    let subCol = subpackCollections[subpackname]
    //console.log('getexludes',subCol,subpackObj)
    if (subpackObj == null || subCol.path != subpackObj.path) {//路径不相等，文件就要互斥
      //if(subpackObj != null) console.log(packName,'paths',subCol.path,subpackObj.path)
      excludes = excludes.concat(subCol[type])
    }
    if (fs.statSync(subCol.path).isDirectory()){
      excludes.push(subCol.path)
    }
  }
  if (packName != CONFIG.MAIN_PACK_NAME) {//分包，去掉当前分包所在的包
    excludes = excludes.concat(mainpackCollection[type])
  }
  return excludes
}

/**
 * 收集子包/主包 文件，返回分类文件列表
 * @param {*} dir 
 * @param {*} excludes  绝对路径列表
 */
export function collectPackFiles(rootPath,excludes = null) {
  //console.log('exludes',excludes)
  let result = {
    "path" : rootPath,
    "all": [],
    "js": [],
    "other": []
  }
  const stat = fs.statSync(rootPath)
  if (stat.isDirectory()) {
    const files = []
    traverseDirSync(rootPath, files, excludes)
    files.forEach((file) => {
      result.all.push(file)
      if (path.extname(file) == '.js'){
        result.js.push(file)
      }
      else {
        result.other.push(file)
      }
    })
  }
  else {//文件
    if (!excludes || excludes.indexOf(rootPath)  == -1) {
      result.all.push(rootPath)
      result.js.push(rootPath)
    }
    else {
      //
    }
  }
  return result
}

export function mkDirs (projectDir, isDev) {
  //let quickgameDir = path.join(projectDir,CONFIG.QUICKGAME_DIR)
  let quickgameDir = projectDir
  let targetDir = path.join(quickgameDir,CONFIG.BUILD_PATH)
  let distDir = path.join(quickgameDir,CONFIG.DEST_DIR)
  
  //fs.ensureDirSync(quickgameDir)
  fs.emptyDirSync(distDir)
  fs.emptyDirSync(targetDir)
  console.log(chalk.green(`[准备工作]build&dist 文件夹已清空`))

  //检查签名文件，如果是dev模式，缺少sign文件，从打包项目中拷贝，如果是发布，需要release下有对应签名文件
  let signDir = path.join(quickgameDir, CONFIG.SIGN_DIR_NAME)
  let _sign = path.resolve(path.resolve(__dirname, '../../sign')) //自带的签名文件

  if(!fs.existsSync(signDir)){
    console.log(chalk.yellow(`### 缺少签名文件 ### 使用默认签名和证书`))
    copyFiles(_sign, signDir)
  }
  let signEnvDir = isDev ? CONFIG.SIGN_DEBUG_DIR : CONFIG.SIGN_RELEASE_DIR
  let privatekey = path.join(signDir, signEnvDir, CONFIG.PRIVATE_FILE_NAME)
  let certificate = path.join(signDir, signEnvDir, CONFIG.CERTIFICATE_FILE_NAME)
  if(!fs.existsSync(privatekey) || !fs.existsSync(certificate)) {
    if (!isDev) {
      console.log(chalk.red(`[签名文件错误]没有 release 的签名和证书, 请保证以下路径的文件存在，私钥：${privatekey}, 证书：${certificate}`))
      shell.exit(1)
    }
    else {
      console.log(chalk.yellow(`### 缺少签名文件 ### 使用默认签名和证书`))
      copyFiles(path.join(_sign, signEnvDir), path.join(signDir, signEnvDir))
    }
  }
  return {
    signFiles:{
      privatekey:privatekey,
      certificate:certificate
    },
    targetDir:targetDir,
    distDir:distDir
  }
}

// 统一转化为linux下方式expose，兼容windows和linux
function getExposeName (entry) {
  //return path.sep + path.relative(process.cwd(), entry).replace(path.extname(entry),'')
  return path.posix.sep + path.relative(process.cwd(), entry).split(path.win32.sep).join(path.posix.sep)
}
/**
 * 只处理.js文件
 * @param {*} dir 源目录
 * @param {*} isMain 是否主包
 * @param {*} hasSub 是否有分包
 * @param {*} targetDir 生成的目标目录 
 * @param {*} excludes 排除打包的文件
 * @param {*} exposeModules 已经暴露的模块，用于处理模块冲突
 */
async function buildJs(dir, targetDir, isMain, hasSub, excludes, exposeModules = {}, isDev = true) {
  return new Promise((resolve, reject) => {
    //console.log('excludes', excludes)
    //考虑单文件的情况
    let buildPatten = fs.statSync(dir).isDirectory() ? path.resolve(dir) + '/**/*.js' : dir
    //console.log('buildPatten', buildPatten)
    globby([buildPatten]).then((entries) => {
      let bundle = createBundle(hasSub, dir)
      let jsMain = CONFIG.MAIN_ENTRY_JS_NAME + ".js"
      entries.forEach(function(entry){
        let expose = path.basename(entry, path.extname(entry))
        //console.log('entry', path.resolve(entry), entry, process.cwd())
        if (exposeModules[expose] && exposeModules[expose] != entry) {//如果是分包嵌套一起的，不警告
          //console.log(chalk.yellow(`[warning]: module '${expose}' both defined in  '${exposeModules[expose]}' and '${entry}'`))
        }
        else {
          exposeModules[expose] = entry
        }

        bundle.require(entry, {
          expose: getExposeName(entry)
        })
        //只有分包这样处理
        if(!isMain && hasSub){
          bundle.add(path.resolve(entry), {
            expose: getExposeName(entry)
          })
        }
      })
      if(isMain) {//主包只执行main.js
        let mainPath = path.resolve(path.join(dir, jsMain))
        bundle.add(mainPath, {
          expose: getExposeName(mainPath)
        })
      }

      // 解决嵌套问题，可能导致文件没有被打包进来，要从excludes里排除；
      // 同时也要注意，不嵌套的时候，对应的excludes也要生效，否则子包的文件会都打进来
      let excludes_ = []
      excludes && excludes.forEach((exclude) => {
        if (entries.indexOf(exclude) == -1 || isMain) {//主包都要排除
          excludes_.push(exclude)
        }
      })

      //bundle = bundle.exclude(excludes_)
      bundle = 
        bundle
        .external(excludes_)
        .transform(babelify, {
          presets: [loadBabelModule('babel-preset-env')],
          generatorOpts:{
            compact: false
          },
          //ignore:['./js/egret.js','./js/eui.js','./js/dragonBones'],
          //compact: false //当文件大小大于500k。babel不优化
        })
        .bundle()
        .on('error', (err) => {
          console.log(chalk.red(`[js编译错误]${err}`))
          //this.emit('finish')
          reject(err)
        })
        .pipe(source(jsMain))
        .pipe(buffer())
        if (isDev) {
          bundle = bundle.pipe(sourcemaps.init({loadMaps: false})) 
        }
        if (!isDev){
          bundle = bundle.pipe(uglify({
            mangle: false,
            compress:{
              sequences: false,  // join consecutive statements with the “comma operator”
              properties: false,  // optimize property access: a["foo"] → a.foo
              // dead_code: true,  // discard unreachable code
              drop_debugger: false,  // discard “debugger” statements
              // ecma: 5, // transform ES5 code into smaller ES6+ equivalent forms
              // evaluate: true,  // evaluate constant expressions
              unsafe: false, // some unsafe optimizations (see below)
              // computed_props: true,
              // conditionals: false,  // optimize if-s and conditional expressions
              comparisons: false,  // optimize comparisons
              booleans: false,  // optimize boolean expressions
              typeofs: false,  // Transforms typeof foo == "undefined" into foo === void 0. Note: recommend to set this value to false for IE10 and earlier versions due to known issues.
              loops: false,  // optimize loops
              unused: false,  // drop unused variables/functions
              hoist_funs: false,  // hoist function declarations
              hoist_props: false,
              hoist_vars: false, // hoist variable declarations
              if_return: false,  // optimize if-s followed by return/continue
              inline: false,  // embed simple functions
              join_vars: false,  // join var declarations
              collapse_vars: false,   // Collapse single-use non-constant variables - side effects permitting.
              reduce_funcs: false,
              reduce_vars: false, // Improve optimization on variables assigned with and used as constant values.
              //warnings: true,
              pure_getters: false,
              pure_funcs: null,
              drop_console: false,
              // expression: false, // Pass true to preserve completion values from terminal statements without return, e.g. in bookmarklets.
              keep_fargs: true,
              keep_fnames: true,
              keep_infinity: true,  // Pass true to prevent Infinity from being compressed into 1/0, which may cause performance issues on Chrome.
              side_effects: false,  // drop side-effect-free statements
            }
          }))
        }
        /* if (isDev) {
          bundle = bundle.pipe(sourcemaps.write('./', {
            sourceRoot: './',
            includeContent: true,
            addComment: true
          }))
        } */
        bundle
        .pipe(gulp.dest(targetDir))
        .on('end', () => {
          resolve()
        })
    })
  })
  
}

/**
 * 根据是否分包生成不同的bundle
 * @param {*} hasSub 是否有分包
 */
function createBundle(hasSub, dir) {
  let config = {
    debug: false,
    insertGlobals:false,
    externalRequireName:"__require__",
    prelude:prelude,
    preludePath:preludePath,
    paths: [],
    //commondir : false
    //basedir:dir
  }
  if (fs.statSync(dir).isDirectory()) {
    config.paths.push(dir)
  }
  else {//不是目录的时候也能够兼容
    config.paths.push(path.dirname(dir))
  }
  if(hasSub) {
    config = Object.assign(config, {
    })
  }
  return browserify(config)
}



/**
 * 返回manifest配置和对应的签名文件
 * @param {string} projectDir 
 * @param {boolean} isDev 
 */
export function checkProject(projectDir) {
  let result = null
  let checkFiles = ['manifest.json','main.js']
  checkFiles.forEach((fileName) => {
    let filePath = path.join(projectDir,fileName)
    if(!fs.existsSync(filePath)) {
      console.log(chalk.red(`[错误]缺少文件 ${fileName}, 确保改路径下文件存在：${filePath}`))
      shell.exit(1)
    }
  })
  let filePath = path.join(projectDir,checkFiles[0])
  try {
    result = require(filePath)
  }
  catch(e) {
    console.log(chalk.red(`[error]parse config file error: ${filePath}`))
    shell.exit(1)
  }
  if(result) {
    let reg = /^[a-zA-Z]+[0-9a-zA-Z_]*(\.[a-zA-Z]+[0-9a-zA-Z_]*)*$/
    if(result['package']) {
      if(!reg.test(result['package'])) {
        console.log(chalk.red(`[配置错误]包名不合法`))
        shell.exit(1)
      }
    }
    else {
      console.log(chalk.red(`[配置错误]必须包含包名`))
      shell.exit(1)
    }
  }
  return result
}