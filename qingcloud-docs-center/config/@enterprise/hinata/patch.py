#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os,sys,site
__dirname = sys.path[0]
if os.path.isdir(os.path.join('/pitrix/lib/pitrix-hinata-admin-cli')):
    site.addsitedir('/pitrix/lib/pitrix-hinata-admin-cli')
import admincli

'''
本脚本用于全新安装、升级时，本工程当前版本运行时所需的原厂配置, 由Installer自动执行。

脚本执行环境：
1) 配置中心组件启动完成
2) WS节点已安装admin-cli组件
3) 任意一WS节点执行一次即可(多次执行也无副作用)
'''
cli = admincli.connect("http://api.qingcloud.com:13000/")
cli.login('dev', 'dev@k6xvodNJ')

def cat(*p):
    file_path = os.path.join(__dirname, *p)
    with open(file_path, 'r') as stream:
        text = stream.read()
    return text

# 设置应用(不存在则创建)
cli.set_app("docs-center", "文档中心-维护文档的通用配置以及 LinkKeyMap 模型")
# 设置模型(不存在则创建)
cli.set_schema("DocLinkKeyMap", { "json_schema": cat("schema/DocLinkKeyMap.json"), "desc": "文档 LinkKeyMap 配置模型" })
cli.set_schema("DocsCenterParams", { "json_schema": cat("schema/DocsCenterParams.json"), "json_ui_schema": cat("schema/DocsCenterParamsUI.json"), "desc": "文档 LinkKeyMap 配置模型" })
# 设置模型原厂默认值
cli.set_schema_preset(("DocLinkKeyMap", "ORIGINAL"), { "content": cat("configs/link_key_mapper.json"), "content_type": "json", "desc": "原厂默认配置" })
cli.set_schema_preset(("DocsCenterParams", "ORIGINAL"), { "content": cat("configs/docs_center_params.yaml"), "content_type": "yaml", "desc": "原厂默认配置" })
# 设置配置(不存在则创建)
cli.set_meta(("docs-center", "link_key_mapper"),  { "schema_name": "DocLinkKeyMap", "content_type": "json", "desc": "文档生成的控制台所需的 key 对应的文档链接" })
cli.set_meta(("docs-center", "docs_center_params"),  { "schema_name": "DocsCenterParams", "content_type": "yaml", "desc": "文档渲染所需的配置" })

print("[docs-center] import complete")
