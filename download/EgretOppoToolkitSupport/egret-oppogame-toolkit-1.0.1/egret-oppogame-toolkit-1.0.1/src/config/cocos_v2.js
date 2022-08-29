//不打包文件相对发布目录的路径
export const EXCLUDE_FILES = ['jsb-adapter/jsb-builtin.js', 
    'cocos-project-template.json', 'frameworks','project.json','.cocos-project.json','.DS_Store']
export const EXCLUDE_FILE_TYPE = ['.cpk']
export const DEFAULT_PARENT_DIR = 'build'
export const DEFAULT_PUB_DIR = 'jsb-link'
export const DEFAULT_TPL_FILES = []//这里的文件如果有修改，就不会从tpl里拷贝覆盖