package com.familyguard.kids.ui

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class BlockOverlayActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val packageName = intent.getStringExtra("EXTRA_PACKAGE_NAME") ?: "App"

        setContent {
            MaterialTheme {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0xFF090D16).copy(alpha = 0.96f)),
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth(0.9f)
                            .padding(24.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                        elevation = CardDefaults.cardElevation(defaultElevation = 16.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(28.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Restricted",
                                tint = Color(0xFFF43F5E),
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "هذا التطبيق مقيّد بواسطة FamilyGuard",
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "لقد انتهى وقت الاستخدام اليومي المحدد لهذا التطبيق، أو تم حظره وفق جدول أوقات الدراسة والنوم.",
                                color = Color(0xFF94A3B8),
                                fontSize = 14.sp,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(24.dp))
                            Button(
                                onClick = {
                                    Toast.makeText(
                                        this@BlockOverlayActivity,
                                        "تم إرسال طلب وقت إضافي إلى هاتف الوالد بنجاح",
                                        Toast.LENGTH_LONG
                                    ).show()
                                    finish()
                                },
                                modifier = Modifier.fillMaxWidth(),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                                shape = RoundedCornerShape(14.dp)
                            ) {
                                Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("طلب إذن وقت إضافي (Request Permission)")
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            OutlinedButton(
                                onClick = { finish() },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp)
                            ) {
                                Text("العودة للشاشة الرئيسية", color = Color(0xFFCBD5E1))
                            }
                        }
                    }
                }
            }
        }
    }
}
