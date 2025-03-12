# `variable.toml`

`variable.toml` 也是运行 CdsCTF 必需的文件。这里将详解每一个字段。

> [!IMPORTANT]
> 与 `constant.toml` 不同，`variable.toml` 的内容可以在前端修改，且不需要在修改后重启 CdsCTF。

```toml
[meta]
title = "CdsCTF"
description = "An open-source CTF platform."

[auth]
is_registration_enabled = true

[captcha]
provider = "pow"  # none | pow | image | turnstile | hcaptcha
difficulty = 2  # only for pow and image captcha.

[captcha.turnstile]
url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
secret_key = ""
site_key = ""

[captcha.hcaptcha]
url = "https://api.hcaptcha.com/siteverify"
secret_key = ""
site_key = ""
score = 80

[email]
is_enabled = false
host = ""
port = 465
tls = "tls"  # starttls | tls | none
username = ""
password = ""
whitelist = []
```