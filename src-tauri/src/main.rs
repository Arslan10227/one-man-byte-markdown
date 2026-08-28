// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

#[tauri::command]
async fn window_minimize(window: tauri::Window) {
    let _ = window.minimize();
}

#[tauri::command]
async fn window_maximize(window: tauri::Window) {
    let _ = window.maximize();
}

#[tauri::command]
async fn window_close(window: tauri::Window) {
    let _ = window.close();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            window_minimize,
            window_maximize,
            window_close,
            // other existing commands are registered elsewhere via generate_handler! macro
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
