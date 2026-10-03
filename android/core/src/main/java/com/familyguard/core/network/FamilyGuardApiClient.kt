package com.familyguard.core.network

import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit

object FamilyGuardApiClient {

    // Default production backend URL (synced with Cloud Run deployment)
    private var baseUrl: String = "https://familyguard-backend.run.app/"
    private var authToken: String? = null

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor { chain ->
                val requestBuilder = chain.request().newBuilder()
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Accept", "application/json")
                
                authToken?.let { token ->
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }

                chain.proceed(requestBuilder.build())
            }
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()
    }

    fun setBaseUrl(url: String) {
        baseUrl = if (url.endsWith("/")) url else "$url/"
        service = createService()
    }

    fun setAuthToken(token: String?) {
        authToken = token
    }

    private fun createService(): FamilyGuardApiService {
        val contentType = "application/json".toMediaType()
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory(contentType))
            .build()
            .create(FamilyGuardApiService::class.java)
    }

    var service: FamilyGuardApiService = createService()
        private set
}
