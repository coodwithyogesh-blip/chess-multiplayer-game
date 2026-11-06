package com.yogesh.chesspuzzlemaster

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

private val Night = Color(0xFF101820)
private val Panel = Color(0xFF1B2835)
private val Gold = Color(0xFFFFC857)
private val Mint = Color(0xFF59D4C8)

@Composable
fun ChessApp() {
    var page by remember { mutableStateOf("home") }
    var roomCode by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Surface(Modifier.fillMaxSize(), color = Night) {
        Column(Modifier.fillMaxSize().padding(18.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("♟", fontSize = 30.sp, color = Gold)
                Spacer(Modifier.width(10.dp))
                Column {
                    Text("CHESS PUZZLE MASTER", color = Gold, fontWeight = FontWeight.Black, fontSize = 18.sp)
                    Text("Think • Play • Master", color = Mint, fontSize = 12.sp)
                }
            }
            Spacer(Modifier.height(20.dp))
            when (page) {
                "home" -> HomePage(
                    onPlay = { page = "play" },
                    onOnline = { page = "online" },
                    onPuzzles = { page = "puzzles" },
                    onBrain = { page = "brain" }
                )
                "play" -> {
                    PageTitle("Computer Chess", "Practice your chess skills")
                    ChessBoard()
                    BackButton { page = "home" }
                }
                "online" -> {
                    PageTitle("Online Multiplayer", "Play with a friend using a room code")
                    ActionCard("Create Room", "Generate a unique 6-digit code") {
                        busy = true; message = "Connecting to Firebase..."
                        scope.launch {
                            try {
                                val uid = ChessFirebase.signIn()
                                roomCode = ChessFirebase.createRoom(uid)
                                message = "Room created. Share this code with your friend."
                            } catch (e: Exception) { message = e.message ?: "Connection failed" }
                            busy = false
                        }
                    }
                    if (roomCode.isNotEmpty()) {
                        Text("ROOM CODE  $roomCode", color = Gold, fontSize = 25.sp, fontWeight = FontWeight.Bold)
                    }
                    OutlinedTextField(value = roomCode.takeIf { it.length != 6 } ?: "",
                        onValueChange = { roomCode = it.filter(Char::isDigit).take(6) },
                        label = { Text("Enter 6-digit room code") }, singleLine = true)
                    ActionCard("Join Room", "Join your friend's room") {
                        if (roomCode.length == 6) {
                            busy = true
                            scope.launch {
                                try {
                                    val uid = ChessFirebase.signIn()
                                    ChessFirebase.joinRoom(uid, roomCode)
                                    message = "Room joined successfully"
                                } catch (e: Exception) { message = e.message ?: "Join failed" }
                                busy = false
                            }
                        } else message = "6-digit code enter karein"
                    }
                    if (busy) CircularProgressIndicator(color = Gold)
                    Text(message, color = Mint)
                    BackButton { page = "home" }
                }
                "puzzles" -> {
                    PageTitle("50 Chess Puzzles", "Complete levels one by one")
                    LazyVerticalGrid(columns = GridCells.Fixed(4), modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(9.dp),
                        horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                        items((1..50).toList()) { level ->
                            Box(Modifier.background(Panel, RoundedCornerShape(12.dp))
                                .clickable { message = "Puzzle level $level selected" }
                                .aspectRatio(1f), contentAlignment = Alignment.Center) {
                                Text("$level", color = Gold, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                            }
                        }
                    }
                    Text(message, color = Mint)
                    BackButton { page = "home" }
                }
                "brain" -> {
                    PageTitle("Brain Games", "Train your mind every day")
                    ActionCard("Math Challenge", "Solve quick number questions") { message = "Math challenge selected" }
                    ActionCard("Logic Puzzle", "Find the correct answer") { message = "Logic puzzle selected" }
                    ActionCard("Memory Test", "Remember the pattern") { message = "Memory test selected" }
                    Text(message, color = Mint)
                    BackButton { page = "home" }
                }
            }
        }
    }
}

@Composable
private fun HomePage(onPlay: () -> Unit, onOnline: () -> Unit, onPuzzles: () -> Unit, onBrain: () -> Unit) {
    PageTitle("Welcome, Chess Master!", "Choose your game mode")
    ActionCard("♟  Play Chess", "Practice on the chessboard", onPlay)
    ActionCard("🌐  Online Multiplayer", "Create or join a room", onOnline)
    ActionCard("🧩  50 Puzzle Levels", "Improve your tactics", onPuzzles)
    ActionCard("🧠  Brain Games", "Math, logic and memory", onBrain)
}

@Composable
private fun PageTitle(title: String, subtitle: String) {
    Text(title, color = Color.White, fontSize = 23.sp, fontWeight = FontWeight.Bold)
    Text(subtitle, color = Mint, fontSize = 13.sp)
    Spacer(Modifier.height(18.dp))
}

@Composable
private fun ActionCard(title: String, subtitle: String, onClick: () -> Unit) {
    Card(Modifier.fillMaxWidth().padding(bottom = 12.dp).clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = Panel), shape = RoundedCornerShape(18.dp)) {
        Column(Modifier.padding(18.dp)) {
            Text(title, color = Gold, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text(subtitle, color = Color.LightGray, fontSize = 13.sp)
        }
    }
}

@Composable
private fun BackButton(onClick: () -> Unit) {
    Spacer(Modifier.height(12.dp))
    TextButton(onClick = onClick) { Text("← Back to Home", color = Gold) }
}

@Composable
private fun ChessBoard() {
    val initial = listOf(
        "♜","♞","♝","♛","♚","♝","♞","♜",
        "♟","♟","♟","♟","♟","♟","♟","♟",
        "","","","","","","","",
        "","","","","","","","",
        "","","","","","","","",
        "","","","","","","","",
        "♙","♙","♙","♙","♙","♙","♙","♙",
        "♖","♘","♗","♕","♔","♗","♘","♖"
    )
    Column(Modifier.fillMaxWidth().aspectRatio(1f)) {
        for (row in 0..7) {
            Row(Modifier.weight(1f)) {
                for (col in 0..7) {
                    val light = (row + col) % 2 == 0
                    Box(Modifier.weight(1f).fillMaxHeight()
                        .background(if (light) Color(0xFFE8DCC8) else Color(0xFF719477)),
                        contentAlignment = Alignment.Center) {
                        Text(initial[row * 8 + col], fontSize = 29.sp,
                            color = if (row < 2) Color(0xFF20242A) else Color.White)
                    }
                }
            }
        }
    }
}
