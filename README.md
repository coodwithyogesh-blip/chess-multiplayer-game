# Chess Puzzle Master

Mobile-first chess game foundation.

## Current playable features
- Player vs Computer (you play White, computer plays Black)
- Easy, Medium, Hard and Grandmaster difficulty selection before each match
- Legal chess moves powered by chess.js (castling, en passant, promotion, check/checkmate and draw rules)
- Move hints, undo last player+bot turn, restart
- Responsive wooden-style board

## Run
Host this repository as a static site (for example, GitHub Pages). ES modules do not work reliably when opening index.html directly as a local file.

## Current limitations
- AI uses a small minimax/alpha-beta search. Difficulty names are gameplay settings, not a claim of engine-level grandmaster strength.
- Promotion currently defaults to Queen.
- Firebase online multiplayer, accounts, leaderboard, 50 curated puzzle levels, offline engine bundling, and Android APK packaging are not yet implemented.
- The chess.js module is currently loaded from jsDelivr, so first load requires internet.
