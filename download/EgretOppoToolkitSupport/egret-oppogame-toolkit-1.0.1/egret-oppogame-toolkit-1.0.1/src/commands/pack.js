/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'
import fs from 'fs-extra'
import {
	copySignFile,
	createMainifestJson,
	getSuggestPackNameJson,
} from '../utils'
import {
	signDir
} from '../pack'
import * as CONFIG from '../config/config'

/**
 * 生成工程目录
 * @param name 项目名
 */
async function generate (pubDir, isDev = true) {
  let dir = pubDir || process.cwd();
  let _root = path.resolve(path.resolve(__dirname, '../'), '../');
  let _tpl = path.join(_root, 'tpl')
  // 判断签名目录是否存在
	let signFiles = copySignFile(dir, _root, CONFIG, isDev)
	let manifestJson = createMainifestJson(_tpl, dir, dir, getSuggestPackNameJson('', dir))
	let distDir = path.join(dir, CONFIG.DEST_DIR)
	fs.emptyDirSync(distDir)
	await signDir(null, dir, distDir, manifestJson.option, signFiles, isDev)
}


// 创建工程目录
module.exports = generate
