/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'

import * as packer from '../pack'
import * as CONFIG from '../config/config'

/**
 * browserify+uglify+babel处理js代码
 * 处理分包逻辑，调用sign签名打包
 * 1.检查package，是否有文件，是否有manifest.json，是否配置分包
 * 2.1 不分包的场景：直接打包，入口文件main.js，直接生成rpk
 * 2.2 分包场景，主包子包分别打包，分别生成rpk后，再生成总包rpk
 * 字体？css？文件暂不打包
 */

/**
 * 生成工程目录
 * @param engine 主要对cocos特殊处理
 * @param isDev 是否Dev
 * @param cwdDir 项目目录，如果不传，默认用命令行所在的目录
 */
function generate (isBuildJs = true, isDev = true, cwdDir) {
  let dir = path.resolve(cwdDir || process.cwd())//工程目录
  let manifestJson = packer.checkProject(dir, isDev)
  let dirConf = packer.mkDirs(dir, isDev)
  let subpackages = getSubpacks(manifestJson)
  if (subpackages && subpackages.length > 0) {
    console.log(chalk.green(`###包含分包### 开始打包`))
    generateWithSubpacks(isBuildJs, dir, dirConf, manifestJson, isDev)
  }
  else {
    console.log(chalk.green(`###不包含分包### 开始打包`))
    generateNoSubpacks(isBuildJs, dir, dirConf, manifestJson ,isDev)
  }
}

/**
 * 没有分包的场景打包
 * @param {*} dir 
 * @param {*} dirConf
 * @param {*} manifestJson 
 * @param {*} isDev 
 */
async function generateNoSubpacks(isBuildJs, dir, dirConf, manifestJson, isDev) {
  await packer.buildDir(isBuildJs, dir, dirConf.targetDir, true, false, [], {}, isDev)
  await packer.signDir(null, dirConf.targetDir, dirConf.distDir, manifestJson, dirConf.signFiles,isDev)
  fs.removeSync(dirConf.targetDir)
}

/**
 * 分包打包，注意：子包有可能是JS文件
 * 遍历所有分包，生成文件列表，
 * 遍历主包，生成文件列表
 * 打包主包，打包分包
 * 打包总包
 * 
 * @param {*} projectDir 
 * @param {*} targetDir 
 * @param {*} distDir 
 * @param {*} manifestJson 
 * @param {*} signFiles 
 */
async function generateWithSubpacks(isBuildJs, projectDir, dirConf, manifestJson, isDev) {
  packer.checkSubpackageConf(projectDir, manifestJson)
  let subpackCollections = collectSubpacks(projectDir, manifestJson.subpackages) // 收集分包文件路径
  let mainpackCollection = collectMainPacks(projectDir,subpackCollections) // 收集主包文件路径

  //打包主包
  let targetMain = path.join(dirConf.targetDir, CONFIG.MAIN_PACK_NAME)
  let tmpRpk = path.join(dirConf.distDir, CONFIG.TMP_RPKS)
  await packer.buildDir(isBuildJs, projectDir, targetMain, true, true, packer.getExcludes(null, subpackCollections, mainpackCollection, CONFIG.MAIN_PACK_NAME, 'all'), {}, isDev)
  await packer.signDir(CONFIG.MAIN_PACK_NAME, targetMain, tmpRpk, manifestJson, dirConf.signFiles, true)

  // 分包打包
  let exposeModules = {} // 所有的暴露的模块
  for (const subpackage of manifestJson.subpackages) {
    let targetSub = path.resolve(path.join(dirConf.targetDir, subpackage.name))
    let sourceDir = path.resolve(path.join(projectDir, subpackage.root))
    let tmpRpk = path.resolve(path.join(dirConf.distDir, CONFIG.TMP_RPKS))
    subpackage.path = sourceDir
    await packer.buildDir(isBuildJs, sourceDir, targetSub, false, true, packer.getExcludes(subpackage, subpackCollections, mainpackCollection, subpackage.name, 'all'), exposeModules, isDev)
    await packer.signDir(subpackage.name, targetSub, tmpRpk, manifestJson, dirConf.signFiles, true)
    
  }
  await packer.signDir(null, tmpRpk, dirConf.distDir, manifestJson, dirConf.signFiles, isDev)
  fs.removeSync(tmpRpk)
  fs.removeSync(dirConf.targetDir)
}

/**
 * 这里收集的路径不包括目录
 * @param {*} projectDir 
 * @param {*} subpackages 
 */
function collectSubpacks(projectDir, subpackages) {
  let result = {}
  subpackages.forEach((subpackage) => {
    result[subpackage.name] = packer.collectPackFiles(path.resolve(path.join(projectDir,subpackage.root)))
  })
  return result
}

/**
 * 这里收集的路径不包括目录
 * @param {*} projectDir 
 * @param {*} subpackCollections 
 */
function collectMainPacks(projectDir,subpackCollections) {
  let excludes = []
  Object.values(subpackCollections).forEach((subCol) => {
    excludes = excludes.concat(subCol.all)
  })
  return packer.collectPackFiles(projectDir, excludes)
}

function getSubpacks(manifest) {
  return manifest['subpackages']
}

// 创建工程目录
module.exports = generate
