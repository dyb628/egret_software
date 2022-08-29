import fs from 'fs-extra'
import path from 'path'
import jszip from 'jszip'
import signer from './bundle'
import { EXCLUDES } from '../config/config'
const COMPRESS_OPTS = {
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: {
    level: 9
  }
}
/*
 *@ input 打包目录
 *@ output 输出路径
 *@ rpkName rpk名
 *@ signFiles 签名文件
 */
export let sign = (options, isDev, callback) => {
  const privatekey = fs.readFileSync(options.signFiles.privatekey)
  const certpem = fs.readFileSync(options.signFiles.certificate)
  const zipper = new jszip()
  const filehashs = []
  const zipfile = path.join(options.output,options.rpkName+'.zip')
  let signfile = path.join(options.output, options.rpkName)
  if (isDev || process.env.NODE_ENV != 'production') {//如果强制写了isDev，不打signed
    signfile += '.rpk'
  }else{
    signfile += '.signed.rpk'
  }
  
  parse(options.input, '.', (name, file) => {
    // 去除/dist/ 和 /sign/目录，.DS_Store文件
    if (name.substr(0, 5) !== 'dist/' && name.substr(0, 5) !== 'sign/' && EXCLUDES.indexOf(name) === -1) {
      console.log('name include', name)
      // 文件列表hash
      filehashs.push({
        name: Buffer.from(name),
        file: file,
        hash: signer.hashFile(file, fs)
      })
      zipper.file(name, fs.createReadStream(file));
    }
  }, fs)
  fs.ensureDirSync(options.output)
  zipper.generateNodeStream(COMPRESS_OPTS).pipe(fs.createWriteStream(zipfile)).on('finish', function() {
    signer.signZip({
        zip: zipfile,
        files: filehashs
      }, privatekey, certpem, signfile)
      // 删除临时文件
    fs.existsSync(zipfile) && fs.unlinkSync(zipfile)
    //console.log(chalk.green(`签名完成！文件为：${signfile}`))
    callback && callback(signfile)
  })
}

let parse = (base, dir, cb, fs) => {
  dir = dir || '.'
  const directory = path.posix.join(base, dir)
  let name
    // 递归遍历目录
  fs.readdirSync(directory).forEach(function(file) {
    const fullpath = path.posix.join(directory, file)
    const stat = fs.statSync(fullpath)
    if (stat.isFile()) {
      // 替换
      const posixdir = dir.split(path.sep).join(path.posix.sep)
      name = path.posix.join(posixdir, path.basename(file))
      cb(name, fullpath)
    } else if (stat.isDirectory()) {
      const subdir = path.posix.join(dir, file)
      parse(base, subdir, cb, fs)
    }
  })
}