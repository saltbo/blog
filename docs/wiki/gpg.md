## GPG 常用命令

### 主秘钥

生成主秘钥

```bash
gpg --full-gen-key
```

生成撤销证书

```bash
gpg --gen-revoke -ao   revoke.pgp   linus # uid 或者key id
```

撤销主密钥

```bash
gpg --import gpg-linus.asc    # 在一台新的电脑上导入你的公钥
gpg --import revoke           # 导入你备份的撤销凭证，直接会导致密钥不可用
```

备份主秘钥

```bash
gpg --export-secret-key E363354FA81A5AF9334F02EBD6304AF502D93919 | paperkey --output paperkey.txt
```

恢复主秘钥

```bash
paperkey --secrets pk_mk.txt --pubring .gnupg/out/pub_0xA6D9859C3FE0DCBE.pgp | gpg --import
```

### 子秘钥

添加子秘钥

```bash
gpg --edit-key linus # 或者key id
gpg>   addkey
```

导出子秘钥

```bash
gpg -ao gh-sign.sec --export-secret-subkeys 0xED13862C4BCD86D8!
```

导入子秘钥

```bash
gpg --import gh-sign.sec
```

撤销子密钥

```bash
gpg --edit-key linus

gpg >   list  # 列出你所有的子密钥
gpg >   key  {n}  # 选择你要销毁的子密钥的 序号
gpg >   revkey
gpg >   save    # 退出前一定要save, 不然所有更改不会生效
```

### 删除

```bash
gpg --delete-secret-keys linus  # 删除私钥，  UID 也可以替换成子密钥ID, 主密钥Key ID
gpg --delete-keys linus		 # 删除公钥
```

## 参考文档

- [2021 年-用更现代的方法使用 PGP-上](https://ulyc.github.io/2021/01/13/2021%E5%B9%B4-%E7%94%A8%E6%9B%B4%E7%8E%B0%E4%BB%A3%E7%9A%84%E6%96%B9%E6%B3%95%E4%BD%BF%E7%94%A8PGP-%E4%B8%8A/)
