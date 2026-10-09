# ==============================================================================
# BiteLens Android APK Automated Build Pipeline
# Uses Local Android SDK & Android Studio JBR (Zero external downloads required)
# ==============================================================================

$ErrorActionPreference = "Stop"

$sdkDir = if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
    $env:ANDROID_HOME
} elseif ($env:LOCALAPPDATA -and (Test-Path "$env:LOCALAPPDATA\Android\Sdk")) {
    "$env:LOCALAPPDATA\Android\Sdk"
} else {
    "$env:LOCALAPPDATA\Android\Sdk"
}
$buildToolsDir = "$sdkDir\build-tools\35.0.0"
$platformJar = "$sdkDir\platforms\android-36\android.jar"

$jbrHome = if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\javac.exe")) {
    $env:JAVA_HOME
} elseif (Test-Path "C:\Program Files\Android\Android Studio\jbr\bin\javac.exe") {
    "C:\Program Files\Android\Android Studio\jbr"
} else {
    "C:\Program Files\Android\Android Studio\jbr"
}
$jbrBin = "$jbrHome\bin"

# Point JAVA_HOME and PATH to JBR (Java 21/25) so d8.bat and apksigner use modern JVM
$env:JAVA_HOME = $jbrHome
$env:PATH = "$jbrBin;$env:PATH"

Write-Host "==> Checking Android Build Environment..." -ForegroundColor Cyan

if (-not (Test-Path $buildToolsDir)) {
    throw "Android Build Tools not found at: $buildToolsDir"
}
if (-not (Test-Path $platformJar)) {
    throw "Android Platform JAR not found at: $platformJar"
}
if (-not (Test-Path "$jbrBin\javac.exe")) {
    throw "JBR javac not found at: $jbrBin\javac.exe"
}

$workDir = "android_build"
if (Test-Path $workDir) {
    Remove-Item -Recurse -Force $workDir
}
New-Item -ItemType Directory -Path "$workDir\compiled" | Out-Null
New-Item -ItemType Directory -Path "$workDir\gen" | Out-Null
New-Item -ItemType Directory -Path "$workDir\obj" | Out-Null
New-Item -ItemType Directory -Path "$workDir\dex" | Out-Null
New-Item -ItemType Directory -Path "$workDir\assets" | Out-Null

# Ensure public/downloads directory exists
New-Item -ItemType Directory -Force -Path "public\downloads" | Out-Null

Write-Host "==> 1. Building Production Web Distribution with Vite..." -ForegroundColor Yellow
npm.cmd run build

Write-Host "==> 1b. Packaging All Web Pages & Assets into APK Container..." -ForegroundColor Yellow
# Copy all production files from dist into assets (excluding dist/downloads)
Get-ChildItem -Path "dist" | Where-Object { $_.Name -ne "downloads" } | ForEach-Object {
    Copy-Item -Recurse -Force -Path $_.FullName -Destination "$workDir\assets"
}
# Ensure uncompiled js/ and images/ are present for runtime assets
if (Test-Path "js") {
    if (-not (Test-Path "$workDir\assets\js")) {
        New-Item -ItemType Directory -Force -Path "$workDir\assets\js" | Out-Null
    }
    Copy-Item -Recurse -Force -Path "js\*" -Destination "$workDir\assets\js"
}
if (Test-Path "images") {
    if (-not (Test-Path "$workDir\assets\images")) {
        New-Item -ItemType Directory -Force -Path "$workDir\assets\images" | Out-Null
    }
    Copy-Item -Recurse -Force -Path "images\*" -Destination "$workDir\assets\images"
}

Write-Host "==> 2. Compiling Android Resources with AAPT2..." -ForegroundColor Yellow
& "$buildToolsDir\aapt2.exe" compile --dir "android\app\src\main\res" -o "$workDir\compiled\resources.zip"

Write-Host "==> 3. Linking Resources & Manifest into Base APK..." -ForegroundColor Yellow
& "$buildToolsDir\aapt2.exe" link `
    -I $platformJar `
    --manifest "android\app\src\main\AndroidManifest.xml" `
    --min-sdk-version 24 `
    --target-sdk-version 34 `
    --version-code 240 `
    --version-name "2.4.0" `
    -A "$workDir\assets" `
    --java "$workDir\gen" `
    -o "$workDir\base.apk" `
    "$workDir\compiled\resources.zip"

Write-Host "==> 4. Compiling Java Source Files with JBR javac..." -ForegroundColor Yellow
$javaFiles = Get-ChildItem -Recurse -Filter *.java -Path "$workDir\gen", "android\app\src\main\java" | Select-Object -ExpandProperty FullName
& "$jbrBin\javac.exe" -source 17 -target 17 -d "$workDir\obj" -cp $platformJar $javaFiles

Write-Host "==> 5. Converting Bytecode to Dalvik Executable (classes.dex) with D8..." -ForegroundColor Yellow
$classFiles = Get-ChildItem -Recurse -Filter *.class -Path "$workDir\obj" | Select-Object -ExpandProperty FullName
& "$buildToolsDir\d8.bat" --lib $platformJar --output "$workDir\dex" $classFiles

Write-Host "==> 6. Adding classes.dex into APK..." -ForegroundColor Yellow
# Using aapt to package classes.dex into root of APK
Push-Location "$workDir\dex"
try {
    & "$buildToolsDir\aapt.exe" add "..\base.apk" "classes.dex"
} finally {
    Pop-Location
}

Write-Host "==> 6b. Normalizing Zip Path Separators to Standard Unix Slashes..." -ForegroundColor Yellow
node scripts/fix_zip_slashes.js "$workDir\base.apk"

Write-Host "==> 7. 4-Byte ZipAligning APK Container..." -ForegroundColor Yellow
& "$buildToolsDir\zipalign.exe" -f -v 4 "$workDir\base.apk" "$workDir\aligned.apk" | Out-Null

Write-Host "==> 8. Signing APK with Debug Keystore..." -ForegroundColor Yellow
$keystoreDir = "$HOME\.android"
$keystorePath = "$keystoreDir\debug.keystore"
if (-not (Test-Path $keystorePath)) {
    New-Item -ItemType Directory -Force -Path $keystoreDir | Out-Null
    Write-Host "Generating debug keystore at $keystorePath..." -ForegroundColor Gray
    & "$jbrBin\keytool.exe" -genkeypair -v `
        -keystore $keystorePath `
        -alias "androiddebugkey" `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -storepass "android" `
        -keypass "android" `
        -dname "CN=Android Debug,O=Android,C=US"
}

$outputApk = "public\downloads\bitelens.apk"
& "$buildToolsDir\apksigner.bat" sign `
    --ks $keystorePath `
    --ks-pass "pass:android" `
    --key-pass "pass:android" `
    --ks-key-alias "androiddebugkey" `
    --v1-signing-enabled true `
    --v2-signing-enabled true `
    --v3-signing-enabled true `
    --out $outputApk `
    "$workDir\aligned.apk"

# Also sync into dist if dist/downloads exists
if (Test-Path "dist") {
    New-Item -ItemType Directory -Force -Path "dist\downloads" | Out-Null
    Copy-Item -Force $outputApk "dist\downloads\bitelens.apk"
}

$apkItem = Get-Item $outputApk
$apkBytes = $apkItem.Length
$apkSizeMB = [math]::Round($apkBytes / 1MB, 2)
$apkHash = (Get-FileHash -Algorithm SHA256 $outputApk).Hash

Write-Host "==> 9. Updating download.html with generated APK checksum & size..." -ForegroundColor Cyan
if (Test-Path "download.html") {
    $dlContent = Get-Content "download.html" -Raw
    $dlContent = $dlContent -replace '\d+\.\d+ MB \(\d+[\d,]* bytes\)', "$apkSizeMB MB ($($apkBytes.ToString('N0')) bytes)"
    $dlContent = $dlContent -replace '[0-9A-Fa-f]{64}', $apkHash
    Set-Content "download.html" -Value $dlContent -NoNewline
}

Write-Host "==> SUCCESS: Standalone Android APK compiled & signed successfully!" -ForegroundColor Green
Write-Host "    File: $outputApk ($apkSizeMB MB / $apkBytes bytes)" -ForegroundColor Green
Write-Host "    SHA-256: $apkHash" -ForegroundColor Green
