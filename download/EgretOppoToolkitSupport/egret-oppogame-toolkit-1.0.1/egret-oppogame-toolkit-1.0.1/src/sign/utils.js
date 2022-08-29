/*
 * Copyright (C) 2017, hapjs.org. All rights reserved.
 */

import path from 'path'
import fs from 'fs'

import chalk from 'chalk'

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
 * @param dir
 * @param files 收集的文件列表
 */
export function traverseDirSync (dir, files, excludeRootDirs=null) {
  const list = fs.readdirSync(dir)
  list.forEach(function (file) {
    file = path.join(dir, file)
    const stat = fs.statSync(file)
    if (stat && stat.isDirectory()) {
      traverseDirSync(file, files)
    }
    else {
      files.push(file)
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
