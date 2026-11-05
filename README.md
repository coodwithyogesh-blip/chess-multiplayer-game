# Chess Puzzle Master

A mobile-first chess game for Android, built with Capacitor.

## Separate screens
- Home: choose a game mode.
- Play vs Computer: dedicated chessboard and bot difficulty screen.
- 50 Puzzle Levels: separate puzzle progression screen.
- Online menu: choose create room or join room.
- Create Room: generates a private six-character invite code and waits for the opponent.
- Join Room: separate screen to enter the invite code.
- Online Game: dedicated multiplayer chessboard after both players connect.

## Game features
- Player vs Computer with Easy, Medium, Hard and Grandmaster labels. The current bot is a small minimax search, not a Stockfish-strength engine.
- Legal chess moves, castling, en passant, checkmate and draws through chess.js.
- Move highlights, last-move indication, hint, undo and restart.
- 50 chess, maths and logic questions with explanations, XP and local progress.
- Firebase Anonymous Authentication and room-code multiplayer.

## Firebase setup
1. Enable Authentication -> Sign-in method -> Anonymous in Firebase Console.
2. Enable Realtime Database.
3. Publish the rules from database.rules.json.
4. Firebase web config is in js/firebase-config.js.

## Build APK
Open GitHub Actions -> Build Android APK. Wait for a successful green check, then download the chess-puzzle-master-debug-apk artifact and extract app-debug.apk.

Package: com.yogesh.chesspuzzlemaster.

## Current limitations
- Online play is room-code based; random matchmaking is not implemented.
- Puzzle progress is local to the device; cloud progress sync is not implemented.
- Puzzle questions are knowledge/math/logic prompts, not a full FEN-based tactics library.
- Chess.js and Firebase modules are loaded from hosted URLs, so internet is required for these modules and online play.
- The APK is a debug build, not a Play Store signed release. Real-device testing remains required.
