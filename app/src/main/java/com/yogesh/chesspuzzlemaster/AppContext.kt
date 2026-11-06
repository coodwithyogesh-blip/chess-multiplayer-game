package com.yogesh.chesspuzzlemaster

import android.app.Application
import android.content.Context

object AppContext {
    lateinit var instance: Context
}

class ChessApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AppContext.instance = applicationContext
    }
}
