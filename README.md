<p align="center">
  <img src=".github/gyozora.png" alt="Logo" height=150 />
</p>

<h1 align="center">Gyozora</h1>

<p align="center">
  <a href="./LICENSE.md"><img src="https://img.shields.io/badge/⚖️ license-GNU%20GPL%20v3.0-blue" alt="MIT License"></a>
  <a href="https://github.com/keelus/gyozora/stargazers"><img src="https://img.shields.io/github/stars/keelus/gyozora?color=red&logo=github" alt="Repo stars"></a>
  <a href="https://github.com/keelus/gyozora/releases/tag/v1.0.0"><img src="https://img.shields.io/github/downloads-pre/keelus/gyozora/latest/total" alt="Latest release"></a>
    
    
</p>

<h2>About gyozora</h2>

Gyozora is a fast and lightweight file explorer in early development. It´s fully compatible with **Windows** and **macOS**. **Linux** will be compatible in the future versions. <br /><br />

<h2>Key features</h2>

- Lightweight.
- Fast folder navigation.
- Modern UI.
- Highly customizable.
- All the features you would expect in a standard file explorer.
- User-friendly.
- Enhanced performance.


### 📷 Screenshot
![Gyozora screenshot windows dark](https://github.com/keelus/gyozora/assets/86611436/b5f6e08b-dad0-49ea-936a-5984d3e5e00d)
![Gyozora screensho macOS light](https://github.com/keelus/gyozora/assets/86611436/cb35b948-d184-446b-b58b-aea3d2d96c6a)





### ⬇️ Install it
You can install the latest release <a href="https://github.com/keelus/gyozora/releases/latest">here</a>.

### 🛠️ Develop it
To serve a development live build of gyozora, <a href="https://wails.io/">wails</a> and <a href="https://www.npmjs.com/">npm</a> must be installed on your system.
1. Clone the repository
```bash
git clone https://github.com/keelus/gyozora.git
cd gyozora
```
2. Install dependencies (you can skip to the next step, which also installs the dependencies)
```bash
npm install ./frontend
```
3. Build a live dev version
```bash
wails dev
```
### 🏗️ Build it
Build gyozora yourself.

***Note: Due to Wails limitations, cross-compiling is not supported.***
```bash
# for Windows
wails build -nsis

# for macOS & Linux
wails build
```
The generated binaries will appear in `./build`
## ⚖️ License
This project is open source under the terms of the [GNU GPL v3.0 license](./LICENSE)

<br />
Made by <a href="https://github.com/keelus">keelus</a> ✌️
