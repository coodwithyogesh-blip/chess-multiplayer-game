# Chess Puzzle Master — Native Android

Native Android application built with Kotlin and Jetpack Compose. GitHub Actions builds the debug APK on every push to `main`.

## Build APK
1. Open the repository's **Actions** tab.
2. Open the latest **Build Native Android APK** workflow run.
3. Download the `chess-puzzle-master-debug-apk` artifact.

## Firebase
This project connects to the existing `yogesh-chess` Firebase Realtime Database and uses anonymous Firebase Authentication. Enable **Authentication → Sign-in method → Anonymous** in Firebase Console. Ensure Realtime Database rules require authenticated users before public launch.

## Current screens
Home, Computer Chess board, Online room create/join, 50-level puzzle selection, Brain Games menu.

The chess move engine, puzzle content/progression, and synchronized online chess gameplay are the next implementation phase; room creation/join currently establishes the Firebase room record.
