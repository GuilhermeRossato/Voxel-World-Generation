# VoxelWorldGeneration

Testing different world generation methods using voxels in the web. Implemented with HTML5, Javascript and three.js

[Click here to run the current version](https://rawgit.com/GuilhermeRossato/3D-Redstone-Simulator/master/index.html)

# Releases
 - v 0.1 [Single Threaded, Simplex Noise, Static World Creation]
![Preview v0.1](https://github.com/GuilhermeRossato/VoxelWorldGeneration/blob/master/Images/Releases/preview_v01.gif?raw=true)

# How to run / build locally

 - Windows: (Requires Google Chrome) Download this repo, unpack it and run `.\Tools\runChrome.bat`. This solves cross-conflicts (allows multithreading/webWorkers/textures)
 - Linux or Mac or Windows: Download this repo, unpack it and put it in a local server, then open `index.html` in any decent web browser.

# Dependencies, Credits and Inspiration

1. [three.js](https://threejs.org/) - Javascript 3D Library - Used to draw the world
2. [Procedural Generation](https://en.wikipedia.org/wiki/Procedural_generation) - Description of procedurally generating things
3. [Fast Simplex Noise in Typescript](https://github.com/joshforisha/fast-simplex-noise-js) - by [joshforisha](https://github.com/joshforisha) - Used to generate [perlin noise](https://en.wikipedia.org/wiki/Perlin_noise) efficiently
4. [Minecraft](https://minecraft.net/pt-br/) - by [Mojang](https://mojang.com/) - Inspiration on world generation