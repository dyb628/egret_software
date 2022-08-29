import { sign } from './signer'
import path from 'path'

const env = process.env.NODE_ENV
const projectPath = path.join(__dirname, '..')
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

console.log('NODE_ENV:' + env);

sign({
  input: path.join(__dirname, '../dist'), 
  output:path.join(__dirname, '../dist/'), 
  rpkName: 'test',
  signFiles: env == 'production' ? signFiles.release : signFiles.debug
})