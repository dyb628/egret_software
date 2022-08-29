因为 vivo 小游戏项目结构升级，白鹭引擎 5.2.28 版本之前创建的项目，需要升级才能支持新的结构。

`注意：如果是老项目 (xxx_vivogame)，请删除原来的 vivo 小游戏项目，重新创建项目！！`

#### Egret 项目升级方法1
* 1.使用 EgretLauncher 下载白鹭引擎 5.2.28 版本
* 2.执行 `egret upgrade --egretversion 5.2.28`
	* 升级将会把您项目中的 `scripts/config.vivogame.ts` 和 `scripts/vivogame/vivogame.ts`这两个文件替换掉。如果您修改了这2个文件，请提前做好备份，升级完成以后再进行对应修改。

#### Egret 项目升级方法2
* 1.使用 EgretLauncher 下载白鹭引擎 5.2.28 版本
* 2.新创建一个游戏项目，将项目中 `scripts/config.vivogame.ts ` 和 `scripts/vivogame/vivogame.ts`这两个文件替换您原来项目里对应的文件