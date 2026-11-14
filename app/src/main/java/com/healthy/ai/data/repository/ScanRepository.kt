package com.healthy.ai.data.repository

import com.healthy.ai.data.model.ChatMessage
import com.healthy.ai.data.model.ScanItem
import com.healthy.ai.data.model.ScanMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class ScanRepository {

    private val _scans = MutableStateFlow<List<ScanItem>>(
        listOf(
            ScanItem(
                id = "sample_food_1",
                imageBase64 = null,
                mode = ScanMode.FOOD,
                foodData = SampleDataProvider.samplePaneerTikka,
                timestamp = System.currentTimeMillis() - 3600000
            ),
            ScanItem(
                id = "sample_med_1",
                imageBase64 = null,
                mode = ScanMode.HEALTH,
                medicineData = SampleDataProvider.sampleDolo650,
                timestamp = System.currentTimeMillis() - 7200000
            )
        )
    )
    val scans: StateFlow<List<ScanItem>> = _scans.asStateFlow()

    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(
        listOf(
            ChatMessage(
                id = "msg_welcome",
                role = "assistant",
                content = "Hello! I am your Healthy AI Assistant. Ask any questions about nutrition, meal calories, dietary macros, or medicine safety.",
                timestamp = System.currentTimeMillis()
            )
        )
    )
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()

    fun addScan(item: ScanItem) {
        val current = _scans.value.toMutableList()
        current.add(0, item)
        _scans.value = current
    }

    fun deleteScan(id: String) {
        _scans.value = _scans.value.filterNot { it.id == id }
    }

    fun clearAllScans() {
        _scans.value = emptyList()
    }

    fun addChatMessage(role: String, content: String): ChatMessage {
        val msg = ChatMessage(
            id = UUID.randomUUID().toString(),
            role = role,
            content = content,
            timestamp = System.currentTimeMillis()
        )
        val current = _chatMessages.value.toMutableList()
        current.add(msg)
        _chatMessages.value = current
        return msg
    }
}
