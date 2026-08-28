#[tauri::command]
fn get_startup_args() -> Vec<String> {
    std::env::args()
        .skip(1)
        .filter(|arg| !arg.starts_with('-') && !arg.is_empty())
        .map(|arg| arg.trim().trim_matches('"').trim_matches('\'').to_string())
        .collect()
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    let clean_path = path.trim().trim_matches('"').trim_matches('\'');
    std::fs::read_to_string(clean_path).map_err(|e| format!("Failed to read file '{}': {}", clean_path, e))
}

#[tauri::command]
fn write_file_content(path: String, content: String) -> Result<(), String> {
    let clean_path = path.trim().trim_matches('"').trim_matches('\'');
    std::fs::write(clean_path, content).map_err(|e| format!("Failed to write file '{}': {}", clean_path, e))
}

#[tauri::command]
fn window_minimize(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
fn window_maximize(window: tauri::Window) {
    if let Ok(is_max) = window.is_maximized() {
        if is_max {
            let _ = window.unmaximize();
        } else {
            let _ = window.maximize();
        }
    } else {
        let _ = window.maximize();
    }
}

#[tauri::command]
fn window_close(window: tauri::Window) {
    let _ = window.destroy();
}

#[tauri::command]
fn check_file_association() -> bool {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        if let Ok(output) = Command::new("reg")
            .creation_flags(CREATE_NO_WINDOW)
            .args(["query", r"HKCU\Software\Classes\.md", "/ve"])
            .output()
        {
            let text = String::from_utf8_lossy(&output.stdout);
            return text.contains("OneManByte.Markdown");
        }
        false
    }
    #[cfg(not(windows))]
    {
        false
    }
}

#[tauri::command]
fn set_file_association(enable: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let exe_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get executable path: {}", e))?
            .to_string_lossy()
            .to_string();

        if enable {
            // 1. Associate .md extension with ProgID OneManByte.Markdown
            let _ = Command::new("reg")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["add", r"HKCU\Software\Classes\.md", "/ve", "/d", "OneManByte.Markdown", "/f"])
                .output();
            let _ = Command::new("reg")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["add", r"HKCU\Software\Classes\.md", "/v", "Content Type", "/d", "text/markdown", "/f"])
                .output();

            // 2. Create ProgID name and description
            let _ = Command::new("reg")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["add", r"HKCU\Software\Classes\OneManByte.Markdown", "/ve", "/d", "OneManByte Markdown Document", "/f"])
                .output();

            // 3. Set DefaultIcon to app exe icon
            let _ = Command::new("reg")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["add", r"HKCU\Software\Classes\OneManByte.Markdown\DefaultIcon", "/ve", "/d", &format!("\"{}\",0", exe_path), "/f"])
                .output();

            // 4. Set Open shell command
            let _ = Command::new("reg")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["add", r"HKCU\Software\Classes\OneManByte.Markdown\shell\open\command", "/ve", "/d", &format!("\"{}\" \"%1\"", exe_path), "/f"])
                .output();
        } else {
            // Unregister association
            let _ = Command::new("reg")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["delete", r"HKCU\Software\Classes\OneManByte.Markdown", "/f"])
                .output();
            let _ = Command::new("reg")
                .creation_flags(CREATE_NO_WINDOW)
                .args(["delete", r"HKCU\Software\Classes\.md", "/f"])
                .output();
        }

        // Notify Windows Shell to refresh file icons and associations immediately (silently with CREATE_NO_WINDOW)
        let _ = Command::new("powershell")
            .creation_flags(CREATE_NO_WINDOW)
            .args([
                "-NoProfile",
                "-NonInteractive",
                "-WindowStyle",
                "Hidden",
                "-Command",
                r#"[System.Runtime.InteropServices.Marshal]::GetDelegateForFunctionPointer((Add-Type -MemberDefinition '[DllImport("shell32.dll")] public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);' -Name Win32Utils -Namespace Win32 -PassThru)::GetMethod('SHChangeNotify').MethodHandle.GetFunctionPointer(), [Action[int, uint, IntPtr, IntPtr]]).DynamicInvoke(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)"#,
            ])
            .output();

        Ok(())
    }
    #[cfg(not(windows))]
    {
        Ok(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_startup_args,
            read_file_content,
            write_file_content,
            window_minimize,
            window_maximize,
            window_close,
            check_file_association,
            set_file_association
        ])
        .run(tauri::generate_context!())
        .expect("error while running OneManByte - Markdown application");
}
