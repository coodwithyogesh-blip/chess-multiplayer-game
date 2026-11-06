package com.yogesh.chesspuzzlemaster

import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import kotlinx.coroutines.tasks.await

object ChessFirebase {
    private const val API_KEY = "AIzaSyATTAYBesPx8lOI3EuSDgN8xTjLWPYvpGw"
    private const val APP_ID = "1:466444401698:android:2a7ef7e8ef0b00e4695e7b"
    private const val PROJECT_ID = "yogesh-chess"
    private const val DB_URL = "https://yogesh-chess-default-rtdb.firebaseio.com"

    fun initialize() {
        if (FirebaseApp.getApps(AppContext.instance).isEmpty()) {
            val options = FirebaseOptions.Builder()
                .setApiKey(API_KEY)
                .setApplicationId(APP_ID)
                .setProjectId(PROJECT_ID)
                .setDatabaseUrl(DB_URL)
                .build()
            FirebaseApp.initializeApp(AppContext.instance, options)
        }
    }

    suspend fun signIn(): String {
        val user = FirebaseAuth.getInstance().signInAnonymously().await().user
            ?: error("Firebase sign-in failed")
        return user.uid
    }

    suspend fun createRoom(uid: String): String {
        val db = FirebaseDatabase.getInstance(DB_URL).reference
        repeat(8) {
            val code = (100000..999999).random().toString()
            val room = db.child("rooms").child(code)
            val snapshot = room.get().await()
            if (!snapshot.exists()) {
                room.setValue(mapOf(
                    "hostUid" to uid,
                    "guestUid" to "",
                    "status" to "waiting",
                    "turn" to "white",
                    "fen" to "start"
                )).await()
                return code
            }
        }
        error("Room code generate nahi hua. Dobara try karein.")
    }

    suspend fun joinRoom(uid: String, code: String) {
        val room = FirebaseDatabase.getInstance(DB_URL).reference
            .child("rooms").child(code)
        val snapshot = room.get().await()
        if (!snapshot.exists()) error("Room code nahi mila")
        if (snapshot.child("guestUid").getValue(String::class.java).orEmpty().isNotEmpty()) {
            error("Room pehle se full hai")
        }
        room.child("guestUid").setValue(uid).await()
        room.child("status").setValue("ready").await()
    }
}
