import path from 'path'
import { sign } from './signer'
import { package as pkg } from '../../../src/manifest.json'

const env = process.env.NODE_ENV
const projectPath = path.join(__dirname, '../../../')
const inputPath = path.join(projectPath, 'src')
const outputPath = path.join(projectPath, 'dist')

// 签名文件
const signFiles = {
  debug: {
    privatekey: path.join(projectPath, 'sign/debug/private.pem'),
    certificate: path.join(projectPath, 'sign/debug/certificate.pem')
  },
  release: {
    privatekey: path.join(projectPath, 'sign/release/private.pem'),
    certificate: path.join(projectPath, 'sign/release/certificate.pem')
  }
}



sign({
  input: inputPath, 
  output:outputPath, 
  rpkName: pkg,
  signFiles: env == 'production' ? signFiles.release : signFiles.debug
})