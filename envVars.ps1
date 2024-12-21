$env:PATH = "C:\Users\marcl\AppData\Local\fnm_multishells\2128_1734768957256;C:\Program Files (x86)\Common Files\Oracle\Java\java8path;C:\Program Files (x86)\Common Files\Oracle\Java\javapath;C:\ProgramData\Oracle\Java\javapath;"C:\ProgramData\Oracle\Java\javapath;E:\lib:E:\bin";C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Windows\System32\OpenSSH\;C:\Program Files\NVIDIA Corporation\NVIDIA NvDLISR;C:\Program Files (x86)\NVIDIA Corporation\PhysX\Common;C:\Program Files\dotnet\;C:\Program Files\Git\cmd;C:\Users\marcl\.cargo\bin;C:\Users\marcl\AppData\Local\Microsoft\WindowsApps;C:\Users\marcl\AppData\Local\GitHubDesktop\bin;C:\Users\marcl\AppData\Local\Programs\Microsoft VS Code\bin;C:\msys64\mingw64\bin;C:\Users\marcl\.cargo\bin;C:\Users\marcl\AppData\Local\Microsoft\WinGet\Packages\Schniz.fnm_Microsoft.Winget.Source_8wekyb3d8bbwe;"
$env:FNM_MULTISHELL_PATH = "C:\Users\marcl\AppData\Local\fnm_multishells\2128_1734768957256"
$env:FNM_VERSION_FILE_STRATEGY = "local"
$env:FNM_DIR = "C:\Users\marcl\AppData\Roaming\fnm"
$env:FNM_LOGLEVEL = "info"
$env:FNM_NODE_DIST_MIRROR = "https://nodejs.org/dist"
$env:FNM_COREPACK_ENABLED = "false"
$env:FNM_RESOLVE_ENGINES = "true"
$env:FNM_ARCH = "x64"
function global:Set-FnmOnLoad { If ((Test-Path .nvmrc) -Or (Test-Path .node-version) -Or (Test-Path package.json)) { & fnm use --silent-if-unchanged }
 }
function global:Set-LocationWithFnm { param($path); if ($path -eq $null) {Set-Location} else {Set-Location $path}; Set-FnmOnLoad }
Set-Alias -Scope global cd_with_fnm Set-LocationWithFnm
Set-Alias -Option AllScope -Scope global cd Set-LocationWithFnm
Set-FnmOnLoad


