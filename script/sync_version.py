import re
import json
from os import path

with open("package.json", mode="r") as package_file:
    obj = json.load(package_file)
    version = obj["version"]
    print(version)

with open(path.join("src-tauri", "tauri.conf.json"), mode="r") as file:
    file_string = file.read()
    position = re.search(r'"version": "\d+.\d+.\d+"', file_string)
    assert position != None
    version_slice = file_string[position.start() : position.end()]
    new_file_string = f'{file_string[:position.start()]}"version": "{version}"{file_string[position.end():]}'

with open(path.join("src-tauri", "tauri.conf.json"), mode="w") as file:
    file.write(new_file_string)

with open(path.join("src-tauri", "Cargo.toml"), mode="r") as file:
    file_string = file.read()
    position = re.search(r'version = "\d+.\d+.\d+"', file_string)
    assert position != None
    version_slice = file_string[position.start() : position.end()]
    new_file_string = f'{file_string[:position.start()]}version = "{version}"{file_string[position.end():]}'

with open(path.join("src-tauri", "Cargo.toml"), mode="w") as file:
    file.write(new_file_string)
