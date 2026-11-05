# Chess Puzzle Master

Mobile-first chess game packaged for Android using Capacitor.

## Current playable features
- Player vs Computer (you play White, computer plays Black)
- Easy, Medium, Hard and Grandmaster difficulty selection before each match
- Legal chess moves powered by chess.js (castling, en passant, promotion, check/checkmate and draw rules)
- Move hints, undo last player+bot turn, restart
- Responsive wooden-style board

## Build Android APK
A GitHub Actions workflow builds a debug APK automatically after relevant changes are pushed to `main`.

1. Open the repository on GitHub.
2. Select **Actions**.
3. Open **Build Android APK**.
4. Wait for the workflow to finish with a green check.
5. Open the completed run and download the artifact named `chess-puzzle-master-debug-apk`.
6. Extract the ZIP and install `app-debug.apk` on your Android phone. Allow installation from that source if Android asks.

You can also start a build manually from **Actions → Build Android APK → Run workflow**.

## Android identity
- App name: Chess Puzzle Master
- Package name: `com.yogesh.chesspuzzlemaster`

## Important limitations
- This is a debug APK, not a Play Store release-signed APK.
- The AI is a small minimax/alpha-beta search. Difficulty levels are approximate; Grandmaster is not equivalent to a full-strength grandmaster engine.
- Pawn promotion currently defaults to Queen.
- The chess.js module is loaded from jsDelivr, so internet is required for the first load / module fetch.
- Firebase multiplayer, accounts, leaderboard, 50 curated puzzle levels and cloud progress are not implemented yet.
