package com.example.nms_mobile.data

import com.google.firebase.Timestamp

/**
 * Status of a support request
 */
enum class SupportRequestStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED;

    companion object {
        fun fromString(value: String): SupportRequestStatus {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: OPEN
        }
    }

    fun displayName(): String = when (this) {
        OPEN -> "Open"
        IN_PROGRESS -> "In Progress"
        RESOLVED -> "Resolved"
        CLOSED -> "Closed"
    }
}

/**
 * Priority level of a support request
 */
enum class SupportRequestPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT;

    companion object {
        fun fromString(value: String): SupportRequestPriority {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: MEDIUM
        }
    }

    fun displayName(): String = when (this) {
        LOW -> "Low"
        MEDIUM -> "Medium"
        HIGH -> "High"
        URGENT -> "Urgent"
    }
}

/**
 * Data class representing a support request in Firestore
 */
data class SupportRequest(
    val id: String = "",
    val userId: String = "",
    val subject: String = "",
    val message: String = "",
    val status: SupportRequestStatus = SupportRequestStatus.OPEN,
    val priority: SupportRequestPriority = SupportRequestPriority.MEDIUM,
    val createdAt: Timestamp? = null,
    val updatedAt: Timestamp? = null,
    val resolvedAt: Timestamp? = null,
    val resolvedBy: String? = null,
    // Joined data (populated when fetching)
    val patientName: String? = null,
    val patientEmail: String? = null
) {
    /**
     * Convert to a map for Firestore storage
     */
    fun toMap(): Map<String, Any?> = mapOf(
        "userId" to userId,
        "subject" to subject,
        "message" to message,
        "status" to status.name.lowercase(),
        "priority" to priority.name.lowercase(),
        "createdAt" to createdAt,
        "updatedAt" to updatedAt,
        "resolvedAt" to resolvedAt,
        "resolvedBy" to resolvedBy,
        "patientName" to patientName,
        "patientEmail" to patientEmail
    )

    companion object {
        /**
         * Create a SupportRequest from a Firestore document
         */
        fun fromMap(id: String, data: Map<String, Any?>): SupportRequest {
            return SupportRequest(
                id = id,
                userId = data["userId"] as? String ?: "",
                subject = data["subject"] as? String ?: "",
                message = data["message"] as? String ?: "",
                status = SupportRequestStatus.fromString(data["status"] as? String ?: "open"),
                priority = SupportRequestPriority.fromString(data["priority"] as? String ?: "medium"),
                createdAt = data["createdAt"] as? Timestamp,
                updatedAt = data["updatedAt"] as? Timestamp,
                resolvedAt = data["resolvedAt"] as? Timestamp,
                resolvedBy = data["resolvedBy"] as? String,
                patientName = data["patientName"] as? String,
                patientEmail = data["patientEmail"] as? String
            )
        }
    }
}
