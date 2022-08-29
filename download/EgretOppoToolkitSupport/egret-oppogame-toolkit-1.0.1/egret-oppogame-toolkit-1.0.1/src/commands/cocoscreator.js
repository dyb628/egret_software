/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'
import fs from 'fs-extra'
import {
	copySignFile,
	createMainifestJson,
	copyFiles,
	getSuggestPackNameJson,
} from '../utils'
import {
	signDir
} from '../pack'
import * as CONFIG from '../config/config'

/**
 * 生成工程目录
 * @param name 是否调试模式
 * @param isSmallPack 是否小包
 */
async function generate (isDev = true, isSmallPack = false) {
  let dir = process.cwd()
  let _root = path.resolve(path.resolve(__dirname, '../'), '../')
  let quickgameTmpDir = path.resolve(dir,'../', CONFIG.QUICKGAME_DIR_TMP)
  
  let _tpl = path.join(_root, 'tpl')
  // 判断签名目录是否存在
  let signFiles = copySignFile(dir, _root, CONFIG, isDev)
  // manifest文件已存在，这里的逻辑实际只是防止manifest文件不存在
  let manifestJson = createMainifestJson(_tpl, dir, dir, getSuggestPackNameJson('', dir))
  
  let distDir = path.join(dir, CONFIG.DEST_DIR)
  fs.emptyDirSync(distDir)

  let excludeFiles = []
  if (isSmallPack) {
	excludeFiles.push('res')// 小包模式下res不拷贝
  }
  //拷贝文件
  fs.emptyDirSync(quickgameTmpDir)
  copyFiles(dir, quickgameTmpDir,null, excludeFiles.map((eFile) => {return path.join(dir, eFile)}))
  await signDir(null, quickgameTmpDir, distDir, manifestJson.option, signFiles, isDev)
  fs.removeSync(quickgameTmpDir)
}


// 
module.exports = generate