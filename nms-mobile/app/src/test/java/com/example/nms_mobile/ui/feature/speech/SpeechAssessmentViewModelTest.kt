package com.example.nms_mobile.ui.feature.speech

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.nms_mobile.data.PatientSessionManager
import com.example.nms_mobile.data.SpeechAssessmentRepository
import com.example.nms_mobile.data.StorageRepository
import io.mockk.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test

@ExperimentalCoroutinesApi
class SpeechAssessmentViewModelTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = UnconfinedTestDispatcher()

    private lateinit var viewModel: SpeechAssessmentViewModel
    private lateinit var speechAssessmentRepository: SpeechAssessmentRepository
    private lateinit var storageRepository: StorageRepository

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        speechAssessmentRepository = mockk(relaxed = true)
        storageRepository = mockk(relaxed = true)
        viewModel = SpeechAssessmentViewModel(speechAssessmentRepository, storageRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        unmockkAll()
    }

    @Test
    fun `confirmRecording uses active patient's user ID`() = runTest {
        // Given
        val patientId = "patient-123"
        mockkObject(PatientSessionManager)
        every { PatientSessionManager.getActiveUserId() } returns patientId

        val audioFile = createTempFile()
        viewModel.stopRecording() // To set the audioFile
        
        // When
        viewModel.confirmRecording()

        // Then
        coVerify {
            speechAssessmentRepository.saveSpeechAssessment(
                match { it.userId == patientId }
            )
        }
    }
}
