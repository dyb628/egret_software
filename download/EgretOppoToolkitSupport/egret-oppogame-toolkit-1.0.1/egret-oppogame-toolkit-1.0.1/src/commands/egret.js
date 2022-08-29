/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'

import fs from 'fs-extra'
import chalk from 'chalk'
import shell from 'shelljs'

import * as packer from '../pack'
import * as CONFIG from '../config/config'
import * as EGRET_CONFIG from '../config/egret'

import {
  mkBuildDirs,
  copyFiles
} from '../utils'

/**
 * 生成工程目录
 * @param sourceDir 指定的微信目录，默认为空
 */
async function generate (pubDir = "", isDev = true) {
  let dir = process.cwd()
  if (pubDir){
    if (!path.isAbsolute(pubDir)){
      pubDir = path.resolve(dir, pubDir)
    }
  }
  else {
    pubDir = path.resolve(dir,'../',path.basename(dir) + "_wxgame")
  }
  if (!fs.existsSync(pubDir)) {
    console.log(chalk.red(`[错误]指定的发布文件夹不存在：${pubDir}`))
    shell.exit(1)
  }

  //生成对应目录，egret在生成项目下运行，所以pubDir = dir
  let dirConf = mkBuildDirs(pubDir, dir, CONFIG, EGRET_CONFIG, 'egret', isDev)
  //拷贝文件
  copyFiles(pubDir, dirConf.quickgameDir,[],EGRET_CONFIG.EXCLUDE_FILES.map((eFile) => {return path.join(pubDir, eFile)}))

  /* EGRET_CONFIG.RENAME_FILES.forEach((item) => {
    fs.moveSync(path.join(dirConf.quickgameDir,item.source),path.join(dirConf.quickgameDir,item.target), { overwrite: true })
  }) */
  
  //打包
  await packer.signDir(null, dirConf.quickgameDir, dirConf.distDir, dirConf.manifestJson.option, dirConf.signFiles, isDev)
}


// 创建工程目录
module.exports = generate
