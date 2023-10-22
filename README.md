<p align="center">
  <img src=".github/gyozora.png" alt="Logo" height=150 />
</p>

<h1 align="center">Gyozora</h1>

<p align="center">
  <a href="./LICENSE.md"><img src="https://img.shields.io/badge/⚖️ license-GNU%20GPL%20v3.0-blue" alt="MIT License"></a>
  <img src="https://img.shields.io/github/stars/keelus/gyozora?color=red&logo=github" alt="stars">
  <img src="https://img.shields.io/badge/🚧 In%20development-FCBA03" alt="In development" />
</p>

<h2>About gyozora</h2>
Gyozora is a fast and lightweight file explorer in early development. It currently supports Windows & macOS and will be fully compatible with Linux in future versions. <br /><br />

```
Note: Gyozora it's currently unstable and there are lots of important functionalities that
haven't been developed yet.
```
<br />

### To try it
Just clone the repo, and rename `data/appcache_empty.db` to `data/appcache.db`. <br />

Then, execute the following command in the root folder:
```bash
wails dev
```

### 🥟📂 Important incoming features:

#### 💻 OS compatibility:
- [x] ~~🪟 Windows (10 & 11)~~
- [ ] 🍎 macOS (arm64[m1, m2] & amd64[intel])
- [ ] 🐧 Linux (amd64, arm64 & arm)

#### 📄 Context menu/file related:
- [x] ~~➕ Add/create a file~~
- [ ] 📋 Copy file(s)
- [ ] 📋 Cut file(s)
- [ ] 📋 Paste file(s)
- [ ] 🆔 Rename a file
- [x] ~~🗑️ Delete file(s)~~
- [ ] ℹ️ Properties of a file

#### 🧑‍💻 User configuration related:
- [ ] 🎨 Choose color theme
- [ ] 📊 Multiple UX options:
  - [ ] Enable/disable file deletion confirmation modal
  - [ ] Change language
  - [ ] ... More

#### 🥟 Others:
- [ ] 🌍 Internationalization
  - [x] ~~🇺🇸 English~~
  - [ ] 🇪🇸 Spanish
- [x] ~~ℹ️ Error messages/toasts~~

<br />
Made by <a href="https://github.com/keelus">keelus</a> ✌️