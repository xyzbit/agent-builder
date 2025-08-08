#!/usr/bin/env python3
"""
项目初始化脚本
读取 code.json 文件，根据其中的 appFiles 创建对应的文件和目录结构
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, Any


def create_directory_if_not_exists(file_path: str) -> None:
    """为文件路径创建必要的目录"""
    directory = os.path.dirname(file_path)
    if directory:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"✓ 创建目录: {directory}")


def write_file_content(file_path: str, content: str, is_binary: bool = False) -> None:
    """写入文件内容"""
    try:
        if is_binary:
            # 如果是二进制文件，这里可以扩展处理逻辑
            print(f"⚠️  跳过二进制文件: {file_path}")
            return
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ 创建文件: {file_path}")
    except Exception as e:
        print(f"❌ 创建文件失败 {file_path}: {e}")


def init_project_from_json(json_file_path: str = "code.json") -> None:
    """从 JSON 文件初始化项目"""
    
    # 检查 JSON 文件是否存在
    if not os.path.exists(json_file_path):
        print(f"❌ 错误: 找不到 {json_file_path} 文件")
        sys.exit(1)
    
    # 读取并解析 JSON 文件
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON 解析错误: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ 读取文件错误: {e}")
        sys.exit(1)
    
    # 检查是否有 appFiles 字段
    if 'appFiles' not in data:
        print("❌ 错误: JSON 文件中没有找到 'appFiles' 字段")
        sys.exit(1)
    
    app_files = data['appFiles']
    print(f"📦 开始初始化项目，共 {len(app_files)} 个文件...")
    print("-" * 50)
    
    created_files = 0
    skipped_files = 0
    
    # 遍历所有文件并创建
    for file_key, file_info in app_files.items():
        file_path = file_info.get('fullPath', file_key)
        file_type = file_info.get('type', 'file')
        content = file_info.get('contents', '')
        is_binary = file_info.get('isBinary', False)
        
        # 跳过非文件类型
        if file_type != 'file':
            print(f"⏭️  跳过非文件项: {file_path} (类型: {file_type})")
            skipped_files += 1
            continue
        
        # 检查文件是否已存在
        if os.path.exists(file_path):
            print(f"⚠️  文件已存在，跳过: {file_path}")
            skipped_files += 1
            continue
        
        # 创建目录
        create_directory_if_not_exists(file_path)
        
        # 写入文件内容
        write_file_content(file_path, content, is_binary)
        created_files += 1
    
    print("-" * 50)
    print(f"🎉 项目初始化完成!")
    print(f"✓ 创建文件: {created_files} 个")
    print(f"⏭️  跳过文件: {skipped_files} 个")
    
    # 显示命令信息
    if 'commands' in data and data['commands']:
        print("\n📋 建议的执行命令:")
        for i, cmd in enumerate(data['commands'], 1):
            action = cmd.get('action', {})
            cmd_type = action.get('type', 'unknown')
            content = action.get('content', '')
            
            if cmd_type == 'shell':
                print(f"  {i}. {content}")
            elif cmd_type == 'start':
                print(f"  {i}. {content} (启动命令)")


def main():
    """主函数"""
    print("🚀 项目初始化脚本")
    print("=" * 50)
    
    # 获取脚本所在目录
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_file = os.path.join(script_dir, "code.json")
    
    # 切换到脚本目录
    os.chdir(script_dir)
    print(f"📁 工作目录: {script_dir}")
    
    # 初始化项目
    init_project_from_json(json_file)


if __name__ == "__main__":
    main()
