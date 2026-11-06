package com.yogesh.chesspuzzlemaster

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ChessFirebase.initialize()
        setContent {
            MaterialTheme(colorScheme = darkColorScheme(
                primary = Color(0xFFFFC857),
                secondary = Color(0xFF59D4C8),
                background = Color(0xFF101820),
                surface = Color(0xFF1B2835)
            )) {
                ChessApp()
            }
        }
    }
}
