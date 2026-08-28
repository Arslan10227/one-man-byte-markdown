import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('📦 Building OneManByte Markdown MSIX for Windows Store...\n');

// 1. Locate Windows SDK Tools
const sdkRoot = 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.26100.0\\x64';
const makeAppx = path.join(sdkRoot, 'makeappx.exe');
const makePri = path.join(sdkRoot, 'makepri.exe');

if (!fs.existsSync(makeAppx) || !fs.existsSync(makePri)) {
  console.error('❌ Could not find Windows SDK makeappx.exe / makepri.exe');
  process.exit(1);
}

const rootDir = process.cwd();
const tauriDir = path.join(rootDir, 'src-tauri');
const layoutDir = path.join(tauriDir, 'target', 'msix_layout');
const assetsDir = path.join(layoutDir, 'Assets');
const iconsDir = path.join(tauriDir, 'icons');
const outputMsix = path.join(rootDir, 'OneManByte-Markdown_1.0.0_x64.msix');

// 2. Prepare layout
if (fs.existsSync(layoutDir)) {
  fs.rmSync(layoutDir, { recursive: true, force: true });
}
fs.mkdirSync(assetsDir, { recursive: true });

// Copy executable
const exePath = path.join(tauriDir, 'target', 'release', 'onemanbyte-markdown.exe');
if (!fs.existsSync(exePath)) {
  console.log('Building Release binary...');
  execSync('cargo build --release', { cwd: tauriDir, stdio: 'inherit' });
}
fs.copyFileSync(exePath, path.join(layoutDir, 'onemanbyte-markdown.exe'));

// Copy Assets
const assetFiles = [
  'Square44x44Logo.png',
  'Square150x150Logo.png',
  'Square310x310Logo.png',
  'Wide310x150Logo.png',
  'StoreLogo.png'
];

for (const f of assetFiles) {
  const src = path.join(iconsDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(assetsDir, f));
  } else {
    console.warn(`Warning: Asset not found: ${src}`);
  }
}

// 3. Generate AppxManifest.xml
const manifest = `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  xmlns:desktop="http://schemas.microsoft.com/appx/manifest/desktop/windows10"
  IgnorableNamespaces="uap rescap desktop">

  <Identity
    Name="OneManByte.OneManByte-MarkdownViewerEditor"
    Publisher="CN=204E8FC4-AC45-46DF-86C4-AB0884CEE5D5"
    Version="1.0.0.0"
    ProcessorArchitecture="x64" />

  <Properties>
    <DisplayName>OneManByte - Markdown</DisplayName>
    <PublisherDisplayName>OneManByte</PublisherDisplayName>
    <Logo>Assets\\StoreLogo.png</Logo>
    <Description>Lightning-fast, lightweight markdown viewer and editor with live preview, KaTeX math, and Mermaid diagrams.</Description>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22621.0" />
  </Dependencies>

  <Resources>
    <Resource Language="EN-US" />
  </Resources>

  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>

  <Applications>
    <Application Id="OneManByte.Markdown"
      Executable="onemanbyte-markdown.exe"
      EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="OneManByte - Markdown"
        Description="OneManByte Markdown Viewer and Editor"
        BackgroundColor="transparent"
        Square150x150Logo="Assets\\Square150x150Logo.png"
        Square44x44Logo="Assets\\Square44x44Logo.png">
        <uap:DefaultTile Wide310x150Logo="Assets\\Wide310x150Logo.png" Square310x310Logo="Assets\\Square310x310Logo.png" />
      </uap:VisualElements>
      <Extensions>
        <uap:Extension Category="windows.fileTypeAssociation">
          <uap:FileTypeAssociation Name="markdown">
            <uap:DisplayName>Markdown Document</uap:DisplayName>
            <uap:Logo>Assets\\Square44x44Logo.png</uap:Logo>
            <uap:SupportedFileTypes>
              <uap:FileType>.md</uap:FileType>
              <uap:FileType>.markdown</uap:FileType>
              <uap:FileType>.mdown</uap:FileType>
              <uap:FileType>.mkd</uap:FileType>
            </uap:SupportedFileTypes>
          </uap:FileTypeAssociation>
        </uap:Extension>
      </Extensions>
    </Application>
  </Applications>
</Package>`;

fs.writeFileSync(path.join(layoutDir, 'AppxManifest.xml'), manifest, 'utf8');

// 4. Create resources.pri with MakePRI
console.log('Generating resources.pri index...');
const priConfig = path.join(tauriDir, 'target', 'priconfig.xml');
execSync(`"${makePri}" createconfig /cf "${priConfig}" /dq en-US /o`, { stdio: 'inherit' });
execSync(`"${makePri}" new /pr "${layoutDir}" /cf "${priConfig}" /mn "${path.join(layoutDir, 'AppxManifest.xml')}" /of "${path.join(layoutDir, 'resources.pri')}" /o /v`, { stdio: 'inherit' });

// 5. Pack with MakeAppx
console.log(`\nPacking MSIX to ${outputMsix}...`);
if (fs.existsSync(outputMsix)) {
  fs.unlinkSync(outputMsix);
}
execSync(`"${makeAppx}" pack /d "${layoutDir}" /p "${outputMsix}" /o /v`, { stdio: 'inherit' });

if (fs.existsSync(outputMsix)) {
  const stats = fs.statSync(outputMsix);
  console.log(`\n✅ SUCCESS: Created Windows Store MSIX package:`);
  console.log(`   ${outputMsix} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
} else {
  console.error('❌ Failed to create MSIX package.');
  process.exit(1);
}
