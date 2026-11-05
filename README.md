# Chess Puzzle Master

Mobile-first Chess Puzzle Master app for Android (Capacitor).

## Current features
- Player vs Computer with Easy, Medium, Hard and Grandmaster settings (basic minimax bot; not a Stockfish-strength engine)
- Legal chess moves through chess.js
- Hint, undo and restart
- 50 chess, maths and logic challenge levels with answer checking, explanations and on-device progress
- Firebase Anonymous Authentication and room-code online chess lobby/game
- Responsive wooden chessboard UI

## Firebase setup (project: yogesh-chess)
1. In Firebase Console, enable Authentication -> Sign-in method -> Anonymous.
2. Create/enable Realtime Database.
3. Open Realtime Database -> Rules and paste the contents of `database.rules.json`, then Publish.
4. The Firebase web app config is in `js/firebase-config.js`. The API key in a Firebase web config is a public client identifier; protect data with database rules and Firebase App Check before public launch.

## Build Android APK
1. Open GitHub -> Actions -> Build Android APK.
2. If it did not start automatically, choose Run workflow.
3. Wait for a green check.
4. Download artifact `chess-puzzle-master-debug-apk`, extract it and install `app-debug.apk`.

Package: `com.yogesh.chesspuzzlemaster`

## Current limitations / testing required
- The online mode currently supports creating/joining a room by code. Random matchmaking is not included yet.
- Firebase rules allow authenticated users to read room records so a joining player can locate a room by code; use App Check and consider stricter server-side validation before public release. Client-side move validation alone is not anti-cheat.
- Puzzle progress is currently saved locally on the device; cloud sync is not implemented yet.
- The 50 level bank currently contains chess knowledge, tactical concepts, arithmetic and logic questions; it is not yet a fully curated FEN-based tactics database.
- Chess.js and Firebase SDKs are currently loaded from their hosted module URLs; internet is needed for these modules and for online play.
- Test on real Android devices before public release. The generated APK is a debug build, not Play Store release-signed.
